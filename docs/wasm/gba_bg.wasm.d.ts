/* tslint:disable */
/* eslint-disable */
export const memory: WebAssembly.Memory;
export function __wbg_emulator_free(a: number): void;
export function emulator_new(a: number, b: number, c: number, d: number): number;
export function emulator_from_saved_state(a: number, b: number, c: number, d: number, e: number, f: number): number;
export function emulator_skip_bios(a: number): void;
export function emulator_run_frame(a: number, b: number): void;
export function emulator_key_down(a: number, b: number, c: number): void;
export function emulator_key_up(a: number, b: number, c: number): void;
export function emulator_test_fps(a: number): void;
export function emulator_collect_audio_samples(a: number): number;
export function emulator_save_state(a: number): number;
export function initialize(): void;
export function __wbg_rominfo_free(a: number): void;
export function rominfo_get_game_code(a: number, b: number): void;
export function rominfo_get_game_title(a: number, b: number): void;
export function parse_rom_header(a: number, b: number): number;
export function __wbindgen_malloc(a: number): number;
export function __wbindgen_realloc(a: number, b: number, c: number): number;
export function __wbindgen_free(a: number, b: number): void;
export function __wbindgen_exn_store(a: number): void;
