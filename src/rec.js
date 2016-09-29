const fs = require('fs')

/**
 * Class containing all replay attributes.
 */
class Replay {
  constructor () {
    this.link = 0
    this.level = ''
    this.multi = false
    this.flagTag = false
    this.frames = [[], []]
    this.events = [[], []]
  }

  /**
   * Loads a replay from file.
   * @param {string} filePath Path to file
   * @returns {Promise} Promise
   */
  static load (filePath) {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, (error, buffer) => {
        if (error) reject(error)
        let replay = new Replay()
        resolve(replay)
      })
    })
  }

  /**
   * Get time of replay in milliseconds.
   * @param {bool} hs Return hundredths
   * @returns {Integer} time
   */
  getTime (hs) {
    if (hs) return 0
    return 0
  }

  /**
   * Saves a replay to file.
   * @param {string} filePath Path to file
   * @returns {Promise} Promise
   */
  save (filePath) {
    return new Promise()
  }
}

module.exports = Replay
