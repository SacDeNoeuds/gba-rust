/* tslint:disable */
/* eslint-disable */
/**
*/
export function initialize(): void;
/**
* @param {Uint8Array} rom_bin
* @returns {RomInfo}
*/
export function parse_rom_header(rom_bin: Uint8Array): RomInfo;
/**
*/
export class Emulator {
  free(): void;
/**
* @param {Uint8Array} bios
* @param {Uint8Array} rom
*/
  constructor(bios: Uint8Array, rom: Uint8Array);
/**
* @param {Uint8Array} bios
* @param {Uint8Array} rom
* @param {Uint8Array} state
* @returns {Emulator}
*/
  static from_saved_state(bios: Uint8Array, rom: Uint8Array, state: Uint8Array): Emulator;
/**
*/
  skip_bios(): void;
/**
* @param {CanvasRenderingContext2D} ctx
*/
  run_frame(ctx: CanvasRenderingContext2D): void;
/**
* @param {string} event_key
*/
  key_down(event_key: string): void;
/**
* @param {string} event_key
*/
  key_up(event_key: string): void;
/**
*/
  test_fps(): void;
/**
* @returns {Float32Array}
*/
  collect_audio_samples(): Float32Array;
/**
* @returns {Uint8Array}
*/
  save_state(): Uint8Array;
}
/**
*/
export class RomInfo {
  free(): void;
/**
* @returns {string}
*/
  get_game_code(): string;
/**
* @returns {string}
*/
  get_game_title(): string;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_emulator_free: (a: number) => void;
  readonly emulator_new: (a: number, b: number, c: number, d: number) => number;
  readonly emulator_from_saved_state: (a: number, b: number, c: number, d: number, e: number, f: number) => number;
  readonly emulator_skip_bios: (a: number) => void;
  readonly emulator_run_frame: (a: number, b: number) => void;
  readonly emulator_key_down: (a: number, b: number, c: number) => void;
  readonly emulator_key_up: (a: number, b: number, c: number) => void;
  readonly emulator_test_fps: (a: number) => void;
  readonly emulator_collect_audio_samples: (a: number) => number;
  readonly emulator_save_state: (a: number) => number;
  readonly initialize: () => void;
  readonly __wbg_rominfo_free: (a: number) => void;
  readonly rominfo_get_game_code: (a: number, b: number) => void;
  readonly rominfo_get_game_title: (a: number, b: number) => void;
  readonly parse_rom_header: (a: number, b: number) => number;
  readonly __wbindgen_malloc: (a: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number) => number;
  readonly __wbindgen_free: (a: number, b: number) => void;
  readonly __wbindgen_exn_store: (a: number) => void;
}

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
        