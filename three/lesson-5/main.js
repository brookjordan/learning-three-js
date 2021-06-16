import { Scene } from '../modules/three/src/scenes/Scene.js';
import { PerspectiveCamera } from '../modules/three/src/cameras/PerspectiveCamera.js';
import { WebGLRenderer } from '../modules/three/src/renderers/WebGLRenderer.js';
import { BoxGeometry } from '../modules/three/src/geometries/BoxGeometry.js';
import { MeshBasicMaterial } from '../modules/three/src/materials/MeshBasicMaterial.js';
// import { MeshPhongMaterial } from '../modules/three/src/materials/MeshPhongMaterial.js';
import { Mesh } from '../modules/three/src/objects/Mesh.js';
import { Group } from '../modules/three/src/objects/Group.js';
import { AxesHelper } from '../modules/three/src/helpers/AxesHelper.js';

const sceneParams = {
  width: 800,
  height: 600,
  canvas: document.querySelector('.webgl'),
};

const cube1 = new Mesh(new BoxGeometry(1, 1, 1), new MeshBasicMaterial({ color: 0xff0000 }));
cube1.position.x = 0.4;

const cube2 = new Mesh(new BoxGeometry(1, 1, 1), new MeshBasicMaterial({ color: 0x00ff00 }));
cube2.position.x = -0.4;
cube2.position.y = 0.5;

const cube3 = new Mesh(new BoxGeometry(1, 1, 1), new MeshBasicMaterial({ color: 0x0000ff }));
cube3.position.z = -0.5;

const group = new Group();
group.add(cube1, cube2, cube3);
group.rotation.y = 0.3;

const camera = new PerspectiveCamera(
  45, // FOV
  sceneParams.width / sceneParams.height, // Aspect ratio
);
camera.position.z = 5;
camera.position.y = 2;
camera.lookAt(group.position);

const axesHelper = new AxesHelper();

const scene = new Scene();
scene.add(camera, group, axesHelper);

const renderer = new WebGLRenderer({
  canvas: sceneParams.canvas,
});
renderer.setSize(sceneParams.width, sceneParams.height);
renderer.render(scene, camera);
