import { readFile } from 'fs-extra';

import { LGR } from '../src';

describe.each([
  ['Default.lgr', true],
  ['Across.lgr', true],
  ['botanic.lgr', false],
])('LGR', (fileName, isDefaultPalette) => {
  test(`parsing and toBuffer matches: ${fileName}`, async () => {
    const file = await readFile(`__tests__/assets/lgr/${fileName}`);
    const lgr = LGR.from(file);
    const lgrBuffer = lgr.toBuffer();
    const loadedBuffer = LGR.from(lgrBuffer);
    expect(lgr).toEqual(loadedBuffer);
  });
  test(`${fileName}.lgr's palette is the default palette: ${isDefaultPalette}`, async () => {
    const file = await readFile(`__tests__/assets/lgr/${fileName}`);
    const lgr = LGR.from(file);
    expect(lgr.paletteIsDefault()).toEqual(isDefaultPalette);
  });
});
