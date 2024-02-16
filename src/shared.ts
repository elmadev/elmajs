/**
 * Types that can be converted to a Buffer object
 */
export type BufferInput = Uint8Array | Buffer | ArrayBuffer;

/**
 * Simple point with x and y coordinates
 */
export class Position {
  public x: number;
  public y: number;

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
}

export enum Clip {
  Unclipped = 0,
  Ground = 1,
  Sky = 2,
}

export interface TimeEntry {
  name1: string;
  name2: string;
  time: number;
}

export interface Top10 {
  single: TimeEntry[];
  multi: TimeEntry[];
}

// Bike diameters and radii.
export const HEAD_DIAMETER = 0.476;
export const HEAD_RADIUS = 0.238;
export const OBJECT_DIAMETER = 0.8;
export const OBJECT_RADIUS = 0.4;
