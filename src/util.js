function formatTime () {
  //
}

/**
 * Pads string with null bytes.
 * @param {string} str String to pad
 * @param {integer} pad Amount to pad
 * @returns {string} string
 */
function nullpadString (str, pad) {
  // check if ascii or padding shorter than string
  if ((!/^[\x00-\x7F]*$/.test(str)) || (str.length > pad)) return undefined
  return str + Array(pad - str.length + 1).join('\x00')
}

/**
 * Trims off null bytes and any additional garbage bytes from a buffer.
 * @param {Buffer} buffer Buffer to parse string from
 * @returns {string} string
 */
function trimString (buffer) {
  let index = buffer.length
  for (let i = 0; i < index; i++) {
    if (buffer[i] === 0x00) {
      index = i
      break
    }
  }
  return buffer.toString('ascii', 0, index)
}

module.exports = {
  formatTime,
  nullpadString,
  trimString
}
