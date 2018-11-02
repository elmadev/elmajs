import { Position } from '../shared'

export enum ObjectType {
  Apple,
  Killer,
  Start,
  Exit,
}

export class ElmaObject {
  public position: Position
  public type: ObjectType

  constructor() {
    this.position = new Position()
    this.type = ObjectType.Apple
  }
}
