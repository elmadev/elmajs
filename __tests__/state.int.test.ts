import { readFile, writeFile } from 'fs-extra';

import { PlayMode, SoundOptimization, State, VideoDetail } from '../src';

describe('State', () => {
  test('load and toBuffer matches', async () => {
    const files = ['__tests__/assets/state/state_default.dat', '__tests__/assets/state/state.dat'];

    for (const filePath of files) {
      const file = await readFile(filePath);
      const state = await State.from(file);
      const stateBuffer = await state.toBuffer();
      const loadedBuffer = await State.from(stateBuffer);
      expect(state).toEqual(loadedBuffer);
    }
  });

  test('state matches expected output', async () => {
    const file = await readFile('__tests__/assets/state/state.dat');
    const state = await State.from(file);

    const expectedTimes = {};
    expect(state.times[0]).toEqual(expectedTimes);
    expect(state.playMode).toBe(PlayMode.Single);
    expect(state.soundEnabled).toBe(false);
    expect(state.soundOptimization).toBe(SoundOptimization.Compatibility);
    expect(state.animatedMenus).toBe(true);
    expect(state.videoDetail).toBe(VideoDetail.High);
    expect(state.animatedObjects).toBe(true);
    expect(state.swapBikes).toBe(false);
  });
});
