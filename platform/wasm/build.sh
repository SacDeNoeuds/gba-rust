set -x
wasm-pack build --target=web --release -d app/wasm --out-name gba -m force -- --locked