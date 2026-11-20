#!/bin/sh
# ffmpeg 6.x mux: two-pass loudnorm to -14 LUFS on the audio alone, length checked, then mux with the picture.
set -e
V=$1; A=$2; OUT=$3
J=$(ffmpeg -hide_banner -i "$A" -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
g() { echo "$J" | grep "\"$1\"" | sed 's/.*: "\(.*\)".*/\1/'; }
ffmpeg -v error -y -i "$A" -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true,aresample=48000" -ar 48000 "${A%.wav}_norm.wav"
da=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$A"); dn=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "${A%.wav}_norm.wav")
echo "audio length: in $da s, normalised $dn s"
ffmpeg -v error -y -i "$V" -i "${A%.wav}_norm.wav" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart "$OUT"
ffmpeg -hide_banner -i "$OUT" -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I:|Peak:)" | tail -2
