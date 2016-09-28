const binary = require('binary-file')
const TOP10 = require('./const')

/**
 * Class containing all level attributes.
 */
class Level {
  constructor (filePath) {
    //
  }

  /**
   * Loads a level from file.
   * @param {string} filePath Path to file
   * @returns {Level} Level class object
   */
  static load (filePath) {
    let level = new Level()
    return level
  }
}

module.exports = Level
