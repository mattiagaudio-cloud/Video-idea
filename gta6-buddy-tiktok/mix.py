"""Voice (the user's ElevenLabs track) + foley from events.json → out/mix.wav. No music: the user adds a track in TikTok."""
import json, os, sys, subprocess
import numpy as np
LIB = os.environ.get('LIB', '/root/lemo-opuscar'); sys.path.insert(0, os.path.join(LIB, 'core/audio'))
from sfx import *   # noqa
HERE = os.path.dirname(os.path.abspath(__file__))
E = json.load(open(os.path.join(HERE, 'events.json'))); DUR = E['dur']
buf = np.zeros((int((DUR + .5) * SR), 2))

def sine(f0, f1, d, tau=None):
    tt = t_(d); f = np.linspace(f0, f1, len(tt)); x = np.sin(2 * np.pi * np.cumsum(f) / SR)
    return x * (env_exp(d, tau) if tau else np.sin(np.pi * tt / d))
def coin(p=1.0):
    d = .45; tt = t_(d); return norm(sum(a * np.sin(2 * np.pi * f * p * tt) * env_exp(d, tau) for f, a, tau in [(2400, 1, .09), (3720, .6, .06), (5100, .4, .04)]) + hp(noise(d), 4000) * env_exp(d, .004) * .6)
def stampfx(): return norm(thump(1, 90) + np.pad(lp(noise(.12), 1500) * env_exp(.12, .02), (0, len(thump(1, 90)) - int(.12 * SR))))
def scribble(d=.3): return norm(bp(noise(d), 1500, 5000) * (np.abs(np.sin(2 * np.pi * 14 * t_(d)))) * np.sin(np.pi * t_(d) / d))
def roll(d=.7):
    out = np.zeros(int(d * SR))
    for k in range(int(d * 26)):
        c = click(1.6 + .2 * np.sin(k), .5 * (1 - k / (d * 26))); s = int(k / 26 * SR); out[s:s + len(c)] += c[:len(out) - s]
    return out
def register(): return norm(np.concatenate([coin(.8)[:int(.08 * SR)] * .5, np.zeros(int(.02 * SR))])[:1]) if False else norm(ding() * .8 + np.pad(scribble(.12) * .3, (0, len(ding()) - int(.12 * SR))))

G = {  # type → (sound function, gain)
    'slam': (lambda e: thump(1, 60) * .9 + np.pad(whoosh(.18), (0, len(thump(1, 60)) - int(.18 * SR))) * .4, .55),
    'rev': (lambda e: roar(1.4) * .8, .30), 'pop': (lambda e: pop(), .40), 'scribble': (lambda e: scribble(.25), .30),
    'stamp': (lambda e: stampfx(), .65), 'whoosh': (lambda e: whoosh(.25), .32), 'whooshOut': (lambda e: whoosh(.3)[::-1].copy(), .30),
    'tap': (lambda e: click(1.0), .45), 'squeak': (lambda e: sine(1800, 2600, .12) * .6, .18), 'key': (lambda e: clack(1.4, .7), .30),
    'beep': (lambda e: sine(1320, 1320, .18), .18), 'coin': (lambda e: coin(.9 + .3 * e.get('v', .5)), .22 ),
    'register': (lambda e: register(), .38), 'slide': (lambda e: whoosh(.2), .25), 'rule': (lambda e: whoosh(.15), .22),
    'ding': (lambda e: ding(), .28), 'roll': (lambda e: roll(.7), .45), 'spot': (lambda e: thump(1, 45), .55), 'heart': (lambda e: heartbeat(), .45),
    'clack': (lambda e: clack(1.1, e.get('v', .7)), .42), 'reel': (lambda e: roll(1.0)[::-1].copy(), .45),
    'coinUp': (lambda e: np.concatenate([coin(1.0)[:int(.07 * SR)], coin(1.26)]), .40), 'check': (lambda e: ding()[:int(.5 * SR)] * env_exp(.5, .12), .25),
    'flip': (lambda e: clack(.9, .8), .30),
}
fx = np.zeros_like(buf)
for i, e in enumerate(E['ev']):
    if e['type'] not in G: print('no sound for', e['type']); continue
    f, g = G[e['type']]; add(fx, f(e).astype(float), e['t'], g, pan=((i * 37) % 9 - 4) / 12)

raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', os.path.join(HERE, 'audio/voce.wav'), '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True).stdout
v = np.frombuffer(raw, dtype=np.float32).astype(float)
v = compress(hp(v, 80), thr=.18, ratio=3)
v = v / (np.sqrt(np.mean(v[np.abs(v) > .01] ** 2)) + 1e-9) * .22     # voice RMS reference
vb = np.zeros_like(buf); add(vb, v, 0.0, 1.0, 0.0)
# duck foley ~6 dB under the voice
from scipy.ndimage import uniform_filter1d
venv = uniform_filter1d(np.abs(vb[:, 0]), int(.08 * SR)); duck = 1 - .5 * np.clip(venv / .05, 0, 1)
mix = vb + fx * duck[:, None]
mix = np.stack([limit(mix[:, c], .9) for c in range(2)], 1)
import wave
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
with wave.open(os.path.join(HERE, 'out/mix.wav'), 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(mix, -1, 1) * 32767).astype(np.int16).tobytes())
print('mix', mix.shape[0] / SR, 's  peak', float(np.abs(mix).max()))
