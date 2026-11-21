"""Guide voice: line WAVs → audio/voce.wav with dramatic gaps, slightly deeper; writes timeline.json with line and word timings.
Usage: python assemble.py <project dir>   (lines.json: [{id, text, gap?}] — gap = silence before the line)"""
import json, os, sys, subprocess, re
import numpy as np
P = sys.argv[1]; SR = 48000
L = json.load(open(f'{P}/lines.json')); pitch = .93
def load(f):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-af', f'asetrate=24000*{pitch},aresample={SR},atempo={1/pitch:.4f}', '-f', 'f32le', '-ac', '1', '-'], capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(float)
t, out, tl = .35, [], []
for i, l in enumerate(L):
    t += l.get('gap', .45) if i else 0
    x = load(f"{P}/audio/lines/{l['id']}.wav"); d = len(x) / SR
    words = l['text'].split(); wts = [max(1, len(re.findall('[aeiouàèéìòù]', w.lower()))) + (.6 if re.search('[.,:]$', w) else 0) for w in words]; s = sum(wts); acc = t; wl = []
    for w, k in zip(words, wts): wd = d * k / s; wl.append({'w': w, 't0': round(acc, 3), 't1': round(acc + wd, 3)}); acc += wd
    tl.append({'id': l['id'], 'text': l['text'], 't0': round(t, 3), 't1': round(t + d, 3), 'words': wl}); out.append((t, x)); t += d
dur = t + 1.6
buf = np.zeros(int(dur * SR))
for t0, x in out: s = int(t0 * SR); buf[s:s + len(x)] += x
buf = buf / (np.abs(buf).max() + 1e-9) * .9
import wave
with wave.open(f'{P}/audio/voce.wav', 'wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((buf * 32767).astype(np.int16).tobytes())
json.dump({'dur': round(dur, 2), 'lines': tl}, open(f'{P}/timeline.json', 'w'), ensure_ascii=False, indent=1)
print(P, 'dur', round(dur, 2))
