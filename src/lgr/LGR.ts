import { Buffer } from 'buffer';
import { PictureData, PictureDeclaration } from '../';
import { nullpadString, trimString } from '../util';
import { BufferInput } from '../shared';

// Magic arbitrary number to signify start of LGR file.
const LGRStart = 0x000003ea;
// Magic arbitrary number to signify end of LGR file.
const LGREOF = 0x0b2e05e7;
// Palette data for default.lgr
const DefaultLGRPalette = new Uint8Array([
  0, 0, 0, 120, 48, 0, 32, 0, 0, 180, 196, 172, 156, 0, 0, 164, 0, 0, 96, 96, 56, 0, 8, 8, 8, 0, 8, 56, 0, 0, 104, 96,
  104, 96, 104, 104, 156, 24, 8, 80, 8, 72, 244, 112, 0, 80, 0, 0, 156, 40, 8, 180, 0, 0, 156, 40, 0, 120, 0, 0, 136,
  64, 16, 156, 16, 8, 40, 8, 0, 0, 128, 8, 0, 128, 0, 244, 228, 16, 128, 0, 0, 56, 48, 48, 32, 32, 48, 0, 96, 0, 188,
  204, 188, 0, 0, 48, 136, 40, 0, 64, 24, 8, 180, 196, 180, 56, 16, 0, 40, 112, 180, 196, 96, 16, 0, 8, 0, 136, 180,
  212, 0, 104, 0, 104, 40, 0, 156, 104, 8, 136, 24, 0, 156, 156, 72, 220, 228, 220, 0, 96, 8, 96, 0, 0, 128, 128, 128,
  136, 136, 96, 120, 128, 148, 72, 64, 32, 0, 212, 24, 96, 96, 96, 104, 96, 96, 148, 48, 0, 136, 48, 196, 120, 32, 0,
  156, 156, 96, 136, 156, 80, 136, 164, 204, 0, 48, 120, 0, 80, 0, 48, 156, 48, 104, 112, 96, 72, 72, 72, 104, 112, 112,
  188, 196, 180, 252, 112, 0, 0, 128, 24, 96, 148, 196, 96, 148, 204, 96, 148, 148, 16, 96, 172, 164, 64, 8, 148, 180,
  212, 196, 0, 0, 0, 48, 0, 148, 0, 0, 172, 0, 0, 136, 48, 0, 0, 32, 0, 64, 16, 0, 180, 188, 188, 0, 136, 8, 72, 96, 72,
  0, 172, 0, 148, 16, 196, 244, 212, 16, 120, 48, 16, 148, 40, 0, 196, 0, 8, 128, 128, 148, 148, 16, 0, 24, 8, 0, 80,
  24, 0, 8, 8, 80, 16, 56, 24, 180, 180, 172, 24, 96, 172, 156, 32, 136, 56, 8, 0, 40, 56, 64, 128, 48, 8, 120, 164,
  204, 120, 164, 112, 16, 0, 0, 188, 180, 64, 236, 188, 56, 32, 32, 32, 164, 180, 172, 0, 120, 8, 80, 80, 80, 0, 120, 0,
  136, 0, 0, 24, 96, 180, 0, 120, 16, 104, 156, 204, 16, 112, 0, 104, 156, 180, 204, 220, 196, 16, 112, 16, 88, 8, 0,
  104, 0, 8, 8, 112, 0, 0, 112, 8, 88, 0, 0, 72, 40, 0, 0, 112, 0, 104, 104, 96, 8, 96, 0, 104, 120, 120, 196, 8, 8, 56,
  64, 64, 0, 64, 0, 148, 104, 96, 56, 64, 32, 96, 0, 164, 228, 96, 8, 16, 16, 8, 16, 16, 16, 32, 104, 180, 112, 156,
  204, 180, 156, 48, 16, 24, 16, 148, 16, 204, 32, 0, 8, 148, 56, 8, 24, 16, 72, 80, 136, 196, 80, 88, 88, 56, 120, 188,
  120, 16, 0, 64, 128, 188, 72, 128, 188, 148, 188, 212, 48, 136, 40, 48, 120, 188, 120, 32, 8, 120, 8, 0, 80, 80, 56,
  72, 0, 0, 64, 64, 64, 96, 96, 88, 136, 24, 8, 16, 32, 8, 40, 0, 0, 72, 80, 64, 40, 48, 40, 16, 120, 8, 48, 104, 188,
  0, 16, 8, 88, 136, 196, 156, 8, 0, 96, 128, 80, 120, 120, 120, 72, 136, 196, 56, 24, 0, 180, 8, 8, 120, 120, 72, 120,
  96, 32, 8, 180, 8, 72, 128, 196, 136, 72, 32, 0, 112, 32, 24, 104, 180, 88, 24, 16, 96, 64, 24, 188, 204, 180, 136,
  136, 148, 48, 112, 180, 24, 24, 24, 16, 56, 0, 120, 172, 204, 8, 16, 24, 80, 212, 40, 104, 212, 244, 0, 96, 204, 104,
  48, 16, 96, 96, 204, 104, 0, 0, 80, 136, 188, 164, 156, 164, 148, 0, 80, 188, 32, 48, 8, 88, 172, 32, 112, 24, 56, 72,
  56, 0, 80, 172, 252, 164, 32, 220, 164, 24, 16, 96, 112, 8, 88, 180, 32, 24, 24, 136, 252, 0, 40, 112, 188, 120, 136,
  128, 236, 220, 72, 32, 40, 64, 120, 48, 8, 104, 164, 196, 244, 164, 120, 236, 156, 120, 120, 64, 16, 188, 16, 8, 96,
  24, 0, 40, 16, 8, 64, 120, 188, 0, 16, 0, 64, 212, 24, 72, 228, 8, 56, 40, 212, 32, 228, 40, 104, 148, 196, 0, 88,
  172, 16, 128, 16, 196, 204, 196, 8, 80, 16, 220, 244, 220, 236, 16, 48, 40, 16, 0, 40, 104, 180, 120, 156, 220, 88,
  16, 212, 48, 48, 80, 88, 148, 196, 220, 0, 0, 212, 212, 212, 0, 8, 156, 0, 148, 196, 88, 80, 80, 72, 220, 40, 16, 80,
  172, 228, 128, 96, 204, 64, 24, 252, 252, 252,
]);

export default class LGR {
  /**
   * Loads a LGR file from a buffer.
   * @param buffer
   */
  public static from(buffer: BufferInput): LGR {
    return this.parseBuffer(Buffer.from(buffer));
  }

  private static parseBuffer(buffer: Buffer): LGR {
    const lgr = new LGR();

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
    lgr.pictureList = lgr.parseListData(buffer.slice(17, 17 + 26 * listLen), listLen);

    // pcx data
    const [pictureData, bytesRead] = lgr.parsePictureData(buffer.slice(17 + 26 * listLen), pictureLen);
    lgr.pictureData = pictureData;

    const expectedEof = buffer.readInt32LE(17 + 26 * listLen + bytesRead);
    if (expectedEof !== LGREOF) {
      throw new Error(`EOF marker expected at byte: ${17 + 26 * listLen + bytesRead}`);
    }
    return lgr;
  }

  public pictureList: PictureDeclaration[] = [];
  public pictureData: PictureData[] = [];
  public path = '';

  /**
   * Returns a buffer representation of the LGR.
   */
  public toBuffer(): Buffer {
    // calculate how many bytes to allocate:
    // - 21 known static bytes, plus 26 bytes for each item in picture.lst
    // - the image data is then reduced and added to that.
    const pictureListLength = this.pictureList.length;
    const bytesToAlloc = this.pictureData.reduce(
      (bytes, picture) => bytes + picture.data.length + 24,
      21 + 26 * pictureListLength,
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
      buffer.write(nullpadString(pictureDeclaration.name, 10), offset + n * 10, 10, 'ascii');
      buffer.writeUInt32LE(pictureDeclaration.pictureType, offset + 10 * pictureListLength + 4 * n);
      buffer.writeUInt32LE(pictureDeclaration.distance, offset + 14 * pictureListLength + 4 * n);
      buffer.writeUInt32LE(pictureDeclaration.clipping, offset + 18 * pictureListLength + 4 * n);
      buffer.writeUInt32LE(pictureDeclaration.transparency, offset + 22 * pictureListLength + 4 * n);
    });

    offset += 26 * pictureListLength;

    this.pictureData.forEach((pictureData) => {
      buffer.write(nullpadString(pictureData.name, 20), offset, 20, 'ascii');
      offset += 20;
      buffer.writeUInt32LE(pictureData.data.length, offset);
      offset += 4;
      offset += pictureData.data.copy(buffer, offset);
    });
    buffer.writeInt32LE(LGREOF, offset);
    return buffer;
  }

  private parseListData(buffer: Buffer, length: number): PictureDeclaration[] {
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

  private parsePictureData(buffer: Buffer, length: number): [PictureData[], number] {
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

  public getPalette(): Uint8Array | undefined {
    // The lgr's palette comes from q1bike.pcx. Other palettes are ignored
    const palette = this.pictureData
      .find((picture) => picture.name.toLowerCase() === 'q1bike.pcx')
      ?.image?.decode().palette;
    return palette;
  }

  public paletteIsDefault(): boolean {
    const palette = this.getPalette();
    return (
      palette?.length === DefaultLGRPalette.length && palette.every((val, index) => val === DefaultLGRPalette[index])
    );
  }
}
