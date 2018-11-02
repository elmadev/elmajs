import { readFile } from 'fs-extra'
import { ElmaObject, ObjectType } from './lev/ElmaObject'
import { Picture } from './lev/Picture'
import { Polygon } from './lev/Polygon'
import { OBJECT_RADIUS, Position } from './shared'
import { trimString } from './util'

const EOD_MARKER = 0x0067103a // level data marker
const EOF_MARKER = 0x00845d52 // level file marker

export enum Version {
  Across,
  Elma,
}

export interface ITimeEntry {
  name1: string
  name2: string
  time: number
}

export interface ITop10 {
  single: ITimeEntry[]
  multi: ITimeEntry[]
}

export class Level {
  public static async load(source: string | Buffer): Promise<Level> {
    if (typeof source === 'string') {
      const file = await readFile(source)
      return this._parseBuffer(file)
    } else if (source instanceof Buffer) {
      return this._parseBuffer(source)
    }
    throw new Error('This should be unreachable but ok')
  }

  private static async _parseBuffer(buffer: Buffer) {
    const level = new Level()

    // remove default polygons and objects
    level.polygons = []
    level.objects = []

    let offset = 0

    const version = buffer.toString('ascii', 0, 5)
    switch (version) {
      case 'POT06':
        level.version = Version.Across
        throw new Error('Across levels are not supported')
      case 'POT14':
        level.version = Version.Elma
        break
      default:
        throw new Error('Not valid Elma level')
    }

    offset += 7 // +2 extra unused bytes

    level.link = buffer.readUInt32LE(offset)
    offset += 4

    for (let i = 0; i < 4; i++) {
      level.integrity[i] = buffer.readDoubleLE(offset)
      offset += 8
    }

    level.name = trimString(buffer.slice(offset, offset + 51))
    offset += 51
    level.lgr = trimString(buffer.slice(offset, offset + 16))
    offset += 16
    level.ground = trimString(buffer.slice(offset, offset + 10))
    offset += 10
    level.sky = trimString(buffer.slice(offset, offset + 10))
    offset += 10

    const polyCount = buffer.readDoubleLE(offset) - 0.4643643
    offset += 8
    const [polygons, readBytes] = this._parsePolygons(buffer, offset, polyCount)
    level.polygons = polygons
    offset += readBytes

    return level
  }

  private static _parsePolygons(
    buffer: Buffer,
    readBytes: number,
    polyCount: number
  ): [Polygon[], number] {
    const polygons: Polygon[] = []
    for (let i = 0; i < polyCount; i++) {
      const polygon = new Polygon()
      polygon.grass = Boolean(buffer.readInt32LE(readBytes))
      readBytes += 4
      const vertexCount = buffer.readInt32LE(readBytes)
      readBytes += 4
      for (let j = 0; j < vertexCount; j++) {
        const x = buffer.readDoubleLE(readBytes)
        readBytes += 8
        const y = buffer.readDoubleLE(readBytes)
        readBytes += 8
        polygon.vertices.push(new Position(x, -y))
      }
      polygons.push(polygon)
    }

    return [polygons, readBytes]
  }

  public version: Version
  public link: number
  public integrity: number[]
  public lgr: string
  public name: string
  public ground: string
  public sky: string
  public polygons: Polygon[]
  public objects: ElmaObject[]
  public pictures: Picture[]
  public top10: ITop10

  constructor() {
    this.version = Version.Elma
    this.link = 0
    this.integrity = [0, 0, 0, 0]
    this.lgr = 'default'
    this.name = 'New level'
    this.ground = 'ground'
    this.sky = 'sky'
    this.polygons = [
      {
        grass: false,
        vertices: [
          { x: 10.0, y: 0.0 },
          { x: 10.0, y: 7.0 },
          { x: 0.0, y: 7.0 },
          { x: 0.0, y: 0.0 },
        ],
      },
    ]
    this.objects = [
      {
        position: { x: 2.0, y: 7.0 - OBJECT_RADIUS },
        type: ObjectType.Start,
      },
      { position: { x: 8.0, y: 7.0 - OBJECT_RADIUS }, type: ObjectType.Exit },
    ]
    this.pictures = []
    this.top10 = {
      multi: [],
      single: [],
    }
  }
}
