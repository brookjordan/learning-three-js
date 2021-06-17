import { WEBGL } from '../modules/three/examples/jsm/WebGL.js';
import { GLTFLoader } from '../modules/three/examples/jsm/loaders/GLTFLoader.js';

import { Scene } from '../modules/three/src/scenes/Scene.js';

import { PerspectiveCamera } from '../modules/three/src/cameras/PerspectiveCamera.js';

import { WebGLRenderer } from '../modules/three/src/renderers/WebGLRenderer.js';
import { WebGL1Renderer } from '../modules/three/src/renderers/WebGL1Renderer.js';

import { MeshStandardMaterial } from '../modules/three/src/materials/MeshStandardMaterial.js';

import { Fog } from '../modules/three/src/scenes/Fog.js';
import { DirectionalLight } from '../modules/three/src/lights/DirectionalLight.js';
import { AmbientLight } from '../modules/three/src/lights/AmbientLight.js';

import {
  VSMShadowMap,
  BackSide,
  DoubleSide,
} from '../modules/three/src/constants.js';

import { OrbitControls } from '../modules/three/examples/jsm/controls/OrbitControls.js';

import { CircleGeometry } from '../modules/three/src/geometries/CircleGeometry.js';

import { Mesh } from '../modules/three/src/objects/Mesh.js';

// import { GUI } from '../modules/dat.gui/build/dat.gui.module.js';
import { TextureContainer } from '../scripts/textures.js';
import { Object3D } from '../modules/three/src/core/Object3D.js';
import { DRACOLoader } from '../modules/three/examples/jsm/loaders/DRACOLoader.js';

let RendererConstructor: typeof WebGL1Renderer | typeof WebGLRenderer;
let canvas: HTMLCanvasElement;
let carContainer = document.querySelector('.car') as HTMLDivElement;
if (WEBGL?.isWebGL2Available()) {
  canvas = document.createElement('canvas');
  carContainer?.append(canvas);
  RendererConstructor = WebGLRenderer;
} else if (WEBGL?.isWebGLAvailable()) {
  canvas = document.createElement('canvas');
  console.warn('Web GL 2 support not found: falling back to slower, legacy Web GL.');
  carContainer?.append(canvas);
  RendererConstructor = WebGL1Renderer;
} else {
  const warning = WEBGL.getWebGL2ErrorMessage();
  carContainer?.appendChild(warning);
  throw new Error(warning.textContent ?? '');
}

let sceneParams: any = {
  size: Math.min(carContainer.clientWidth, carContainer.clientHeight),
  dpp: 1,
  aspectRatio: 1,
  canvas,
  cursorX: 0,
  cursorY: 0,
  canvasDimensionsUpdated: false,
  gravity: -0.003,
  floorHeight: -0.5,
  motionDamping: 50,
};

interface Shot {
  readonly car: {
    readonly rotationSpeed: number;
  };
  readonly camera: {
    readonly fov: number;
    readonly position: {
      readonly x: number;
      readonly y: number;
      readonly z: number;
    };
    readonly lookAt: {
      readonly x: number;
      readonly y: number;
      readonly z: number;
    };
  };
}
let shots: { [name: string]: Shot } = {
  front: {
    car: {
      rotationSpeed: 0,
    },
    camera: {
      fov: 20,
      position: {
        x: 0,
        y: 0.6,
        z: 9,
      },
      lookAt: {
        x: 0,
        y: 0,
        z: 0,
      },
    },
  },

  back: {
    car: {
      rotationSpeed: 0,
    },
    camera: {
      fov: 20,
      position: {
        x: 0,
        y: 1.6,
        z: -9,
      },
      lookAt: {
        x: 0,
        y: 0,
        z: 0,
      },
    },
  },

  top: {
    car: {
      rotationSpeed: 0,
    },
    camera: {
      fov: 45,
      position: {
        x: 0,
        y: 7,
        z: 0,
      },
      lookAt: {
        x: 0,
        y: 0,
        z: 0,
      },
    },
  },

  bottom: {
    car: {
      rotationSpeed: 0,
    },
    camera: {
      fov: 45,
      position: {
        x: 0,
        y: -7,
        z: 0,
      },
      lookAt: {
        x: 0,
        y: 0,
        z: 0,
      },
    },
  },

  left: {
    car: {
      rotationSpeed: 0,
    },
    camera: {
      fov: 45,
      position: {
        x: 7,
        y: 0.6,
        z: 0,
      },
      lookAt: {
        x: 0,
        y: 0,
        z: 0,
      },
    },
  },

  right: {
    car: {
      rotationSpeed: 0,
    },
    camera: {
      fov: 45,
      position: {
        x: -7,
        y: 0.6,
        z: 0,
      },
      lookAt: {
        x: 0,
        y: 0,
        z: 0,
      },
    },
  },

  showroom: {
    car: {
      rotationSpeed: 0.005,
    },
    camera: {
      fov: 45,
      position: {
        x: 3.6706021328202767,
        y: 2.997833987795383,
        z: 4.923524519424251,
      },
      lookAt: {
        x: -0.029397867179722773,
        y: -0.0021660122046174143,
        z: 0.023524519424250264,
      },
    },
  },

  driver: {
    car: {
      rotationSpeed: 0,
    },
    camera: {
      fov: 60,
      position: {
        x: -0.09823739469335407,
        y: 0.8107863773767336,
        z: -0.3766174578592377,
      },
      lookAt: {
        x: 0.32151348578026306,
        y: 0.6322871388569032,
        z: 0.22247963618615096,
      },
    },
  },

  passengers: {
    car: {
      rotationSpeed: 0,
    },
    camera: {
      fov: 75,
      position: {
        x: -0.917794256780162,
        y: 0.8958917660396359,
        z: -0.5988382818759269,
      },
      lookAt: {
        x: 0.0488523695408864,
        y: 0.2928064535707909,
        z: -0.8286991998689824,
      },
    },
  },
} as const;
type ShotName = keyof typeof shots;
let shot = shots.showroom;
let lookingAt = {...shot.camera.lookAt};

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
    ioniqModel.translateY(-2);
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

let floorMaterial = new MeshStandardMaterial();
{
  floorMaterial.aoMap = textures.get('doorAmbientOcclusion');
  floorMaterial.aoMapIntensity = 1.5;
  floorMaterial.map = textures.get('doorColor');
  floorMaterial.metalness = 0.1;
  floorMaterial.metalnessMap = textures.get('doorMetalness');
  floorMaterial.normalMap = textures.get('doorNormal');
  floorMaterial.roughness = 2;
  floorMaterial.roughnessMap = textures.get('doorRoughness');
  floorMaterial.envMap = textures.environment;
  floorMaterial.envMapIntensity = 1;
  floorMaterial.side = DoubleSide;
}

let floor = new Mesh(new CircleGeometry(13, 50), floorMaterial);
{
  floor.geometry.setAttribute('uv2', floor.geometry.attributes.uv);
  floor.rotation.x = Math.PI / -2;
  floor.position.y = sceneParams.floorHeight;
  floor.receiveShadow = true;
}

let mainLight = new DirectionalLight(0xe8e7ac);
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
}

let ambientLight = new AmbientLight(0x7a41ff);
ambientLight.intensity = 1;

let camera = new PerspectiveCamera(shot.camera.fov);
{
  camera.near = 0.5;
  camera.far = 30;
  camera.position.x = shot.camera.position.x;
  camera.position.y = shot.camera.position.y;
  camera.position.z = shot.camera.position.z;
}

let cameraControls: OrbitControls | undefined;
// Uncomment to enter shot-finder mode
// cameraControls = new OrbitControls(camera, sceneParams.canvas);
if (cameraControls) {
  cameraControls.enableDamping = false;
}


// let gui = new GUI({});
// let cameraGUI = gui.addFolder('Camera');
// cameraGUI.add(camera, 'fov').min(0).max(90);


let scene = new Scene();
scene.fog = new Fog(0xffffff, 12, 17);
scene.add(
  camera,
  floor,

  mainLight,
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

camera.matrixAutoUpdate = true;
function step() {
  cameraControls?.update();

  floorMaterial.opacity = Math.min(1, Math.max(0, camera.position.y * 8));
  if (floorMaterial.opacity < 1) {
    floorMaterial.transparent = true;
  } else {
    floorMaterial.transparent = false;
  }

  if (!cameraControls) {
    if (ioniqModel) {
      if (shot.car.rotationSpeed === 0) {
        ioniqModel.rotation.z *= 1 - 1 / sceneParams.motionDamping;
      } else {
        ioniqModel?.rotateZ(shot.car.rotationSpeed);
      }
    }

    camera.position.x = (camera.position.x * (sceneParams.motionDamping - 1) + shot.camera.position.x) / sceneParams.motionDamping;
    camera.position.y = (camera.position.y * (sceneParams.motionDamping - 1) + shot.camera.position.y) / sceneParams.motionDamping;
    camera.position.z = (camera.position.z * (sceneParams.motionDamping - 1) + shot.camera.position.z) / sceneParams.motionDamping;

    lookingAt.x = (lookingAt.x * (sceneParams.motionDamping - 1) + shot.camera.lookAt.x) / sceneParams.motionDamping;
    lookingAt.y = (lookingAt.y * (sceneParams.motionDamping - 1) + shot.camera.lookAt.y) / sceneParams.motionDamping;
    lookingAt.z = (lookingAt.z * (sceneParams.motionDamping - 1) + shot.camera.lookAt.z) / sceneParams.motionDamping;
    camera.lookAt(
      lookingAt.x,
      lookingAt.y,
      lookingAt.z,
    );

    camera.fov = (camera.fov * (sceneParams.motionDamping - 1) + shot.camera.fov) / sceneParams.motionDamping;
    camera.updateProjectionMatrix();
  }
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

let cameraPos: string = '';
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

  if (cameraControls) {
    let newCameraPos = `${camera.position.x},${camera.position.y},${camera.position.z}\n${cameraControls.target.x},${cameraControls.target.y},${cameraControls.target.z}`;
    if (newCameraPos !== cameraPos) {
      cameraPos = newCameraPos;
      console.log(cameraPos);
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

animate({ init: true });


function render() {
  if (sceneParams.canvasDimensionsUpdated) {
    renderer.setSize(sceneParams.size, sceneParams.size);
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
  sceneParams.size = Math.min(
    Math.round(carContainer.clientWidth * dpp),
    Math.round(carContainer.clientHeight * dpp),
  );
  sceneParams.canvasDimensionsUpdated = true;
}
updateRenderDimensions();

let isTouchEvent = (event: MouseEvent | TouchEvent): event is TouchEvent => 'touches' in event;
window.addEventListener('mousemove', (event: MouseEvent | TouchEvent) => {
  let touch = isTouchEvent(event) ? event.touches[0] : event;
  sceneParams.cursorX = ((touch.clientX - sceneParams.canvas.offsetLeft) / sceneParams.size) * 2 - 1;
  sceneParams.cursorY = ((touch.clientY - sceneParams.canvas.offsetTop) / sceneParams.size) * -2 + 1;
});

sceneParams.canvas.addEventListener('dblclick', () => {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    sceneParams.canvas.requestFullscreen();
  }
});

function updateShot(shotName: ShotName) {
  shot = shots[shotName];
}
Object.keys(shots).forEach((shotName: ShotName) => {
  (document.querySelector(`.shot--${shotName}`) as HTMLButtonElement)
    .onclick = (event: MouseEvent) => {
      event.preventDefault();
      updateShot(shotName);
    };
});

window.addEventListener('resize', () => updateRenderDimensions(1));
window.addEventListener('focus', () => updateRenderDimensions());
document.body.addEventListener('mouseenter', () => updateRenderDimensions());
