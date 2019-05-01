import { State } from '../src';

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
});
