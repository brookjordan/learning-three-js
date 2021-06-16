import {
  WebGLRenderer,
  Scene,
  Mesh,
  BoxGeometry,
  MeshBasicMaterial,
  PerspectiveCamera,
} from '../modules/three/build/three.module.js';

const sceneParams = {
  width: 800,
  height: 600,
  canvas: document.querySelector('.webgl'),
};

const renderer = new WebGLRenderer({
  canvas: sceneParams.canvas,
});

const scene = new Scene();

const cube = new Mesh(new BoxGeometry(1, 1, 1), new MeshBasicMaterial());

const camera = new PerspectiveCamera(
  45, // FOV
  sceneParams.width / sceneParams.height, // Aspect ratio
);

renderer.setSize(sceneParams.width, sceneParams.height);
camera.position.z = 3;

scene.add(camera, cube);

renderer.render(scene, camera);
