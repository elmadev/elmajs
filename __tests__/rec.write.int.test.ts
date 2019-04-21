import { readFile } from 'fs-extra';
import { Replay } from '../src/rec';

describe('Replay writing', () => {
  test('Replay save() method without modifications matches original replay', async () => {
    const original = await Replay.load(
      '__tests__/assets/replays/rec_valid_1.rec'
    );
    await original.save('temp/save_rec_valid_1.rec');
    const savedLoaded = await Replay.load('temp/save_rec_valid_1.rec');
    savedLoaded.path = '';
    original.path = '';
    expect(savedLoaded).toEqual(original);
  });

  test('.toBuffer() of unmodified replay matches original #1', async () => {
    const originalFile = await Replay.load(
      '__tests__/assets/replays/rec_valid_1.rec'
    );
    const file = await readFile('__tests__/assets/replays/rec_valid_1.rec');
    const buffer = await originalFile.toBuffer();
    expect(file.length).toEqual(buffer.length);
    const bufferReplay = await Replay.load(buffer);

    originalFile.path = '';
    bufferReplay.path = '';
    expect(originalFile).toEqual(bufferReplay);
  });

  test('Replay save() method without modifications matches original multi-replay', async () => {
    const original = await Replay.load(
      '__tests__/assets/replays/rec_valid_2.rec'
    );
    await original.save('temp/save_rec_valid_2.rec');
    const savedLoaded = await Replay.load('temp/save_rec_valid_2.rec');
    original.path = '';
    savedLoaded.path = '';
    expect(original).toEqual(savedLoaded);
  });

  test('Replay save() method without modifications matches original replay 2', async () => {
    const original = await Replay.load(
      '__tests__/assets/replays/rec_valid_3.rec'
    );
    await original.save('temp/save_rec_valid_3.rec');
    const savedLoaded = await Replay.load('temp/save_rec_valid_3.rec');
    original.path = '';
    savedLoaded.path = '';
    expect(original).toEqual(savedLoaded);
  });

  test('Replay toBuffer() returns buffer with valid data', async () => {
    // how useful is this test? shrug, doesn't hurt I suppose
    const rec = await Replay.load('__tests__/assets/replays/rec_valid_1.rec');
    const buffer = await rec.toBuffer();

    expect(buffer[0]).toBe(0xb8);
    expect(buffer[178]).toBe(0x05);
    expect(buffer[292]).toBe(0x4b);
    expect(buffer[449]).toBe(0xa5);
    expect(buffer[950]).toBe(0xcf);
    expect(buffer[1110]).toBe(0xb1);
    expect(buffer[1585]).toBe(0x80);
    expect(buffer[1989]).toBe(0xe8);
    expect(buffer[2383]).toBe(0x3f);
    expect(buffer[2601]).toBe(0x05);
    expect(buffer[3010]).toBe(0xb4);
  });
});
