import { Texture } from '../modules/three/src/textures/Texture.js';
import { CubeTexture } from '../modules/three/src/textures/CubeTexture.js';
import { CubeTextureLoader } from '../modules/three/src/loaders/CubeTextureLoader.js';
// import { HDRCubeTextureLoader } from '../modules/three/examples/jsm/loaders/HDRCubeTextureLoader.js';
import { LoadingManager } from '../modules/three/src/loaders/LoadingManager.js';
import { NearestFilter } from '../modules/three/src/constants.js';
import { TextureLoader } from '../modules/three/src/loaders/TextureLoader.js';
// import { FontLoader } from '../modules/three/src/loaders/FontLoader.js';

const loadingManager = new LoadingManager();

export class TextureContainer {
  textureLoader: TextureLoader;
  cubeTextureLoader: CubeTextureLoader;
  environment: CubeTexture;

  #textures: { [textureName: string]: Texture };

  get(textureName: string) {
    return this.#textures[textureName];
  }

  addFlatTexture(name: string, src: string) {
    if (this.#textures[name]) { throw new Error(`Adding ${src} aborted.\nA texture with this name already exists: ${name}.`); }
    this.#textures[name] = this.textureLoader.load(src);
    this.#textures[name].minFilter = NearestFilter;
    this.#textures[name].magFilter = NearestFilter;
  }

  setEnvironment(name: string, src: string) {
    this.#textures[name] = this.textureLoader.load(src);
    this.#textures[name].minFilter = NearestFilter;
    this.#textures[name].magFilter = NearestFilter;
  }

  constructor({ environment }: { environment: [string, string, string, string, string, string] }) {
    this.textureLoader = new TextureLoader(loadingManager);
    this.cubeTextureLoader = new CubeTextureLoader(loadingManager);
    this.#textures = {};
    this.environment = this.cubeTextureLoader.load(environment);
    this.environment.minFilter = NearestFilter;
    this.environment.magFilter = NearestFilter;
    // this.hdrCubeTextureLoader = new HDRCubeTextureLoader(loadingManager);
  }
}
