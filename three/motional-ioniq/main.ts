import { WEBGL } from '../modules/three/examples/jsm/WebGL.js';
import { GLTFLoader } from '../modules/three/examples/jsm/loaders/GLTFLoader.js';

import { Scene } from '../modules/three/src/scenes/Scene.js';

import { PerspectiveCamera } from '../modules/three/src/cameras/PerspectiveCamera.js';

import { WebGLRenderer } from '../modules/three/src/renderers/WebGLRenderer.js';
import { WebGL1Renderer } from '../modules/three/src/renderers/WebGL1Renderer.js';

import { MeshStandardMaterial } from '../modules/three/src/materials/MeshStandardMaterial.js';

// import { CameraHelper } from '../modules/three/src/helpers/CameraHelper.js';

import { DirectionalLight } from '../modules/three/src/lights/DirectionalLight.js';
import { AmbientLight } from '../modules/three/src/lights/AmbientLight.js';

import {
  PCFSoftShadowMap,
  VSMShadowMap,
  BackSide,
} from '../modules/three/src/constants.js';

import { OrbitControls } from '../modules/three/examples/jsm/controls/OrbitControls.js';

import { CylinderGeometry } from '../modules/three/src/geometries/CylinderGeometry.js';
// import { BufferAttribute } from '../modules/three/src/core/BufferAttribute.js';

import { Mesh } from '../modules/three/src/objects/Mesh.js';

// import { GUI } from '../modules/dat.gui/build/dat.gui.module.js';
// import { Fog } from '../modules/three/src/scenes/Fog.js';
import { TextureContainer } from '../scripts/textures.js';
// import { Vector3 } from '../modules/three/src/math/Vector3.js';
import { Object3D } from '../modules/three/src/core/Object3D.js';
import { DRACOLoader } from '../modules/three/examples/jsm/loaders/DRACOLoader.js';

let RendererConstructor: typeof WebGL1Renderer | typeof WebGLRenderer;
let canvas: HTMLCanvasElement;
if (WEBGL?.isWebGL2Available()) {
  canvas = document.createElement('canvas');
  document.body.append(canvas);
  RendererConstructor = WebGLRenderer;
} else if (WEBGL?.isWebGLAvailable()) {
  canvas = document.createElement('canvas');
  console.warn('Web GL 2 support not found: falling back to slower, legacy Web GL.');
  document.body.append(canvas);
  RendererConstructor = WebGL1Renderer;
} else {
  const warning = WEBGL.getWebGL2ErrorMessage();
  document.body.appendChild(warning);
  throw new Error(warning.textContent ?? '');
}

let sceneParams: any = {
  width: window.innerWidth,
  height: window.innerHeight,
  dpp: 1,
  get aspectRatio() {
    return this.width / this.height;
  },
  fov: 45,
  canvas,
  cursorX: 0,
  cursorY: 0,
  canvasDimensionsUpdated: false,
  gravity: -0.003,
  floorHeight: -0.3,
};

const modelLoader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('../modules/three/examples/js/libs/draco/');
modelLoader.setDRACOLoader(dracoLoader);

let ioniqModel: Object3D | undefined;
const addShadows = (model) => {
  if (model.name === 'shadow_plane') {
    model.visible = false;
  } else {
    model.castShadow = true;
    model.receiveShadow = true;
    model.material && (model.material.shadowSide = BackSide);
  }
  if (model.type !== 'mesh') {
    model.children.forEach(addShadows);
  }
}
modelLoader.load('./ioniq.draco.glb',
  (gltf) => {
    ioniqModel = gltf.scene.children.find(({name}) => name === 'Ioniq_5');
    if (!ioniqModel) return;
    ioniqModel.translateY(-1.5);
    ioniqModel.translateZ(0.1 - sceneParams.floorHeight);
    addShadows(ioniqModel);

    scene.add(ioniqModel);
  },
  undefined,
  (error) => {
    console.error( error );
  },
);

// let _random = Random(123);
// let random = (): number => _random().value || -1;

let textures = new TextureContainer({
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

let doorMaterial = new MeshStandardMaterial();
{
  doorMaterial.aoMap = textures.get('doorAmbientOcclusion');
  doorMaterial.aoMapIntensity = 1.5;
  doorMaterial.map = textures.get('doorColor');
  doorMaterial.metalness = 0.1;
  doorMaterial.metalnessMap = textures.get('doorMetalness');
  doorMaterial.normalMap = textures.get('doorNormal');
  doorMaterial.roughness = 2;
  doorMaterial.roughnessMap = textures.get('doorRoughness');
  doorMaterial.envMap = textures.environment;
  doorMaterial.envMapIntensity = 1;
}

let floor = new Mesh(new CylinderGeometry(13, 13, 0, 50, 1), doorMaterial);
{
  floor.geometry.setAttribute('uv2', floor.geometry.attributes.uv);
  // floor.rotation.x = Math.PI / -2;
  floor.position.y = sceneParams.floorHeight;
  floor.receiveShadow = true;
}

let mainLight = new DirectionalLight(0xe8e7ac);
// let mainLightShadowHelper: CameraHelper;
{
  mainLight.position.x = 2;
  mainLight.position.z = 7;
  mainLight.position.y = 4 + sceneParams.floorHeight;
  mainLight.intensity = 1.7;
  mainLight.lookAt(0, 0 + sceneParams.floorHeight, 0);

  mainLight.castShadow = true;
  mainLight.shadow.radius = 3;
  mainLight.shadow.mapSize.width = 2048;
  mainLight.shadow.mapSize.height = 2048;
  mainLight.shadow.camera.near = 4;
  mainLight.shadow.camera.far = 12;
  mainLight.shadow.camera.top = 2;
  mainLight.shadow.camera.bottom =  -1.5;
  mainLight.shadow.camera.right = 2.5;
  mainLight.shadow.camera.left = -2.5;
  // mainLightShadowHelper  = new CameraHelper(mainLight.shadow.camera);
}

let ambientLight = new AmbientLight(0x7a41ff);
ambientLight.intensity = 1;

let camera = new PerspectiveCamera(sceneParams.fov);
{
  camera.near = 0.5;
  camera.far = 30;
  camera.position.z = 6;
  camera.position.y = 4;
}
let cameraControls = new OrbitControls(camera, sceneParams.canvas);
{
  cameraControls.enableDamping = true;
}


// let gui = new GUI({});
// let emitterGUI = gui.addFolder('Emitter');


// let axesHelper = new AxesHelper(3,3,3);


let scene = new Scene();
// scene.fog = new Fog(0xffffff, 12, 17);
scene.add(
  camera,
  floor,
  // axesHelper,

  mainLight,
  // mainLightShadowHelper,
  ambientLight,
);

let renderer = new RendererConstructor({
  canvas: sceneParams.canvas,
  antialias: true,
  alpha: true,

});
renderer.physicallyCorrectLights = true;
renderer.setClearColor(0xffffff);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = VSMShadowMap;

function step() {
  cameraControls.update();
  ioniqModel?.rotateZ(0.001);
}

let calcFPS = {
  lastSecond: Math.floor(performance.now() / 1000) * 1000,
  frames: 1,
  actualFPS: 0,
};


let animateRAF: number;
let animationFPS = 60;
let animationMSPF = 1000 / animationFPS;
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
// for (let i = 0; i < 1000; i += 1) {
//   addParticle({ init: true });
// }
animate({ init: true });


function render() {
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

  // Get FPS around 30
  {
    let timeNow = performance.now();
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
    }
  }
};
render();

function updateRenderDimensions(dpp = sceneParams.dpp) {
  sceneParams.dpp = Math.max(0.4, Math.min(dpp, 1));
  sceneParams.width = Math.round(window.innerWidth * dpp);
  sceneParams.height = Math.round(window.innerHeight * dpp);
  sceneParams.canvasDimensionsUpdated = true;
}
updateRenderDimensions();

let isTouchEvent = (event: MouseEvent | TouchEvent): event is TouchEvent => 'touches' in event;
window.addEventListener('mousemove', (event: MouseEvent | TouchEvent) => {
  let touch = isTouchEvent(event) ? event.touches[0] : event;
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
