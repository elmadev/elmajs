import { Position } from '../shared'

export enum ObjectType {
  Exit = 1,
  Apple = 2,
  Killer = 3,
  Start = 4,
}

export enum Gravity {
  None = 0,
  Up = 1,
  Down = 2,
  Left = 3,
  Right = 4,
}

export class ElmaObject {
  public position: Position
  public type: ObjectType
  public gravity: Gravity
  public animation: number

  constructor() {
    this.position = new Position()
    this.type = ObjectType.Apple
    this.gravity = Gravity.None
    this.animation = 1
  }
}
