/**
 * Formats time to string.
 * Defaults to: '01:18,03' (mins:secs,hundredths)
 * If time is longer than 1hr will add hours in front: '23:51:00,99'.
 */

export function formatTime(time: number) {
  const hundredths = Math.trunc(time % 100)
  const seconds = Math.trunc((time / 100) % 60)
  const minutes = Math.trunc((time / (100 * 60)) % 60)
  const hours = Math.trunc(time / (100 * 60 * 60))

  return `${hours ? hours + ':' : ''}${minutes
    .toString()
    .padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')},${hundredths.toString().padStart(2, '0')}`
}

/**
 * Pads a string with null-bytes, or returns a slice, with desired length.
 * @param str String to pad
 * @param length Desired string length
 */
export function nullpadString(str: string, length: number) {
  if (!/^[\x00-\x7F]*$/.test(str)) {
    throw new Error('String contains non-ASCII values')
  }
  // if string is longer than padding, just return a slice of it
  if (str.length > length) return str.slice(0, length)
  return str.padEnd(length, '\x00')
}

/**
 * Trims null-bytes and any following bytes from buffer and returns a string representation.
 */
export function trimString(buffer: Buffer) {
  const index = buffer.indexOf('\x00')
  return buffer.toString('ascii', 0, index !== -1 ? index : undefined)
}
