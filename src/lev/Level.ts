import { Buffer } from 'buffer';

import {
  ElmaObject,
  Gravity,
  Top10,
  nullpadString,
  OBJECT_RADIUS,
  ObjectType,
  Picture,
  Polygon,
  Position,
  trimString,
  top10ToBuffer,
  bufferToTop10,
} from '../';
import { BufferInput } from '../shared';

const EOD_MARKER = 0x0067103a; // level data marker
const EOF_MARKER = 0x00845d52; // level file marker

export enum Version {
  Across,
  Elma,
}

export default class Level {
  /**
   * Loads a level from a buffer representation of the file.
   * @param buffer
   */
  public static from(buffer: BufferInput): Level {
    return this.parseBuffer(Buffer.from(buffer));
  }

  /**
   * Encrypts or decrypts top10 lists
   */
  public static cryptTop10(buffer: BufferInput): Buffer {
    const output = Buffer.from(buffer); // copy buffer to not modify reference
    let ebp8 = 0x15;
    let ebp10 = 0x2637;

    for (let i = 0; i < 688; i++) {
      output[i] ^= ebp8 & 0xff;
      // sick domi modifications to work with JS
      ebp10 += (ebp8 % 0xd3d) * 0xd3d;
      ebp8 = ebp10 * 0x1f + 0xd3d;
      ebp8 = (ebp8 & 0xffff) - 2 * (ebp8 & 0x8000);
    }

    return output;
  }

  private static parseBuffer(buffer: Buffer): Level {
    const level = new Level();

    // remove default polygons and objects
    level.polygons = [];
    level.objects = [];

    let offset = 0;

    const version = buffer.toString('ascii', 0, 5);
    switch (version) {
      case 'POT06':
        level.version = Version.Across;
        throw new Error('Across levels are not supported');
      case 'POT14':
        level.version = Version.Elma;
        break;
      default:
        throw new Error('Not valid Elma level');
    }

    offset += 7; // +2 extra unused bytes

    level.link = buffer.readUInt32LE(offset);
    offset += 4;

    for (let i = 0; i < 4; i++) {
      level.integrity[i] = buffer.readDoubleLE(offset);
      offset += 8;
    }

    level.name = trimString(buffer.slice(offset, offset + 51));
    offset += 51;
    level.lgr = trimString(buffer.slice(offset, offset + 16));
    offset += 16;
    level.ground = trimString(buffer.slice(offset, offset + 10));
    offset += 10;
    level.sky = trimString(buffer.slice(offset, offset + 10));
    offset += 10;

    const polyCount = buffer.readDoubleLE(offset) - 0.4643643;
    offset += 8;
    const [polygons, readBytes] = this.parsePolygons(buffer, offset, polyCount);
    level.polygons = polygons;
    offset = readBytes;

    const objectCount = buffer.readDoubleLE(offset) - 0.4643643;
    offset += 8;
    level.objects = this.parseObjects(buffer, offset, objectCount);
    offset += objectCount * 28;

    const picCount = buffer.readDoubleLE(offset) - 0.2345672;
    offset += 8;
    level.pictures = this.parsePictures(buffer, offset, picCount);
    offset += picCount * 54;

    if (buffer.readInt32LE(offset) !== EOD_MARKER) {
      throw new Error('End of data marker mismatch');
    }
    offset += 4;

    const top10Data = Level.cryptTop10(buffer.slice(offset, offset + 688));
    level.top10 = bufferToTop10(top10Data);
    offset += 688;

    if (buffer.readInt32LE(offset) !== EOF_MARKER) {
      throw new Error('End of file marker mismatch');
    }

    return level;
  }

  private static parsePolygons(buffer: Buffer, readBytes: number, polyCount: number): [Polygon[], number] {
    const polygons: Polygon[] = [];

    for (let i = 0; i < polyCount; i++) {
      const polygon = new Polygon();
      polygon.grass = Boolean(buffer.readInt32LE(readBytes));
      readBytes += 4;
      const vertexCount = buffer.readInt32LE(readBytes);
      readBytes += 4;
      for (let j = 0; j < vertexCount; j++) {
        const x = buffer.readDoubleLE(readBytes);
        readBytes += 8;
        const y = buffer.readDoubleLE(readBytes);
        readBytes += 8;
        polygon.vertices.push(new Position(x, -y));
      }
      polygons.push(polygon);
    }

    return [polygons, readBytes];
  }

  private static parseObjects(buffer: Buffer, offset: number, objectCount: number): ElmaObject[] {
    const objects: ElmaObject[] = [];

    for (let i = 0; i < objectCount; i++) {
      const elmaObject = new ElmaObject();
      elmaObject.position.x = buffer.readDoubleLE(offset);
      offset += 8;
      elmaObject.position.y = -buffer.readDoubleLE(offset);
      offset += 8;
      elmaObject.type = buffer.readInt32LE(offset);
      if (elmaObject.type < 1 || elmaObject.type > 4) {
        throw new Error(`Invalid object type value=${elmaObject.type} at offset=${offset}`);
      }
      offset += 4;
      elmaObject.gravity = buffer.readInt32LE(offset);
      if (elmaObject.gravity < 0 || elmaObject.gravity > 4) {
        throw new Error(`Invalid gravity value=${elmaObject.gravity} at offset=${offset}`);
      }
      offset += 4;
      elmaObject.animation = buffer.readInt32LE(offset) + 1;
      offset += 4;

      objects.push(elmaObject);
    }

    return objects;
  }

  private static parsePictures(buffer: Buffer, offset: number, picCount: number): Picture[] {
    const pictures = [];
    for (let i = 0; i < picCount; i++) {
      const picture = new Picture();
      picture.name = trimString(buffer.slice(offset, offset + 10));
      offset += 10;
      picture.texture = trimString(buffer.slice(offset, offset + 10));
      offset += 10;
      picture.mask = trimString(buffer.slice(offset, offset + 10));
      offset += 10;
      picture.position.x = buffer.readDoubleLE(offset);
      offset += 8;
      picture.position.y = -buffer.readDoubleLE(offset);
      offset += 8;
      picture.distance = buffer.readInt32LE(offset);
      offset += 4;
      picture.clip = buffer.readInt32LE(offset);
      if (picture.clip < 0 || picture.clip > 2) {
        throw new Error(`Invalid clip value=${picture.clip} at offset=${offset}`);
      }
      offset += 4;

      pictures.push(picture);
    }

    return pictures;
  }

  public version: Version;
  public link: number;
  public integrity: number[];
  public lgr: string;
  public name: string;
  public ground: string;
  public sky: string;
  public polygons: Polygon[];
  public objects: ElmaObject[];
  public pictures: Picture[];
  public top10: Top10;

  constructor() {
    this.version = Version.Elma;
    this.link = 0;
    this.integrity = [0, 0, 0, 0];
    this.lgr = 'default';
    this.name = 'Unnamed level';
    this.ground = 'ground';
    this.sky = 'sky';
    this.polygons = [
      {
        grass: false,
        vertices: [new Position(10, 0), new Position(10, 7), new Position(0, 7), new Position(0, 0)],
      },
    ];
    this.objects = [
      {
        animation: 1,
        gravity: Gravity.None,
        position: new Position(2, 0 + OBJECT_RADIUS),
        type: ObjectType.Start,
      },
      {
        animation: 1,
        gravity: Gravity.None,
        position: new Position(8, 0 + OBJECT_RADIUS),
        type: ObjectType.Exit,
      },
    ];
    this.pictures = [];
    this.top10 = {
      multi: [],
      single: [],
    };
  }

  /**
   * Returns a buffer representation of the level.
   */
  public toBuffer(): Buffer {
    this.integrity = this.calculateIntegrity();
    let bufferSize = 850; // all known level attributes' size
    for (const polygon of this.polygons) {
      bufferSize += 8 + 16 * polygon.vertices.length;
    }
    bufferSize += 28 * this.objects.length + 54 * this.pictures.length;
    const buffer = Buffer.alloc(bufferSize);

    if (this.version !== Version.Elma) {
      throw new Error('Only Elma levels are supported');
    }
    buffer.write('POT14', 0, 5, 'ascii');
    buffer.writeUInt16LE(this.link & 0xffff, 5);
    buffer.writeUInt32LE(this.link, 7);
    for (let i = 0; i < this.integrity.length; i++) {
      buffer.writeDoubleLE(this.integrity[i], 11 + i * 8);
    }
    const name = nullpadString(this.name, 51);
    buffer.write(name, 43, 51, 'ascii');
    const lgr = nullpadString(this.lgr, 16);
    buffer.write(lgr, 94, 16, 'ascii');
    const ground = nullpadString(this.ground, 10);
    buffer.write(ground, 110, 10, 'ascii');
    const sky = nullpadString(this.sky, 10);
    buffer.write(sky, 120, 10, 'ascii');

    buffer.writeDoubleLE(this.polygons.length + 0.4643643, 130);
    let offset = 138; // unknown territory, time to keep track of offset!
    for (const polygon of this.polygons) {
      buffer.writeInt32LE(polygon.grass ? 1 : 0, offset);
      offset += 4;
      buffer.writeInt32LE(polygon.vertices.length, offset);
      offset += 4;
      for (const vertex of polygon.vertices) {
        buffer.writeDoubleLE(vertex.x, offset);
        offset += 8;
        buffer.writeDoubleLE(-vertex.y, offset);
        offset += 8;
      }
    }

    buffer.writeDoubleLE(this.objects.length + 0.4643643, offset);
    offset += 8;
    for (const obj of this.objects) {
      buffer.writeDoubleLE(obj.position.x, offset);
      offset += 8;
      buffer.writeDoubleLE(-obj.position.y, offset);
      offset += 8;
      buffer.writeInt32LE(obj.type, offset);
      offset += 4;
      buffer.writeInt32LE(obj.gravity, offset);
      offset += 4;
      buffer.writeInt32LE(obj.animation - 1, offset);
      offset += 4;
    }

    buffer.writeDoubleLE(this.pictures.length + 0.2345672, offset);
    offset += 8;
    for (const picture of this.pictures) {
      const picName = nullpadString(picture.name, 10);
      buffer.write(picName, offset, 10, 'ascii');
      offset += 10;
      const texture = nullpadString(picture.texture, 10);
      buffer.write(texture, offset, 10, 'ascii');
      offset += 10;
      const mask = nullpadString(picture.mask, 10);
      buffer.write(mask, offset, 10, 'ascii');
      offset += 10;
      buffer.writeDoubleLE(picture.position.x, offset);
      offset += 8;
      buffer.writeDoubleLE(-picture.position.y, offset);
      offset += 8;
      buffer.writeInt32LE(picture.distance, offset);
      offset += 4;
      buffer.writeInt32LE(picture.clip, offset);
      offset += 4;
    }

    buffer.writeInt32LE(EOD_MARKER, offset);
    offset += 4;
    const top10Buffer = top10ToBuffer(this.top10);
    const encryptedTop10Buffer = Level.cryptTop10(top10Buffer);
    encryptedTop10Buffer.copy(buffer, offset);
    offset += 688;
    buffer.writeInt32LE(EOF_MARKER, offset);

    return buffer;
  }

  /**
   * Calculates the integrity sums of the level.
   * NOTE: Does not currently detect topology errors.
   */
  private calculateIntegrity(): number[] {
    const polSum = this.polygons.reduce((polyAccumulator, polyCurrent) => {
      return (
        polyAccumulator +
        polyCurrent.vertices.reduce((vertAccumulator, vertCurrent) => {
          return vertAccumulator + vertCurrent.x + vertCurrent.y;
        }, 0)
      );
    }, 0);

    const objSum = this.objects.reduce((objAccumulator, objCurrent) => {
      let objVal = 0;
      if (objCurrent.type === ObjectType.Exit) objVal = 1;
      else if (objCurrent.type === ObjectType.Apple) objVal = 2;
      else if (objCurrent.type === ObjectType.Killer) objVal = 3;
      else if (objCurrent.type === ObjectType.Start) objVal = 4;
      return objAccumulator + objCurrent.position.x + objCurrent.position.y + objVal;
    }, 0);

    const picSum = this.pictures.reduce((picAccumulator, picCurrent) => {
      return picAccumulator + picCurrent.position.x + picCurrent.position.y;
    }, 0);

    const sum = (polSum + objSum + picSum) * 3247.764325643;

    return [
      sum,
      this.getRandomInt(0, 5871) + 11877 - sum,
      this.getRandomInt(0, 5871) + 11877 - sum,
      this.getRandomInt(0, 6102) + 12112 - sum,
    ];
  }

  /**
   * Returns a random number in [min..max] range
   */
  private getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }
}
