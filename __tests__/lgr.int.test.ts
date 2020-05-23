import { readFile } from 'fs-extra';

import { LGR } from '../src';

describe('LGR', () => {
  test.each(['Default.lgr', 'Across.lgr'])('parsing and toBuffer matches: %s', async (fileName: string) => {
    const file = await readFile(`__tests__/assets/lgr/${fileName}`);
    const lgr = LGR.from(file);
    const lgrBuffer = lgr.toBuffer();
    const loadedBuffer = LGR.from(lgrBuffer);
    expect(lgr).toEqual(loadedBuffer);
  });
});
