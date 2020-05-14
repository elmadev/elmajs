import { Buffer } from 'buffer';

import { TimeEntry, Top10 } from '../shared';
import { nullpadString, trimString } from '../util';

const PLAYER_STRUCT_SIZE = 116;
const PLAYERENTRY_PADDING = 38;
const NUM_INTERNALS = 54;
const PLAYER_NAME_SIZE = 15;
const PLAYERENTRY_NAME_SIZE = 16;
const LEVEL_NAME_SIZE = 20;
const NUM_PLAYERS = 50;
const NUM_LEVELS = 90;
const STATE_START = 200;
const STATE_END = 123432221;
const STATE_END_ALT = 123432112;
const TOP10_ENTRIES = 10;

export enum PlayMode {
  Single = 1,
  Multi = 0,
}

export enum SoundOptimization {
  Compatibility = 1,
  BestQuality = 0,
}

export enum VideoDetail {
  Low = 0,
  High = 1,
}

export interface PlayerEntry {
  // Player name.
  name: string;
  // Skipped internals.
  skipped_internals: boolean[];
  // The index of last internal the player has reached so far.
  last_internal: number;
  // The last played (selected) internal.
  selected_internal: number;
}

export interface PlayerKeys {
  throttle: number;
  brake: number;
  rotateRight: number;
  rotateLeft: number;
  changeDirection: number;
  toggleNavigator: number;
  toggleTimer: number;
  toggleShowHide: number;
}

export default class State {
  /**
   * Loads a state from a buffer representation of the file.
   * @param buffer
   */
  public static async from(buffer: Buffer): Promise<State> {
    return this.parseBuffer(buffer);
  }

  private static async parseBuffer(buffer: Buffer): Promise<State> {
    const state = new State();
    const decryptedBuffer = this.cryptState(buffer);

    let offset = 0;
    const version = decryptedBuffer.readUInt32LE(offset);
    if (version !== STATE_START) throw Error('Invalid state.dat file');
    offset += 4;

    return state;
  }

  private static cryptState(buffer: Buffer): Buffer {
    const bufCopy = Buffer.from(buffer);
    const statePieces = [
      4,
      61920,
      5800,
      4,
      PLAYER_NAME_SIZE,
      PLAYER_NAME_SIZE,
      4,
      4,
      4,
      4,
      4,
      4,
      4,
      4,
      32,
      32,
      4,
      4,
      4,
      LEVEL_NAME_SIZE,
      LEVEL_NAME_SIZE,
    ];

    let curr = 0;
    for (const p of statePieces) {
      const decryptedPart = this.cryptStatePiece(bufCopy.slice(curr, curr + p));
      decryptedPart.copy(bufCopy, curr);
      curr += p;
    }
    return bufCopy;
  }

  private static cryptStatePiece(buffer: Buffer): Buffer {
    const bufCopy = Buffer.from(buffer);
    let ebp8 = 0x17;
    let ebp10 = 0x2636;

    for (let i = 0; i < buffer.length; i++) {
      bufCopy[i] ^= ebp8 & 0xff;
      ebp10 += (ebp8 % 0xd3f) * 0xd3f;
      ebp8 = ebp10 * 0x1f + 0xd3f;
      ebp8 = (ebp8 & 0xffff) - 2 * (ebp8 & 0x8000);
    }

    return bufCopy;
  }

  // State file version; the only supported value is 200.
  public readonly version = STATE_START;
  // Best times lists. state.dat has a fixed-size array of 90 of these.
  public times: Top10[] = Array(90).fill({});
  // List of players. state.dat has a fixed-size array of 50 of these.
  public players: PlayerEntry[] = [];
  // Name of player A, maximum 14 characters.
  public playerAName = '';
  // Name of player B, maximum 14 characters.
  public playerBName = '';
  // Keys for player A.
  public playerAKeys: PlayerKeys = {
    brake: 208,
    changeDirection: 57,
    rotateLeft: 203,
    rotateRight: 205,
    throttle: 200,
    toggleNavigator: 47,
    toggleShowHide: 2,
    toggleTimer: 20,
  };
  // Keys for player B.
  public playerBKeys: PlayerKeys = {
    brake: 80,
    changeDirection: 82,
    rotateLeft: 79,
    rotateRight: 81,
    throttle: 76,
    toggleNavigator: 48,
    toggleShowHide: 3,
    toggleTimer: 21,
  };
  // Whether sound is enabled.
  public soundEnabled = true;
  // Sound optimization.
  public soundOptimization: SoundOptimization = SoundOptimization.BestQuality;
  // Play mode.
  public playMode: PlayMode = PlayMode.Single;
  // Whether flag tag mode is enabled.
  public flagTag = false;
  // Whether bikes are swapped.
  public swapBikes = false;
  // Video detail.
  public videoDetail: VideoDetail = VideoDetail.High;
  // Whether objects are animated.
  public animatedObjects = true;
  // Whether menus are animated.
  public animatedMenus = true;
  // Key for increasing screen size.
  public incScreenSizeKey = 13;
  // Key for decreasing screen size.
  public decScreenSizeKey = 12;
  // Key for taking a screenshot.
  public screenshotKey = 23;
  // Name of last edited level.
  public lastEditedLevName = '';
  // Name of last played external level.
  public lastPlayedExternal = '';

  /**
   * Returns a buffer representation of the State.
   */
  public async toBuffer(): Promise<Buffer> {
    const buffer = Buffer.alloc(0);
    return buffer;
  }
}
