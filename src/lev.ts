import { Position, OBJECT_RADIUS } from './shared'
import { readFile } from 'fs'

const EOD_MARKER = 0x0067103a // level data marker
const EOF_MARKER = 0x00845d52 // level file marker

export enum ObjectType {
  Apple,
  Killer,
  Start,
  Exit,
}

export enum Version {
  Across,
  Elma,
}

export class Polygon {
  grass: boolean
  vertices: Position[]

  constructor() {
    this.grass = false
    this.vertices = []
  }
}

export class ElmaObject {
  position: Position
  type: ObjectType

  constructor() {
    this.position = new Position()
    this.type = ObjectType.Apple
  }
}

export interface IPicture {}

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
  version!: Version
  link!: number
  integrity!: number[]
  lgr!: string
  name!: string
  ground!: string
  sky!: string
  polygons!: Polygon[]
  objects!: ElmaObject[]
  pictures!: IPicture[]
  top10!: ITop10

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
      single: [],
      multi: [],
    }
  }

  static async load(source: string | Buffer) {
    if (typeof source === 'string') {
      readFile(source, async (error, buffer) => {
        if (error) throw new Error(error.message)
        return await this._parseBuffer(buffer)
      })
    } else if (source instanceof Buffer) {
      this._parseBuffer(source)
    }
  }

  private static async _parseBuffer(buffer: Buffer) {}
}
