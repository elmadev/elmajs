import { LGR } from '../src';

describe('LGR', () => {
  test('load and toBuffer matches #1', async () => {
    const lgr = await LGR.load('__tests__/assets/lgr/Default.lgr');
    lgr.path = '';
    const lgrBuffer = await lgr.toBuffer();
    const loadedBuffer = await LGR.load(lgrBuffer);
    expect(lgr).toEqual(loadedBuffer);
  });

  test('load and toBuffer matches #2', async () => {
    const lgr = await LGR.load('__tests__/assets/lgr/Across.lgr');
    lgr.path = '';
    const lgrBuffer = await lgr.toBuffer();
    const loadedBuffer = await LGR.load(lgrBuffer);
    expect(lgr).toEqual(loadedBuffer);
  });
});
