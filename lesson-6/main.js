import { Between } from '../scripts/alea.js';
import { Scene } from 'Three/scenes/Scene.js';
import { PerspectiveCamera } from 'Three/cameras/PerspectiveCamera.js';
import { OrthographicCamera } from 'Three/cameras/OrthographicCamera.js';
import { WebGLRenderer } from 'Three/renderers/WebGLRenderer.js';
// import { WebGL1Renderer } from 'Three/renderers/WebGL1Renderer.js';
import { BoxGeometry } from 'Three/geometries/BoxGeometry.js';
import { BufferGeometry } from 'Three/core/BufferGeometry.js';
import { MeshBasicMaterial } from 'Three/materials/MeshBasicMaterial.js';
// import { MeshPhongMaterial } from 'Three/materials/MeshPhongMaterial.js';
// import { LineDashedMaterial } from 'Three/materials/LineDashedMaterial.js';
import { FrontSide, BackSide, DoubleSide } from 'Three/constants.js';
import { Float32BufferAttribute } from 'Three/core/BufferAttribute.js';
import { OrbitControls } from 'ThreeExamples/controls/OrbitControls.js';
import { Mesh } from 'Three/objects/Mesh.js';
import { Group } from 'Three/objects/Group.js';
import { AxesHelper } from 'Three/helpers/AxesHelper.js';
import { GUI } from '/modules/dat.gui/build/dat.gui.module.js';

const gui = new GUI();
const cameraGui = gui.addFolder('Camera');
const blueGui = gui.addFolder('Blue shape');

const random = Between(123456789);

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

const redShape = new Mesh(
  new BoxGeometry(1, 1, 1),
  new MeshBasicMaterial({ color: 0xff0000 })
);
redShape.position.x = 0.4;
shapesGroup.add(
  redShape,
);

const greenShape = new Mesh(
  new BoxGeometry(1, 1, 1),
  new MeshBasicMaterial({ color: 0x00ff00 }),
);
greenShape.position.x = -0.4;
greenShape.position.y = 0.51;
greenShape.position.z = 0.3;
shapesGroup.add(
  greenShape,
);

const blueShape = {
  vertCount: 8,
  faceCount: 100,
  maxVerts: 100,
  maxFaces: 5000,
};
blueShape.material = new MeshBasicMaterial({ color: 0x0000ff, side: FrontSide });
blueShape.verts = new Float32BufferAttribute(Array.from({ length: blueShape.maxVerts * 3 }, () => random(-1.25, 1.25)), 3);
blueShape.geometry = new BufferGeometry();
blueShape.geometry.setAttribute('position', blueShape.verts);

const buildAvailableBlueFaces = () => {
  blueShape.faces = Array.from({ length: blueShape.maxFaces }, () => Math.floor(random(0, blueShape.vertCount)));
}
const makeBlueGeometry = () => {
  blueShape.mesh && shapesGroup.remove(blueShape.mesh);
  blueShape.geometry.setIndex(blueShape.faces.slice(0, blueShape.faceCount));
  if (blueShape.mesh) {
    blueShape.mesh.geometry = blueShape.geometry;
  } else {
    blueShape.mesh = new Mesh(
      blueShape.geometry,
      blueShape.material,
    );
  }
  shapesGroup.add(blueShape.mesh);
}

buildAvailableBlueFaces();
makeBlueGeometry();

blueGui.add(blueShape, 'vertCount', 3, blueShape.maxVerts, 1).onChange((_newValue) => { buildAvailableBlueFaces(); makeBlueGeometry(); });
blueGui.add(blueShape, 'faceCount', 10, blueShape.maxFaces, 1).onChange((_newValue) => { makeBlueGeometry(); });



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

  camera.near = 0.001;
  camera.far = 100;
  camera.position.z = 5;
  camera.position.y = 2;
  return camera;
})();

cameraGui.add(camera.position, 'x').min(-10).max(10);
cameraGui.add(camera.position, 'y').min(-10).max(10);
cameraGui.add(camera.position, 'z').min(-10).max(10);


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
);


const renderer = new WebGLRenderer({
  canvas: sceneParams.canvas,
  antialias: true,
  alpha: true,
});
renderer.setClearColor(0, 0);


let lastTickTime = Date.now();


const fps = 60;
const mspf = 1000 / fps;
(function render() {
  if (sceneParams.canvasDimensionsUpdated) {
    renderer.setSize(sceneParams.width, sceneParams.height);
    renderer.setPixelRatio(Math.min(2, devicePixelRatio));
    camera.aspect = sceneParams.aspectRatio;
    camera.updateProjectionMatrix();
    sceneParams.canvasDimensionsUpdated = false;
  }

  while (lastTickTime < Date.now() - mspf) {
    groupRot += 0.001;
    lastTickTime += mspf;
  }
  shapesGroup.rotation.y = groupRot;

  cameraControls.update();

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
