var _a;
import PerlinNoise3D from '../scripts/perlin.js';
import { WEBGL } from '../modules/three/examples/jsm/WebGL.js';
import { Scene } from '../modules/three/src/scenes/Scene.js';
import { PerspectiveCamera } from '../modules/three/src/cameras/PerspectiveCamera.js';
import { WebGLRenderer } from '../modules/three/src/renderers/WebGLRenderer.js';
import { MeshStandardMaterial } from '../modules/three/src/materials/MeshStandardMaterial.js';
import { DirectionalLight } from '../modules/three/src/lights/DirectionalLight.js';
import { AmbientLight } from '../modules/three/src/lights/AmbientLight.js';
import { FrontSide } from '../modules/three/src/constants.js';
import { OrbitControls } from '../modules/three/examples/jsm/controls/OrbitControls.js';
// import { Group } from '../modules/three/src/objects/Group.js';
import { SphereGeometry } from '../modules/three/src/geometries/SphereGeometry.js';
// import { TorusGeometry } from '../modules/three/src/geometries/TorusGeometry.js';
import { PlaneGeometry } from '../modules/three/src/geometries/PlaneGeometry.js';
// import { BufferGeometry } from '../modules/three/src/core/BufferGeometry.js';
// import { BufferAttribute } from '../modules/three/src/core/BufferAttribute.js';
// import { Points } from '../modules/three/src/objects/Points.js';
import { Mesh } from '../modules/three/src/objects/Mesh.js';
import { GUI } from '../modules/dat.gui/build/dat.gui.module.js';
import { Fog } from '../modules/three/src/scenes/Fog.js';
import { TextureContainer } from '../scripts/textures.js';
// import { PointsMaterial } from '../modules/three/src/materials/PointsMaterial.js';
import { Vector3 } from '../modules/three/src/math/Vector3.js';
import { PCFSoftShadowMap } from '../modules/three/src/constants.js';
let canvas = document.createElement('canvas');
if (WEBGL === null || WEBGL === void 0 ? void 0 : WEBGL.isWebGL2Available()) {
  document.body.append(canvas);
} else {
  let warning = WEBGL.getWebGL2ErrorMessage();
  document.body.appendChild(warning);
  throw new Error((_a = warning.textContent) !== null && _a !== void 0 ? _a : '');
}
let sceneParams = {
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
};
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
  doorMaterial.side = FrontSide;
  doorMaterial.flatShading = false;
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
let floor = new Mesh(new PlaneGeometry(15, 15), doorMaterial);
{
  floor.geometry.setAttribute('uv2', floor.geometry.attributes.uv);
  floor.rotation.x = Math.PI / -2;
  floor.position.y = -1.4;
  floor.receiveShadow = true;
}
let particleEmitterGeometry = new PlaneGeometry(15, 15);
particleEmitterGeometry.translate(0, 5, 0);
let particleMaterial = new MeshStandardMaterial();
{
  particleMaterial.side = FrontSide;
  particleMaterial.flatShading = false;
  particleMaterial.metalness = 0.1;
  particleMaterial.roughness = 10;
  // particleMaterial.envMap = textures.environment;
  // particleMaterial.envMapIntensity = 3;
}
let particleGeometry = new SphereGeometry(0.1, 5, 3);
particleGeometry.setAttribute('position', particleGeometry.getAttribute('position'));
class Particle {
  constructor({ mesh, speed, color }) {
    this.mesh = mesh;
    this.speed = speed !== null && speed !== void 0 ? speed : new Vector3(0, 0, 0);
    this.color = color;
  }
  setSpeed(acceleration) {
    this.speed.x = acceleration.x;
    this.speed.y = acceleration.y;
    this.speed.z = acceleration.z;
  }
  accelerate(acceleration) {
    this.speed.x += acceleration.x;
    this.speed.y += acceleration.y;
    this.speed.z += acceleration.z;
  }
}
let particleSettings = {
  perSecond: 120,
};
let particleMaxDrift = 10;
let particles = [];
let deadParticles = [];
let particleFriction = 0.9925;
let windPS = Math.random() * 0.2 - 0.1;
let turbulence = new PerlinNoise3D(Math.round(Math.random() * 99999));
let wind = new Vector3(windPS / 60, -0.00003, windPS / 60);
let addParticle = ({ init = false } = {}) => {
  let particle;
  let oldParticle = deadParticles.pop();
  if (oldParticle) {
    particle = oldParticle;
    particle.mesh.visible = true;
  } else {
    particle = new Particle({
      mesh: new Mesh(particleGeometry, particleMaterial),
      color: new Vector3(Math.random(), Math.random(), Math.random()),
    });
  }
  particles.push(particle);
  particle.setSpeed(new Vector3(0, -0.02, 0));
  particle.mesh.position.x = Math.random() * particleMaxDrift * 2 - particleMaxDrift;
  particle.mesh.position.y = init ? Math.random() * 10 - 2 : 8;
  particle.mesh.position.z = Math.random() * particleMaxDrift * 2 - particleMaxDrift;
  particle.mesh.castShadow = true;
  // particle.mesh.receiveShadow = true;
  scene.add(particle.mesh);
};
let removeParticle = (index) => {
  particles[index].mesh.visible = false;
  deadParticles.push(particles.splice(index, 1)[0]);
};
let mainLight = new DirectionalLight(0xe8e7ac);
// let mainLightShadowHelper: CameraHelper;
{
  mainLight.position.x = 2;
  mainLight.position.z = 7;
  mainLight.position.y = 4;
  mainLight.intensity = 3;
  mainLight.lookAt(0, 0, 0);
  mainLight.castShadow = true;
  // mainLight.shadow.radius = 3;
  mainLight.shadow.mapSize.width = 512;
  mainLight.shadow.mapSize.height = 256;
  mainLight.shadow.camera.near = 1;
  mainLight.shadow.camera.far = 15;
  mainLight.shadow.camera.top = 3;
  mainLight.shadow.camera.bottom = -4;
  mainLight.shadow.camera.right = 10;
  mainLight.shadow.camera.left = -10;
  // mainLightShadowHelper  = new CameraHelper(mainLight.shadow.camera);
}
let ambientLight = new AmbientLight(0x7a41ff);
ambientLight.intensity = 1;
let camera = new PerspectiveCamera(sceneParams.fov);
{
  camera.near = 0.5;
  camera.far = 30;
  camera.position.z = 10;
  camera.position.y = 4;
}
let cameraControls = new OrbitControls(camera, sceneParams.canvas);
{
  cameraControls.enableDamping = true;
}
let gui = new GUI({});
let particlesGUI = gui.addFolder('Particles');
particlesGUI.add(particleSettings, 'perSecond').min(1).max(2000).step(1).name('Per second');
// let axesHelper = new AxesHelper(3,3,3);
let scene = new Scene();
scene.fog = new Fog(0xffffff, 2, 18);
scene.add(
  camera,
  floor,
  // axesHelper,
  mainLight,
  // mainLightShadowHelper,
  ambientLight,
  ...particles.map(({ mesh }) => mesh),
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
  let particlesPerFrame = particleSettings.perSecond / 60;
  let particlesToMake = Math.floor(particlesPerFrame) + (Math.random() < particlesPerFrame % 1 ? 1 : 0);
  while (particlesToMake) {
    addParticle();
    particlesToMake -= 1;
  }
  particles.forEach((particle, index) => {
    if (!particle.mesh.visible) return;
    const turb =
      Math.max(
        0,
        turbulence.noise(particle.mesh.position.x / 10, particle.mesh.position.y / 10, particle.mesh.position.z / 10) -
          0.5,
      ) || 0;
    particle.accelerate(new Vector3(wind.x * turb, wind.y - Math.abs(turb) * 0.0002, wind.z * turb));
    particle.setSpeed(
      new Vector3(
        particle.speed.x * particleFriction,
        particle.speed.y * particleFriction,
        particle.speed.z * particleFriction,
      ),
    );
    particle.mesh.position.x += particle.speed.x;
    particle.mesh.position.y += particle.speed.y;
    particle.mesh.position.z += particle.speed.z;
    if (
      particle.mesh.position.y < -2 ||
      Math.abs(particle.mesh.position.x) > particleMaxDrift ||
      Math.abs(particle.mesh.position.z) > particleMaxDrift
    ) {
      removeParticle(index);
    }
  });
}
let calcFPS = {
  display: document.createElement('div'),
  lastSecond: Math.floor(performance.now() / 1000) * 1000,
  frames: 1,
  actualFPS: 0,
};
calcFPS.display.classList.add('actual-fps');
document.body.append(calcFPS.display);
let animateRAF;
let animationFPS = 60;
let animationMSPF = 1000 / animationFPS;
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
for (let i = 0; i < 1000; i += 1) {
  addParticle({ init: true });
}
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
}
render();
function updateRenderDimensions(dpp = sceneParams.dpp) {
  sceneParams.dpp = Math.max(0.4, Math.min(dpp, 1));
  sceneParams.width = Math.round(window.innerWidth * dpp);
  sceneParams.height = Math.round(window.innerHeight * dpp);
  sceneParams.canvasDimensionsUpdated = true;
}
updateRenderDimensions();
let isTouchEvent = (event) => 'touches' in event;
window.addEventListener('mousemove', (event) => {
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
