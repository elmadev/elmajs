const fs = require('fs')
const DEFS = require('./const')
const trimString = require('./util').trimString

/**
 * Class containing all level attributes.
 */
class Level {
  constructor () {
    this.version = 'Elma'
    this.link = 0
    this.integrity = [0.0, 0.0, 0.0, 0.0]
    this.lgr = 'default'
    this.name = 'New level'
    this.ground = 'ground'
    this.sky = 'sky'
    this.polygons = [{ grass: false, vertices: [{ x: 10.0, y: 0.0 }, { x: 10.0, y: 7.0 }, { x: 0.0, y: 7.0 }, { x: 0.0, y: 0.0 }] }]
    this.objects = [{ position: { x: 2.0, y: 7.0 - DEFS.OBJECT_RADIUS }, type: 'start' },
                    { position: { x: 8.0, y: 7.0 - DEFS.OBJECT_RADIUS }, type: 'exit' }]
    this.pictures = []
    this.top10 = {
      single: [],
      multi: []
    }
  }

  /**
   * Loads a level from file.
   * @param {string} filePath Path to file
   * @returns {Promise} Promise
   */
  static load (filePath) {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, (error, buffer) => {
        if (error) reject(error)
        let level = new Level()
        level._parseFile(buffer).then(results => resolve(results)).catch(error => reject(error))
      })
    })
  }

  /**
   * Parses file buffer data into a Level.
   * @returns {Promise} Promise
   */
  _parseFile (buffer) {
    return new Promise((resolve, reject) => {
      let offset = 0
      // check version
      let version = buffer.toString('ascii', 0, 5)
      switch (version) {
        case 'POT06':
          reject('Across levels are not supported')
          return
        case 'POT14':
          this.version = 'Elma'
          break
        default:
          reject('Not valid Elma level.')
          return
      }
      offset += 7
      // link
      this.link = buffer.readUInt32LE(offset)
      offset += 4
      // integrity sums
      for (let i = 0; i < 4; i++) {
        this.integrity[i] = buffer.readDoubleLE(offset)
        offset += 8
      }
      // level name
      this.name = trimString(buffer.slice(offset, offset + 51))
      offset += 51
      // lgr
      this.lgr = trimString(buffer.slice(offset, offset + 16))
      offset += 16
      // ground
      this.ground = trimString(buffer.slice(offset, offset + 10))
      offset += 10
      // sky
      this.sky = trimString(buffer.slice(offset, offset + 10))
      offset += 10
      
      if (true) resolve(this)
      reject()
    })
  }

  /**
   * Internal convinience method.
   * @returns {Promise} Promise
   */
  _update () {
    return new Promise((resolve, reject) => {
      if (true) resolve()
      reject()
    })
  }

  /**
   * Toplogy check.
   * @returns {Promise} Promise
   */
  _checkTopology () {
    return new Promise((resolve, reject) => {
      if (true) resolve()
      reject()
    })
  }

  /**
   * Returns level as buffer data.
   * @returns {Promise} Promise
   */
  toBuffer () {
    return new Promise((resolve, reject) => {
      if (true) resolve()
      reject()
    })
  }

  /**
   * Generate new link number.
   */
  generateLink () {
    let max32 = Math.pow(2, 32) - 1
    this.link = Math.floor(Math.random() * max32)
  }

  /**
   * Saves a level to file.
   * @param {string} filePath Path to file
   * @returns {Promise} Promise
   */
  save (filePath) {
    return new Promise()
  }
}

module.exports = Level
