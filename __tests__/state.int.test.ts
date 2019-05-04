import { PlayMode, SoundOptimization, State, VideoDetail } from '../src';

describe('State', () => {
  test('load and toBuffer matches #1', async () => {
    const state = await State.load('__tests__/assets/state/state_default.dat');
    state.path = '';
    const stateBuffer = await state.toBuffer();
    const loadedBuffer = await State.load(stateBuffer);
    expect(state).toEqual(loadedBuffer);
  });

  test('load and toBuffer matches #2', async () => {
    const state = await State.load('__tests__/assets/state/state.dat');
    state.path = '';
    const stateBuffer = await state.toBuffer();
    const loadedBuffer = await State.load(stateBuffer);
    expect(state).toEqual(loadedBuffer);
  });

  test('state matches expected output', async () => {
    const state = await State.load('__tests__/assets/state/state.dat');

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
