import { Position } from '../shared'

export interface IRideHeader {
  link: number
  level: string
  isMulti: boolean
  isFlagTag: boolean
}

export enum Direction {
  Left = 0,
  Right = 1,
}

export interface IFrame {
  bike: Position
  leftWheel: Position
  rightWheel: Position
  head: Position
  bikeRotation: number
  leftWheelRotation: number
  rightWheelRotation: number
  throttle: boolean
  direction: Direction
  backWheelSpeed: number
  collisionStrength: number
}

export interface IEvent {
  type: EventType
  time: number
  touchInfo: number
  groundInfo: number
}

export enum EventType {
  Touch = 0,
  Ground = 1,
  Apple = 4,
  Turn = 5,
  VoltRight = 6,
  VoltLeft = 7,
}

export default class Ride {
  public frames: IFrame[]
  public events: IEvent[]

  constructor() {
    this.frames = []
    this.events = []
  }
}
