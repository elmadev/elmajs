import { readFile, writeFile } from 'fs-extra';
import { nullpadString, trimString } from '../util';
import { PictureData, PictureDeclaration } from './';

export default class LGR {
  /**
   * Loads a level file.
   * @param source Can either be a file path or a buffer
   */
  public static async load(source: string | Buffer): Promise<LGR> {
    if (typeof source === 'string') {
      const file = await readFile(source);
      return this._parseBuffer(file);
    } else if (source instanceof Buffer) {
      return this._parseBuffer(source);
    }
    throw new Error(
      'Invalid input argument. Expected string or Buffer instance object'
    );
  }

  private static async _parseBuffer(source: string | Buffer): Promise<LGR> {
    const lgr = new LGR();
    return lgr;
  }

  public pictureList: PictureDeclaration[] = [];
  public pictureData: PictureData[] = [];

  /**
   * Returns a buffer representation of the LGR.
   */
  public async toBuffer(): Promise<Buffer> {
    const buffer = Buffer.alloc(0);
    return buffer;
  }
  public async save() {}
}
