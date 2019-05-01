import { readFile, writeFile } from 'fs-extra';
import {
  Clip,
  PictureData,
  PictureDeclaration,
  PictureType,
  Transparency,
} from '../';
import { nullpadString, trimString } from '../util';

// Magic arbitrary number to signify start of LGR file.
const LGRStart = 0x000003ea;
// Magic arbitrary number to signify end of LGR file.
const LGREOF = 0x0b2e05e7;

export default class LGR {
  /**
   * Loads a level file.
   * @param source Can either be a file path or a buffer
   */
  public static async load(source: string | Buffer): Promise<LGR> {
    if (typeof source === 'string') {
      const file = await readFile(source);
      return this._parseBuffer(file, source);
    } else if (source instanceof Buffer) {
      return this._parseBuffer(source);
    }
    throw new Error(
      'Invalid input argument. Expected string or Buffer instance object'
    );
  }

  private static async _parseBuffer(
    buffer: Buffer,
    path?: string
  ): Promise<LGR> {
    const lgr = new LGR();
    if (path) lgr.path = path;

    const version = buffer.toString('ascii', 0, 5);

    // there are no other LGR versions possible, so no need to store it (?)
    if (version !== 'LGR12') {
      throw new Error(`Invalid LGR version: ${version}`);
    }

    const pictureLen = buffer.readInt32LE(5);
    const expectedHeader = buffer.readInt32LE(9);
    if (expectedHeader !== LGRStart) {
      throw new Error(`Invalid header: ${expectedHeader}`);
    }

    // picture.lst section
    const listLen = buffer.readInt32LE(13);
    lgr.pictureList = await lgr._parseListData(
      buffer.slice(17, 17 + 26 * listLen),
      listLen
    );

    // pcx data
    const [pictureData, bytesRead] = await lgr._parsePictureData(
      buffer.slice(17 + 26 * listLen),
      pictureLen
    );
    lgr.pictureData = pictureData;

    const expectedEof = buffer.readInt32LE(17 + 26 * listLen + bytesRead);
    if (expectedEof !== LGREOF) {
      throw new Error(
        `EOF marker expected at byte: ${17 + 26 * listLen + bytesRead}`
      );
    }
    return lgr;
  }

  public pictureList: PictureDeclaration[] = [];
  public pictureData: PictureData[] = [];
  public path: string = '';

  /**
   * Returns a buffer representation of the LGR.
   */
  public async toBuffer(): Promise<Buffer> {
    // calculate how many bytes to allocate:
    // - 21 known static bytes, plus 26 bytes for each item in picture.lst
    // - the image data is then reduced and added to that.
    const pictureListLength = this.pictureList.length;
    const bytesToAlloc = this.pictureData.reduce(
      (bytes, picture) => bytes + picture.data.length + 24,
      21 + 26 * pictureListLength
    );
    const buffer = Buffer.alloc(bytesToAlloc);
    let offset = 0;
    buffer.write('LGR12', offset, 5, 'ascii');
    offset += 5;
    buffer.writeUInt32LE(this.pictureData.length, offset);
    offset += 4;
    buffer.writeInt32LE(LGRStart, offset);
    offset += 4;
    buffer.writeUInt32LE(pictureListLength, offset);
    offset += 4;

    this.pictureList.forEach((pictureDeclaration, n) => {
      buffer.write(
        nullpadString(pictureDeclaration.name, 10),
        offset + n * 10,
        10,
        'ascii'
      );
      buffer.writeUInt32LE(
        pictureDeclaration.pictureType,
        offset + 10 * pictureListLength + 4 * n
      );
      buffer.writeUInt32LE(
        pictureDeclaration.distance,
        offset + 14 * pictureListLength + 4 * n
      );
      buffer.writeUInt32LE(
        pictureDeclaration.clipping,
        offset + 18 * pictureListLength + 4 * n
      );
      buffer.writeUInt32LE(
        pictureDeclaration.transparency,
        offset + 22 * pictureListLength + 4 * n
      );
    });

    offset += 26 * pictureListLength;

    this.pictureData.forEach(pictureData => {
      buffer.write(nullpadString(pictureData.name, 20), offset, 20, 'ascii');
      offset += 20;
      buffer.writeUInt32LE(pictureData.data.length, offset);
      offset += 4;
      offset += pictureData.data.copy(buffer, offset);
    });
    buffer.writeInt32LE(LGREOF, offset);
    return buffer;
  }

  public async save(path?: string) {
    const buffer = await this.toBuffer();
    await writeFile(path || this.path, buffer);
  }

  private async _parseListData(
    buffer: Buffer,
    length: number
  ): Promise<PictureDeclaration[]> {
    const pictureDeclarations: PictureDeclaration[] = [];
    let offset = 0;
    const names = buffer.slice(offset, offset + length * 10);
    offset += length * 10;
    const pictureTypes = buffer.slice(offset, offset + length * 4);
    offset += length * 4;
    const distances = buffer.slice(offset, offset + length * 4);
    offset += length * 4;
    const clips = buffer.slice(offset, offset + length * 4);
    offset += length * 4;
    const transparencies = buffer.slice(offset, offset + length * 4);
    for (let i = 0; i < length; i++) {
      const pictureDeclaration = new PictureDeclaration();
      pictureDeclaration.name = trimString(names.slice(10 * i, 10 * i + 10));
      pictureDeclaration.pictureType = pictureTypes.readInt32LE(i * 4);
      pictureDeclaration.distance = distances.readInt32LE(i * 4);
      pictureDeclaration.clipping = clips.readInt32LE(i * 4);
      pictureDeclaration.transparency = transparencies.readInt32LE(i * 4);
      pictureDeclarations.push(pictureDeclaration);
    }

    return pictureDeclarations;
  }

  private async _parsePictureData(
    buffer: Buffer,
    length: number
  ): Promise<[PictureData[], number]> {
    const pictures: PictureData[] = [];
    let offset = 0;
    for (let i = 0; i < length; i++) {
      const name = trimString(buffer.slice(offset, offset + 12));
      offset += 20; // +8 garbage (?) bytes
      const bytesToRead = buffer.readUInt32LE(offset);
      offset += 4;
      const data = buffer.slice(offset, offset + bytesToRead);
      pictures.push(new PictureData(name, data));
      offset += bytesToRead;
    }
    // we need to return amount of bytes read in order to correctly get the offset later.
    return [pictures, offset];
  }
}
