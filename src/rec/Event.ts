export default class Event {
  public type: EventType;
  public time: number;
  public touchInfo: number;
  public groundInfo: number;

  constructor() {
    this.type = 0;
    this.time = 0;
    this.touchInfo = 0;
    this.groundInfo = 0;
  }
}

export enum EventType {
  Touch = 0,
  Ground = 1,
  Apple = 4,
  Turn = 5,
  VoltRight = 6,
  VoltLeft = 7,
}
