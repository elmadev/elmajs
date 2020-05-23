import { Clip } from '../shared';

export enum PictureType {
  Normal = 100,
  Texture = 101,
  Mask = 102,
}

export enum Transparency {
  // No transparency. Only valid for ´Mask´ picture types.
  Solid = 10,
  // Palette index 0 is transparent color.
  Palette = 11,
  // Top left pixel is transparent color.
  TopLeft = 12,
  // Top right pixel is transparent color.
  TopRight = 13,
  // Bottom left pixel is transparent color.
  BottomLeft = 14,
  // Bottom right pixel is transparent color.
  BottomRight = 15,
}

export default class PictureDeclaration {
  /// Picture name.
  public name = '';
  /// Picture type.
  public pictureType: PictureType = PictureType.Normal;
  /// Default distance, 1-999.
  public distance = 450;
  /// Default clipping.
  public clipping: Clip = Clip.Sky;
  /// Transparency.
  public transparency: Transparency = Transparency.TopLeft;
}
