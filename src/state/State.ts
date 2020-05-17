import { Buffer } from 'buffer';

import { Top10 } from '../shared';
import { nullpadString, trimString, bufferToTop10, top10ToBuffer } from '../util';

const STATE_SIZE = 67910;
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
  skippedInternals: boolean[];
  // The index of last internal the player has reached so far.
  lastInternal: number;
  // The last played (selected) internal.
  selectedInternal: number;
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
  public static from(buffer: Buffer): State {
    if (buffer.length !== STATE_SIZE)
      throw Error(`Invalid state.dat file, expected buffer length of ${STATE_SIZE}, got ${buffer.length}`);
    return this.parseBuffer(buffer);
  }

  private static parseBuffer(buffer: Buffer): State {
    const state = new State();
    const decryptedBuffer = this.cryptState(buffer);

    let offset = 0;
    const version = decryptedBuffer.readUInt32LE(offset);
    if (version !== STATE_START) throw Error('Invalid state.dat file');
    offset += 4;

    for (let i = 0; i < NUM_LEVELS; i++) {
      const levelTimesBuffer = decryptedBuffer.slice(offset, offset + 688);
      const top10 = bufferToTop10(levelTimesBuffer);
      state.times[i] = top10;
      offset += 688;
    }

    // get amount of players before parsing player data
    const players = decryptedBuffer.readUInt32LE(offset + 5800);
    if (players > NUM_PLAYERS) throw Error(`Expected max ${NUM_PLAYERS} player entries, got ${players}`);

    for (let i = 0; i < players; i++) {
      const nextPlayerOffset = offset + i * PLAYER_STRUCT_SIZE;
      const player = this.parsePlayer(decryptedBuffer.slice(nextPlayerOffset, nextPlayerOffset + PLAYER_STRUCT_SIZE));
      state.players.push(player);
    }

    offset += 5800 + 4;

    state.playerAName = trimString(decryptedBuffer.slice(offset, offset + PLAYER_NAME_SIZE));
    offset += PLAYER_NAME_SIZE;
    state.playerBName = trimString(decryptedBuffer.slice(offset, offset + PLAYER_NAME_SIZE));
    offset += PLAYER_NAME_SIZE;

    // settings
    state.soundEnabled = Boolean(decryptedBuffer.readInt32LE(offset));
    offset += 4;
    state.soundOptimization = decryptedBuffer.readInt32LE(offset);
    offset += 4;
    state.playMode = decryptedBuffer.readInt32LE(offset);
    offset += 4;
    state.flagTag = Boolean(decryptedBuffer.readInt32LE(offset));
    offset += 4;
    state.swapBikes = !Boolean(decryptedBuffer.readInt32LE(offset)); // inverted because Balazs 🤷‍♀️
    offset += 4;
    state.videoDetail = decryptedBuffer.readInt32LE(offset);
    offset += 4;
    state.animatedObjects = Boolean(decryptedBuffer.readInt32LE(offset));
    offset += 4;
    state.animatedMenus = Boolean(decryptedBuffer.readInt32LE(offset));
    offset += 4;

    state.playerAKeys = this.parsePlayerKeys(decryptedBuffer.slice(offset, offset + 32));
    offset += 32;
    state.playerBKeys = this.parsePlayerKeys(decryptedBuffer.slice(offset, offset + 32));
    offset += 32;

    state.incScreenSizeKey = decryptedBuffer.readUInt32LE(offset);
    offset += 4;
    state.decScreenSizeKey = decryptedBuffer.readUInt32LE(offset);
    offset += 4;
    state.screenshotKey = decryptedBuffer.readUInt32LE(offset);
    offset += 4;

    state.lastEditedLevName = trimString(decryptedBuffer.slice(offset, offset + LEVEL_NAME_SIZE));
    offset += LEVEL_NAME_SIZE;
    state.lastPlayedExternal = trimString(decryptedBuffer.slice(offset, offset + LEVEL_NAME_SIZE));
    offset += LEVEL_NAME_SIZE;

    // do we actually care about this?
    const EOF = decryptedBuffer.readUInt32LE(offset);
    if (!(EOF === STATE_END || EOF === STATE_END_ALT)) throw Error(`Expected EOF marker, got ${EOF}`);

    return state;
  }

  private static parsePlayer(buffer: Buffer): PlayerEntry {
    if (buffer.length !== PLAYER_STRUCT_SIZE)
      throw Error(`Expected buffer of length ${PLAYER_STRUCT_SIZE}, got ${buffer.length}`);
    const name = trimString(buffer.slice(0, PLAYERENTRY_NAME_SIZE));
    const skippedInternals = [...buffer.slice(PLAYERENTRY_NAME_SIZE, PLAYERENTRY_NAME_SIZE + NUM_INTERNALS)].map(
      Boolean,
    );
    const lastInternal = buffer.readUInt32LE(PLAYERENTRY_NAME_SIZE + NUM_INTERNALS + PLAYERENTRY_PADDING);
    const selectedInternal = buffer.readUInt32LE(PLAYERENTRY_NAME_SIZE + NUM_INTERNALS + PLAYERENTRY_PADDING + 4);
    const player = { name, skippedInternals, lastInternal, selectedInternal };

    return player;
  }

  private static parsePlayerKeys(buffer: Buffer): PlayerKeys {
    if (buffer.length !== 32) throw Error(`Expected buffer of length 32, got ${buffer.length}`);
    let offset = 0;
    const throttle = buffer.readUInt32LE(offset);
    offset += 4;
    const brake = buffer.readUInt32LE(offset);
    offset += 4;
    const rotateRight = buffer.readUInt32LE(offset);
    offset += 4;
    const rotateLeft = buffer.readUInt32LE(offset);
    offset += 4;
    const changeDirection = buffer.readUInt32LE(offset);
    offset += 4;
    const toggleNavigator = buffer.readUInt32LE(offset);
    offset += 4;
    const toggleTimer = buffer.readUInt32LE(offset);
    offset += 4;
    const toggleShowHide = buffer.readUInt32LE(offset);

    return {
      throttle,
      brake,
      rotateRight,
      rotateLeft,
      changeDirection,
      toggleNavigator,
      toggleTimer,
      toggleShowHide,
    };
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
  public times: Top10[] = Array(90).fill({ single: [], multi: [] });
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
  public toBuffer(): Buffer {
    const buffer = Buffer.alloc(STATE_SIZE);
    let offset = 0;

    buffer.writeUInt32LE(STATE_START);
    offset += 4;

    // top10 lists, with padding if there are less times than expected.
    const timesLen = this.times.length;
    if (timesLen < NUM_LEVELS) {
      const top10padding: Top10[] = Array(NUM_LEVELS - timesLen).fill({ single: [], multi: [] });
      this.times.push(...top10padding);
    }
    for (const top10 of this.times.slice(0, NUM_LEVELS)) {
      const top10Buffer = top10ToBuffer(top10);
      top10Buffer.copy(buffer, offset);
      offset += 688;
    }

    for (const player of this.players.slice(0, NUM_PLAYERS)) {
      const name = nullpadString(player.name, PLAYERENTRY_NAME_SIZE);
      buffer.write(name, offset, PLAYERENTRY_NAME_SIZE, 'ascii');
      offset += PLAYERENTRY_NAME_SIZE;
      const skippedInternals = player.skippedInternals.slice(0, NUM_INTERNALS);
      skippedInternals.forEach((skipped) => {
        buffer.writeUInt8(skipped ? 1 : 0, offset);
        offset += 1;
      });

      if (skippedInternals.length < NUM_INTERNALS) {
        offset += NUM_INTERNALS - skippedInternals.length;
      }

      offset += PLAYERENTRY_PADDING;
      buffer.writeInt32LE(player.lastInternal, offset);
      offset += 4;
      buffer.writeInt32LE(player.selectedInternal, offset);
      offset += 4;
    }

    if (this.players.length < NUM_PLAYERS) {
      buffer.fill(0, offset, offset + PLAYER_STRUCT_SIZE * (NUM_PLAYERS - this.players.length));
      offset += PLAYER_STRUCT_SIZE * (NUM_PLAYERS - this.players.length);
    }

    buffer.writeUInt32LE(this.players.length, offset);
    offset += 4;

    buffer.write(nullpadString(this.playerAName, PLAYER_NAME_SIZE), offset, PLAYER_NAME_SIZE, 'ascii');
    offset += PLAYER_NAME_SIZE;
    buffer.write(nullpadString(this.playerBName, PLAYER_NAME_SIZE), offset, PLAYER_NAME_SIZE, 'ascii');
    offset += PLAYER_NAME_SIZE;

    // settings
    buffer.writeInt32LE(this.soundEnabled ? 1 : 0, offset);
    offset += 4;
    buffer.writeInt32LE(this.soundOptimization, offset);
    offset += 4;
    buffer.writeInt32LE(this.playMode, offset);
    offset += 4;
    buffer.writeInt32LE(this.flagTag ? 1 : 0, offset);
    offset += 4;
    buffer.writeInt32LE(this.swapBikes ? 0 : 1, offset);
    offset += 4;
    buffer.writeInt32LE(this.videoDetail, offset);
    offset += 4;
    buffer.writeInt32LE(this.animatedObjects ? 1 : 0, offset);
    offset += 4;
    buffer.writeInt32LE(this.animatedMenus ? 1 : 0, offset);
    offset += 4;

    // keys
    [this.playerAKeys, this.playerBKeys].forEach((keys) => {
      buffer.writeUInt32LE(keys.throttle, offset);
      offset += 4;
      buffer.writeUInt32LE(keys.brake, offset);
      offset += 4;
      buffer.writeUInt32LE(keys.rotateRight, offset);
      offset += 4;
      buffer.writeUInt32LE(keys.rotateLeft, offset);
      offset += 4;
      buffer.writeUInt32LE(keys.changeDirection, offset);
      offset += 4;
      buffer.writeUInt32LE(keys.toggleNavigator, offset);
      offset += 4;
      buffer.writeUInt32LE(keys.toggleTimer, offset);
      offset += 4;
      buffer.writeUInt32LE(keys.toggleShowHide, offset);
      offset += 4;
    });

    buffer.writeUInt32LE(this.incScreenSizeKey, offset);
    offset += 4;
    buffer.writeUInt32LE(this.decScreenSizeKey, offset);
    offset += 4;
    buffer.writeUInt32LE(this.screenshotKey, offset);
    offset += 4;

    buffer.write(nullpadString(this.lastEditedLevName, LEVEL_NAME_SIZE), offset, LEVEL_NAME_SIZE, 'ascii');
    offset += LEVEL_NAME_SIZE;
    buffer.write(nullpadString(this.lastPlayedExternal, LEVEL_NAME_SIZE), offset, LEVEL_NAME_SIZE, 'ascii');
    offset += LEVEL_NAME_SIZE;

    buffer.writeUInt32LE(STATE_END, offset);

    return State.cryptState(buffer);
  }
}
