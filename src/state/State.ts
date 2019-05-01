import { readFile, writeFile } from 'fs-extra';
import { ITimeEntry, ITop10 } from '../';
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

export interface IPlayerEntry {
  // Player name.
  name: string;
  // Skipped internals.
  skipped_internals: boolean[];
  // The index of last internal the player has reached so far.
  last_internal: number;
  // The last played (selected) internal.
  selected_internal: number;
}

export interface IPlayerKeys {
  throttle: number;
  brake: number;
  rotate_right: number;
  rotate_left: number;
  change_direction: number;
  toggle_navigator: number;
  toggle_timer: number;
  toggle_show_hide: number;
}

export default class State {
  /**
   * Loads a state file.
   * @param source Can either be a file path or a buffer
   */
  public static async load(source: string | Buffer): Promise<State> {
    if (typeof source === 'string') {
      const file = await readFile(source);
      return this._parseBuffer(file, source);
    } else if (source instanceof Buffer) {
      return this._parseBuffer(source);
    }
    throw new Error(
      'Invalid input argument. Expected string or Buffer instance object'
    );
  }

  private static async _parseBuffer(
    buffer: Buffer,
    path?: string
  ): Promise<State> {
    const state = new State();
    if (path) state.path = path;
    return state;
  }

  /// State file version; the only supported value is 200.
  public version: number = 200;
  /// Best times lists. state.dat has a fixed-size array of 90 of these.
  public times: ITop10[] = [];
  /// List of players. state.dat has a fixed-size array of 50 of these.
  public players: IPlayerEntry[] = [];
  /// Name of player A, maximum 14 characters.
  public playerAName: string = '';
  /// Name of player B, maximum 14 characters.
  public playerBName: string = '';
  /// Keys for player A.
  public playerAKeys?: IPlayerKeys;
  /// Keys for player B.
  public playerBKeys?: IPlayerKeys;
  /// Whether sound is enabled.
  public soundEnabled: boolean = true;
  /// Sound optimization.
  public soundOptimization: SoundOptimization = SoundOptimization.Compatibility;
  /// Play mode.
  public playMode: PlayMode = PlayMode.Single;
  /// Whether flag tag mode is enabled.
  public flagTag: boolean = false;
  /// Whether bikes are swapped.
  public swapBikes: boolean = false;
  /// Video detail.
  public videoDetail: VideoDetail = VideoDetail.High;
  /// Whether objects are animated.
  public animatedObjects: boolean = true;
  /// Whether menus are animated.
  public animatedMenus: boolean = true;
  /// Key for increasing screen size.
  public incScreenSizeKey?: number;
  /// Key for decreasing screen size.
  public decScreenSizeKey?: number;
  /// Key for taking a screenshot.
  public screenshotKey?: number;
  /// Name of last edited level.
  public lastEditedLevName: string = '';
  /// Name of last played external level.
  public lastPlayedExternal: string = '';
  public path: string = '';

  /**
   * Returns a buffer representation of the State.
   */
  public async toBuffer(): Promise<Buffer> {
    const buffer = Buffer.alloc(0);
    return buffer;
  }

  public async save(path?: string) {
    const buffer = await this.toBuffer();
    await writeFile(path || this.path, buffer);
  }
}
