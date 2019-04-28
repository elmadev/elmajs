export default class PictureData {
  public name: string;
  public data: Buffer;

  constructor(name: string, buffer: Buffer) {
    this.name = name;
    this.data = buffer;
  }
}
