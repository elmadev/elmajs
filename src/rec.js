
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
   * @returns {Replay} Replay class object
   */
  static load (filePath) {
    let replay = new Replay()
    return replay
  }

  /**
   * Saves a replay to file.
   * @param {string} filePath Path to file
   * @returns {bool} Failure or success
   */
  save (filePath) {
    return false
  }
}

module.exports = Replay
