// @ts-check
import * as wasm from "./wasm/gba.js";

var isWasmReady = wasm.default(); // initialise gba wasm module

var pressed = false;
/** @type {wasm.Emulator | null} */
var emulator = null

const ctx = document.querySelector('canvas')?.getContext('2d');
if (!ctx) throw new Error('expected to find a canvas')

const romInput = document.getElementById('rom-input')
if (!(romInput instanceof HTMLInputElement)) throw new Error('rom input must be an input')
const turbo = document.getElementById('turbo')
if (!(turbo instanceof HTMLInputElement)) throw new Error('rom input must be an input')

const preInstalled = /** @type {HTMLElement[]} */ (Array.from(document.querySelectorAll('[data-rom]')))
const controls = /** @type {HTMLElement[]} */ (Array.from(document.querySelectorAll('[data-controlkey]')));
const bindings = /** @type {HTMLElement[]} */ (Array.from(document.querySelectorAll('[data-bindkey]')));
function showDialog(toggled) {
    document.querySelector('.dialog')?.toggleAttribute('hidden', !toggled);
}
Object.assign(window, { showDialog })


/** @typedef {'A' | 'B' | 'L' | 'R' | 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight' | 'Select' | 'Start'} Key */

/** @returns {Object<string, Key>} */
function computeBindings() {
    return Object.fromEntries(bindings.map((element) => {
        return [element.textContent?.trim(), element.dataset.bindkey]
    }))
}
var keyBindings = computeBindings();

document.addEventListener('mousedown', () => { pressed = true; }, true);
document.addEventListener('mouseup', () => { pressed = false; }, true);
document.addEventListener('keydown', (event) => {
    const key = event.key.length === 1 ? event.key.toUpperCase() : event.key;
    const matchingKey = keyBindings[key]
    if (matchingKey) keyDown(matchingKey)
}, false)
document.addEventListener('keyup', (event) => {
    const key = event.key.length === 1 ? event.key.toUpperCase() : event.key;
    const matchingKey = keyBindings[key];
    if (matchingKey) keyUp(matchingKey)
}, false);

const pads = controls.filter(control => control.classList.contains('arrow'))
const buttons = controls.filter(control => !control.classList.contains('arrow'))

const handleKey = ({ control, handler, remove = '', add = '' }) => {
    const key = control.dataset.controlkey;
    return ({ checkPressed = true } = {}) => {
        if (checkPressed && !pressed) return
        handler(key)
        if (remove) control.classList.remove('pressed')
        if (add) control.classList.add('pressed')
    }
};
buttons.forEach((button) => {
    const key = button.dataset.controlkey
    if (!key) throw new Error('it should have a control key')

    const handleKeyDown = handleKey({ control: button, handler: keyDown, add: 'pressed' })
    const handleKeyUp = handleKey({ control: button, handler: keyUp, remove: 'pressed' })
    button.addEventListener('mouseenter', () => handleKeyDown(), false);
    button.addEventListener('mouseleave', () => handleKeyUp(), false);
    button.addEventListener('mousedown', () => handleKeyDown({ checkPressed: false }), false);
    button.addEventListener('mouseup', () => handleKeyUp({ checkPressed: false }), false);
    button.addEventListener('touchstart', () => handleKeyDown({ checkPressed: false }), false);
    button.addEventListener('touchend', () => handleKeyUp({ checkPressed: false }), false);
})
let padTouched = undefined;
const onUntouchPad = () => {
    if (!padTouched) return;
    handleKey({ control: padTouched, handler: keyUp, remove: 'pressed' })({ checkPressed: false });
    padTouched = undefined;
}
const onTouchPad = (padNewlyTouched) => {
    if (padTouched) handleKey({ control: padTouched, handler: keyUp, remove: 'pressed' })({ checkPressed: false });
    handleKey({ control: padNewlyTouched, handler: keyDown, add: 'pressed' })({ checkPressed: false });
    padTouched = padNewlyTouched;
};
pads.forEach((pad) => {
    const key = pad.dataset.controlkey
    if (!key) throw new Error('it should have a control key')
    const handleKeyDown = handleKey({ control: pad, handler: keyDown, add: 'pressed' })
    const handleKeyUp = handleKey({ control: pad, handler: keyUp, remove: 'pressed' })

    pad.addEventListener('mouseenter', () => handleKeyDown({ checkPressed: false }), false);
    pad.addEventListener('mouseleave', () => handleKeyUp({ checkPressed: false }), false);

    pad.addEventListener('touchstart', () => onTouchPad(pad), false);
    pad.addEventListener('touchend', onUntouchPad, false);
    pad.addEventListener('touchmove', (event) => {
        const target = event.touches[0];
        const touched = document.elementFromPoint(target.pageX, target.pageY);
        
        if (!(touched instanceof HTMLElement)) throw new Error('pad must touch something');
        
        // if no change, do nothing
        if (padTouched === touched) return;

        // If touch target changes and is another pad, trigger "key up" of left pad and trigger "key down" of newly pressed pad.
        if (pads.includes(touched)) onTouchPad(touched);
        else onUntouchPad();
    }, false)
})

bindings.forEach((element) => {
    element.addEventListener('keydown', (event) => {
        element.textContent = event.key.toUpperCase();
        element.blur();
        keyBindings = computeBindings()
    })
})

/** @type {Uint8Array | null} */
var bios = null;
/** @type {Uint8Array | null} */
var cachedRom = null;

await Promise.all([,
    isWasmReady,
    fetch('./assets/gba_bios.bin').then((response) => response.arrayBuffer()).then((buffer) => {
        bios = new Uint8Array(buffer)
    }),
]);


function keyDown(key) {
    if (!emulator) return
    // console.info('key down', key)
    emulator.key_down(key);
}
function keyUp(key) {
    if (!emulator) return
    // console.info('key up', key)
    emulator.key_up(key);
}

var intervalId

const rate = () => turbo.checked ? 6 : 16

// Create our audio context
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
console.log("audio context " + audioContext);

const playAudio = emulator => {
    let audioData = emulator.collect_audio_samples();

    let frameCount = audioData.length / 2;
    const audioBuffer = audioContext.createBuffer(
        2,
        frameCount,
        audioContext.sampleRate
    );

    for (let channel = 0; channel < 2; channel++) {
        let nowBuffering = audioBuffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            // audio data frames are interleaved
            nowBuffering[i] = audioData[i*2 + channel];
        }
    }

    const audioSource = audioContext.createBufferSource();
    audioSource.buffer = audioBuffer;

    audioSource.connect(audioContext.destination);
    audioSource.start();
}

const emulatorLoop = function() {
    if (!emulator) return;
    emulator.run_frame(ctx);
    playAudio(emulator);
}

function stopEmulator() {
    if (intervalId != 0) {
        console.log("killing emulator");
        clearInterval(intervalId);
        intervalId = 0;
        emulator = null;
    }
}

/**
 * @param {Uint8Array} rom
 */
function startEmulator(rom) {
    if (!bios || !rom) return;
    
    stopEmulator();
    
    cachedRom = rom;
    emulator = new wasm.Emulator(bios, rom);
    // if (shouldSkipBios) emulator.skip_bios();
    
    intervalId = setInterval(emulatorLoop, rate());
}

function startEmulatorFromState(state) {
    if (!cachedRom || !bios) return;
    stopEmulator();
    emulator = wasm.Emulator.from_saved_state(bios, cachedRom, state);
    // if (shouldSkipBios) emulator.skip_bios();
    intervalId = setInterval(emulatorLoop, rate());
}

turbo.onchange = () => {
    if (intervalId) clearInterval(intervalId)
    intervalId = setInterval(emulatorLoop, rate())
};

romInput.onchange = () => {
    const file = romInput.files?.[0];
    if (!file) return;
    file.arrayBuffer().then((romData) => {
        startEmulator(new Uint8Array(romData))
        showDialog(false)
    })
}

preInstalled.forEach((element) => {
    const romAddr = element.dataset.rom;
    if (!romAddr) throw new Error('rom not defined');
    element.onclick = () => fetch(romAddr).then((response) => response.arrayBuffer()).then((romData) => {
        startEmulator(new Uint8Array(romData))
        showDialog(false)
    })
})
const searchParams = new URLSearchParams(location.search);
const apiUrl = searchParams.get('apiUrl')
disableSaveButtonsIf(!apiUrl);

/** @type {Uint8Array | null} */
var cachedSave = null

function getSaveState() {
    if (!emulator) return null
    return new Uint8Array(emulator.save_state())
}
/**
 * @param {Uint8Array} state
 */
function restoreSavedState(state) {
    if (!emulator) return
    startEmulatorFromState(new Uint8Array(state))
}

function restoreFromApi() {
    if (cachedSave) return startEmulatorFromState(new Uint8Array(cachedSave))
    if (!apiUrl || !cachedRom) return
    const romTitle = wasm.parse_rom_header(cachedRom).get_game_title()
    disableSaveButtonsIf(true);
    fetch(`${apiUrl}/${romTitle}`, {
        method: 'GET',
        mode: 'cors',
    })
    .then((response) => {
        if (!response.ok) throw new Error('Restoring failed')
        return response.arrayBuffer()
    })
    .then((buffer) => {
        const state = new Uint8Array(buffer)
        startEmulatorFromState(state)
        disableSaveButtonsIf(false);
    })
    .catch(() => {
        window.alert('Failed to restore state')
        disableSaveButtonsIf(false);
    })
}

function saveToApi(state = getSaveState()) {
    if (!state) return;
    cachedSave = new Uint8Array(state)
    if (!apiUrl || !cachedRom) return
    const romTitle = wasm.parse_rom_header(cachedRom).get_game_title()
    disableSaveButtonsIf(true);
    fetch(`${apiUrl}/${romTitle}`, {
        method: 'PUT',
        body: state,
        headers: { 'Content-Type': 'application/octet-stream' },
        mode: 'cors',
    }).then((response) => {
        if (!response.ok) throw new Error('failed');
        window.alert('Good: Remote save done');
        disableSaveButtonsIf(false);
    }).catch(() => {
        window.alert('Remote save failed, cached save worked')
        disableSaveButtonsIf(false);
    })
}

function exportSave() {
    const state = getSaveState()
    if (!state || !cachedRom) return
    const blob = new Blob([state], { type: 'application/octet-stream' })
    const anchor = document.createElement('a')
    anchor.href = URL.createObjectURL(blob)
    const romInfo = wasm.parse_rom_header(cachedRom)
    anchor.download = `${romInfo.get_game_code()}-${romInfo.get_game_title()}.sav`
    anchor.click()
}
/** @param {File | undefined} fileOrNothing */
function importSave(fileOrNothing) {
    if (!fileOrNothing) return
    fileOrNothing.arrayBuffer().then(buffer => {
        const state = new Uint8Array(buffer)
        if (apiUrl) saveToApi(state)
        restoreSavedState(state)
    })
}

function disableSaveButtonsIf(bool) {
    document.getElementById('save')?.toggleAttribute('disabled', bool)
    document.getElementById('restore')?.toggleAttribute('disabled', bool)
}

Object.assign(window, { restoreFromApi, saveToApi, importSave, exportSave })
