import PerlinNoise3D from '../scripts/perlin.js';

import { WEBGL } from '../modules/three/examples/jsm/WebGL.js';

import { Scene } from '../modules/three/src/scenes/Scene.js';

import { PerspectiveCamera } from '../modules/three/src/cameras/PerspectiveCamera.js';

import { WebGLRenderer } from '../modules/three/src/renderers/WebGLRenderer.js';

import { MeshStandardMaterial } from '../modules/three/src/materials/MeshStandardMaterial.js';

import { DirectionalLight } from '../modules/three/src/lights/DirectionalLight.js';
import { AmbientLight } from '../modules/three/src/lights/AmbientLight.js';

import {
  PCFSoftShadowMap,
} from '../modules/three/src/constants.js';

import { OrbitControls } from '../modules/three/examples/jsm/controls/OrbitControls.js';

import { SphereGeometry } from '../modules/three/src/geometries/SphereGeometry.js';
import { CylinderGeometry } from '../modules/three/src/geometries/CylinderGeometry.js';
import { BufferAttribute } from '../modules/three/src/core/BufferAttribute.js';

import { Mesh } from '../modules/three/src/objects/Mesh.js';

import { GUI } from '../modules/dat.gui/build/dat.gui.module.js';
import { TextureContainer } from '../scripts/textures.js';
import { Vector3 } from '../modules/three/src/math/Vector3.js';
import { css } from '../scripts/formatter.js';

let canvas = document.createElement('canvas');
if (WEBGL?.isWebGL2Available()) {
  document.body.append(canvas);
} else {
  let warning = WEBGL.getWebGL2ErrorMessage();
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
  gravity: -0.005,
};


// let _random = Random(123);
// let random = (): number => _random().value || -1;

type KeyEventName = 'press' | 'release' | 'hold' | 'idle';
class Key {
  keyName: string;
  wasPressed: boolean = false;
  pressed: boolean = false;

  events: { [eventName in KeyEventName]: Set<Function> } = {
    press: new Set(),
    release: new Set(),
    hold: new Set(),
    idle: new Set(),
  };

  constructor(keyName: string) {
    this.keyName = keyName;
  };

  on(eventNames: KeyEventName | KeyEventName[], callback: Function) {
    (Array.isArray(eventNames) ? eventNames : [eventNames]).forEach((eventName) => {
      let eventList = this.events[eventName];
      let eventListPreviousSize = eventList.size;
      if (eventListPreviousSize === eventList.add(callback).size) {
        console.warn(`Skipped adding a Key ${eventName} callback that already exists on ${this.keyName}.`);
      }
    });
  };

  off(eventNames: KeyEventName | KeyEventName[], callback: Function) {
    (Array.isArray(eventNames) ? eventNames : [eventNames]).forEach((eventName) => {
      this.events[eventName].delete(callback);
    });
  };
}
let keysArray: [ keyName: string, key: Key ][] = [
  'w', 'a', 's', 'd',
  ' ',
].map((keyName) => [keyName, new Key(keyName)]);
let keys: { [keyName: string]: Key } = Object.fromEntries(keysArray);

window.addEventListener('keydown', ({ key }) => {
  if (!keys[key]) return;
  keys[key].pressed = true;
});
window.addEventListener('keyup', ({ key }) => {
  if (!keys[key]) return;
  keys[key].pressed = false;
});
window.addEventListener('blur', () => {
  keysArray.forEach(([, key]) => {
    if (key.pressed) {
      key.pressed = false;
    }
  });
});


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
let floorHeight = -1.4;
{
  floor.geometry.setAttribute('uv2', floor.geometry.attributes.uv);
  // floor.rotation.x = Math.PI / -2;
  floor.position.y = floorHeight;
  floor.receiveShadow = true;
}

class Entity {
  mesh: Mesh;
  speed: Vector3;
  radius: number;
  age: number;

  setSpeed(acceleration: Vector3) {
    this.speed.x = acceleration.x;
    this.speed.y = acceleration.y;
    this.speed.z = acceleration.z;
  }

  accelerate(acceleration: Vector3) {
    this.speed.x += acceleration.x;
    this.speed.y += acceleration.y;
    this.speed.z += acceleration.z;
  }

  constructor({
    mesh,
    speed = new Vector3(0, 0, 0),
    radius = 0.1,
  }: {
    mesh: Mesh,
    speed?: Vector3;
    radius?: number;
  }) {
    this.mesh = mesh;
    this.speed = speed;
    this.radius = radius;
    this.age = 0;
  }
}
let entities: Entity[] = [];


let character: Entity;
{
  let characterMaterial = new MeshStandardMaterial();
  {
    // particleMaterial.metalness = 0.01;
    // particleMaterial.roughness = 0;
    characterMaterial.vertexColors = true;
    // particleMaterial.envMap = textures.environment;
    // particleMaterial.envMapIntensity = 100;
  }
  let characterGeometry = new SphereGeometry(1, 35, 19);
  characterGeometry.setAttribute('position', characterGeometry.getAttribute('position'));

  let characterRadius = Math.random() * 0.1 + 0.15;
  character = new Entity({
    mesh: new Mesh(characterGeometry.clone(), characterMaterial),
    radius: characterRadius,
  });
  character.mesh.geometry.scale(character.radius, character.radius, character.radius);
  character.mesh.geometry.setAttribute(
    'color',
    new BufferAttribute(
      new Float32Array(
        new Array(character.mesh.geometry.getAttribute('position').count).fill([Math.random(), Math.random(), Math.random()]).flat(),
      ),
      3,
    ),
  );
  character.mesh.position.x = 0;
  character.mesh.position.y = floorHeight + characterRadius;
  character.mesh.position.z = 0;
  character.mesh.castShadow = true;
  entities.push(character);
}

let cS = { // characterStats
  acceleration: 0.004,
  maxSpeed: 0.2,
  jumpStrength: 0.15,
  shouldJump: false,
  bounciness: 0.8,
}
let accelerateForward = () => {
  character.speed.z = Math.max(-cS.maxSpeed, character.speed.z - cS.acceleration);
};
let accelerateLeft = () => {
  character.speed.x = Math.max(-cS.maxSpeed, character.speed.x - cS.acceleration);
};
let accelerateBack = () => {
  character.speed.z = Math.min(cS.maxSpeed, character.speed.z + cS.acceleration);
};
let accelerateRight = () => {
  character.speed.x = Math.min(cS.maxSpeed, character.speed.x + cS.acceleration);
};
let prepareJump = () => {
  cS.shouldJump = true;
}

keys.w.on(['press', 'hold'], accelerateForward);
keys.a.on(['press', 'hold'], accelerateLeft);
keys.s.on(['press', 'hold'], accelerateBack);
keys.d.on(['press', 'hold'], accelerateRight);

keys[' '].on(['press'], prepareJump);
if ('ontouchstart' in document.documentElement) {
  const buttons = document.createElement('div');
  buttons.classList.add('buttons');
  const upButton = document.createElement('button');
  upButton.classList.add('button', 'button--up');
  const downButton = document.createElement('button');
  downButton.classList.add('button', 'button--down');
  const leftButton = document.createElement('button');
  leftButton.classList.add('button', 'button--left');
  const rightButton = document.createElement('button');
  rightButton.classList.add('button', 'button--right');
  const jumpButton = document.createElement('button');
  jumpButton.classList.add('button', 'button--jump');
  const styles = document.createElement('style');
  styles.innerText = css`
    .buttons {
      position: fixed;
      bottom: 10px;
      left: 10px;
      display: grid;
      grid-template:
        '. up .' 44px
        'left . right' 44px
        '. down .' 44px / 44px 44px 44px;
    }
    .button--up {
      grid-area: up;
    }
    .button--down {
      grid-area: down;
    }
    .button--left {
      grid-area: left;
    }
    .button--right {
      grid-area: right;
    }
    .button--jump {
      position: fixed;
      bottom: 10px;
      right: 10px;
      width: 100px;
      height: 100px;
      border-radius: 50px;
    }
  `;
  document.body.append(buttons);
  buttons.append(upButton, downButton, leftButton, rightButton, jumpButton);
  document.head.append(styles);

  upButton.addEventListener('touchstart', (e) => { e.preventDefault(); keys.w.pressed = true; });
  upButton.addEventListener('touchend', (e) => { e.preventDefault(); keys.w.pressed = false; });
  leftButton.addEventListener('touchstart', (e) => { e.preventDefault(); keys.a.pressed = true; });
  leftButton.addEventListener('touchend', (e) => { e.preventDefault(); keys.a.pressed = false; });
  downButton.addEventListener('touchstart', (e) => { e.preventDefault(); keys.s.pressed = true; });
  downButton.addEventListener('touchend', (e) => { e.preventDefault(); keys.s.pressed = false; });
  rightButton.addEventListener('touchstart', (e) => { e.preventDefault(); keys.d.pressed = true; });
  rightButton.addEventListener('touchend', (e) => { e.preventDefault(); keys.d.pressed = false; });
  jumpButton.addEventListener('touchstart', (e) => { e.preventDefault(); keys[' '].pressed = true; });
  jumpButton.addEventListener('touchend', (e) => { e.preventDefault(); keys[' '].pressed = false; });
} else {
  let controlInstructions = document.createElement('p');
  controlInstructions.textContent = 'w, a, s, d to move. Space to jump.';
  controlInstructions.classList.add('control-instructions');

  const styles = document.createElement('style');
  styles.innerText = css`
    .control-instructions {
      position: fixed;
      top: 10px;
      left: 10px;
      pointer-events: none;
    }
  `;
  document.body.append(controlInstructions);
  document.head.append(styles);
}



let mainLight = new DirectionalLight(0xe8e7ac);
// // let mainLightShadowHelper: CameraHelper;
{
  mainLight.position.x = 2;
  mainLight.position.z = 7;
  mainLight.position.y = 4;
  mainLight.intensity = 3;
  mainLight.lookAt(0, 0, 0);

  mainLight.castShadow = true;
  // mainLight.shadow.radius = 3;
  mainLight.shadow.mapSize.width = 1024;
  mainLight.shadow.mapSize.height = 512;
  mainLight.shadow.camera.near = 0;
  mainLight.shadow.camera.far = 21;
  mainLight.shadow.camera.top = 7;
  mainLight.shadow.camera.bottom =  -6.2;
  mainLight.shadow.camera.right = 13;
  mainLight.shadow.camera.left = -13;
  // // mainLightShadowHelper  = new CameraHelper(mainLight.shadow.camera);
}

let ambientLight = new AmbientLight(0x7a41ff);
ambientLight.intensity = 2;

let camera = new PerspectiveCamera(sceneParams.fov);
{
  camera.near = 0.5;
  camera.far = 40;
  camera.position.z = 18;
  camera.position.y = 5;
}
let cameraControls = new OrbitControls(camera, sceneParams.canvas);
{
  cameraControls.enableDamping = true;
}


let gui = new GUI({});
let characterGUI = gui.addFolder('Character');
characterGUI.add(cS, 'jumpStrength').min(0.01).max(1).step(0.01).name('Jump strength');
characterGUI.add(cS, 'bounciness').min(0).max(1).step(0.01).name('Bounciness');
characterGUI.add(cS, 'acceleration').min(0.0001).max(0.2).step(0.0001).name('Acceleration');
characterGUI.add(cS, 'maxSpeed').min(0.01).max(1).step(0.01).name('Max speed');
let environmentGUI = gui.addFolder('Environment');
environmentGUI.add(sceneParams, 'gravity').min(-0.02).max(-0.0005).step(0.0005).name('Gravity');


// let axesHelper = new AxesHelper(3,3,3);

let scene = new Scene();
scene.add(
  camera,
  floor,
  // axesHelper,

  mainLight,
  // mainLightShadowHelper,
  ambientLight,
  character.mesh,
);

let renderer = new WebGLRenderer({
  canvas: sceneParams.canvas,
  // antialias: true,
  alpha: true,
});
renderer.physicallyCorrectLights = true;
renderer.setClearColor(0xffffff);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;

function step() {
  keysArray.forEach(([, key]) => {
    if (key.pressed) {
      if (key.wasPressed) {
        key.events.hold.forEach((callback) => callback());
      } else {
        key.events.press.forEach((callback) => callback());
      }
    } else {
      if (key.wasPressed) {
        key.events.release.forEach((callback) => callback());
      } else {
        key.events.idle.forEach((callback) => callback());
      }
    }

    key.wasPressed = key.pressed;
  });

  character.speed.y = (character.speed.y + sceneParams.gravity) * 0.99;

  character.speed.x *= 0.95;
  character.speed.z *= 0.95;
  character.mesh.position.x += character.speed.x;
  character.mesh.position.z += character.speed.z;

  if (Math.sqrt(character.mesh.position.x ** 2 + character.mesh.position.z ** 2) > 13) {
    character.mesh.position.x
     = character.speed.x
     = character.mesh.position.z
     = character.speed.z
     = 0;
  }

  let onFloorHeight = floorHeight + character.radius;
  if (cS.shouldJump && character.mesh.position.y < onFloorHeight + 0.02) {
    character.speed.y = cS.jumpStrength;
    cS.shouldJump = false;
  }
  let newHeight = character.mesh.position.y + character.speed.y;
  if (newHeight < onFloorHeight) {
    character.mesh.position.y = -(character.mesh.position.y - onFloorHeight) + onFloorHeight;
    character.speed.y = Math.abs(character.speed.y) * cS.bounciness;
  } else {
    character.mesh.position.y = newHeight;
  }
}


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
