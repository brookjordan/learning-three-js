var __classPrivateFieldSet =
  (this && this.__classPrivateFieldSet) ||
  function (receiver, state, value, kind, f) {
    if (kind === 'm') throw new TypeError('Private method is not writable');
    if (kind === 'a' && !f) throw new TypeError('Private accessor was defined without a setter');
    if (typeof state === 'function' ? receiver !== state || !f : !state.has(receiver))
      throw new TypeError('Cannot write private member to an object whose class did not declare it');
    return kind === 'a' ? f.call(receiver, value) : f ? (f.value = value) : state.set(receiver, value), value;
  };
var __classPrivateFieldGet =
  (this && this.__classPrivateFieldGet) ||
  function (receiver, state, kind, f) {
    if (kind === 'a' && !f) throw new TypeError('Private accessor was defined without a getter');
    if (typeof state === 'function' ? receiver !== state || !f : !state.has(receiver))
      throw new TypeError('Cannot read private member from an object whose class did not declare it');
    return kind === 'm' ? f : kind === 'a' ? f.call(receiver) : f ? f.value : state.get(receiver);
  };
var _TextureContainer_textures;
import { CubeTextureLoader } from '../modules/three/src/loaders/CubeTextureLoader.js';
// import { HDRCubeTextureLoader } from '../modules/three/examples/jsm/loaders/HDRCubeTextureLoader.js';
import { LoadingManager } from '../modules/three/src/loaders/LoadingManager.js';
import { NearestFilter } from '../modules/three/src/constants.js';
import { TextureLoader } from '../modules/three/src/loaders/TextureLoader.js';
// import { FontLoader } from '../modules/three/src/loaders/FontLoader.js';
const loadingManager = new LoadingManager();
export class TextureContainer {
  constructor({ environment }) {
    _TextureContainer_textures.set(this, void 0);
    this.textureLoader = new TextureLoader(loadingManager);
    this.cubeTextureLoader = new CubeTextureLoader(loadingManager);
    __classPrivateFieldSet(this, _TextureContainer_textures, {}, 'f');
    this.environment = this.cubeTextureLoader.load(environment);
    this.environment.minFilter = NearestFilter;
    this.environment.magFilter = NearestFilter;
    // this.hdrCubeTextureLoader = new HDRCubeTextureLoader(loadingManager);
  }
  get(textureName) {
    return __classPrivateFieldGet(this, _TextureContainer_textures, 'f')[textureName];
  }
  addFlatTexture(name, src) {
    if (__classPrivateFieldGet(this, _TextureContainer_textures, 'f')[name]) {
      throw new Error(`Adding ${src} aborted.\nA texture with this name already exists: ${name}.`);
    }
    __classPrivateFieldGet(this, _TextureContainer_textures, 'f')[name] = this.textureLoader.load(src);
    __classPrivateFieldGet(this, _TextureContainer_textures, 'f')[name].minFilter = NearestFilter;
    __classPrivateFieldGet(this, _TextureContainer_textures, 'f')[name].magFilter = NearestFilter;
  }
  setEnvironment(name, src) {
    __classPrivateFieldGet(this, _TextureContainer_textures, 'f')[name] = this.textureLoader.load(src);
    __classPrivateFieldGet(this, _TextureContainer_textures, 'f')[name].minFilter = NearestFilter;
    __classPrivateFieldGet(this, _TextureContainer_textures, 'f')[name].magFilter = NearestFilter;
  }
}
_TextureContainer_textures = new WeakMap();
