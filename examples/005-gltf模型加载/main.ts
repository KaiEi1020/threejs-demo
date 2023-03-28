import * as THREE from 'three';
import gsap from 'gsap';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// 1. 创建场景
const scene = new THREE.Scene();
// scene.background = new THREE.Color(0xffffff);
// 2. 创建相机
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
// 设置相机位置
camera.position.set(0, 0, 2);

// 把摄像机添加到场景里
scene.add(camera);

// 3. 创建渲染器
const renderer = new THREE.WebGLRenderer({ alpha: true });
// 设置渲染的尺寸大小
renderer.setSize(window.innerWidth, window.innerHeight);
// 将webgl渲染的canvas内容添加到body
document.body.appendChild(renderer.domElement);

// 4. 创建控制器
const controls = new OrbitControls(camera, renderer.domElement);

// 4. 加载模型
// new RGBELoader().load('./industrial_sunset_02_puresky_4k.hdr', (texture) => {
//   texture.mapping = THREE.EquirectangularReflectionMapping;
//   scene.background = texture;
//   // scene.environment = texture;

//   render();

//   const gltfLoader = new GLTFLoader();
//   gltfLoader.load('./zoro.gltf', (gltf) => {
//     const s = 1.2;
//     gltf.scene.scale.set(s, s, s);
//     scene.add(gltf.scene);

//     gsap.to(gltf.scene.rotation, { x: 2 * Math.PI, duration: 5, repeat: -1 });
//   });
// });

const gltfLoader = new GLTFLoader();
gltfLoader.load('./planter_pot_clay.gltf', (gltf) => {
  const s = 1.2;
  gltf.scene.scale.set(s, s, s);
  scene.add(gltf.scene);

  gsap.to(gltf.scene.rotation, {
    y: 2 * Math.PI,
    x: 0,
    z: 0,
    duration: 5,
    repeat: -1,
  });
});

// 灯光
const light = new THREE.AmbientLight(0x404040, 0.9);
scene.add(light);
const directionLight = new THREE.DirectionalLight(0xffffff, 0.4);
const spotLight = new THREE.SpotLight();
spotLight.position.set(-20, 20, 20);
spotLight.intensity = 1.2;
scene.add(spotLight);
scene.add(directionLight);

// scene.add(controls);
// controls.addEventListener('change', render); // use if there is no animation loop

function render() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

render();
