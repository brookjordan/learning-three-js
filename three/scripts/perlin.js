let iOctaves = 1; // 1 / max persistence
let fPersistence = 0.2;
let fResult;
let fFreq;
let fPers;
let aOctFreq; // frequency per octave
let aOctPers; // persistance per octave
let fPersMax;
const octaveFreq = () => {
  let fFreq;
  let fPers;
  aOctFreq = [];
  aOctPers = [];
  fPersMax = 0;
  for (let i = 0; i < iOctaves; i++) {
    fFreq = 2 ** i;
    fPers = fPersistence ** i;
    fPersMax += fPers;
    aOctFreq.push(fFreq);
    aOctPers.push(fPers);
  }
  fPersMax = 2 / fPersMax;
};
const perm = new Uint8Array(512);
const p = new Uint8Array(256);
const grad3 = [
  [1, 1, 0],
  [-1, 1, 0],
  [1, -1, 0],
  [-1, -1, 0],
  [1, 0, 1],
  [-1, 0, 1],
  [1, 0, -1],
  [-1, 0, -1],
  [0, 1, 1],
  [0, -1, 1],
  [0, 1, -1],
  [0, -1, -1],
];
// Return the dot product for 2d perlin noise
function dot2(g, x, y) {
  return g[0] * x + g[1] * y;
}
// Return the dot product for 3d perlin noise
function dot3(g, x, y, z) {
  return g[0] * x + g[1] * y + g[2] * z;
}
// Seeded random number generator
function seed(x) {
  x = (x << 13) ^ x;
  return 1.0 - ((x * (x * x * 15731 + 789221) + 1376312589) & 0x7fffffff) / 1073741824;
}
function noise2D(x, y, _z) {
  // Find unit grid cell containing point
  const X = Math.floor(x) & 255;
  const Y = Math.floor(y) & 255;
  // Get relative xyz coordinates of point within that cell
  x -= Math.floor(x);
  y -= Math.floor(y);
  const fade = (t) => t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
  const lerp = (a, b, t) => (1.0 - t) * a + t * b;
  const u = fade(x);
  const v = fade(y);
  // Calculate a set of four hashed gradient indices
  const n00 = perm[X + perm[Y]] % 12;
  const n01 = perm[X + perm[Y + 1]] % 12;
  const n10 = perm[X + 1 + perm[Y + 1]] % 12;
  const n11 = perm[X + 1 + perm[Y + 1]] % 12;
  // Calculate noise contributions from each of the four corners
  const gi00 = dot2(grad3[n00], x, y);
  const gi01 = dot2(grad3[n01], x, y - 1);
  const gi10 = dot2(grad3[n10], x - 1, y);
  const gi11 = dot2(grad3[n11], x - 1, y - 1);
  // Interpolate the results along axises
  return lerp(lerp(gi00, gi10, u), lerp(gi01, gi11, u), v);
}
function noise3D(x, y, z) {
  // Find unit grid cell containing point
  const X = Math.floor(x) & 255;
  const Y = Math.floor(y) & 255;
  const Z = Math.floor(z) & 255;
  // Get relative xyz coordinates of point within that cell
  x -= Math.floor(x);
  y -= Math.floor(y);
  z -= Math.floor(z);
  const fade = (t) => t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
  const lerp = (a, b, t) => (1.0 - t) * a + t * b;
  const u = fade(x);
  const v = fade(y);
  const w = fade(z);
  // Calculate a set of eight hashed gradient indices
  const n000 = perm[X + perm[Y + perm[Z]]] % 12;
  const n001 = perm[X + perm[Y + perm[Z + 1]]] % 12;
  const n010 = perm[X + perm[Y + 1 + perm[Z]]] % 12;
  const n011 = perm[X + perm[Y + 1 + perm[Z + 1]]] % 12;
  const n100 = perm[X + 1 + perm[Y + perm[Z]]] % 12;
  const n101 = perm[X + 1 + perm[Y + perm[Z + 1]]] % 12;
  const n110 = perm[X + 1 + perm[Y + 1 + perm[Z]]] % 12;
  const n111 = perm[X + 1 + perm[Y + 1 + perm[Z + 1]]] % 12;
  // Calculate noise contributions from each of the eight corners
  const gi000 = dot3(grad3[n000], x, y, z);
  const gi001 = dot3(grad3[n001], x, y, z - 1);
  const gi010 = dot3(grad3[n010], x, y - 1, z);
  const gi011 = dot3(grad3[n011], x, y - 1, z - 1);
  const gi100 = dot3(grad3[n100], x - 1, y, z);
  const gi101 = dot3(grad3[n101], x - 1, y, z - 1);
  const gi110 = dot3(grad3[n110], x - 1, y - 1, z);
  const gi111 = dot3(grad3[n111], x - 1, y - 1, z - 1);
  // Interpolate the results along axises
  return lerp(
    lerp(lerp(gi000, gi100, u), lerp(gi001, gi101, u), w),
    lerp(lerp(gi010, gi110, u), lerp(gi011, gi111, u), w),
    v,
  );
}
export default class PerlinNoise {
  constructor(seedValue = 1) {
    for (let i = 0; i < 256; i++) {
      p[i] = Math.abs(~~(seed(i * Math.round(seedValue)) * 256));
    }
    // To remove the need for index wrapping, double the permutation table length
    for (let i = 0; i < 512; i++) {
      perm[i] = p[i & 255];
    }
    this.noiseDetail(1, 1);
  }
  noise(x, y, z) {
    fResult = 0;
    for (let i = 0; i < iOctaves; i++) {
      fFreq = aOctFreq[i];
      fPers = aOctPers[i];
      switch (arguments.length) {
        case 3:
          fResult += fPers * noise3D(fFreq * x, fFreq * y, fFreq * z);
          break;
        case 2:
          fResult += fPers * noise2D(fFreq * x, fFreq * y, undefined);
          break;
        default:
          fResult += fPers * noise3D(fFreq * x, fFreq * y, fFreq * z);
          break;
      }
    }
    return (fResult * fPersMax + 0.8) * 0.5;
  }
  noiseDetail(octaves, persistance) {
    iOctaves = octaves || iOctaves;
    fPersistence = persistance || fPersistence;
    octaveFreq();
  }
}
