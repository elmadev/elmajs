import { Position } from '../shared';

export enum Clip {
  Unclipped = 0,
  Ground = 1,
  Sky = 2,
}

export default class Picture {
  public name: string;
  public texture: string;
  public mask: string;
  public position: Position;
  public distance: number;
  public clip: Clip;
  public grass: boolean;
  public vertices: Position[];

  constructor() {
    this.name = 'barrel';
    this.texture = '';
    this.mask = '';
    this.position = new Position(0, 0);
    this.distance = 600;
    this.clip = Clip.Sky;
    this.grass = false;
    this.vertices = [];
  }
}
