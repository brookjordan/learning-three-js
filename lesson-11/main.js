// alea is a predictable random library
// import { Between } from '../scripts/alea.js';

import { Scene } from 'Three/scenes/Scene.js';

import { PerspectiveCamera } from 'Three/cameras/PerspectiveCamera.js';
import { OrthographicCamera } from 'Three/cameras/OrthographicCamera.js';

import { WebGLRenderer } from 'Three/renderers/WebGLRenderer.js';
// import { WebGL1Renderer } from 'Three/renderers/WebGL1Renderer.js';

// import { MeshBasicMaterial } from 'Three/materials/MeshBasicMaterial.js';
// import { MeshPhongMaterial } from 'Three/materials/MeshPhongMaterial.js';
// import { MeshLambertMaterial } from 'Three/materials/MeshLambertMaterial.js';
import { MeshStandardMaterial } from 'Three/materials/MeshStandardMaterial.js';
import { MeshPhysicalMaterial } from 'Three/materials/MeshPhysicalMaterial.js';
// import { MeshMatcapMaterial } from 'Three/materials/MeshMatcapMaterial.js';
// import { MeshDepthMaterial } from 'Three/materials/MeshDepthMaterial.js';
// import { MeshNormalMaterial } from 'Three/materials/MeshNormalMaterial.js';
// import { LineDashedMaterial } from 'Three/materials/LineDashedMaterial.js';

import { PointLight } from 'Three/lights/PointLight.js';
import { AmbientLight } from 'Three/lights/AmbientLight.js';

import {
  FrontSide,
  BackSide,
  DoubleSide,
  RepeatWrapping,
  NearestFilter,
} from 'Three/constants.js';

// import { Float32BufferAttribute } from 'Three/core/BufferAttribute.js';
import { OrbitControls } from 'ThreeExamples/controls/OrbitControls.js';

import { Group } from 'Three/objects/Group.js';
// import { BufferGeometry } from 'Three/core/BufferGeometry.js';
import { SphereGeometry } from 'Three/geometries/SphereGeometry.js';
import { BoxGeometry } from 'Three/geometries/BoxGeometry.js';
import { TorusGeometry } from 'Three/geometries/TorusGeometry.js';

import { Mesh } from 'Three/objects/Mesh.js';

import { AxesHelper } from 'Three/helpers/AxesHelper.js';
import { LoadingManager } from 'Three/loaders/LoadingManager.js';
import { TextureLoader } from 'Three/loaders/TextureLoader.js';
import { CubeTextureLoader } from 'Three/loaders/CubeTextureLoader.js';
import { HDRCubeTextureLoader } from 'ThreeExamples/loaders/HDRCubeTextureLoader.js';

import { GUI } from '/modules/dat.gui/build/dat.gui.module.js';

const gui = new GUI();
const cameraGui = gui.addFolder('Camera');
const materialGui = gui.addFolder('Material');
const lightsGui = gui.addFolder('Lights');

const loadingManager = new LoadingManager();
const textureLoader = new TextureLoader(loadingManager);
const cubeTextureLoader = new CubeTextureLoader(loadingManager);
const cubeHDRTextureLoader = new HDRCubeTextureLoader(loadingManager);
const textures = {};
const addFlatTexture = (name, src) => {
  textures[name] = textureLoader.load(src);
  textures[name].min = NearestFilter;
  textures[name].max = NearestFilter;
  // textures[name].generateMipmaps = false;
}
const addCubeTexture = (name, src, _format) => {
  const format = _format || 'jpg';
  textures[name] = (format === 'hdr' ? cubeHDRTextureLoader : cubeTextureLoader).load([
    `${src}/px.${format}`,
    `${src}/nx.${format}`,
    `${src}/py.${format}`,
    `${src}/ny.${format}`,
    `${src}/pz.${format}`,
    `${src}/nz.${format}`,
  ]);
  textures[name].min = NearestFilter;
  textures[name].max = NearestFilter;
  // textures[name].generateMipmaps = false;
}

addCubeTexture('environment0', './i/environmentMaps/0');
addCubeTexture('environment1', './i/environmentMaps/1');
addCubeTexture('environment2', './i/environmentMaps/2');
addCubeTexture('environment3', './i/environmentMaps/3');
addCubeTexture('environment4', './i/environmentMaps/4', 'hdr');

addFlatTexture('minecraft', './i/minecraft.png');

addFlatTexture('doorAlpha', './i/door/alpha.jpg');
addFlatTexture('doorAmbientOcclusion', './i/door/ambientOcclusion.jpg');
addFlatTexture('doorColor', './i/door/color.jpg');
addFlatTexture('doorHeight', './i/door/height.jpg');
addFlatTexture('doorMetalness', './i/door/metalness.jpg');
addFlatTexture('doorNormal', './i/door/normal.jpg');
addFlatTexture('doorRoughness', './i/door/roughness.jpg');

addFlatTexture('matcapClay', './i/matcap/1.png');
addFlatTexture('matcapChrome', './i/matcap/3.png');
addFlatTexture('matcapRed', './i/matcap/4.png');
addFlatTexture('matcapIronman', './i/matcap/5.png');
addFlatTexture('matcapCell', './i/matcap/7.png');

const sceneParams = {
  width: window.innerWidth,
  height: window.innerHeight,
  get aspectRatio() { return this.width / this.height },
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

const material = new MeshPhysicalMaterial();
  material.side = FrontSide;
  material.transparent = true;
  material.flatShading = false;

  material.alphaMap = textures.doorAlpha;
  material.aoMap = textures.doorAmbientOcclusion;
  material.aoMapIntensity = 1.5;
  material.map  = textures.doorColor;
  material.displacementMap = textures.doorHeight;
  material.displacementScale = 0.1;
  material.metalness = 0.1;
  material.metalnessMap = textures.doorMetalness;
  material.normalMap = textures.doorNormal;
  material.roughness = 2.7;
  material.roughnessMap = textures.doorRoughness;
  material.matcap = textures.matcapCell;
  material.envMap = textures.environment3;
  material.envMapIntensity = 12;

const sphere = new Mesh(new SphereGeometry(0.8, 640, 320), material);
  sphere.geometry.setAttribute('uv2', sphere.geometry.attributes.uv);
const box = new Mesh(new BoxGeometry(1, 1, 1, 250, 250, 250), material);
  box.geometry.setAttribute('uv2', box.geometry.attributes.uv);
const torus = new Mesh(new TorusGeometry(0.6, 0.2, 320, 640), material);
  torus.geometry.setAttribute('uv2', torus.geometry.attributes.uv);

sphere.position.x = -1.4;
torus.position.x = 1.4;

shapesGroup.add(
  sphere,
  box,
  torus,
);



const pointLight1 = new PointLight(0xf9f3b5);
pointLight1.position.x = 4;
pointLight1.position.z = 5;
pointLight1.position.y = 3;
pointLight1.intensity = 0.8;

const pointLight2 = new PointLight(0xf9f3b5);
pointLight2.position.x = -3;
pointLight2.position.z = -5;
pointLight2.position.y = -5;
pointLight2.intensity = 0.5;

const ambientLight = new AmbientLight(0x9254bf);
ambientLight.intensity = 0.8;



const camera = ((type = 'perspective') => {
  let camera;
  if (type === 'orthpgraphic') {
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
  camera.far = 20;
  camera.position.z = 5;
  camera.position.y = 2;
  return camera;
})();

cameraGui.add(camera.position, 'x').min(-10).max(10);
cameraGui.add(camera.position, 'y').min(-10).max(10);
cameraGui.add(camera.position, 'z').min(-10).max(10);

const materialEvents = {
  envMapIndex: 0,
  changeEnvMap() {
    this.envMapIndex = (this.envMapIndex + 1) % 5;
    material.envMap = textures[`environment${this.envMapIndex}`];
  },
};
materialGui.add(material, 'aoMapIntensity').min(0).max(2).step(0.01);
materialGui.add(material, 'metalness').min(0).max(0.3).step(0.01);
materialGui.add(material, 'roughness').min(0).max(10).step(0.01);
materialGui.add(materialEvents, 'changeEnvMap');
materialGui.add(material, 'envMapIntensity').min(0).max(30).step(0.01);

lightsGui.add(pointLight1, 'intensity').min(0).max(1.5).step(0.01);
lightsGui.add(pointLight2, 'intensity').min(0).max(1.5).step(0.01);
lightsGui.add(ambientLight, 'intensity').min(0).max(1.5).step(0.01);


const cameraControls = new OrbitControls(
  camera,
  sceneParams.canvas,
);
cameraControls.enableDamping = true;


const axesHelper = new AxesHelper(3,3,3);


const scene = new Scene();
scene.add(
  camera,
  shapesGroup,
  axesHelper,

  pointLight1,
  pointLight2,
  ambientLight,
);


const renderer = new WebGLRenderer({
  canvas: sceneParams.canvas,
  antialias: true,
  alpha: true,
});
renderer.setClearColor(0, 0);


let lastTickTime = Date.now();



const animationFPS = 60;
const aniamtionMSPF = 1000 / animationFPS;

const groupSpeed = 0.060;
const itemSpeed = 0.200;
function step() {
  groupRot += groupSpeed / animationFPS;
  shapesGroup.rotation.y = groupRot;

  sphere.rotation.z += itemSpeed / animationFPS;
  torus.rotation.y += itemSpeed / animationFPS;
  box.rotation.x += itemSpeed / animationFPS;
}

(function animate() {
  while (lastTickTime < Date.now() - aniamtionMSPF) {
    step();
    lastTickTime += aniamtionMSPF;
  }

  cameraControls.update();

  requestAnimationFrame(animate);
})();



(function render() {
  if (sceneParams.canvasDimensionsUpdated) {
    renderer.setSize(sceneParams.width, sceneParams.height);
    renderer.setPixelRatio(Math.min(2, devicePixelRatio));
    camera.aspect = sceneParams.aspectRatio;
    camera.updateProjectionMatrix();
    sceneParams.canvasDimensionsUpdated = false;
  }

  renderer.render(
    scene,
    camera,
  );

  requestAnimationFrame(render);
})();


function updateRenderDimensions() {
  sceneParams.width = window.innerWidth;
  sceneParams.height = window.innerHeight;
  sceneParams.canvasDimensionsUpdated = true;
}
updateRenderDimensions();


window.addEventListener('mousemove',  (event) => {
  const touch = event.touches ? event.touches[0] : event;
  sceneParams.cursorX = (touch.clientX - sceneParams.canvas.offsetLeft) / sceneParams.width * 2 - 1;
  sceneParams.cursorY = (touch.clientY - sceneParams.canvas.offsetTop) / sceneParams.height * -2 + 1;
});

sceneParams.canvas.addEventListener('dblclick',  () => {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    sceneParams.canvas.requestFullscreen();
  }
});

window.addEventListener('resize', updateRenderDimensions);
window.addEventListener('focus', updateRenderDimensions);
document.body.addEventListener('mouseenter', updateRenderDimensions);
