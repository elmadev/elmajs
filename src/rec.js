const fs = require('fs')

/**
 * Class containing all replay attributes.
 */
class Replay {
  constructor () {
    this.link = 0
    this.level
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
   * Saves a replay to file.
   * @param {string} filePath Path to file
   * @returns {Promise} Promise
   */
  save (filePath) {
    return new Promise()
  }
}

module.exports = Replay
