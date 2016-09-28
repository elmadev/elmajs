const binary = require('binary-file')

/**
 * Class containing all replay attributes.
 */
class Replay {
  constructor (filePath) {
    //
  }

  /**
   * Loads a replay from file.
   * @param {string} filePath Path to file
   * @returns {Replay} Replay class object
   */
  static load (filePath) {
    let replay = new Replay()
    return replay
  }
}

module.exports = Replay
