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

  // test('Replay save() method without modifications matches original multi-replay', async () => {
  //   const original = await Replay.load(
  //     '__tests__/assets/replays/rec_valid_2.rec'
  //   );
  //   await original.save('temp/save_rec_valid_2.rec');
  //   const savedLoaded = await Replay.load('temp/save_rec_valid_2.rec');
  //   expect(savedLoaded).toEqual(original);
  // });

  // test('Replay save() method without modifications matches original replay 2', async () => {
  //   const original = await Replay.load(
  //     '__tests__/assets/replays/rec_valid_3.rec'
  //   );
  //   await original.save('temp/save_rec_valid_3.rec');
  //   const savedLoaded = await Replay.load('temp/save_rec_valid_3.rec');
  //   expect(savedLoaded).toEqual(original);
  // });

  // test('Invalid Replay event: load() gives error', () => {
  //   return expect(
  //     Replay.load('__tests__/assets/replays/invalid_event.rec')
  //   ).rejects.toEqual(
  //     new Error('Invalid event type value=8 at event offset=288')
  //   );
  // });

  // test('getTime, finished, single', async () => {
  // 	const rec = Replay.load('test/assets/replays/rec_valid_1.rec')
  // 	expect(rec.getTime()).toEqual({ time: 14649, finished: true, reason: undefined })
  // })

  // test('getTime, finished, multi', async () => {
  // 	const rec = Replay.load('test/assets/replays/rec_valid_1.rec')
  // 	expect(rec.getTime()).toEqual({ time: 14671, finished: true, reason: undefined })
  // })

  // test('getTime, unfinished, no event', async () => {
  // 	return Replay.load('test/assets/replays/unfinished.rec').then(result => {
  // 		t.deepEqual(result.getTime(), { time: 533, finished: false, reason: 'framediff' })
  // 	}).catch(error => t.fail(error))
  // })

  // test('getTime, unfinished, single, event', async () => {
  // 	return Replay.load('test/assets/replays/rec_valid_3.rec').then(result => {
  // 		t.deepEqual(result.getTime(), { time: 4767, finished: false, reason: 'framediff' })
  // 	}).catch(error => t.fail(error))
  // })

  // test('getTime, unfinished, multi, event', async () => {
  // 	return Replay.load('test/assets/replays/multi_event_unfinished.rec').then(result => {
  // 		t.deepEqual(result.getTime(), { time: 1600, finished: false, reason: 'framediff' })
  // 	}).catch(error => t.fail(error))
  // })

  // test('getTime, unfinished, multi, event 2', async () => {
  // 	return Replay.load('test/assets/replays/multi_event_unfinished_2.rec').then(result => {
  // 		t.deepEqual(result.getTime(), { time: 3233, finished: false, reason: 'notouch' })
  // 	}).catch(error => t.fail(error))
  // })

  // test('getTime, unfinished, single, event, framediff', async () => {
  // 	return Replay.load('test/assets/replays/event_unfinished.rec').then(result => {
  // 		t.deepEqual(result.getTime(), { time: 8567, finished: false, reason: 'framediff' })
  // 	}).catch(error => t.fail(error))
  // })

  // test('Replay toBuffer() returns buffer with valid data', async () => {
  // 	return Replay.load('test/assets/replays/rec_valid_1.rec').then(result => {
  // 		return result.toBuffer().then(buffer => {
  // 			t.is(buffer[0], 0xB8)
  // 			t.is(buffer[178], 0x05)
  // 			t.is(buffer[292], 0x4B)
  // 			t.is(buffer[449], 0xA5)
  // 			t.is(buffer[950], 0xCF)
  // 			t.is(buffer[1110], 0xB1)
  // 			t.is(buffer[1585], 0x80)
  // 			t.is(buffer[1989], 0xE8)
  // 			t.is(buffer[2383], 0x3F)
  // 			t.is(buffer[2601], 0x05)
  // 			t.is(buffer[3010], 0xB4)
  // 		}).catch(error => t.fail(error))
  // 	}).catch(error => t.fail(error))
  // })
});
