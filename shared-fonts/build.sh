#!/bin/sh
# Build: picture (1080x1920, 30 fps) → voice + foley mix → mux at -14 LUFS. Usage: sh build.sh <keynote|news|stick> <output name>
set -e
LIB=${LIB:-/root/lemo-opuscar}; HERE=$(cd "$(dirname "$0")" && pwd); export LIB
cd "$LIB"
node core/render/events.mjs "$HERE" --size 1080x1920
node core/render/video.mjs "$HERE" --fps 30 --size 1080x1920 --workers ${WORKERS:-4} --out "$HERE/out/video.mp4"
"$LIB/.venv/bin/python" "$HERE/mix.py" "$1"
sh "$HERE/mux_local.sh" "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/$2.mp4"
