const fs = require('fs')
const nullpadString = require('./util').nullpadString
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
          event.eventType = 'touch'
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
          throw new Error('Unknown event type')
      }

      events.push(event)
    }

    return events
  }

  /**
   * Internal convinience method.
   * @private
   * @param {Bool} multi Process 2nd part of multi-replay data?
   * @returns {Promise}
   */
  _update (multi) {
    return new Promise((resolve, reject) => {
      // figure out how big of a buffer to create since dynamic allocation is not a thing...
      let playerIndex = multi ? 1 : 0
      let numFrames = this.frames[playerIndex].length
      let bufferSize = 44 + (27 * numFrames) + (16 * this.events[playerIndex].length)
      let buffer = Buffer.alloc(bufferSize)

      buffer.writeUInt32LE(numFrames, 0)
      buffer.writeUInt32LE(0x83, 4)
      buffer.writeUInt32LE(this.multi ? 1 : 0, 8)
      buffer.writeUInt32LE(this.flagTag ? 1 : 0, 12)
      buffer.writeUInt32LE(this.link, 16)
      buffer.write(nullpadString(this.level, 12), 20, 'ascii')
      buffer.writeUInt32LE(0, 32)

      for (let i = 0; i < numFrames; i++) {
        buffer.writeFloatLE(this.frames[playerIndex][i].bike.x, 36 + (i * 4))
        buffer.writeFloatLE(this.frames[playerIndex][i].bike.y, 36 + (i * 4) + (numFrames * 4))
        buffer.writeInt16LE(this.frames[playerIndex][i].leftWheel.x, 36 + (i * 2) + (numFrames * 8))
        buffer.writeInt16LE(this.frames[playerIndex][i].leftWheel.y, 36 + (i * 2) + (numFrames * 10))
        buffer.writeInt16LE(this.frames[playerIndex][i].rightWheel.x, 36 + (i * 2) + (numFrames * 12))
        buffer.writeInt16LE(this.frames[playerIndex][i].rightWheel.y, 36 + (i * 2) + (numFrames * 14))
        buffer.writeInt16LE(this.frames[playerIndex][i].head.x, 36 + (i * 2) + (numFrames * 16))
        buffer.writeInt16LE(this.frames[playerIndex][i].head.y, 36 + (i * 2) + (numFrames * 18))
        buffer.writeInt16LE(this.frames[playerIndex][i].rotation, 36 + (i * 2) + (numFrames * 20))
        buffer.writeUInt8(this.frames[playerIndex][i].leftRotation, 36 + i + (numFrames * 22))
        buffer.writeUInt8(this.frames[playerIndex][i].rightRotation, 36 + i + (numFrames * 23))
        let data = Math.floor(Math.random() * (255)) & 0xFC // generate random data for rec because why not eh?
        if (this.frames[playerIndex][i].throttle) data |= 1
        if (this.frames[playerIndex][i].right) data |= 2
        buffer.writeUInt8(data, 36 + i + (numFrames * 24))
        buffer.writeInt16LE(this.frames[playerIndex][i].volume, 36 + (i * 2) + (numFrames * 25))
      }

      // need to start keeping track of offset from now on
      let offset = 36 + (27 * numFrames)

      buffer.writeUInt32LE(this.events[playerIndex].length, offset)
      offset += 4

      this.events[playerIndex].forEach(event => {
        buffer.writeDoubleLE(event.time, offset)
        offset += 8
        switch (event.eventType) {
          case 'touch':
            buffer.writeUInt32LE(event.info, offset)
            buffer.writeUInt32LE(0, offset + 4)
            break
          case 'ground1':
            buffer.writeUInt32LE(131071, offset)
            buffer.writeUInt32LE(1050605825, offset + 4)
            break
          case 'ground2':
            buffer.writeUInt32LE(327679, offset)
            buffer.writeUInt32LE(1065185444, offset + 4)
            break
          case 'turn':
            buffer.writeUInt32LE(393215, offset)
            buffer.writeUInt32LE(1065185444, offset + 4)
            break
          case 'voltRight':
            buffer.writeUInt32LE(458751, offset)
            buffer.writeUInt32LE(1065185444, offset + 4)
            break
          case 'voltLeft':
            buffer.writeUInt32LE(524287, offset)
            buffer.writeUInt32LE(1065185444, offset + 4)
            break
          default:
            reject('Unknown event type')
            return
        }
        offset += 8
      })
      buffer.writeUInt32LE(EOR_MARKER, offset)

      resolve(buffer)
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
    return new Promise((resolve, reject) => {
      if (!filePath) reject('No filepath specified')
      if (this.multi) {
        let singleBuffer = this._update(false)
        let multiBuffer = this._update(true)
        Promise.all([singleBuffer, multiBuffer]).then(buffers => {
          let combinedBuffer = Buffer.concat([buffers[0], buffers[1]])
          fs.writeFile(filePath, combinedBuffer, error => {
            if (error) reject(error)
            resolve()
          })
        })
      } else {
        this._update(false).then(singleBuffer => {
          fs.writeFile(filePath, singleBuffer, error => {
            if (error) reject(error)
            resolve()
          })
        }).catch(error => reject(error))
      }
    })
  }
}

module.exports = Replay
