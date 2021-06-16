var _d;
import { WEBGL } from '../modules/three/examples/jsm/WebGL.js';
import { Scene } from '../modules/three/src/scenes/Scene.js';
import { PerspectiveCamera } from '../modules/three/src/cameras/PerspectiveCamera.js';
import { WebGLRenderer } from '../modules/three/src/renderers/WebGLRenderer.js';
import { WebGL1Renderer } from '../modules/three/src/renderers/WebGL1Renderer.js';
import { RawShaderMaterial } from '../modules/three/src/materials/RawShaderMaterial.js';
import { DirectionalLight } from '../modules/three/src/lights/DirectionalLight.js';
import { AmbientLight } from '../modules/three/src/lights/AmbientLight.js';
import { DoubleSide } from '../modules/three/src/constants.js';
import { TrackballControls } from '../modules/three/examples/jsm/controls/TrackballControls.js';
import { Group } from '../modules/three/src/objects/Group.js';
import { SphereGeometry } from '../modules/three/src/geometries/SphereGeometry.js';
import { Mesh } from '../modules/three/src/objects/Mesh.js';
import { GUI } from '../modules/dat.gui/build/dat.gui.module.js';
let RendererConstructor;
let canvas;
if (WEBGL === null || WEBGL === void 0 ? void 0 : WEBGL.isWebGL2Available()) {
  canvas = document.createElement('canvas');
  document.body.append(canvas);
  RendererConstructor = WebGLRenderer;
} else if (WEBGL === null || WEBGL === void 0 ? void 0 : WEBGL.isWebGLAvailable()) {
  canvas = document.createElement('canvas');
  console.warn('Web GL 2 support not found: falling back to slower, legacy Web GL.');
  document.body.append(canvas);
  RendererConstructor = WebGL1Renderer;
} else {
  const warning = WEBGL.getWebGL2ErrorMessage();
  document.body.appendChild(warning);
  throw new Error((_d = warning.textContent) !== null && _d !== void 0 ? _d : '');
}
const sceneParams = {
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
const renderer = new RendererConstructor({
  canvas: sceneParams.canvas,
  antialias: true,
  alpha: true,
});
renderer.physicallyCorrectLights = true;
renderer.setClearColor(0x5102ff, 1);
renderer.shadowMap.enabled = true;
renderer.setSize(sceneParams.width, sceneParams.height);
renderer.setPixelRatio(Math.min(2, devicePixelRatio));
const shapesGroup = new Group();
let groupRot = 0;
const shaderMods = {
  _w: 0.05,
  set w(multiplier) {
    this.update('_w', multiplier);
  },
  get w() {
    return this._w;
  },
  _h: 0.05,
  set h(multiplier) {
    this.update('_h', multiplier);
  },
  get h() {
    return this._h;
  },
  _a: 0.1,
  set a(multiplier) {
    this.update('_a', multiplier);
  },
  get a() {
    return this._a;
  },
  _b: 0.1,
  set b(multiplier) {
    this.update('_b', multiplier);
  },
  get b() {
    return this._b;
  },
  _aa: 0.1,
  set aa(multiplier) {
    this.update('_aa', multiplier);
  },
  get aa() {
    return this._aa;
  },
  _bb: 0.1,
  set bb(multiplier) {
    this.update('_bb', multiplier);
  },
  get bb() {
    return this._bb;
  },
  _c: 0.5,
  set c(multiplier) {
    this.update('_c', multiplier);
  },
  get c() {
    return this._c;
  },
  _cc: 0.2,
  set cc(multiplier) {
    this.update('_cc', multiplier);
  },
  get cc() {
    return this._cc;
  },
  _x: 1,
  set x(multiplier) {
    this.update('_x', multiplier);
  },
  get x() {
    return this._x;
  },
  _y: 1,
  set y(multiplier) {
    this.update('_y', multiplier);
  },
  get y() {
    return this._y;
  },
  _z: 1,
  set z(multiplier) {
    this.update('_z', multiplier);
  },
  get z() {
    return this._z;
  },
  update(key, value) {
    this[key] = value;
    material.uniforms.u_width.value = canvas.width * this.w;
    material.uniforms.u_height.value = canvas.height * this.h;
    material.uniforms.u_a.value = this.a;
    material.uniforms.u_b.value = this.b;
    material.uniforms.u_aa.value = this.aa;
    material.uniforms.u_bb.value = this.bb;
    material.uniforms.u_c.value = this.c;
    material.uniforms.u_cc.value = this.cc;
    material.uniforms.u_x.value = this.x;
    material.uniforms.u_y.value = this.y;
    material.uniforms.u_z.value = this.z;
    material.needsUpdate = true;
  },
};
const material = new RawShaderMaterial({
  uniforms: {
    u_width: { value: canvas.width * shaderMods.w },
    u_height: { value: canvas.height * shaderMods.h },
    u_a: { value: shaderMods.a },
    u_b: { value: shaderMods.b },
    u_aa: { value: shaderMods.aa },
    u_bb: { value: shaderMods.bb },
    u_c: { value: shaderMods.c },
    u_cc: { value: shaderMods.cc },
    u_x: { value: shaderMods.x },
    u_y: { value: shaderMods.y },
    u_z: { value: shaderMods.z },
  },
  vertexShader: /* glsl */ `
    uniform mat4 projectionMatrix;
    uniform mat4 viewMatrix;
    uniform mat4 modelMatrix;

    uniform float u_x;
    uniform float u_y;
    uniform float u_z;

    varying float v_z;
    varying float v_y;

    attribute vec3 position;

    float random (vec2 st) {
      return fract(
        sin(
          dot(
            st.xy,
            vec2(12.9898,78.233)
          )
        ) * 43758.5453123
      );
    }

    void main()
    {
      vec4 modelPosition = modelMatrix * vec4(position, 1.0);
      vec4 viewPosition = viewMatrix * modelPosition;
      vec4 projectedPosition = projectionMatrix * viewPosition;

      projectedPosition.y += random(position.xy) * u_y;
      projectedPosition.x += random(position.yx) * u_x;
      projectedPosition.z += random(position.xy) * u_z;

      v_z = projectedPosition.z;
      v_y = viewPosition.y;

      gl_Position = projectedPosition;
    }
  `,
  fragmentShader: /* glsl */ `
    precision mediump float;

    uniform float u_width;
    uniform float u_height;

    uniform float u_a;
    uniform float u_b;

    uniform float u_aa;
    uniform float u_bb;

    uniform float u_c;
    uniform float u_cc;

    varying float v_z;
    varying float v_y;

    float random (vec2 st) {
      return fract(
        sin(
          dot(
            st.xy,
            vec2(12.9898,78.233)
          )
        ) * 43758.5453123
      );
    }

    void main()
    {
      vec2 resolution = vec2(u_width, u_height);
      vec2 st = gl_FragCoord.xy / resolution;

      vec2 ipos = ceil(st);
      vec2 fpos = fract(st);

      float q = random(ipos);
      float w = random(vec2(floor(q), floor(q)));
      float e = random(vec2(q, w));
      float r = random(vec2(w, e));
      float t = random(vec2(e, r));

      st = gl_FragCoord.xy / resolution;
      st /= 3.0;
      st.x += r * u_aa - u_aa / 2.0;
      st.y += t * u_bb - u_bb / 2.0;
      st *= 3.0;
      st.x += e * u_a - u_a / 2.0;
      st.y += w * u_b - u_b / 2.0;

      ipos = ceil(st);

      float rr = random(ipos);
      float gg = random(vec2(floor(rr), floor(rr))) - v_y * u_c * 0.00002;
      float bb = random(vec2(gg, rr)) + v_z * u_cc * 0.1;
      rr -= v_z * u_cc * 0.03;

      gg += rr * u_cc * 1.0;
      gg -= v_y * u_c * 0.3;

      gl_FragColor = vec4(rr, gg, bb, 1.0);
    }
  `,
});
{
  material.side = DoubleSide;
}
const floor = new Mesh(new SphereGeometry(8, 120, 80), material);
floor.geometry.setAttribute('uv2', floor.geometry.attributes.uv);
{
  floor.rotation.x = Math.PI / -2;
  floor.position.y = -1.4;
  floor.receiveShadow = true;
}
const mainLight = new DirectionalLight(0xe8e7ac);
{
  mainLight.position.x = 2;
  mainLight.position.z = 7;
  mainLight.position.y = 4;
  mainLight.intensity = 3;
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
let camera = new PerspectiveCamera(sceneParams.fov);
{
  camera.near = 0.5;
  camera.far = 30;
  camera.position.z = 5;
  camera.position.y = 2;
}
const cameraControls = new TrackballControls(camera, sceneParams.canvas);
const scene = new Scene();
scene.add(camera, floor, shapesGroup, mainLight, ambientLight);
function step() {
  shapesGroup.rotation.y = groupRot;
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
(function keepRendering() {
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
  requestAnimationFrame(keepRendering);
})();
function updateRenderDimensions(dpp = sceneParams.dpp) {
  sceneParams.dpp = Math.min(dpp, 1);
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
const gui = new GUI({ width: Math.max(window.innerWidth / 2, 250) });
const vertexShaderGUI = gui.addFolder('Vertex shader');
vertexShaderGUI.add(shaderMods, 'x').min(-2).max(2).step(0.1).name('x');
vertexShaderGUI.add(shaderMods, 'y').min(-2).max(2).step(0.1).name('y');
vertexShaderGUI.add(shaderMods, 'z').min(0).max(4).step(0.1).name('z');
const fragmentShaderGUI = gui.addFolder('Fragment shader');
fragmentShaderGUI.add(shaderMods, 'w').min(0.01).max(1).step(0.01).name('Width');
fragmentShaderGUI.add(shaderMods, 'h').min(0.01).max(1).step(0.01).name('Height');
fragmentShaderGUI.add(shaderMods, 'a').min(-3).max(3).step(0.01).name('a');
fragmentShaderGUI.add(shaderMods, 'aa').min(-3).max(3).step(0.01).name('aa');
fragmentShaderGUI.add(shaderMods, 'b').min(-3).max(3).step(0.01).name('b');
fragmentShaderGUI.add(shaderMods, 'bb').min(-3).max(3).step(0.01).name('bb');
fragmentShaderGUI.add(shaderMods, 'c').min(0.01).max(1).step(0.01).name('c');
fragmentShaderGUI.add(shaderMods, 'cc').min(0.01).max(1).step(0.01).name('cc');
window.addEventListener('resize', () => updateRenderDimensions(1));
window.addEventListener('focus', () => updateRenderDimensions());
document.body.addEventListener('mouseenter', () => updateRenderDimensions());
