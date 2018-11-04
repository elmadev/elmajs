import { readFile } from 'fs-extra'
import Ride, { IEvent, IFrame, IRideHeader } from './rec/Ride'
import { trimString } from './util'

const EOR_MARKER = 0x00492f75 // replay marker

export class Replay {
  /**
   * Loads a replay file.
   * @param source Can either be a file path or a buffer
   */
  public static async load(source: string | Buffer): Promise<Replay> {
    if (typeof source === 'string') {
      const file = await readFile(source)
      return this._parseBuffer(file)
    } else if (source instanceof Buffer) {
      return this._parseBuffer(source)
    }
    throw new Error('This should be unreachable but ok')
  }

  private static async _parseBuffer(buffer: Buffer): Promise<Replay> {
    const rec = new Replay()
    let offset = 0

    // support replays with more than 2 rides by continually trying to read ride data.
    while (offset < buffer.length) {
      const [header, ride] = await this._parseRide(buffer)
      rec.rides.push(ride)
      offset += 36 + ride.frames.length * 27 + ride.events.length * 16
    }

    return rec
  }

  /**
   * Parses a "ride", which consists of frames and events
   */
  private static async _parseRide(
    buffer: Buffer
  ): Promise<[IRideHeader, Ride]> {
    const ride = new Ride()

    let offset = 0

    const numFrames = buffer.readUInt32LE(offset)
    offset += 8 // + 4 unused extra bytes
    const isMulti = Boolean(buffer.readInt32LE(offset))
    offset += 4
    const isFlagTag = Boolean(buffer.readInt32LE(offset))
    offset += 4
    const link = buffer.readUInt32LE(offset)
    offset += 4
    const level = trimString(buffer.slice(offset, offset + 12))
    offset += 16 // + 4 unused extra bytes
    const header = { isMulti, isFlagTag, link, level }
    // frames
    ride.frames = await Replay._parseFrames(
      buffer.slice(offset, offset + 27 * numFrames),
      numFrames
    )
    offset += 27 * numFrames
    // events
    const numEvents = buffer.readUInt32LE(offset)
    offset += 4
    ride.events = await Replay._parseEvents(
      buffer.slice(offset, offset + 16 * numEvents),
      numEvents
    )
    // offset += 16 * numEvents

    const expected = buffer.readInt32LE(offset)
    if (expected !== EOR_MARKER) {
      throw new Error('End of replay marker mismatch')
    }
    // offset += 4

    return [header, ride]
  }

  private static async _parseFrames(
    buffer: Buffer,
    numFrames: number
  ): Promise<IFrame[]> {
    const frames: IFrame[] = []
    return frames
  }

  private static async _parseEvents(
    buffer: Buffer,
    numEvents: number
  ): Promise<IEvent[]> {
    const events: IEvent[] = []
    return events
  }

  public link: number
  public level: string
  public isMulti: boolean
  public isFlagTag: boolean
  public rides: Ride[]

  constructor() {
    this.link = 0
    this.level = ''
    this.isMulti = false
    this.isFlagTag = false
    this.rides = []
  }
}
