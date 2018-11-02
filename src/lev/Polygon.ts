import { Position } from '../shared'

export class Polygon {
  public grass: boolean
  public vertices: Position[]

  constructor() {
    this.grass = false
    this.vertices = []
  }
}
