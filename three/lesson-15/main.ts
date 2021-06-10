// alea is a predictable random library
import Random from '../scripts/alea.js';

import { WEBGL } from 'ThreeExamples/WebGL.js';

import { Scene } from 'Three/scenes/Scene.js';

import { PerspectiveCamera } from 'Three/cameras/PerspectiveCamera.js';
import { OrthographicCamera } from 'Three/cameras/OrthographicCamera.js';

import { WebGLRenderer } from 'Three/renderers/WebGLRenderer.js';
// import { WebGL1Renderer } from 'Three/renderers/WebGL1Renderer.js';

// import { MeshBasicMaterial } from 'Three/materials/MeshBasicMaterial.js';
// import { MeshPhongMaterial } from 'Three/materials/MeshPhongMaterial.js';
// import { MeshLambertMaterial } from 'Three/materials/MeshLambertMaterial.js';
import { MeshStandardMaterial } from 'Three/materials/MeshStandardMaterial.js';
// import { MeshPhysicalMaterial } from 'Three/materials/MeshPhysicalMaterial.js';
// import { MeshMatcapMaterial } from 'Three/materials/MeshMatcapMaterial.js';
// import { MeshDepthMaterial } from 'Three/materials/MeshDepthMaterial.js';
// import { MeshNormalMaterial } from 'Three/materials/MeshNormalMaterial.js';
// import { LineDashedMaterial } from 'Three/materials/LineDashedMaterial.js';

import { PointLight } from 'Three/lights/PointLight.js';
import { AmbientLight } from 'Three/lights/AmbientLight.js';
import { RectAreaLight } from 'Three/lights/RectAreaLight.js';

import {
  FrontSide,
  // BackSide,
  // DoubleSide,
  // RepeatWrapping,
  NearestFilter,
} from 'Three/constants.js';

// import { Float32BufferAttribute } from 'Three/core/BufferAttribute.js';
import { OrbitControls } from 'ThreeExamples/controls/OrbitControls.js';

import { Group } from 'Three/objects/Group.js';
import { BufferGeometry } from 'Three/core/BufferGeometry.js';
import { SphereGeometry } from 'Three/geometries/SphereGeometry.js';
import { BoxGeometry } from 'Three/geometries/BoxGeometry.js';
import { TorusGeometry } from 'Three/geometries/TorusGeometry.js';
import { PlaneGeometry } from 'Three/geometries/PlaneGeometry.js';
import { TextGeometry } from 'Three/geometries/TextGeometry.js';

import { Mesh } from 'Three/objects/Mesh.js';

// import { AxesHelper } from 'Three/helpers/AxesHelper.js';
import { LoadingManager } from 'Three/loaders/LoadingManager.js';
import { TextureLoader } from 'Three/loaders/TextureLoader.js';
import { CubeTextureLoader } from 'Three/loaders/CubeTextureLoader.js';
import { FontLoader } from 'Three/loaders/FontLoader.js';
// import { HDRCubeTextureLoader } from 'ThreeExamples/loaders/HDRCubeTextureLoader.js';

import { GUI } from 'dat.gui';
import { Texture } from 'Three/textures/Texture';

if (WEBGL?.isWebGL2Available()) {
  const canvas = document.createElement('canvas');
  canvas.classList.add('webgl');
  document.body.append(canvas);
} else {
  const warning = WEBGL.getWebGL2ErrorMessage();
  document.body.appendChild(warning);
  throw new Error(warning.textContent ?? '');
}

const _random = Random(123);
const random = (): number => _random().value || -1;

const gui = new GUI({});
const lightsGui = gui.addFolder('Light intensity');
const particlesGui = gui.addFolder('Particles');

const loadingManager = new LoadingManager();
const fontLoader = new FontLoader(loadingManager);
const textureLoader = new TextureLoader(loadingManager);
const cubeTextureLoader = new CubeTextureLoader(loadingManager);
// const cubeHDRTextureLoader = new HDRCubeTextureLoader(loadingManager);
const textures: {
  [name: string]: Texture;
} = {};
const addFlatTexture = (name: string, src: string) => {
  textures[name] = textureLoader.load(src);
  textures[name].minFilter = NearestFilter;
  textures[name].magFilter = NearestFilter;
};

textures.environment = cubeTextureLoader.load([
  '/three/i/environmentMap/px.jpg',
  '/three/i/environmentMap/nx.jpg',
  '/three/i/environmentMap/py.jpg',
  '/three/i/environmentMap/ny.jpg',
  '/three/i/environmentMap/pz.jpg',
  '/three/i/environmentMap/nz.jpg',
]);
textures.environment.minFilter = NearestFilter;
textures.environment.magFilter = NearestFilter;

addFlatTexture('doorAlpha', '/three/i/door/alpha.jpg');
addFlatTexture('doorAmbientOcclusion', '/three/i/door/ambientOcclusion.jpg');
addFlatTexture('doorColor', '/three/i/door/color.jpg');
addFlatTexture('doorHeight', '/three/i/door/height.jpg');
addFlatTexture('doorMetalness', '/three/i/door/metalness.jpg');
addFlatTexture('doorNormal', '/three/i/door/normal.jpg');
addFlatTexture('doorRoughness', '/three/i/door/roughness.jpg');

addFlatTexture('matcapClay', '/three/i/matcap/1.png');
addFlatTexture('matcapChrome', '/three/i/matcap/3.png');
addFlatTexture('matcapRed', '/three/i/matcap/4.png');
addFlatTexture('matcapIronman', '/three/i/matcap/5.png');
addFlatTexture('matcapCell', '/three/i/matcap/7.png');

const sceneParams: any = {
  width: window.innerWidth,
  height: window.innerHeight,
  get aspectRatio() {
    return this.width / this.height;
  },
  // Perpective camera
  fov: 45,
  // Orthographic camera
  renderSize: 2,
  canvas: document.querySelector('.webgl'),
  cursorX: 0,
  cursorY: 0,
  canvasDimensionsUpdated: false,
};

const shapesGroup = new Group();
let groupRot = 0;

const material = new MeshStandardMaterial();
{
  material.side = FrontSide;
  // material.transparent = true;
  material.flatShading = false;

  // material.alphaMap = textures.doorAlpha;
  // material.displacementMap = textures.doorHeight;
  // material.displacementScale = 0.1;
  // material.matcap = textures.matcapCell;`
  material.aoMap = textures.doorAmbientOcclusion;
  material.aoMapIntensity = 1.5;
  material.map = textures.doorColor;
  material.metalness = 0.1;
  material.metalnessMap = textures.doorMetalness;
  material.normalMap = textures.doorNormal;
  material.roughness = 2;
  material.roughnessMap = textures.doorRoughness;
  material.envMap = textures.environment;
  material.envMapIntensity = 4;
}

const floor = new Mesh(new PlaneGeometry(30, 30), material);
floor.geometry.setAttribute('uv2', floor.geometry.attributes.uv);
{
  floor.rotation.x = Math.PI / -2;
  // floor.position.x = -1.4;
  floor.position.y = -6;
}
const sphere = new Mesh(new SphereGeometry(0.8, 640, 320), material);
{
  sphere.geometry.setAttribute('uv2', sphere.geometry.attributes.uv);
  sphere.position.x = -1.4;
  sphere.position.y = -0.3;
}
const box = new Mesh(new BoxGeometry(1, 1, 1, 250, 250, 250), material);
{
  box.geometry.setAttribute('uv2', box.geometry.attributes.uv);
  box.position.y = -0.3;
}
const torus = new Mesh(new TorusGeometry(0.6, 0.2, 320, 640), material);
{
  torus.geometry.setAttribute('uv2', torus.geometry.attributes.uv);
  torus.position.x = 1.4;
  torus.position.y = -0.3;
}

interface Particle {
  mesh: Mesh;
  init: any;
  speed: any;
  phase: number;
  bounce: number;
};
const particles: {
  _displayCount: number;
  displayCount: number;
  all: Particle[];
  display: Particle[];
  particleGeometry?: BufferGeometry;
  totalCount?: number;
} = {
  _displayCount: 0,
  all: [],
  display: [],
  get displayCount() {
    return this._displayCount;
  },
  set displayCount(newCount) {
    shapesGroup.remove(...this.display.map(({mesh}) => mesh));
    this.display = this.all.slice(0, newCount) ?? [];
    this._displayCount = newCount;
    shapesGroup.add(...this.display.map(({mesh}) => mesh));
  },
};
particles.totalCount = 1e3;
particles.particleGeometry = new TorusGeometry(0.1, 0.04, 12, 24);
particles.all = Array.from({ length: particles.totalCount }, () => {
  const torus = new Mesh(particles.particleGeometry, material);
  const aParticle: Particle = {
    mesh: torus,
    init: { position: {} },
    speed: {},
    phase: 0,
    bounce: 0,
  };
  aParticle.init.position.x = torus.position.x = (random() - 0.5) * 10;
  aParticle.init.position.y = torus.position.y = (random() - 0.5) * 10;
  aParticle.init.position.z = torus.position.z = (random() - 0.5) * 10;
  torus.rotation.x = aParticle.speed.x = random() * Math.PI;
  torus.rotation.y = aParticle.speed.y = random() * Math.PI;
  torus.rotation.z = aParticle.speed.z = random() * Math.PI;

  aParticle.phase = Math.random() * Math.PI * 2;
  aParticle.bounce = Math.random() * 0.2 + 0.1;
  aParticle.speed.phase = Math.random() * 0.01 + 0.01;

  return aParticle;
});
particles.displayCount = 10;

let text;
fontLoader.load(
  '/three/modules/three/examples/fonts/gentilis_regular.typeface.json',
  (font) => {
    const options = {
      font,
      size: 0.5,
      height: 0.2,
      steps: 5,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.02,
      bevelOffset: 0,
      bevelSegments: 5,
    };
    text = new Mesh(new TextGeometry('I’m wooden!', options), material);
    text.geometry.center();
    text.geometry.translate(0, 0.8, 0);
    console.log(text.geometry.boundingBox);
    shapesGroup.add(text);
  },
  () => {
    console.log('Still loading font…');
  },
  (e) => {
    console.log('Error loading font: ' + e);
  },
);

shapesGroup.add(sphere, box, torus);

const areaLight = new RectAreaLight(0xf9f3b5, 5, 5, 5);
areaLight.position.x = 4;
areaLight.position.z = 5;
areaLight.position.y = 3;
areaLight.intensity = 6;
areaLight.lookAt(0, 0, 0);

const pointLight = new PointLight(0x67b8ff);
pointLight.position.x = -3;
pointLight.position.z = -5;
pointLight.position.y = -8;
pointLight.decay = 2;
pointLight.power = 5000;

const ambientLight = new AmbientLight(0x9254bf);
ambientLight.intensity = 1;

const camera = ((type = 'perspective') => {
  let camera;
  if (type === 'orthographic') {
    camera = new OrthographicCamera(
      -sceneParams.renderSize * sceneParams.aspectRatio, // left
      sceneParams.renderSize * sceneParams.aspectRatio, // right
      sceneParams.renderSize, // top
      -sceneParams.renderSize, // bottom
      0.1,
      10,
    );
  } else if (type === 'perspective') {
    camera = new PerspectiveCamera(sceneParams.fov);
  } else {
    throw new Error(`No camera type of ${type} exists`);
  }

  camera.near = 0.5;
  camera.far = 30;
  camera.position.z = 5;
  camera.position.y = 2;
  return camera;
})();

lightsGui.add(areaLight, 'intensity').min(0).max(20).step(1).name('Front - area');
lightsGui.add(pointLight, 'power').min(0).max(2e4).step(100).name('Back - point');
lightsGui.add(pointLight, 'decay').min(0).max(3).step(0.1).name('Back - decay');
lightsGui.add(ambientLight, 'intensity').min(0).max(20).step(0.1).name('Ambient');
lightsGui.add(material, 'envMapIntensity').min(0).max(20).step(0.1).name('Environment');

particlesGui.add(particles, 'displayCount').min(0).max(particles.totalCount).step(1).name('Particle count');

const cameraControls = new OrbitControls(camera, sceneParams.canvas);
cameraControls.enableDamping = true;

// const axesHelper = new AxesHelper(3,3,3);

const scene = new Scene();
scene.add(
  camera,
  floor,
  shapesGroup,
  // axesHelper,

  pointLight,
  areaLight,
  ambientLight,
);

const renderer = new WebGLRenderer({
  canvas: sceneParams.canvas,
  antialias: true,
  alpha: true,
});
renderer.physicallyCorrectLights = true;
renderer.setClearColor(0, 0);

const groupSpeed = 0.06;
const itemSpeed = 0.2;
function step() {
  groupRot += groupSpeed / animationFPS;
  shapesGroup.rotation.y = groupRot;

  sphere.rotation.z += itemSpeed / animationFPS;
  torus.rotation.y += itemSpeed / animationFPS;
  box.rotation.x += itemSpeed / animationFPS;

  particles.display.forEach((particle) => {
    particle.mesh.rotation.z += Math.max(-itemSpeed, Math.min(itemSpeed, itemSpeed / particle.speed.y)) / animationFPS;
    particle.mesh.rotation.y += Math.max(-itemSpeed, Math.min(itemSpeed, itemSpeed / particle.speed.z)) / animationFPS;
    particle.mesh.rotation.x += Math.max(-itemSpeed, Math.min(itemSpeed, itemSpeed / particle.speed.x)) / animationFPS;

    particle.phase += particle.speed.phase;
    particle.mesh.position.y = particle.init.position.y + Math.sin(particle.phase) * particle.bounce - particle.bounce / 2;
  });
}

let animateRAF: number;
const animationFPS = 60;
const animationMSPF = 1000 / animationFPS;
let lastStepTime = Date.now();

function animate({ init = false }: { init?: boolean } = {}) {
  if (init) {
    lastStepTime = Date.now();
    step();
  } else {
    while (lastStepTime < Date.now() - animationMSPF) {
      step();
      lastStepTime += animationMSPF;
    }
  }

  cameraControls.update();

  animateRAF = requestAnimationFrame(() => {
    animate();
  });
}
window.onblur = () => {
  cancelAnimationFrame(animateRAF);
};
window.onfocus = () => {
  animate({ init: true });
};
animate({ init: true });

(function render() {
  if (sceneParams.canvasDimensionsUpdated) {
    renderer.setSize(sceneParams.width, sceneParams.height);
    renderer.setPixelRatio(Math.min(2, devicePixelRatio));
    if ('aspect' in camera) {
      camera.aspect = sceneParams.aspectRatio;
    }
    camera.updateProjectionMatrix();
    sceneParams.canvasDimensionsUpdated = false;
  }

  renderer.render(scene, camera);

  requestAnimationFrame(render);
})();

function updateRenderDimensions() {
  sceneParams.width = window.innerWidth;
  sceneParams.height = window.innerHeight;
  sceneParams.canvasDimensionsUpdated = true;
}
updateRenderDimensions();

const isTouchEvent = (event: MouseEvent | TouchEvent): event is TouchEvent => 'touches' in event;
window.addEventListener('mousemove', (event: MouseEvent | TouchEvent) => {
  const touch = isTouchEvent(event) ? event.touches[0] : event;
  sceneParams.cursorX = ((touch.clientX - sceneParams.canvas.offsetLeft) / sceneParams.width) * 2 - 1;
  sceneParams.cursorY = ((touch.clientY - sceneParams.canvas.offsetTop) / sceneParams.height) * -2 + 1;
});

sceneParams.canvas.addEventListener('dblclick', () => {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    sceneParams.canvas.requestFullscreen();
  }
});

window.addEventListener('resize', updateRenderDimensions);
window.addEventListener('focus', updateRenderDimensions);
document.body.addEventListener('mouseenter', updateRenderDimensions);
