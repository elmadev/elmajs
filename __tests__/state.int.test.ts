import { readFile } from 'fs-extra';

import { PlayMode, SoundOptimization, State, VideoDetail, Top10 } from '../src';

describe('State', () => {
  test.each(['state_default.dat', 'state.dat', 'state_skipped_max_tag.dat'])(
    'toBuffer matches original buffer: %s',
    async (fileName: string) => {
      const file = await readFile(`__tests__/assets/state/${fileName}`);
      const state = State.from(file);
      const stateBuffer = state.toBuffer();
      expect(file).toEqual(stateBuffer);
    },
  );

  test('new State matches default state.dat', async () => {
    const file = await readFile('__tests__/assets/state/state_default.dat');
    const state = State.from(file);

    expect(new State()).toEqual(state);
  });

  describe('parsing matches expected output', () => {
    test('state.dat', async () => {
      const file = await readFile('__tests__/assets/state/state.dat');
      const state = State.from(file);

      const expectedTimes: Top10 = {
        single: [
          {
            name1: 'proman',
            name2: 'proman',
            time: 1465,
          },
          {
            name1: 'proman',
            name2: 'proman',
            time: 1487,
          },
        ],
        multi: [
          {
            name1: 'proman',
            name2: 'proman',
            time: 1492,
          },
          {
            name1: 'proman',
            name2: 'proman',
            time: 1494,
          },
        ],
      };

      expect(state.times[0]).toEqual(expectedTimes);
      expect(state.playMode).toBe(PlayMode.Single);
      expect(state.soundEnabled).toBe(false);
      expect(state.soundOptimization).toBe(SoundOptimization.Compatibility);
      expect(state.animatedMenus).toBe(true);
      expect(state.videoDetail).toBe(VideoDetail.High);
      expect(state.animatedObjects).toBe(true);
      expect(state.swapBikes).toBe(false);
    });

    test('state with 5 skips and up to tag unlocked', async () => {
      const file = await readFile('__tests__/assets/state/state_skipped_max_tag.dat');
      const state = State.from(file);

      expect(state.players[0].skippedInternals.slice(0, 8)).toEqual([
        false,
        false,
        true,
        true,
        true,
        true,
        true,
        false,
      ]);
      expect(state.players[0].lastInternal).toBe(8);
    });
  });
});
