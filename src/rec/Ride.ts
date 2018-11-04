import { Position } from '../shared'

export interface IRideHeader {
  link: number
  level: string
  isMulti: boolean
  isFlagTag: boolean
}

export interface IFrame {
  position: Position
}

export interface IEvent {
  type: boolean
}

export default class Ride {
  public frames: IFrame[]
  public events: IEvent[]

  constructor() {
    this.frames = []
    this.events = []
  }
}
