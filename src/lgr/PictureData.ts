import PCX from 'pcx-js';

export default class PictureData {
  public name: string;
  public data: Buffer;
  public image: PCX;

  constructor(name: string, buffer: Buffer) {
    this.name = name;
    this.data = buffer;
    this.image = new PCX(this.data);
  }
}
