const fs = require('fs')
const trimString = require('./util').trimString
const EOR_MARKER = require('./const').EOR_MARKER

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
   * @static
   * @param {string} filePath Path to file
   * @returns {Promise} Promise
   */
  static load (filePath) {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, (error, buffer) => {
        if (error) reject(error)
        let replay = new Replay()
        replay._parseFile(buffer).then(results => resolve(results)).catch(error => reject(error))
      })
    })
  }

  /**
   * Parses file buffer data into a Replay.
   * @private
   * @returns {Promise}
   */
  _parseFile (buffer) {
    return new Promise((resolve, reject) => {
      let offset = 0
      // frame count
      let numFrames = buffer.readUInt32LE(offset)
      offset += 8 // + 4 unused extra bytes
      // multireplay?
      this.multi = Boolean(buffer.readInt32LE(offset))
      offset += 4
      // flag-tag replay?
      this.flagTag = Boolean(buffer.readInt32LE(offset))
      offset += 4
      // level link
      this.link = buffer.readUInt32LE(offset)
      offset += 4
      // level filename with extension
      this.level = trimString(buffer.slice(offset, offset + 12))
      offset += 16 // + 4 unused extra bytes

      // frames
      this.frames[0] = Replay._parseFrames(buffer.slice(offset, offset + (27 * numFrames)), numFrames)
      offset += 27 * numFrames
      // events
      let numEvents = buffer.readUInt32LE(offset)
      offset += 4
      this.events[0] = Replay._parseEvents(buffer.slice(offset, offset + (16 * numEvents)), numEvents)
      offset += 16 * numEvents

      // end of replay marker
      let expected = buffer.readInt32LE(offset)
      if (expected !== EOR_MARKER) {
        reject('End of replay marker mismatch')
        return
      }

      // if multi rec, parse another set of frames and events while skipping
      // other fields we already gathered from the first half. probably?
      if (this.multi) {
        offset += 4
        let numFrames = buffer.readUInt32LE(offset)
        offset += 36 // +32 bytes where skipping other fields
        this.frames[1] = Replay._parseFrames(buffer.slice(offset, offset + (27 * numFrames)), numFrames)
        offset += 27 * numFrames
        let numEvents = buffer.readUInt32LE(offset)
        offset += 4
        this.events[1] = Replay._parseEvents(buffer.slice(offset, offset + (16 * numEvents)), numEvents)
        offset += 16 * numEvents
        let expected = buffer.readInt32LE(offset)
        if (expected !== EOR_MARKER) {
          reject('End of multi-replay marker mismatch')
          return
        }
      }

      resolve(this)
    })
  }

  /**
   * Parses frame data into an array of frame objects.
   * @private
   * @static
   * @param {Buffer} buffer Frame data to parse.
   * @param {Number} numFrames Number of frames to parse.
   * @returns {Array}
   */
  static _parseFrames (buffer, numFrames) {
    let frames = []
    for (let i = 0; i < numFrames; i++) {
      let data = buffer.readUInt8(i + (numFrames * 24)) // read in data field first to process it
      let frame = {
        bike: { x: buffer.readFloatLE(i * 4), y: buffer.readFloatLE((i * 4) + (numFrames * 4)) },
        leftWheel: { x: buffer.readInt16LE((i * 2) + (numFrames * 8)), y: buffer.readInt16LE((i * 2) + (numFrames * 10)) },
        rightWheel: { x: buffer.readInt16LE((i * 2) + (numFrames * 12)), y: buffer.readInt16LE((i * 2) + (numFrames * 14)) },
        head: { x: buffer.readInt16LE((i * 2) + (numFrames * 16)), y: buffer.readInt16LE((i * 2) + (numFrames * 18)) },
        rotation: buffer.readInt16LE((i * 2) + (numFrames * 20)),
        leftRotation: buffer.readUInt8(i + (numFrames * 22)),
        rightRotation: buffer.readUInt8(i + (numFrames * 23)),
        throttle: (data & 1) !== 0,
        right: (data & (1 << 1)) !== 0,
        volume: buffer.readInt16LE((i * 2) + (numFrames * 25))
      }
      frames.push(frame)
    }
    return frames
  }

  /**
   * Parses event data into an array of event objects.
   * @private
   * @static
   * @param {Buffer} buffer Event data to parse.
   * @param {Number} numEvents Number of events to parse.
   * @returns {Array}
   */
  static _parseEvents (buffer, numEvents) {
    let events = []
    let offset = 0
    for (let i = 0; i < numEvents; i++) {
      let event = {}
      event.time = buffer.readDoubleLE(offset)
      offset += 8
      event.info = buffer.readInt16LE(offset)
      offset += 2
      let eventType = buffer.readUInt8(offset)
      offset += 6 // 1 + 5 unknown bytes
      switch (eventType) {
        case 0:
          event.eventType = 'apple'
          break
        case 1:
          event.eventType = 'ground1'
          break
        case 4:
          event.eventType = 'ground2'
          break
        case 5:
          event.eventType = 'turn'
          break
        case 6:
          event.eventType = 'voltRight'
          break
        case 7:
          event.eventType = 'voltLeft'
          break
        default:
          event.eventType = undefined
          break
      }

      events.push(event)
    }

    return events
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
