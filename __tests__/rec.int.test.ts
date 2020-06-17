import { readFile } from 'fs-extra';

import { Direction, EventType, Replay, ReplayFinishStateReason } from '../src/rec';
import { Position } from '../src/shared';

describe('Replay', () => {
  test('parses valid replay #1', async () => {
    const filePath = '__tests__/assets/replays/rec_valid_1.rec';
    const file = await readFile(filePath);
    const replay = Replay.from(file);
    expect(replay).toBeInstanceOf(Replay);
    expect(replay.isMulti).toBeFalsy();
    expect(replay.isFlagTag).toBeFalsy();
    expect(replay.link).toBe(2549082363);
    expect(replay.level).toBe('tutor14.lev');
    expect(replay.rides[0].frames.length).toBe(440);

    // few random frames
    expect(replay.rides[0].frames[0]).toEqual({
      backWheelSpeed: 0,
      bike: new Position(34.3025016784668, -1.1253118515014648),
      bikeRotation: 10000,
      collisionStrength: 0,
      head: new Position(0, 439),
      leftWheel: new Position(-850, -524),
      leftWheelRotation: 250,
      rightWheel: new Position(849, -524),
      rightWheelRotation: 0,
      throttleAndDirection: 205,
    });
    expect(replay.rides[0].frames[0].direction).toBe(Direction.Left);
    expect(replay.rides[0].frames[0].throttle).toBe(true);

    expect(replay.rides[0].frames[100]).toEqual({
      backWheelSpeed: 114,
      bike: new Position(27.14251708984375, -1.1152113676071167),
      bikeRotation: 9826,
      collisionStrength: 0,
      head: new Position(74, 397),
      leftWheel: new Position(-903, -514),
      leftWheelRotation: 248,
      rightWheel: new Position(586, -534),
      rightWheelRotation: 238,
      throttleAndDirection: 173,
    });
    expect(replay.rides[0].frames[100].direction).toBe(Direction.Left);
    expect(replay.rides[0].frames[100].throttle).toBe(true);

    expect(replay.rides[0].frames[439]).toEqual({
      backWheelSpeed: 136,
      bike: new Position(-34.77971267700195, 11.52646541595459),
      bikeRotation: 9047,
      collisionStrength: 22,
      head: new Position(226, 376),
      leftWheel: new Position(-1050, -33),
      leftWheelRotation: 73,
      rightWheel: new Position(286, -757),
      rightWheelRotation: 163,
      throttleAndDirection: 29,
    });
    expect(replay.rides[0].frames[439].direction).toBe(Direction.Left);
    expect(replay.rides[0].frames[439].throttle).toBe(true);

    // some random events
    expect(replay.rides[0].events.length).toBe(24);
    expect(replay.rides[0].events[0]).toEqual({
      groundInfo: 0.9900000095367432,
      time: 1.57728480001688,
      touchInfo: -1,
      type: EventType.VoltRight,
    });
    expect(replay.rides[0].events[1]).toEqual({
      groundInfo: 0.7211928367614746,
      time: 1.6974048000097273,
      touchInfo: -1,
      type: EventType.Ground,
    });
    expect(replay.rides[0].events[11]).toEqual({
      groundInfo: 0.9900000095367432,
      time: 3.9464880000114437,
      touchInfo: -1,
      type: EventType.VoltLeft,
    });
    expect(replay.rides[0].events[23]).toEqual({
      groundInfo: 0,
      time: 6.398683200001716,
      touchInfo: 3,
      type: EventType.Touch,
    });
  });

  test('parses valid multi replay #1', async () => {
    const filePath = '__tests__/assets/replays/rec_valid_2.rec';
    const file = await readFile(filePath);
    const replay = Replay.from(file);
    expect(replay).toBeInstanceOf(Replay);
    expect(replay.isMulti).toBeTruthy();
    expect(replay.isFlagTag).toBeFalsy();
    expect(replay.link).toBe(2549082363);
    expect(replay.level).toBe('tutor14.lev');

    expect(replay.rides[0].frames.length).toBe(440);
    expect(replay.rides[1].frames.length).toBe(441);

    expect(replay.rides[0].frames[439]).toEqual({
      backWheelSpeed: 136,
      bike: new Position(-34.77971267700195, 11.52646541595459),
      bikeRotation: 9047,
      collisionStrength: 22,
      head: new Position(226, 376),
      leftWheel: new Position(-1050, -33),
      leftWheelRotation: 73,
      rightWheel: new Position(286, -757),
      rightWheelRotation: 163,
      throttleAndDirection: 29,
    });
    expect(replay.rides[0].frames[439].direction).toBe(Direction.Left);
    expect(replay.rides[0].frames[439].throttle).toBe(true);

    expect(replay.rides[1].frames[0].bike.y).toBe(-1.1253118515014648);
    expect(replay.rides[1].frames[100].bike.x).toBe(27.138593673706055);

    expect(replay.rides[0].events.length).toBe(24);
    expect(replay.rides[1].events.length).toBe(23);
  });

  test('getTime, finished, single', async () => {
    const filePath = '__tests__/assets/replays/rec_valid_1.rec';
    const file = await readFile(filePath);
    const rec = Replay.from(file);
    expect(rec.getTime()).toEqual({
      finished: true,
      reason: ReplayFinishStateReason.Touch,
      time: 14649,
    });
  });

  test('getTime, finished, multi', async () => {
    const filePath = '__tests__/assets/replays/rec_valid_2.rec';
    const file = await readFile(filePath);
    const rec = Replay.from(file);
    expect(rec.getTime()).toEqual({
      finished: true,
      reason: ReplayFinishStateReason.Touch,
      time: 14671,
    });
  });

  test('getTime, unfinished, no event', async () => {
    const filePath = '__tests__/assets/replays/unfinished.rec';
    const file = await readFile(filePath);
    const rec = Replay.from(file);
    expect(rec.getTime()).toEqual({
      finished: false,
      reason: ReplayFinishStateReason.NoTouch,
      time: 533,
    });
  });

  test('getTime, unfinished, single, event', async () => {
    const filePath = '__tests__/assets/replays/rec_valid_3.rec';
    const file = await readFile(filePath);
    const rec = Replay.from(file);
    expect(rec.getTime()).toEqual({
      finished: false,
      reason: ReplayFinishStateReason.NoTouch,
      time: 4767,
    });
  });

  test('getTime, unfinished, multi, event', async () => {
    const filePath = '__tests__/assets/replays/multi_event_unfinished.rec';
    const file = await readFile(filePath);
    const rec = Replay.from(file);
    expect(rec.getTime()).toEqual({
      finished: false,
      reason: ReplayFinishStateReason.NoTouch,
      time: 1600,
    });
  });

  test('getTime, unfinished, multi, event 2', async () => {
    const filePath = '__tests__/assets/replays/multi_event_unfinished_2.rec';
    const file = await readFile(filePath);
    const rec = Replay.from(file);
    expect(rec.getTime()).toEqual({
      finished: false,
      reason: ReplayFinishStateReason.NoTouch,
      time: 3233,
    });
  });

  test('getTime, unfinished, single, event, framediff', async () => {
    const filePath = '__tests__/assets/replays/event_unfinished.rec';
    const file = await readFile(filePath);
    const rec = Replay.from(file);
    expect(rec.getTime()).toEqual({
      finished: false,
      reason: ReplayFinishStateReason.NoTouch,
      time: 8567,
    });
  });

  test.each(['rec_valid_1.rec', 'rec_valid_2.rec', 'rec_valid_3.rec'])(
    'toBuffer matches original replay: %s',
    async (fileName) => {
      const filePath = `__tests__/assets/replays/${fileName}`;
      const file = await readFile(filePath);
      const replay = Replay.from(file);
      expect(replay.toBuffer()).toEqual(file);
    },
  );
});
