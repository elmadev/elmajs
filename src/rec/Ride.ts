import Event from './Event';
import Frame from './Frame';

export interface RideHeader {
  link: number;
  level: string;
  isMulti: boolean;
  isFlagTag: boolean;
}

export default class Ride {
  public frames: Frame[];
  public events: Event[];

  constructor() {
    this.frames = [];
    this.events = [];
  }
}
