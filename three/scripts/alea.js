function Mash() {
  let n = 0xefc8249d;

  const mash = (data) => {
    data = String(data);
    for (let i = 0; i < data.length; i++) {
      n += data.charCodeAt(i);
      let h = 0.02519603282416938 * n;
      n = h >>> 0;
      h -= n;
      h *= n;
      n = h >>> 0;
      h -= n;
      n += h * 0x100000000; // 2^32
    }
    return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
  };

  return mash;
}

export function* Alea(seed) {
  let mash = Mash();

  let c = 1;
  let s0 = mash(' ');
  let s1 = mash(' ');
  let s2 = mash(' ');
  s0 -= mash(seed);
  if (s0 < 0) {
    s0 += 1;
  }
  s1 -= mash(seed);
  if (s1 < 0) {
    s1 += 1;
  }
  s2 -= mash(seed);
  if (s2 < 0) {
    s2 += 1;
  }
  mash = null;

  let t = 2091639 * s0 + c * 2.3283064365386963e-10; // 2^-32
  while (true) {
    s0 = s1;
    s1 = s2;
    s2 = t - (c = t | 0);
    yield s2;
    t = 2091639 * s0 + c * 2.3283064365386963e-10;
  }
}

function copy({ c, s0, s1, s2 }, t) {
  t.c = c;
  t.s0 = s0;
  t.s1 = s1;
  t.s2 = s2;
  return t;
}

export default function impl(seed, opts) {
  const xg = Alea(seed);
  const state = opts && opts.state;
  const prng = () => xg.next();
  prng.int32 = () => (xg.next() * 0x100000000) | 0;
  prng.double = () => prng() + ((prng() * 0x200000) | 0) * 1.1102230246251565e-16 /* 2^-53 */;
  if (state) {
    if (typeof state == 'object') copy(state, xg);
    prng.state = () => copy(xg, {});
  }
  return prng;
}

export function Between(seed) {
  const alea = Alea(seed);
  return (min, max) => alea.next().value * (max - min) + min;
}
