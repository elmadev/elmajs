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
    this.objects = [{ x: 2.0, y: 7.0 - DEFS.OBJECT_RADIUS, type: 'start' },
                    { x: 8.0, y: 7.0 - DEFS.OBJECT_RADIUS, type: 'exit' }]
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
        // remove default polygons and objects
        level.polygons = []
        level.objects = []
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
      offset += 7 // 2 extra garbage bytes

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

      // polygons
      let polyCount = buffer.readDoubleLE(offset) - 0.4643643
      offset += 8
      for (let i = 0; i < polyCount; i++) {
        let polygon = {}
        polygon.grass = Boolean(buffer.readInt32LE(offset))
        polygon.vertices = []
        offset += 4
        let vertexCount = buffer.readInt32LE(offset)
        offset += 4
        for (let j = 0; j < vertexCount; j++) {
          let vertex = {}
          vertex.x = buffer.readDoubleLE(offset)
          offset += 8
          vertex.y = buffer.readDoubleLE(offset)
          offset += 8
          polygon.vertices.push(vertex)
        }
        this.polygons.push(polygon)
      }

      // objects
      let objectCount = buffer.readDoubleLE(offset) - 0.4643643
      offset += 8
      for (let i = 0; i < objectCount; i++) {
        let object = {}
        object.x = buffer.readDoubleLE(offset)
        offset += 8
        object.y = buffer.readDoubleLE(offset)
        offset += 8
        let objType = buffer.readInt32LE(offset)
        offset += 4
        let gravity = buffer.readInt32LE(offset)
        offset += 4
        let animation = buffer.readInt32LE(offset) + 1
        offset += 4
        switch (objType) {
          case 1:
            object.type = 'exit'
            break
          case 2:
            object.type = 'apple'
            switch (gravity) {
              case 0:
                object.gravity = 'normal'
                break
              case 1:
                object.gravity = 'up'
                break
              case 2:
                object.gravity = 'down'
                break
              case 3:
                object.gravity = 'left'
                break
              case 4:
                object.gravity = 'right'
                break
              default:
                reject('Invalid gravity value')
                return
            }
            object.animation = animation
            break
          case 3:
            object.type = 'killer'
            break
          case 4:
            object.type = 'start'
            break
          default:
            reject('Invalid object value')
            return
        }
        this.objects.push(object)
      }

      // pictures
      let picCount = buffer.readDoubleLE(offset) - 0.2345672
      offset += 8
      for (let i = 0; i < picCount; i++) {
        let picture = {}
        picture.name = trimString(buffer.slice(offset, offset + 10))
        offset += 10
        picture.texture = trimString(buffer.slice(offset, offset + 10))
        offset += 10
        picture.mask = trimString(buffer.slice(offset, offset + 10))
        offset += 10
        picture.x = buffer.readDoubleLE(offset)
        offset += 8
        picture.y = buffer.readDoubleLE(offset)
        offset += 8
        picture.distance = buffer.readInt32LE(offset)
        offset += 4
        let clip = buffer.readInt32LE(offset)
        offset += 4
        switch (clip) {
          case 0:
            picture.clip = 'unclipped'
            break
          case 1:
            picture.clip = 'ground'
            break
          case 2:
            picture.clip = 'sky'
            break
          default:
            reject('Invalid clip value')
            return
        }
        this.pictures.push(picture)
      }

      // end of data marker
      if (buffer.readInt32LE(offset) !== 0x0067103A) {
        reject('End of data marker error')
        return
      }
      offset += 4

      // top10 lists
      let top10Data = Level.cryptTop10(buffer.slice(offset, offset + 688))
      this.top10.single = this._parseTop10(top10Data.slice(0, 344))
      this.top10.multi = this._parseTop10(top10Data.slice(344))
      offset += 688

      // EOF marker
      if (buffer.readInt32LE(offset) !== 0x00845D52) {
        reject('End of file marker error')
        return
      }

      resolve(this)
    })
  }

  /**
   * Encrypts and decrypts top10 list data.
   * @param {Buffer} buffer Data to encrypt or decrypt
   * @returns {Buffer} buffer
   */
  static cryptTop10 (buffer) {
    let output = Buffer.from(buffer) // copy buffer to not modify reference?
    let ebp8 = 0x15
    let ebp10 = 0x2637

    for (let i = 0; i < 688; i++) {
      output[i] ^= ebp8 & 0xFF
      // sick domi modifications to work with JS
      ebp10 += (ebp8 % 0xD3D) * 0xD3D
      ebp8 = ebp10 * 0x1F + 0xD3D
      ebp8 = (ebp8 & 0xFFFF) - 2 * (ebp8 & 0x8000)
    }

    return output
  }

  /**
   * Parses top10 list data and returns array with times.
   * @param {Buffer} buffer
   * @returns {Array} times
   */
  _parseTop10 (buffer) {
    let top10Count = buffer.readInt32LE()
    let output = []
    for (let i = 0; i < top10Count; i++) {
      let timeOffset = 4 + i * 4
      let timeEnd = timeOffset + 4
      let nameOneOffset = 44 + i * 15
      let nameOneEnd = nameOneOffset + 15
      let nameTwoOffset = 194 + i * 15
      let nameTwoEnd = nameTwoOffset + 15
      let entry = {}
      entry.time = buffer.slice(timeOffset, timeEnd).readInt32LE()
      entry.name1 = trimString(buffer.slice(nameOneOffset, nameOneEnd))
      entry.name2 = trimString(buffer.slice(nameTwoOffset, nameTwoEnd))
      output.push(entry)
    }
    return output
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
