import { Position } from '../shared';

export enum Direction {
  Left = 0,
  Right = 1,
}

export default class Frame {
  public bike: Position;
  public leftWheel: Position;
  public rightWheel: Position;
  public head: Position;
  public bikeRotation: number;
  public leftWheelRotation: number;
  public rightWheelRotation: number;
  public backWheelSpeed: number;
  public collisionStrength: number;
  public throttleAndDirection: number;

  constructor() {
    // TODO: maybe figure out "default" positions as they are in-game
    this.bike = new Position(0, 0);
    this.leftWheel = new Position(0, 0);
    this.rightWheel = new Position(0, 0);
    this.head = new Position(0, 0);
    this.bikeRotation = 0;
    this.leftWheelRotation = 0;
    this.rightWheelRotation = 0;
    this.backWheelSpeed = 0;
    this.collisionStrength = 0;
    this.throttleAndDirection = 0;
  }

  get throttle() {
    return (this.throttleAndDirection & 1) !== 0;
  }

  set throttle(throttle: boolean) {
    this.throttleAndDirection =
      (this.throttleAndDirection & ~1) | (throttle ? 1 : 0);
  }

  get direction() {
    return this.throttleAndDirection & (1 << 1);
  }

  set direction(direction: Direction) {
    this.throttleAndDirection =
      (this.throttleAndDirection & ~(1 << 2)) | (direction << 2);
  }
}
