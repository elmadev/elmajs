import { Buffer } from 'buffer';

import { nullpadString, trimString, cryptPiece, CryptKey } from '../util';
import { BufferInput } from '../shared';

const MAX_FILES = 150;
const RESOURCE_FILE_SIZE = 24;
const ENCRYPTED_SIZE = MAX_FILES * RESOURCE_FILE_SIZE;
const MAGIC_NUMBER = 1347839;
const HEADER_SIZE = 4 + ENCRYPTED_SIZE + 4;
const CRYPT_KEY: CryptKey = [23, 9982, 3391, 31];

export interface ResourceFile {
  name: string;
  data: Buffer;
}

export default class Resource {
  public files: ResourceFile[] = [];

  /**
   * Loads a resource file from a buffer.
   * @param buffer
   */
  public static from(buffer: BufferInput): Resource {
    return this.parseBuffer(Buffer.from(buffer));
  }

  private static parseBuffer(buffer: Buffer): Resource {
    const res = new Resource();

    const magicNumber = buffer.readUInt32LE(4 + ENCRYPTED_SIZE);
    if (magicNumber !== MAGIC_NUMBER) throw Error(`Magic Number not found, is this really a .res file?`);

    const fileCount = buffer.readUInt32LE(0);
    if (fileCount > MAX_FILES) throw Error(`Max number of files is ${MAX_FILES}, but got ${fileCount} files`);
    const decryptedHeader = this.cryptHeader(buffer.slice(4, 4 + ENCRYPTED_SIZE));
    for (let i = 0; i < fileCount; i++) {
      const pos = i * RESOURCE_FILE_SIZE;
      const name = trimString(decryptedHeader.slice(pos, pos + 16));
      const length = decryptedHeader.readUInt32LE(pos + 16);
      const offset = decryptedHeader.readUInt32LE(pos + 20);
      const data = buffer.slice(offset, offset + length);
      res.files.push({ name, data });
    }

    return res;
  }

  public toBuffer(): Buffer {
    const fileCount = this.files.length;
    if (fileCount > MAX_FILES) throw Error(`Max number of files is ${MAX_FILES}, but got ${fileCount} files`);

    const size = HEADER_SIZE + this.files.reduce((sum, file) => sum + file.data.length, 0);
    const buffer = Buffer.alloc(size);
    const header = Buffer.alloc(ENCRYPTED_SIZE);

    buffer.writeUInt32LE(fileCount, 0);
    buffer.writeUInt32LE(MAGIC_NUMBER, 4 + ENCRYPTED_SIZE);
    let offset = HEADER_SIZE;
    for (let i = 0; i < fileCount; i++) {
      const pos = i * RESOURCE_FILE_SIZE;
      const name = this.files[i].name;
      const data = this.files[i].data;
      const length = data.length;
      if (name.length > 12) throw Error(`Filename ${name} is too long (max 12 characters)`);
      if (!name.includes('.')) throw Error(`Filename ${name} needs to include a file extension!`);
      header.write(nullpadString(name, 16), pos, 16, 'ascii');
      header.writeUInt32LE(length, pos + 16);
      header.writeUInt32LE(offset, pos + 20);
      data.copy(buffer, offset);
      offset += length;
    }

    const encryptedHeader = Resource.cryptHeader(header);
    encryptedHeader.copy(buffer, 4);

    return buffer;
  }

  private static cryptHeader(buffer: Buffer): Buffer {
    const bufCopy = Buffer.from(buffer);
    if (bufCopy.length !== ENCRYPTED_SIZE)
      throw Error(`Invalid resource header length, expected buffer length of ${ENCRYPTED_SIZE}, got ${bufCopy.length}`);
    const cryptedHeader = cryptPiece(bufCopy, CRYPT_KEY);
    return cryptedHeader;
  }
}
