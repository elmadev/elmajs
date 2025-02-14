import { readFile } from 'fs-extra';

import { Resource } from '../src';

describe('Res', () => {
  // This test actually doesn't work with Across.res/Elma.res due to garbage bytes after the end of strings
  test('toBuffer matches original buffer', async () => {
    const file = await readFile(`__tests__/assets/res/abc.res`);
    const res = Resource.from(file);
    const resBuffer = res.toBuffer();
    expect(file).toEqual(resBuffer);
  });
  test('Parsing matches expected output', async () => {
    const file = await readFile(`__tests__/assets/res/abc.res`);
    const res = Resource.from(file);
    expect(res.files.length).toEqual(3);
    expect(res.files[0].name).toEqual('a.a');
    expect(res.files[1].name).toEqual('b.b');
    expect(res.files[2].name).toEqual('cccccccC.ccc');
    expect(res.files[0].data).toEqual(Buffer.from('FileA'));
    expect(res.files[1].data).toEqual(Buffer.from([0, 0, 0]));
    expect(res.files[2].data).toEqual(Buffer.from('FileC'));
  });
  test('toBuffer throws error: Filename too long', async () => {
    const res = new Resource();
    res.files.push({ name: 'length=13.bad', data: Buffer.from([0]) });
    expect(() => res.toBuffer()).toThrowError('Filename length=13.bad is too long (max 12 characters)');
  });
  test('toBuffer throws error: Filename no ext', async () => {
    const res = new Resource();
    res.files.push({ name: 'noext', data: Buffer.from([0]) });
    expect(() => res.toBuffer()).toThrowError('Filename noext needs to include a file extension!');
  });
  test('toBuffer throws error: Too many files', async () => {
    const res = new Resource();
    for (let i = 0; i < 151; i++) {
      res.files.push({ name: `file{i}.txt`, data: Buffer.from([i]) });
    }
    expect(() => res.toBuffer()).toThrowError('Max number of files is 150, but got 151 files');
  });
  test('from throws error: Too many files', async () => {
    const file = await readFile(`__tests__/assets/res/too_many_files.res`);
    expect(() => Resource.from(file)).toThrowError('Max number of files is 150, but got 151 files');
  });
  test('from throws error: Magic number', async () => {
    const file = await readFile(`__tests__/assets/res/magic_number.res`);
    expect(() => Resource.from(file)).toThrowError('Magic Number not found, is this really a .res file?');
  });
});
