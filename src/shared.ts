/**
 * Simple point with x and y coordinates
 */
export class Position {
  public x: number
  public y: number

  constructor(x: number = 0, y: number = 0) {
    this.x = x
    this.y = y
  }
}

// Bike diameters and radii.
export const HEAD_DIAMETER = 0.476
export const HEAD_RADIUS = 0.238
export const OBJECT_DIAMETER = 0.8
export const OBJECT_RADIUS = 0.4
