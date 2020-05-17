import { Buffer } from 'buffer';

import { Top10, TimeEntry, BufferInput } from './shared';

/**
 * Formats time to string.
 * Defaults to: '01:18,03' (mins:secs,hundredths)
 * If time is longer than 1hr will add hours in front: '23:51:00,99'.
 */
export function formatTime(time: number): string {
  const hundredths = Math.trunc(time % 100);
  const seconds = Math.trunc((time / 100) % 60);
  const minutes = Math.trunc((time / (100 * 60)) % 60);
  const hours = Math.trunc(time / (100 * 60 * 60));

  return `${hours ? hours + ':' : ''}${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')},${hundredths.toString().padStart(2, '0')}`;
}

/**
 * Pads a string with null-bytes, or returns a slice, with desired length.
 * @param str String to pad
 * @param length Desired string length
 */
export function nullpadString(str: string, length: number): string {
  if (!/^[\x00-\x7F]*$/.test(str)) {
    throw new Error('String contains non-ASCII values');
  }
  // if string is longer than padding, just return a slice of it
  if (str.length > length) return str.slice(0, length);
  return str.padEnd(length, '\x00');
}

/**
 * Trims null-bytes and any following bytes from buffer and returns a string representation.
 */
export function trimString(buffer: BufferInput): string {
  const bufferObj = Buffer.from(buffer);
  const index = bufferObj.indexOf('\x00');
  return bufferObj.toString('ascii', 0, index !== -1 ? index : undefined);
}

/**
 * Convert a Top10 best times list into a unencrypted buffer representation
 * @param top10
 */
export function top10ToBuffer(top10: Top10): Buffer {
  const buffers: Buffer[] = Object.values(top10).map((list) => {
    // sort all the times first
    list.sort((a: TimeEntry, b: TimeEntry) => {
      if (a.time > b.time) return 1;
      if (a.time < b.time) return -1;
      return 0;
    });

    const buffer = Buffer.alloc(344);
    buffer.writeUInt32LE(list.length >= 10 ? 10 : list.length, 0);

    for (let i = 0; i < list.length; i++) {
      if (i < 10) {
        buffer.writeUInt32LE(list[i].time, 4 + 4 * i);
        buffer.write(nullpadString(list[i].name1, 15), 44 + 15 * i);
        buffer.write(nullpadString(list[i].name2, 15), 194 + 15 * i);
      }
    }

    return buffer;
  });

  return Buffer.concat(buffers, 688);
}

/**
 * Converts buffer to Top10 part. I.e. single-player or multi-player top10 times separately
 * @param buffer unencrypted Buffer of length 344
 */
export function bufferToTop10Part(buffer: BufferInput): TimeEntry[] {
  const bufferObj = Buffer.from(buffer);

  if (bufferObj.length !== 344) throw Error(`Top10 buffer length expected to be 344, got ${bufferObj.length}`);

  const entryCount = bufferObj.readInt32LE(0);
  const top10: TimeEntry[] = [];

  for (let i = 0; i < entryCount; i++) {
    const timeOffset = 4 + i * 4;
    const nameOneOffset = 44 + i * 15;
    const nameOneEnd = nameOneOffset + 15;
    const nameTwoOffset = 194 + i * 15;
    const nameTwoEnd = nameTwoOffset + 15;
    const time = bufferObj.readInt32LE(timeOffset);
    const name1 = trimString(bufferObj.slice(nameOneOffset, nameOneEnd));
    const name2 = trimString(bufferObj.slice(nameTwoOffset, nameTwoEnd));
    top10.push({ time, name1, name2 });
  }

  return top10;
}

/**
 * Converts buffer to Top10
 * @param buffer unencrypted Buffer of length 688
 */
export function bufferToTop10(buffer: BufferInput): Top10 {
  const bufferObj = Buffer.from(buffer);

  if (bufferObj.length !== 688) throw Error(`Top10 buffer length expected to be 688, got ${bufferObj.length}`);

  const single = bufferToTop10Part(bufferObj.slice(0, 344));
  const multi = bufferToTop10Part(bufferObj.slice(344));

  return {
    single,
    multi,
  };
}
