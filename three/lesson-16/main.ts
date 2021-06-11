// alea is a predictable random library
// import Random from '../scripts/alea.js';

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

// import { LightShadow } from '../modules/three/src/lights/LightShadow';

// import { PointLight } from '../modules/three/src/lights/PointLight.js';
import { DirectionalLight } from '../modules/three/src/lights/DirectionalLight.js';
import { AmbientLight } from '../modules/three/src/lights/AmbientLight.js';
// import { RectAreaLight } from '../modules/three/src/lights/RectAreaLight.js';

import {
  // AdditiveBlending,
  FrontSide,
  // MultiplyBlending,
  // SubtractiveBlending,
  // BackSide,
  // DoubleSide,
  // RepeatWrapping,
  // PCFShadowMap,
  // PCFSoftShadowMap,
} from '../modules/three/src/constants.js';

// import { Float2**5BufferAttribute } from '../modules/three/src/core/BufferAttribute.js';
import { OrbitControls } from '../modules/three/examples/jsm/controls/OrbitControls.js';

import { Group } from '../modules/three/src/objects/Group.js';
// import { BufferGeometry } from '../modules/three/src/core/BufferGeometry.js';
import { SphereGeometry } from '../modules/three/src/geometries/SphereGeometry.js';
// import { BoxGeometry } from '../modules/three/src/geometries/BoxGeometry.js';
import { TorusGeometry } from '../modules/three/src/geometries/TorusGeometry.js';
import { PlaneGeometry } from '../modules/three/src/geometries/PlaneGeometry.js';
import { BufferGeometry } from '../modules/three/src/core/BufferGeometry.js';
import { BufferAttribute } from '../modules/three/src/core/BufferAttribute.js';
import { Points } from '../modules/three/src/objects/Points.js';
// import { TextGeometry } from '../modules/three/src/geometries/TextGeometry.js';

import { Mesh } from '../modules/three/src/objects/Mesh.js';

// import { AxesHelper } from '../modules/three/src/helpers/AxesHelper.js';

import { GUI } from '../modules/dat.gui/build/dat.gui.module.js';
// import { Texture } from '../modules/three/src/textures/Texture.js';
// import { Vector2 } from '../modules/three/src/math/Vector2.js';
import { Fog } from '../modules/three/src/scenes/Fog.js';
import { TextureContainer } from '../scripts/textures.js';
import { PointsMaterial } from '../modules/three/src/materials/PointsMaterial.js';


if (WEBGL?.isWebGL2Available()) {
  const canvas = document.createElement('canvas');
  canvas.classList.add('webgl');
  document.body.append(canvas);
} else {
  const warning = WEBGL.getWebGL2ErrorMessage();
  document.body.appendChild(warning);
  throw new Error(warning.textContent ?? '');
}

// const _random = Random(123);
// const random = (): number => _random().value || -1;

const gui = new GUI({});
const shadowsGUI = gui.addFolder('Shadows');

const textures = new TextureContainer({
  environment: [
    '/three/i/environmentMap/px.jpg',
    '/three/i/environmentMap/nx.jpg',
    '/three/i/environmentMap/py.jpg',
    '/three/i/environmentMap/ny.jpg',
    '/three/i/environmentMap/pz.jpg',
    '/three/i/environmentMap/nz.jpg',
  ],
});

textures.addFlatTexture('doorAlpha', '/three/i/door/alpha.jpg');
textures.addFlatTexture('doorAmbientOcclusion', '/three/i/door/ambientOcclusion.jpg');
textures.addFlatTexture('doorColor', '/three/i/door/color.jpg');
textures.addFlatTexture('doorHeight', '/three/i/door/height.jpg');
textures.addFlatTexture('doorMetalness', '/three/i/door/metalness.jpg');
textures.addFlatTexture('doorNormal', '/three/i/door/normal.jpg');
textures.addFlatTexture('doorRoughness', '/three/i/door/roughness.jpg');

// textures.addFlatTexture('matcapClay', '/three/i/matcap/1.png');
// textures.addFlatTexture('matcapChrome', '/three/i/matcap/3.png');
// textures.addFlatTexture('matcapRed', '/three/i/matcap/4.png');
// textures.addFlatTexture('matcapIronman', '/three/i/matcap/5.png');
// textures.addFlatTexture('matcapCell', '/three/i/matcap/7.png');

// textures.addFlatTexture('dustParticleBig', '/three/i/particles/dust.jpg');
textures.addFlatTexture('dustParticle', '/three/i/particles/dust.small.jpg');

const sceneParams: any = {
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

  // material.alphaMap = textures.get('doorAlpha');
  // material.displacementMap = textures.get('doorHeight');
  // material.displacementScale = 0.1;
  // material.matcap = textures.get('matcapCell');`
  material.aoMap = textures.get('doorAmbientOcclusion');
  material.aoMapIntensity = 1.5;
  material.map = textures.get('doorColor');
  material.metalness = 0.1;
  material.metalnessMap = textures.get('doorMetalness');
  material.normalMap = textures.get('doorNormal');
  material.roughness = 2;
  material.roughnessMap = textures.get('doorRoughness');
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
const sphere = new Mesh(new SphereGeometry(0.8, 2**7, 2**6), material);
{
  sphere.geometry.setAttribute('uv2', sphere.geometry.attributes.uv);
  sphere.position.x = -0.9;
  sphere.position.y = -0.3;
  sphere.castShadow = true;
  sphere.receiveShadow = true;
  shapesGroup.add(sphere);
}
const torus = new Mesh(new TorusGeometry(0.6, 0.2, 2**5, 2**6), material);
{
  torus.geometry.setAttribute('uv2', torus.geometry.attributes.uv);
  torus.position.x = 0.9;
  torus.position.y = -0.3;
  torus.castShadow = true;
  torus.receiveShadow = true;
  shapesGroup.add(torus);
}
interface Particle {
  position: {
    x: number;
    y: number;
    z: number;
  };
  speed: {
    x: number;
    y: number;
    z: number;
  };
  color: [number, number, number];
}
const particleMaxDrift = 10;
const particleData: Particle[] = Array.from({ length: 10000 }, () => ({
  position: {
    x: Math.random() * particleMaxDrift * 2 - particleMaxDrift,
    y: Math.random() * 5 - 2,
    z: Math.random() * particleMaxDrift * 2 - particleMaxDrift,
  },
  speed: {
    x: Math.random() * 0.004 - 0.002,
    y: Math.random() * -0.004 - 0.001,
    z: Math.random() * 0.004 - 0.002,
  },
  color: [Math.random(), Math.random(), Math.random()],
}));
const particleGeometry = new BufferGeometry();
const particleMaterial = new PointsMaterial({ color: 0x999999 });
particleMaterial.sizeAttenuation = false;
particleMaterial.transparent = true;
particleMaterial.alphaMap = textures.get('dustParticle');
// particleMaterial.alphaTest = 0.001;
// particleMaterial.depthTest = false;
particleMaterial.depthWrite = false;
// particleMaterial.blending = MultiplyBlending;
particleMaterial.vertexColors = true;
particleMaterial.sizeAttenuation = true;
particleMaterial.size = 0.2;
// particleMaterial.size = 30;
const particles = new Points(particleGeometry, particleMaterial);
const updateParticles = () => {
  const particlePositionArray = particleData.flatMap(({ position: { x, y, z } }) => [x, y, z]);
  const positions = new Float32Array(particlePositionArray);
  particles.geometry.setAttribute('position', new BufferAttribute(positions, 3));
}
updateParticles();
particles.geometry.setAttribute('color', new BufferAttribute(new Float32Array(particleData.flatMap(({ color }) => color)), 3));
particles.castShadow = true;
particles.receiveShadow = true;

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
  set mainQuality(newSize: number) {
    mainLight.shadow.mapSize.width = newSize;
    mainLight.shadow.mapSize.height = newSize;
    mainLight.shadow.map = null as any;
  },
  get mainQuality() {
    return mainLight.shadow.mapSize.width;
  }
};

shadowsGUI.add(mainLight, 'castShadow').name('Main: cast');
shadowsGUI.add(updateShadow, 'mainQuality').min(2**5).max(2**11).step(2**5).name('Main: quality');
shadowsGUI.add(mainLight.shadow, 'radius').min(0).max(100).step(1).name('Main: radius');
shadowsGUI.add(sphere, 'castShadow').name('Sphere: cast');
shadowsGUI.add(sphere, 'receiveShadow').name(' - receive');
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
  particles,
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

  particleData.forEach(({ position, speed }) => {
    position.x += speed.x;
    position.y += speed.y;
    position.z += speed.z;

    if (position.y < -1.5) {
      position.y = 3;
    }
    if (position.x > Math.abs(particleMaxDrift)) {
      position.x *= -1;
    }
    if (position.z > Math.abs(particleMaxDrift)) {
      position.z *= -1;
    }
  });
  updateParticles();
}

const calcFPS = {
  display: document.createElement('div'),
  lastSecond: Math.floor(performance.now() / 1000) * 1000,
  frames: 1,
  actualFPS: 0,
};
calcFPS.display.classList.add('actual-fps');
document.body.append(calcFPS.display);


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

function updateRenderDimensions(dpp = sceneParams.dpp) {
  sceneParams.dpp = Math.min(dpp, 1);
  sceneParams.width = Math.round(window.innerWidth * dpp);
  sceneParams.height = Math.round(window.innerHeight * dpp);
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

window.addEventListener('resize', () => updateRenderDimensions(1));
window.addEventListener('focus', () => updateRenderDimensions());
document.body.addEventListener('mouseenter', () => updateRenderDimensions());
