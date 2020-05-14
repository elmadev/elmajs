import { Buffer } from 'buffer';

import { Top10, TimeEntry } from './shared';

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
export function trimString(buffer: Buffer): string {
  const index = buffer.indexOf('\x00');
  return buffer.toString('ascii', 0, index !== -1 ? index : undefined);
}

/**
 * Convert a Top10 best times list into a unencrypted buffer representation
 * @param top10
 */
export function top10ToBuffer(top10: Top10): Buffer {
  const buffers: Buffer[] = Object.values(top10)
    .reverse() // ordered keys "multi" and "single", so reverse them
    .map((list) => {
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
