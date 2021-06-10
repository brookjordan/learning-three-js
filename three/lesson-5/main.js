import { Scene } from 'Three/scenes/Scene.js';
import { PerspectiveCamera } from 'Three/cameras/PerspectiveCamera.js';
import { WebGLRenderer } from 'Three/renderers/WebGLRenderer.js';
import { BoxGeometry } from 'Three/geometries/BoxGeometry.js';
import { MeshBasicMaterial } from 'Three/materials/MeshBasicMaterial.js';
// import { MeshPhongMaterial } from 'Three/materials/MeshPhongMaterial.js';
import { Mesh } from 'Three/objects/Mesh.js';
import { Group } from 'Three/objects/Group.js';
import { AxesHelper } from 'Three/helpers/AxesHelper.js';

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
