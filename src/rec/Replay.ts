import { readFile, writeFile } from 'fs-extra';
import { Position } from '../shared';
import { nullpadString, trimString } from '../util';
import { Event, Frame, IRideHeader, Ride } from './';
import { EventType } from './Event';

const EOR_MARKER = 0x00492f75; // replay marker

export enum ReplayFinishStateReason {
  Touch = 'Touch',
  NoTouch = 'NoTouch',
  FrameDifference = 'FrameDifference',
}

export interface IFinishState {
  finished: boolean;
  reason: ReplayFinishStateReason;
  time: number;
}

export default class Replay {
  /**
   * Loads a replay file.
   * @param source Can either be a file path or a buffer
   */
  public static async load(source: string | Buffer): Promise<Replay> {
    if (typeof source === 'string') {
      const file = await readFile(source);
      return this._parseBuffer(file, source);
    } else if (source instanceof Buffer) {
      return this._parseBuffer(source);
    }
    throw new Error('This should be unreachable but ok');
  }

  private static async _parseBuffer(
    buffer: Buffer,
    path?: string
  ): Promise<Replay> {
    const rec = new Replay();
    if (path) rec.path = path;
    let offset = 0;

    // support replays with more than 2 rides by continually trying to read ride data.
    while (offset < buffer.length) {
      const [header, ride] = await this._parseRide(buffer.slice(offset));
      Object.assign(rec, header);
      rec.rides.push(ride);
      offset += 44 + ride.frames.length * 27 + ride.events.length * 16;
    }

    return rec;
  }

  /**
   * Parses a "ride", which consists of frames and events
   */
  private static async _parseRide(
    buffer: Buffer
  ): Promise<[IRideHeader, Ride]> {
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

    ride.frames = await Replay._parseFrames(
      buffer.slice(offset, offset + 27 * numFrames),
      numFrames
    );
    offset += 27 * numFrames;

    const numEvents = buffer.readUInt32LE(offset);
    offset += 4;
    ride.events = await Replay._parseEvents(
      buffer.slice(offset, offset + 16 * numEvents),
      numEvents
    );
    offset += 16 * numEvents;

    const expected = buffer.readInt32LE(offset);
    if (expected !== EOR_MARKER) {
      throw new Error('End of replay marker mismatch');
    }
    // offset += 4

    return [header, ride];
  }

  private static async _parseFrames(
    buffer: Buffer,
    numFrames: number
  ): Promise<Frame[]> {
    const frames: Frame[] = [];

    for (let i = 0; i < numFrames; i++) {
      const frame = new Frame();
      frame.bike = new Position(
        buffer.readFloatLE(i * 4),
        buffer.readFloatLE(i * 4 + numFrames * 4)
      );
      frame.leftWheel = new Position(
        buffer.readInt16LE(i * 2 + numFrames * 8),
        buffer.readInt16LE(i * 2 + numFrames * 10)
      );
      frame.rightWheel = new Position(
        buffer.readInt16LE(i * 2 + numFrames * 12),
        buffer.readInt16LE(i * 2 + numFrames * 14)
      );
      frame.head = new Position(
        buffer.readInt16LE(i * 2 + numFrames * 16),
        buffer.readInt16LE(i * 2 + numFrames * 18)
      );
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

  private static async _parseEvents(
    buffer: Buffer,
    numEvents: number
  ): Promise<Event[]> {
    const events: Event[] = [];

    let offset = 0;
    for (let i = 0; i < numEvents; i++) {
      const time = buffer.readDoubleLE(offset);
      offset += 8;
      const touchInfo = buffer.readInt16LE(offset);
      offset += 2;
      const type = buffer.readUInt8(offset);
      offset += 2; // 1 + 1 padding
      const groundInfo = buffer.readFloatLE(offset);
      offset += 4;
      if (type < 0 || type > 7) {
        throw new Error(
          `Invalid event type value=${type} at event offset=${offset}`
        );
      }

      events.push({ time, touchInfo, type, groundInfo });
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
  public async toBuffer(): Promise<Buffer> {
    // calculate how many bytes we need by checking each ride's frames and events
    const bufferSize = this.rides.reduce((byteAcc, ride) => {
      const rideBytes = 44 + 27 * ride.frames.length + 16 * ride.events.length;
      return byteAcc + rideBytes;
    }, 0);
    const buffer = Buffer.alloc(bufferSize);
    let offset = 0;

    this.rides.forEach(ride => {
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
        buffer.writeFloatLE(
          ride.frames[i].bike.y,
          offset + i * 4 + numFrames * 4
        );
        buffer.writeInt16LE(
          ride.frames[i].leftWheel.x,
          offset + i * 2 + numFrames * 8
        );
        buffer.writeInt16LE(
          ride.frames[i].leftWheel.y,
          offset + i * 2 + numFrames * 10
        );
        buffer.writeInt16LE(
          ride.frames[i].rightWheel.x,
          offset + i * 2 + numFrames * 12
        );
        buffer.writeInt16LE(
          ride.frames[i].rightWheel.y,
          offset + i * 2 + numFrames * 14
        );
        buffer.writeInt16LE(
          ride.frames[i].head.x,
          offset + i * 2 + numFrames * 16
        );
        buffer.writeInt16LE(
          ride.frames[i].head.y,
          offset + i * 2 + numFrames * 18
        );
        buffer.writeInt16LE(
          ride.frames[i].bikeRotation,
          offset + i * 2 + numFrames * 20
        );
        buffer.writeUInt8(
          ride.frames[i].leftWheelRotation,
          offset + i + numFrames * 22
        );
        buffer.writeUInt8(
          ride.frames[i].rightWheelRotation,
          offset + i + numFrames * 23
        );
        buffer.writeUInt8(
          ride.frames[i].throttleAndDirection,
          offset + i + numFrames * 24
        );
        buffer.writeUInt8(
          ride.frames[i].backWheelSpeed,
          offset + i + numFrames * 25
        );
        buffer.writeUInt8(
          ride.frames[i].collisionStrength,
          offset + i + numFrames * 26
        );
      }

      offset += 27 * numFrames;

      buffer.writeUInt32LE(ride.events.length, offset);
      offset += 4;

      ride.events.forEach(event => {
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

  public async save(path?: string) {
    const buffer = await this.toBuffer();
    await writeFile(path || this.path || this.level, buffer);
  }

  /**
   * Get time of replay in milliseconds.
   */
  public getTime(): IFinishState {
    // First check if last event was a touch event in ride(s) event data.
    const lastEvent = this.rides.reduce((prev: any, ride) => {
      const prevTime = prev ? prev.time : 0;
      const lastRideEvent =
        ride.events.length > 0
          ? ride.events[ride.events.length - 1]
          : undefined;
      const lastRideEventTime = lastRideEvent ? lastRideEvent.time : 0;
      if (lastRideEventTime > prevTime) {
        return lastRideEvent;
      }
      return prev;
    }, undefined);

    // Highest frame time.
    const maxFrames = this.rides.reduce((prev, ride) => {
      return ride.frames.length > prev ? ride.frames.length : prev;
    }, 0);
    const maxFrameTime = maxFrames * 33.333;

    // If no touch event, return approximate frame time.
    if ((lastEvent && lastEvent.type !== EventType.Touch) || !lastEvent) {
      return {
        finished: false,
        reason: ReplayFinishStateReason.NoTouch,
        time: Math.round(maxFrameTime),
      };
    }

    // Set to highest event time.
    const maxEventTime = lastEvent.time * 2289.37728938;

    // If event difference to frame time is >1 frames of time, probably not finished?
    if (maxFrameTime > maxEventTime + 34.333) {
      return {
        finished: false,
        reason: ReplayFinishStateReason.FrameDifference,
        time: Math.round(maxFrameTime),
      };
    }

    // Otherwise probably finished?
    return {
      finished: true,
      reason: ReplayFinishStateReason.Touch,
      time: Math.round(maxEventTime),
    };
  }
}
