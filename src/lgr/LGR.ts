import { readFile, writeFile } from 'fs-extra';
import {
  Clip,
  PictureData,
  PictureDeclaration,
  PictureType,
  Transparency,
} from '../';
import { nullpadString, trimString } from '../util';

// Magic arbitrary number to signify start of LGR file.
const LGRStart = 0x00_00_03_ea;
// Magic arbitrary number to signify end of LGR file.
const LGREOF = 0x0b_2e_05_e7;

export default class LGR {
  /**
   * Loads a level file.
   * @param source Can either be a file path or a buffer
   */
  public static async load(source: string | Buffer): Promise<LGR> {
    if (typeof source === 'string') {
      const file = await readFile(source);
      return this._parseBuffer(file);
    } else if (source instanceof Buffer) {
      return this._parseBuffer(source);
    }
    throw new Error(
      'Invalid input argument. Expected string or Buffer instance object'
    );
  }

  private static async _parseBuffer(buffer: Buffer): Promise<LGR> {
    const lgr = new LGR();

    const version = buffer.toString('ascii', 0, 5);

    // there are no other LGR versions possible, so no need to store it (?)
    if (version !== 'LGR12') {
      throw new Error(`Invalid LGR version: ${version}`);
    }

    const pictureLen = buffer.readInt32LE(5);
    const expectedHeader = buffer.readInt32LE(9);
    if (expectedHeader !== LGRStart) {
      throw new Error(`Invalid header: ${expectedHeader}`);
    }

    // picture.lst section
    const listLen = buffer.readInt32LE(13);
    lgr.pictureList = await lgr._parseListData(buffer, listLen);

    // // pcx data
    // let bytes_read = lgr.parse_picture_data(&buffer, picture_len)?;

    // let (_, mut expected_eof) = buffer.split_at(bytes_read);

    // let expected_eof = expected_eof.read_i32::<LE>()?;
    // if expected_eof != LGR_EOF {
    // 		return Err(ElmaError::EOFMismatch);
    // }
    return lgr;
  }

  public pictureList: PictureDeclaration[] = [];
  public pictureData: PictureData[] = [];

  /**
   * Returns a buffer representation of the LGR.
   */
  public async toBuffer(): Promise<Buffer> {
    const buffer = Buffer.alloc(0);
    return buffer;
  }
  public async save() {}

  private async _parseListData(
    buffer: Buffer,
    length: number
  ): Promise<PictureDeclaration[]> {
    const pictureDeclarations: PictureDeclaration[] = [];
    let offset = 17;
    const names = buffer.slice(offset, offset + length * 10);
    offset += length * 10;
    const pictureTypes = buffer.slice(offset, offset + length * 4);
    offset += length * 4;
    const distances = buffer.slice(offset, offset + length * 4);
    offset += length * 4;
    const clips = buffer.slice(offset, offset + length * 4);
    offset += length * 4;
    const transparencies = buffer.slice(offset, offset + length * 4);
    for (let i = 0; i < length; i++) {
      const pictureDeclaration = new PictureDeclaration();
      pictureDeclaration.name = trimString(names.slice(10 * i, 10 * i + 10));
      pictureDeclaration.pictureType = pictureTypes.readInt32LE(i * 4);
      pictureDeclaration.distance = distances.readInt32LE(i * 4);
      pictureDeclaration.clipping = clips.readInt32LE(i * 4);
      pictureDeclaration.transparency = transparencies.readInt32LE(i * 4);
      pictureDeclarations.push(pictureDeclaration);
    }

    return pictureDeclarations;
  }
}

// fn parse_picture_data(&mut self, mut buffer: &[u8], len: usize) -> Result<usize, ElmaError> {
// 	let mut bytes_read = 0;
// 	// pcx data
// 	for _ in 0..len {
// 			let (name, remaining) = buffer.split_at(12);
// 			let name = trim_string(&name)?;
// 			let (_, remaining) = remaining.split_at(8);
// 			let (mut bytes_len, remaining) = remaining.split_at(4);
// 			let bytes_len = bytes_len.read_i32::<LE>()? as usize;
// 			let data = remaining[..bytes_len].to_vec();

// 			self.picture_data.push(PictureData { name, data });
// 			buffer = &buffer[24 + bytes_len..];
// 			bytes_read += 24 + bytes_len;
// 	}
// 	Ok(bytes_read)
// }

// /// Returns a Vec with bytes representing the LGR as a buffer.
// ///
// /// # Examples
// ///
// /// ```rust
// /// # use elma::lgr::*;
// /// let lgr = LGR::new();
// /// let buffer = lgr.to_bytes().unwrap();
// /// ```
// pub fn to_bytes(&self) -> Result<Vec<u8>, ElmaError> {
// 	let mut bytes = vec![];
// 	bytes.extend_from_slice(b"LGR12");
// 	bytes.write_u32::<LE>(self.picture_data.len() as u32)?;
// 	bytes.write_i32::<LE>(LGR)?;
// 	bytes.extend_from_slice(&self.write_picture_list()?);
// 	bytes.extend_from_slice(&self.write_picture_data()?);
// 	bytes.write_i32::<LE>(LGR_EOF)?;

// 	Ok(bytes)
// }

// fn write_picture_list(&self) -> Result<Vec<u8>, ElmaError> {
// 	let mut bytes = vec![];
// 	bytes.write_u32::<LE>(self.picture_list.len() as u32)?;
// 	let mut names = vec![];
// 	let mut picture_types = vec![];
// 	let mut distances = vec![];
// 	let mut clippings = vec![];
// 	let mut transparencies = vec![];

// 	for picture in &self.picture_list {
// 			names.extend_from_slice(&string_null_pad(&picture.name, 10)?);
// 			picture_types.write_u32::<LE>(picture.picture_type as u32)?;
// 			distances.write_u32::<LE>(u32::from(picture.distance))?;
// 			clippings.write_u32::<LE>(picture.clipping as u32)?;
// 			transparencies.write_u32::<LE>(picture.transparency as u32)?;
// 	}

// 	bytes.extend_from_slice(&names);
// 	bytes.extend_from_slice(&picture_types);
// 	bytes.extend_from_slice(&distances);
// 	bytes.extend_from_slice(&clippings);
// 	bytes.extend_from_slice(&transparencies);

// 	Ok(bytes)
// }

// fn write_picture_data(&self) -> Result<Vec<u8>, ElmaError> {
// 	let mut bytes = vec![];

// 	for picture in &self.picture_data {
// 			bytes.extend_from_slice(&string_null_pad(&picture.name, 20)?);
// 			bytes.write_u32::<LE>(picture.data.len() as u32)?;
// 			bytes.extend_from_slice(&picture.data);
// 	}

// 	Ok(bytes)
// }
