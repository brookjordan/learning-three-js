// alea is a predictable random library
// import Random from '../scripts/alea.js';
var _a;
import { WEBGL } from '../modules/three/examples/jsm/WebGL.js';
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
// import { LightShadow } from 'Three/lights/LightShadow';
// import { PointLight } from 'Three/lights/PointLight.js';
import { DirectionalLight } from 'Three/lights/DirectionalLight.js';
import { AmbientLight } from 'Three/lights/AmbientLight.js';
// import { RectAreaLight } from 'Three/lights/RectAreaLight.js';
import {
  FrontSide,
  // BackSide,
  // DoubleSide,
  // RepeatWrapping,
  NearestFilter,
  // PCFShadowMap,
  // PCFSoftShadowMap,
} from 'Three/constants.js';
// import { Float2**5BufferAttribute } from 'Three/core/BufferAttribute.js';
import { OrbitControls } from '../modules/three/examples/jsm/controls/OrbitControls.js';
import { Group } from 'Three/objects/Group.js';
// import { BufferGeometry } from 'Three/core/BufferGeometry.js';
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
// import { HDRCubeTextureLoader } from '../modules/three/examples/jsm/loaders/HDRCubeTextureLoader.js';
import { GUI } from '../modules/dat.gui/build/dat.gui.module.js';
import { Fog } from 'Three/Three.js';
if (WEBGL === null || WEBGL === void 0 ? void 0 : WEBGL.isWebGL2Available()) {
  const canvas = document.createElement('canvas');
  canvas.classList.add('webgl');
  document.body.append(canvas);
} else {
  const warning = WEBGL.getWebGL2ErrorMessage();
  document.body.appendChild(warning);
  throw new Error((_a = warning.textContent) !== null && _a !== void 0 ? _a : '');
}
// const _random = Random(123);
// const random = (): number => _random().value || -1;
const gui = new GUI({});
const shadowsGUI = gui.addFolder('Shadows');
const loadingManager = new LoadingManager();
const fontLoader = new FontLoader(loadingManager);
const textureLoader = new TextureLoader(loadingManager);
const cubeTextureLoader = new CubeTextureLoader(loadingManager);
// const cubeHDRTextureLoader = new HDRCubeTextureLoader(loadingManager);
const textures = {};
const addFlatTexture = (name, src) => {
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
const sceneParams = {
  width: window.innerWidth,
  height: window.innerHeight,
  dpp: 1,
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
  material.envMapIntensity = 1;
}
const floor = new Mesh(new PlaneGeometry(15, 15), material);
floor.geometry.setAttribute('uv2', floor.geometry.attributes.uv);
{
  floor.rotation.x = Math.PI / -2;
  floor.position.y = -1.4;
  floor.receiveShadow = true;
}
const sphere = new Mesh(new SphereGeometry(0.8, 2 ** 7, 2 ** 6), material);
{
  sphere.geometry.setAttribute('uv2', sphere.geometry.attributes.uv);
  sphere.position.x = -1.4;
  sphere.position.y = -0.3;
  sphere.castShadow = true;
  sphere.receiveShadow = true;
  shapesGroup.add(sphere);
}
const box = new Mesh(new BoxGeometry(1, 1, 1, 1, 1, 1), material);
{
  box.geometry.setAttribute('uv2', box.geometry.attributes.uv);
  box.position.y = -0.3;
  box.castShadow = true;
  box.receiveShadow = true;
  shapesGroup.add(box);
}
const torus = new Mesh(new TorusGeometry(0.6, 0.2, 2 ** 5, 2 ** 6), material);
{
  torus.geometry.setAttribute('uv2', torus.geometry.attributes.uv);
  torus.position.x = 1.4;
  torus.position.y = -0.3;
  torus.castShadow = true;
  torus.receiveShadow = true;
  shapesGroup.add(torus);
}
let text;
fontLoader.load(
  '/three/modules/three/examples/fonts/gentilis_regular.typeface.json',
  (font) => {
    const options = {
      font,
      size: 0.5,
      height: 0.2,
      steps: 2,
      curveSegments: 4,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.02,
      bevelOffset: 0,
      bevelSegments: 5,
    };
    text = new Mesh(new TextGeometry('I’m wooden!', options), material);
    text.geometry.center();
    text.geometry.translate(0, 0.8, 0);
    text.castShadow = true;
    text.receiveShadow = true;
    shadowsGUI.add(text, 'castShadow').name('Text: cast');
    shadowsGUI.add(text, 'receiveShadow').name(' - receive');
    shapesGroup.add(text);
  },
  () => {
    console.log('Still loading font…');
  },
  (e) => {
    console.log('Error loading font: ' + e);
  },
);
// const areaLight = new RectAreaLight(0xf9f3b5, 5, 5, 5);
// areaLight.position.x = 4;
// areaLight.position.z = 5;
// areaLight.position.y = 3;
// areaLight.intensity = 6;
// areaLight.lookAt(0, 0, 0);
const mainLight = new DirectionalLight(0xe8e7ac);
{
  mainLight.position.x = 2;
  mainLight.position.z = 7;
  mainLight.position.y = 4;
  mainLight.intensity = 3;
  // mainLight.decay = 2;
  // mainLight.power = 5000;
  mainLight.lookAt(0, 0, 0);
  mainLight.castShadow = true;
  mainLight.shadow.radius = 3;
  mainLight.shadow.mapSize.width = 512;
  mainLight.shadow.mapSize.height = 512;
  mainLight.shadow.camera.near = 6;
  mainLight.shadow.camera.far = 15;
  mainLight.shadow.camera.top = mainLight.shadow.camera.right = 3;
  mainLight.shadow.camera.bottom = mainLight.shadow.camera.left = -3;
}
const ambientLight = new AmbientLight(0x7a41ff);
ambientLight.intensity = 3;
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
// lightsGui.add(areaLight, 'intensity').min(0).max(20).step(1).name('Front - area');
// lightsGui.add(mainLight, 'intensity').min(0).max(20).step(0.5).name('Front - point');
// lightsGui.add(mainLight, 'power').min(0).max(2e4).step(100).name('Front - point');
// lightsGui.add(mainLight, 'decay').min(0).max(3).step(0.1).name('Front - decay');
const updateShadow = {
  set mainQuality(newSize) {
    mainLight.shadow.mapSize.width = newSize;
    mainLight.shadow.mapSize.height = newSize;
    mainLight.shadow.map = null;
  },
  get mainQuality() {
    return mainLight.shadow.mapSize.width;
  },
};
shadowsGUI.add(mainLight, 'castShadow').name('Main: cast');
shadowsGUI
  .add(updateShadow, 'mainQuality')
  .min(2 ** 5)
  .max(2 ** 11)
  .step(2 ** 5)
  .name('Main: quality');
shadowsGUI.add(mainLight.shadow, 'radius').min(0).max(100).step(1).name('Main: radius');
shadowsGUI.add(sphere, 'castShadow').name('Sphere: cast');
shadowsGUI.add(sphere, 'receiveShadow').name(' - receive');
shadowsGUI.add(box, 'castShadow').name('Box: cast');
shadowsGUI.add(box, 'receiveShadow').name(' - receive');
shadowsGUI.add(torus, 'castShadow').name('Doughnut: cast');
shadowsGUI.add(torus, 'receiveShadow').name(' - receive');
const cameraControls = new OrbitControls(camera, sceneParams.canvas);
cameraControls.enableDamping = true;
// const axesHelper = new AxesHelper(3,3,3);
const scene = new Scene();
scene.fog = new Fog(0xffffff, 3, 13);
scene.add(
  camera,
  floor,
  shapesGroup,
  // axesHelper,
  mainLight,
  // areaLight,
  ambientLight,
);
const renderer = new WebGLRenderer({
  canvas: sceneParams.canvas,
  // antialias: true,
  alpha: true,
});
renderer.physicallyCorrectLights = true;
renderer.setClearColor(0, 0);
renderer.shadowMap.enabled = true;
// renderer.shadowMap.type = PCFShadowMap; // the default
const groupSpeed = 0.06;
const itemSpeed = 0.2;
function step() {
  groupRot += groupSpeed / animationFPS;
  shapesGroup.rotation.y = groupRot;
  sphere.rotation.z += itemSpeed / animationFPS;
  torus.rotation.y += itemSpeed / animationFPS;
  box.rotation.x += itemSpeed / animationFPS;
}
let animateRAF;
const animationFPS = 60;
const animationMSPF = 1000 / animationFPS;
let lastStepTime = Date.now();
function animate({ init = false } = {}) {
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
const calcFPS = {
  display: document.createElement('div'),
  lastSecond: Math.floor(performance.now() / 1000) * 1000,
  frames: 1,
  actualFPS: 0,
};
calcFPS.display.classList.add('actual-fps');
document.body.append(calcFPS.display);
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
  // Get FPS around 30
  {
    const timeNow = performance.now();
    if (timeNow < calcFPS.lastSecond + 1000) {
      calcFPS.frames += 1;
    } else {
      calcFPS.actualFPS = calcFPS.frames;
      if (calcFPS.actualFPS < 25) {
        updateRenderDimensions(sceneParams.dpp * 0.8);
      }
      if (calcFPS.actualFPS > 35) {
        updateRenderDimensions(sceneParams.dpp * 1.05);
      }
      calcFPS.lastSecond = Math.floor(timeNow / 1000) * 1000;
      calcFPS.frames = 1;
      calcFPS.display.textContent = `${calcFPS.actualFPS} : ${+sceneParams.dpp.toFixed(2)}`;
    }
  }
  requestAnimationFrame(render);
})();
function updateRenderDimensions(dpp = sceneParams.dpp) {
  sceneParams.dpp = dpp;
  sceneParams.width = Math.round(window.innerWidth * dpp);
  sceneParams.height = Math.round(window.innerHeight * dpp);
  sceneParams.canvasDimensionsUpdated = true;
}
updateRenderDimensions();
const isTouchEvent = (event) => 'touches' in event;
window.addEventListener('mousemove', (event) => {
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
window.addEventListener('resize', () => updateRenderDimensions(1));
window.addEventListener('focus', () => updateRenderDimensions());
document.body.addEventListener('mouseenter', () => updateRenderDimensions());
