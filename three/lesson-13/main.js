// alea is a predictable random library
import Random from '../scripts/alea.js';

import { WEBGL } from '../modules/three/examples/jsm/WebGL.js';

import { Scene } from '../modules/three/src/scenes/Scene.js';

import { PerspectiveCamera } from '../modules/three/src/cameras/PerspectiveCamera.js';
import { OrthographicCamera } from '../modules/three/src/cameras/OrthographicCamera.js';

import { WebGLRenderer } from '../modules/three/src/renderers/WebGLRenderer.js';
// import { WebGL1Renderer } from '../modules/three/src/renderers/WebGL1Renderer.js';

// import { MeshBasicMaterial } from '../modules/three/src/materials/MeshBasicMaterial.js';
// import { MeshPhongMaterial } from '../modules/three/src/materials/MeshPhongMaterial.js';
// import { MeshLambertMaterial } from '../modules/three/src/materials/MeshLambertMaterial.js';
import { MeshStandardMaterial } from '../modules/three/src/materials/MeshStandardMaterial.js';
// import { MeshPhysicalMaterial } from '../modules/three/src/materials/MeshPhysicalMaterial.js';
// import { MeshMatcapMaterial } from '../modules/three/src/materials/MeshMatcapMaterial.js';
// import { MeshDepthMaterial } from '../modules/three/src/materials/MeshDepthMaterial.js';
// import { MeshNormalMaterial } from '../modules/three/src/materials/MeshNormalMaterial.js';
// import { LineDashedMaterial } from '../modules/three/src/materials/LineDashedMaterial.js';

import { PointLight } from '../modules/three/src/lights/PointLight.js';
import { AmbientLight } from '../modules/three/src/lights/AmbientLight.js';
import { RectAreaLight } from '../modules/three/src/lights/RectAreaLight.js';

import {
  FrontSide,
  // BackSide,
  // DoubleSide,
  // RepeatWrapping,
  NearestFilter,
} from '../modules/three/src/constants.js';

// import { Float32BufferAttribute } from '../modules/three/src/core/BufferAttribute.js';
import { OrbitControls } from '../modules/three/examples/jsm/controls/OrbitControls.js';

import { Group } from '../modules/three/src/objects/Group.js';
// import { BufferGeometry } from '../modules/three/src/core/BufferGeometry.js';
import { SphereGeometry } from '../modules/three/src/geometries/SphereGeometry.js';
import { BoxGeometry } from '../modules/three/src/geometries/BoxGeometry.js';
import { TorusGeometry } from '../modules/three/src/geometries/TorusGeometry.js';
import { PlaneGeometry } from '../modules/three/src/geometries/PlaneGeometry.js';
import { TextGeometry } from '../modules/three/src/geometries/TextGeometry.js';

import { Mesh } from '../modules/three/src/objects/Mesh.js';

// import { AxesHelper } from '../modules/three/src/helpers/AxesHelper.js';
import { LoadingManager } from '../modules/three/src/loaders/LoadingManager.js';
import { TextureLoader } from '../modules/three/src/loaders/TextureLoader.js';
import { CubeTextureLoader } from '../modules/three/src/loaders/CubeTextureLoader.js';
import { FontLoader } from '../modules/three/src/loaders/FontLoader.js';
// import { HDRCubeTextureLoader } from '../modules/three/examples/jsm/loaders/HDRCubeTextureLoader.js';

import { GUI } from '../modules/dat.gui/build/dat.gui.module.js';

if (!WEBGL || !WEBGL.isWebGL2Available) {
  document.querySelector('body').removeChild(document.querySelector('.webgl'));

  const warning = WEBGL.getWebGL2ErrorMessage();
  document.querySelector('body').appendChild(warning);
  throw new Error(warning.textContent);
}

const _random = Random(123);
const random = () => _random().value;
window.random = random;

const gui = new GUI();
const lightsGui = gui.addFolder('Light intensity');
const particlesGui = gui.addFolder('Instances');

const loadingManager = new LoadingManager();
const fontLoader = new FontLoader(loadingManager);
const textureLoader = new TextureLoader(loadingManager);
const cubeTextureLoader = new CubeTextureLoader(loadingManager);
// const cubeHDRTextureLoader = new HDRCubeTextureLoader(loadingManager);
const textures = {};
const addFlatTexture = (name, src) => {
  textures[name] = textureLoader.load(src);
  textures[name].min = NearestFilter;
  textures[name].max = NearestFilter;
  // textures[name].generateMipmaps = false;
};

textures.environment = cubeTextureLoader.load([
  '/three/i/environmentMap/px.jpg',
  '/three/i/environmentMap/nx.jpg',
  '/three/i/environmentMap/py.jpg',
  '/three/i/environmentMap/ny.jpg',
  '/three/i/environmentMap/pz.jpg',
  '/three/i/environmentMap/nz.jpg',
]);
textures.environment.min = NearestFilter;
textures.environment.max = NearestFilter;

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

const sceneParams = {
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

const particles = {
  _displayCount: 0,
  get displayCount() {
    return this._displayCount;
  },
  set displayCount(newCount) {
    shapesGroup.remove(...(this.display ?? []));
    this.display = this.all.slice(0, newCount);
    this._displayCount = newCount;
    shapesGroup.add(...this.display);
  },
};
particles.totalCount = 1e3;
particles.particleGeometry = new TorusGeometry(0.1, 0.04, 12, 24);
particles.all = Array.from({ length: particles.totalCount }, () => {
  const torus = new Mesh(particles.particleGeometry, material);
  torus.init = { position: {} };
  torus.init.position.x = torus.position.x = (random() - 0.5) * 10;
  torus.init.position.y = torus.position.y = (random() - 0.5) * 10;
  torus.init.position.z = torus.position.z = (random() - 0.5) * 10;
  torus.speed = {};
  torus.rotation.x = torus.speed.x = random() * Math.PI;
  torus.rotation.y = torus.speed.y = random() * Math.PI;
  torus.rotation.z = torus.speed.z = random() * Math.PI;

  torus.phase = Math.random() * Math.PI * 2;
  torus.bounce = Math.random() * 0.2 + 0.1;
  torus.speed.phase = Math.random() * 0.01 + 0.01;

  return torus;
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
    particle.rotation.z += Math.max(-itemSpeed, Math.min(itemSpeed, itemSpeed / particle.speed.y)) / animationFPS;
    particle.rotation.y += Math.max(-itemSpeed, Math.min(itemSpeed, itemSpeed / particle.speed.z)) / animationFPS;
    particle.rotation.x += Math.max(-itemSpeed, Math.min(itemSpeed, itemSpeed / particle.speed.x)) / animationFPS;

    particle.phase += particle.speed.phase;
    particle.position.y = particle.init.position.y + Math.sin(particle.phase) * particle.bounce - particle.bounce / 2;
  });
}

let animateRAF;
const animationFPS = 60;
const animationMSPF = 1000 / animationFPS;
let lastStepTime = Date.now();

function animate(init = false) {
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
    camera.aspect = sceneParams.aspectRatio;
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

window.addEventListener('mousemove', (event) => {
  const touch = event.touches ? event.touches[0] : event;
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
