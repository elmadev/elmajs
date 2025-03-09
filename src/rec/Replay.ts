import { Position, BufferInput } from '../shared';
import { nullpadString, trimString } from '../util';
import { Event, Frame, RideHeader, Ride } from './';
import { EventType } from './Event';

const EOR_MARKER = 0x00492f75; // replay marker

export enum ReplayFinishStateReason {
  Touch = 'Touch',
  NoTouch = 'NoTouch',
  FrameDifference = 'FrameDifference',
}

export interface FinishState {
  finished: boolean;
  reason: ReplayFinishStateReason;
  time: number;
}

export default class Replay {
  /**
   * Loads a replay file.
   * @param buffer BufferInput
   */
  public static from(buffer: BufferInput): Replay {
    return this.parseBuffer(Buffer.from(buffer));
  }

  private static parseBuffer(buffer: Buffer): Replay {
    const rec = new Replay();
    let offset = 0;

    // support replays with more than 2 rides by continually trying to read ride data.
    while (offset < buffer.length) {
      const [header, ride] = this.parseRide(buffer.slice(offset));
      Object.assign(rec, header);
      rec.rides.push(ride);
      offset += 44 + ride.frames.length * 27 + ride.events.length * 16;
    }

    return rec;
  }

  /**
   * Parses a "ride", which consists of frames and events
   */
  private static parseRide(buffer: Buffer): [RideHeader, Ride] {
    const ride = new Ride();

    let offset = 0;

    const numFrames = buffer.readUInt32LE(offset);
    offset += 8; // + 4 unused extra bytes
    const isMulti = Boolean(buffer.readInt32LE(offset));
    offset += 4;
    const isFlagTag = Boolean(buffer.readInt32LE(offset));
    offset += 4;
    const link = buffer.readUInt32LE(offset);
    offset += 4;
    const level = trimString(buffer.slice(offset, offset + 12));
    offset += 16; // + 4 unused extra bytes
    const header = { isMulti, isFlagTag, link, level };

    ride.frames = Replay.parseFrames(buffer.slice(offset, offset + 27 * numFrames), numFrames);
    offset += 27 * numFrames;

    const numEvents = buffer.readUInt32LE(offset);
    offset += 4;
    ride.events = Replay.parseEvents(buffer.slice(offset, offset + 16 * numEvents), numEvents);
    offset += 16 * numEvents;

    const expected = buffer.readInt32LE(offset);
    if (expected !== EOR_MARKER) {
      throw new Error('End of replay marker mismatch');
    }
    // offset += 4

    return [header, ride];
  }

  private static parseFrames(buffer: Buffer, numFrames: number): Frame[] {
    const frames: Frame[] = [];

    for (let i = 0; i < numFrames; i++) {
      const frame = new Frame();
      frame.bike = new Position(buffer.readFloatLE(i * 4), buffer.readFloatLE(i * 4 + numFrames * 4));
      frame.leftWheel = new Position(
        buffer.readInt16LE(i * 2 + numFrames * 8),
        buffer.readInt16LE(i * 2 + numFrames * 10),
      );
      frame.rightWheel = new Position(
        buffer.readInt16LE(i * 2 + numFrames * 12),
        buffer.readInt16LE(i * 2 + numFrames * 14),
      );
      frame.head = new Position(buffer.readInt16LE(i * 2 + numFrames * 16), buffer.readInt16LE(i * 2 + numFrames * 18));
      frame.bikeRotation = buffer.readInt16LE(i * 2 + numFrames * 20);
      frame.leftWheelRotation = buffer.readUInt8(i + numFrames * 22);
      frame.rightWheelRotation = buffer.readUInt8(i + numFrames * 23);
      frame.throttleAndDirection = buffer.readUInt8(i + numFrames * 24);
      frame.backWheelSpeed = buffer.readUInt8(i + numFrames * 25);
      frame.collisionStrength = buffer.readUInt8(i + numFrames * 26);

      frames.push(frame);
    }

    return frames;
  }

  private static parseEvents(buffer: Buffer, numEvents: number): Event[] {
    const events: Event[] = [];

    let offset = 0;
    for (let i = 0; i < numEvents; i++) {
      const event = new Event();
      event.time = buffer.readDoubleLE(offset);
      offset += 8;
      event.touchInfo = buffer.readInt16LE(offset);
      offset += 2;
      event.type = buffer.readUInt8(offset);
      offset += 2; // 1 + 1 padding
      event.groundInfo = buffer.readFloatLE(offset);
      offset += 4;
      if (event.type < 0 || event.type > 7) {
        throw new Error(`Invalid event type value=${event.type} at event offset=${offset}`);
      }

      events.push(event);
    }

    return events;
  }

  public link: number;
  public level: string;
  public isMulti: boolean;
  public isFlagTag: boolean;
  public rides: Ride[];
  public path: string;

  constructor() {
    this.link = 0;
    this.level = '';
    this.isMulti = false;
    this.isFlagTag = false;
    this.rides = [];
    this.path = '';
  }

  /**
   * Returns a buffer representation of the replay.
   */
  public toBuffer(): Buffer {
    // calculate how many bytes we need by checking each ride's frames and events
    const bufferSize = this.rides.reduce((byteAcc, ride) => {
      const rideBytes = 44 + 27 * ride.frames.length + 16 * ride.events.length;
      return byteAcc + rideBytes;
    }, 0);
    const buffer = Buffer.alloc(bufferSize);
    let offset = 0;

    this.rides.forEach((ride) => {
      const numFrames = ride.frames.length;
      buffer.writeUInt32LE(numFrames, offset);
      buffer.writeUInt32LE(0x83, offset + 4);
      buffer.writeUInt32LE(this.isMulti ? 1 : 0, offset + 8);
      buffer.writeUInt32LE(this.isFlagTag ? 1 : 0, offset + 12);
      buffer.writeUInt32LE(this.link, offset + 16);
      buffer.write(nullpadString(this.level, 12), offset + 20, 12, 'ascii');
      buffer.writeUInt32LE(0, offset + 32);

      offset += 36;
      for (let i = 0; i < numFrames; i++) {
        buffer.writeFloatLE(ride.frames[i].bike.x, offset + i * 4);
        buffer.writeFloatLE(ride.frames[i].bike.y, offset + i * 4 + numFrames * 4);
        buffer.writeInt16LE(ride.frames[i].leftWheel.x, offset + i * 2 + numFrames * 8);
        buffer.writeInt16LE(ride.frames[i].leftWheel.y, offset + i * 2 + numFrames * 10);
        buffer.writeInt16LE(ride.frames[i].rightWheel.x, offset + i * 2 + numFrames * 12);
        buffer.writeInt16LE(ride.frames[i].rightWheel.y, offset + i * 2 + numFrames * 14);
        buffer.writeInt16LE(ride.frames[i].head.x, offset + i * 2 + numFrames * 16);
        buffer.writeInt16LE(ride.frames[i].head.y, offset + i * 2 + numFrames * 18);
        buffer.writeInt16LE(ride.frames[i].bikeRotation, offset + i * 2 + numFrames * 20);
        buffer.writeUInt8(ride.frames[i].leftWheelRotation, offset + i + numFrames * 22);
        buffer.writeUInt8(ride.frames[i].rightWheelRotation, offset + i + numFrames * 23);
        buffer.writeUInt8(ride.frames[i].throttleAndDirection, offset + i + numFrames * 24);
        buffer.writeUInt8(ride.frames[i].backWheelSpeed, offset + i + numFrames * 25);
        buffer.writeUInt8(ride.frames[i].collisionStrength, offset + i + numFrames * 26);
      }

      offset += 27 * numFrames;

      buffer.writeUInt32LE(ride.events.length, offset);
      offset += 4;

      ride.events.forEach((event) => {
        buffer.writeDoubleLE(event.time, offset);
        offset += 8;
        const defaultInfo = -1;
        const defaultInfo2 = 0.99;

        switch (event.type) {
          case EventType.Touch:
            buffer.writeInt16LE(event.touchInfo, offset);
            buffer.writeUInt8(event.type, offset + 2);
            buffer.writeUInt8(0, offset + 3);
            buffer.writeFloatLE(0, offset + 4);
            break;
          case EventType.Ground:
            buffer.writeInt16LE(defaultInfo, offset);
            buffer.writeUInt8(event.type, offset + 2);
            buffer.writeUInt8(0, offset + 3);
            buffer.writeFloatLE(event.groundInfo, offset + 4);
            break;
          default:
            buffer.writeInt16LE(defaultInfo, offset);
            buffer.writeUInt8(event.type, offset + 2);
            buffer.writeUInt8(0, offset + 3);
            buffer.writeFloatLE(defaultInfo2, offset + 4);
            break;
        }
        offset += 8;
      });

      buffer.writeUInt32LE(EOR_MARKER, offset);
      offset += 4;
    });

    return buffer;
  }

  /**
   * Get time of replay in milliseconds.
   */
  public getTime(): FinishState {
    // First get the last event of (each) ride.
    const lastEvents = this.rides.map((ride) =>
      ride.events.length > 0 ? ride.events[ride.events.length - 1] : undefined,
    );

    // Time of each ride's last event, in milliseconds.
    const lastEventTimes = lastEvents.map((event: undefined | Event) => (event ? event.timeInMilliseconds : undefined));

    // Time of the final event(s) (= the event(s) with the highest time), in milliseconds.
    const finalEventTime = lastEventTimes.reduce((prev: undefined | number, time: undefined | number) => {
      if (!prev) {
        return time;
      } else if (!time) {
        return prev;
      } else return time > prev ? time : prev;
    }, undefined);

    // Get all Touch/Apple events with finalEventTime. Other events with finalEventTime are filtered out.
    // (For example player 2 might have a GroundTouch event with the same time as player 1's flower Touch.)
    const finalEvents = <Event[]>[];
    for (const ride of this.rides) {
      const touchOrAppleEvents = ride.events.filter(
        (event) =>
          event.timeInMilliseconds === finalEventTime &&
          (event.type === EventType.Touch || event.type === EventType.Apple),
      );
      finalEvents.push(...touchOrAppleEvents);
    }

    // Time of each ride's last frame, in milliseconds.
    const FrameDuration = 1000 / 30.0;
    const lastFrameTimes = this.rides.map((ride) => ride.frames.length * FrameDuration);

    // Highest frame time, in milliseconds.
    const finalFrameTime = lastFrameTimes.reduce((prev, time) => {
      return time > prev ? time : prev;
    }, 0);

    // Not finished if the final events don't include a Touch or Apple event, so return approximate frame time.
    if (finalEvents.length === 0) {
      return {
        finished: false,
        reason: ReplayFinishStateReason.NoTouch,
        time: Math.round(finalFrameTime),
      };
    }

    // Info about whether each ride's last event is within ~1 frame of time from the end of that ride.
    // In finished rides, flower Touch is sometimes slightly more than FrameDuration away from the end,
    // so a small extra tolerance is allowed. (In singleplayer replays, the extra time can range at least
    // from 6.0e-13 to 4.9e-8 ms, and in multiplayer replays at least from 0.333 ms to 3.333 ms.)
    const extraTolerance = this.rides.length > 1 ? 3.5 : 1.0e-7;
    const rideHasLastFrameEvent = lastFrameTimes.map((lastFrameTime, idx) => {
      const lastEventTime = lastEventTimes[idx];
      return lastEventTime ? lastFrameTime <= lastEventTime + FrameDuration + extraTolerance : false;
    });

    // If the highest event time is not within ~1 frame of time from the end, probably not finished?
    const finalEventIdx = lastEventTimes.lastIndexOf(finalEventTime);
    if (!rideHasLastFrameEvent[finalEventIdx]) {
      return {
        finished: false,
        reason: ReplayFinishStateReason.FrameDifference,
        time: Math.round(finalFrameTime),
      };
    }

    // For multiplayer replays where one player waits at the flower for the other to take an apple.
    let waitingAtFlower = false;
    let endsWithAppleTake = false;

    let isFinished = false;
    for (const [idx, ride] of this.rides.entries()) {
      // Potentially finished, if ride ends in a Touch or Apple event.
      const lastEvent = lastEvents[idx];
      if (lastEvent && rideHasLastFrameEvent[idx] && !isFinished) {
        if (lastEvent.type === EventType.Touch) {
          if (
            ride.events.length >= 2 &&
            ride.events[ride.events.length - 2].type === EventType.Touch &&
            ride.events[ride.events.length - 2].time !== lastEvent.time
          ) {
            // Probably ended at flower, but not all apples were taken.
            isFinished = false;
            waitingAtFlower = true;
          } else {
            // Otherwise probably finished, but false positives are possible (e.g., dying to killer).
            isFinished = true;
          }
        } else if (lastEvent.type === EventType.Apple) {
          endsWithAppleTake = true;
          if (ride.events.length >= 3) {
            const endAppleCount = ride.events.filter(
              (event) => event.type === EventType.Apple && event.time === lastEvent.time,
            ).length;
            const endTouchEventCount = ride.events.filter(
              (event) => event.type === EventType.Touch && event.time === lastEvent.time,
            ).length;
            if (endTouchEventCount >= endAppleCount + 1) {
              // Apple(s) and flower taken at the same time. N apples and a flower will
              // generate (at least) N+1 Touch events, followed by N Apple events.
              isFinished = true;
            }
          }
        }
      }
    }

    // Multiplayer finish.
    if (waitingAtFlower && endsWithAppleTake) isFinished = true;

    return {
      finished: isFinished,
      reason: isFinished ? ReplayFinishStateReason.Touch : ReplayFinishStateReason.NoTouch,
      time: isFinished && finalEventTime ? Math.floor(finalEventTime) : Math.round(finalFrameTime),
    };
  }

  /**
   * Returns the number of apples collected in the replay.
   *
   * @returns Number of apples
   */
  get apples(): number {
    let apples = 0;

    for (const ride of this.rides) {
      const touchEvents = ride.events.filter((event) => event.type === 0).sort((a, b) => b.time - a.time);
      const appleEvents = ride.events.filter((event) => event.type === 4);
      const unique = [...new Set(touchEvents.map((event) => event.touchInfo))].map((event, idx) => touchEvents[idx]);

      appleEvents.forEach((appleEvent) => {
        const touchEventWithSameTime = unique.findIndex((touchEvent) => {
          return touchEvent.time === appleEvent.time;
        });

        if (touchEventWithSameTime > -1) {
          unique.splice(touchEventWithSameTime, 1);
          apples += 1;
        }
      });
    }

    return apples;
  }

  /**
   * Returns the total number of apples collected in the replay (including "apple bugs")
   */
  get totalApples(): number {
    const apples = this.rides.reduce((apples, ride) => {
      apples += ride.events.filter((event) => event.type === 4).length;
      return apples;
    }, 0);
    return apples;
  }
}
