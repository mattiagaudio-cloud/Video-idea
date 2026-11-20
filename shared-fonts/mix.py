"""Voice (the user's ElevenLabs track) + foley from events.json → out/mix.wav. No music: the user adds a track in TikTok.
Usage: python mix.py <keynote|news|stick>"""
import json, os, sys, subprocess, wave
import numpy as np
LIB = os.environ.get('LIB', '/root/lemo-opuscar'); sys.path.insert(0, os.path.join(LIB, 'core/audio'))
from sfx import *   # noqa
from scipy.ndimage import uniform_filter1d
STYLE = sys.argv[1] if len(sys.argv) > 1 else 'keynote'
HERE = os.path.dirname(os.path.abspath(__file__))
E = json.load(open(os.path.join(HERE, 'events.json'))); DUR = E['dur']
N = int((DUR + .5) * SR)

def tone(f0, f1, d, tau):
    tt = t_(d); f = np.linspace(f0, f1, len(tt)); return np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(d, tau)
def bell(f, d=.9, tau=.25):
    tt = t_(d); return norm(sum(a * np.sin(2 * np.pi * f * m * tt) * env_exp(d, tau * k) for m, a, k in [(1, 1, 1), (2, .35, .6), (3.01, .15, .35)]))
def coin(p=1.0):
    d = .45; tt = t_(d); return norm(sum(a * np.sin(2 * np.pi * f * p * tt) * env_exp(d, tau) for f, a, tau in [(2400, 1, .09), (3720, .6, .06), (5100, .4, .04)]) + hp(noise(d), 4000) * env_exp(d, .004) * .6)
def soft_whoosh(d=.28): return lp(whoosh(d), 3000)
def mixat(a, b, dt):
    b = np.pad(b, (int(dt * SR), 0)); n = max(len(a), len(b)); return np.pad(a, (0, n - len(a))) + np.pad(b, (0, n - len(b)))

def sq(f0, f1, d, duty=.5, tau=None):
    tt = t_(d); f = np.linspace(f0, f1, len(tt)); ph = np.cumsum(f) / SR; x = np.where((ph % 1) < duty, 1.0, -1.0)
    return x * (env_exp(d, tau) if tau else 1.0) * .5
def seq(notes, dur=.07, duty=.5):
    out = [sq(f, f, dur, duty, dur * .8) for f in notes]; return np.concatenate(out)
def crush(x, bits=4): return np.round(x * (2 ** bits)) / (2 ** bits)
def boom(): return norm(tone(90, 45, 1.2, .35) + lp(noise(1.2), 200) * env_exp(1.2, .08) * .4)
def sweepfx(): return norm(bp(noise(.5), 2000, 9000) * np.sin(np.pi * t_(.5) / .5) ** 2)
def flap(n=6):
    out = np.zeros(int(.05 * n * SR) + int(.1 * SR))
    for k in range(n): c = clack(1.3 + .05 * k, .6); s = int(k * .05 * SR); out[s:s + len(c)] += c[:len(out) - s]
    return out
def timp(): return norm(tone(110, 95, 1.0, .25) + lp(noise(1.0), 400) * env_exp(1.0, .03) * .5)
def pencil(d=.35): return norm(bp(noise(d), 2500, 7000) * (.6 + .4 * np.abs(np.sin(2 * np.pi * 9 * t_(d)))) * np.sin(np.pi * t_(d) / d))

MAPS = {
  'keynote': {'boom': (boom, .45), 'sweep': (sweepfx, .16), 'tick': (lambda: click(1.6, .6), .22), 'swoosh': (soft_whoosh, .14),
              'toggle': (lambda: click(1.2), .3), 'confirm': (lambda: bell(1568, .9, .2), .16), 'key': (lambda: click(2.0, .5), .14),
              'notif': (lambda: mixat(bell(1046, .7, .15), bell(1568, .6, .15), .09), .18),
              'cash': (lambda: bell(1318, 1.2, .3), .2), 'strike': (lambda: soft_whoosh(.18), .2), 'coin': (lambda: coin(1.0), .2)},
  'news':    {'sting': (lambda: norm(mixat(timp(), bell(880, 1.4, .4) * .6, 0)), .5), 'slash': (lambda: whoosh(.18), .3), 'wipe': (lambda: whoosh(.3), .26),
              'flip': (lambda: flap(3), .3), 'flap': (lambda: flap(8), .32), 'stamp': (lambda: thump(1, 80), .5),
              'timp': (timp, .45), 'tick': (lambda: click(1.4, .6), .3), 'key': (lambda: clack(1.2, .5), .2), 'coin': (lambda: coin(1.0), .22),
              'ding': (lambda: bell(1318, 1.0, .25), .2)},
  'stick':   {'pop': (lambda: pop(), .3), 'pencil': (lambda: pencil(.35), .14), 'clasp': (lambda: click(1.0, .8), .35), 'coin': (lambda: coin(1.0), .2),
              'swoosh': (lambda: soft_whoosh(.22), .12), 'ding': (lambda: bell(1046, 1.0, .25), .18), 'thump': (lambda: thump(.8, 90), .3),
              'key': (lambda: click(1.6, .5), .14), 'pulse': (lambda: tone(400, 900, .35, .12), .12)},
}
MAPS['pixel'] = {'alert': (lambda: seq([880, 1320, 1760], .05), .5), 'boom': (lambda: crush(boom(), 5), .35), 'blip': (lambda: sq(1200, 1200, .05, .25, .03), .3),
    'shatter': (lambda: crush(norm(hp(noise(.4), 800) * env_exp(.4, .1)), 3), .35), 'fanfare': (lambda: seq([523, 659, 784, 1046, 784, 1046], .08), .4),
    'menu': (lambda: sq(660, 990, .06, .5, .05), .25), 'ok': (lambda: seq([784, 1175], .07), .35), 'type': (lambda: sq(1500, 1500, .025, .5, .015), .2),
    'chest': (lambda: seq([392, 494, 587, 784], .05), .35), 'coins': (lambda: seq([1318, 1568] * 4, .045, .25), .3), 'coin': (lambda: seq([988, 1318], .06, .25), .35),
    'coinUp': (lambda: seq([988, 1318, 1760], .06, .25), .35), 'step': (lambda: seq([200, 0.001, 200], .04), .2)}
MAPS['toon'] = {'zap': (lambda: norm(mixat(tone(1800, 200, .35, .12), boom() * .5, 0)), .45), 'whoosh': (lambda: soft_whoosh(.25), .25), 'pop': (lambda: pop(), .35),
    'click': (lambda: click(1.2, .7), .3), 'snap': (lambda: norm(mixat(clack(1.6, 1), tone(900, 300, .2, .06), .01)), .45), 'thud': (lambda: thump(.9, 70), .45),
    'ding': (lambda: bell(1318, .9, .2), .22), 'portal': (lambda: norm(tone(200, 1400, .6, .4) * np.sin(np.pi * t_(.6) / .6) + bp(noise(.6), 1500, 6000) * .2), .3),
    'coin': (lambda: coin(1.0), .2), 'cash': (lambda: mixat(bell(1046, 1.0, .25), bell(1568, .8, .2), .08), .25), 'ting': (lambda: coin(1.4), .35),
    'holo': (lambda: norm(tone(600, 1200, .3, .15) + tone(900, 1800, .3, .1) * .5), .2), 'boing': (lambda: norm(tone(180, 520, .35, .2) * (1 + .3 * np.sin(2 * np.pi * 18 * t_(.35)))), .35)}
MAPS['anime'] = {'hit': (lambda: norm(mixat(boom(), bp(noise(.3), 2000, 8000) * env_exp(.3, .05), 0)), .5), 'neon': (lambda: norm((bp(noise(.35), 100, 400) * .6 + tone(120, 120, .35, .3)) * (np.floor(t_(.35) * 30) % 3 > 0)), .3),
    'swish': (lambda: whoosh(.22), .3), 'shine': (lambda: mixat(bell(2093, 1.0, .25), bell(3136, .8, .2), .05), .22), 'tap': (lambda: click(1.3, .7), .3),
    'ok': (lambda: mixat(bell(1046, .7, .2), bell(1568, .7, .2), .07), .22), 'ting': (lambda: coin(1.3), .3), 'buzz': (lambda: norm(tone(120, 120, .12, .08) + bp(noise(.12), 300, 900) * .3), .18),
    'coin': (lambda: mixat(coin(1.0), bell(1568, .6, .15), .03), .25)}
M = MAPS[STYLE]; fx = np.zeros((N, 2))
for i, e in enumerate(E['ev']):
    if e['type'] not in M: print('no sound for', e['type']); continue
    f, g = M[e['type']]; add(fx, np.asarray(f(), float), e['t'], g * e.get('v', 1.0), pan=((i * 37) % 9 - 4) / 14)
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', os.path.join(HERE, 'audio/voce.wav'), '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True).stdout
v = np.frombuffer(raw, dtype=np.float32).astype(float)
v = compress(hp(v, 80), thr=.18, ratio=3); v = v / (np.sqrt(np.mean(v[np.abs(v) > .01] ** 2)) + 1e-9) * .22
vb = np.zeros((N, 2)); add(vb, v, 0.0, 1.0, 0.0)
venv = uniform_filter1d(np.abs(vb[:, 0]), int(.08 * SR)); duck = 1 - .5 * np.clip(venv / .05, 0, 1)
mix = vb + fx * duck[:, None]; mix = np.stack([limit(mix[:, c], .9) for c in range(2)], 1)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
with wave.open(os.path.join(HERE, 'out/mix.wav'), 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(mix, -1, 1) * 32767).astype(np.int16).tobytes())
print('mix', round(mix.shape[0] / SR, 2), 's')
