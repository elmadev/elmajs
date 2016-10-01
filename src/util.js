function formatTime () {
  //
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
  trimString
}
