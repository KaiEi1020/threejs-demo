/**
 *  几何体
 */
import * as THREE from 'three';

// 1. 创建场景
const scene = new THREE.Scene();

// 2. 创建相机
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);  // 透视相机

// 设置相机位置
camera.position.set(0, 0, 10);
scene.add(camera);

// 添加物体
// 创建几何体、材质
const geometry = new THREE.BoxGeometry();
const vertices = new Float32Array([
  -1.0, -1.0, 1.0,
  1.0,-1.0,1.0,
  1.0,1.0,1.0,
  -1.0,-1.0,-1.0
]);


const cube = new THREE.MeshBasicMaterial({ color: 0xffff00 });

// 根据几何体和材质创建物体
// const cƒw THREE.Mesh(cubeGeometry, cubeMaterial);

// consoleƒeGeometry);
// consoleƒeMaterial);
// consoleƒe);

// 将物体ƒ景中
// scene.add()

// 初始化渲染器
const renderer = new THREE.WebGLRenderer();

// 设置渲染的尺寸大小
renderer.setSize(window.innerWidth, window.innerHeight);
// console.log(renderer);

// 将webgl渲染的canvas内容添加到body
document.body.appendChild(renderer.domElement);

// 使用渲染器，通过相机将场景渲染进来
// renderer.render(scene, camera);

// 创建轨道控制器
// const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true;

// 添加坐标轴辅助器
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

const clock = new THREE.Clock();

// gsap.to(cube.position, { x: 5, duration: 5 });
// gsap.to(cube.rotation, { x: 2 * Math.PI, duration: 5 });


function render() {
  // controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

render();

window.addEventListener('resize', () => {
  // 更新摄像头 宽高比
  camera.aspect = window.innerWidth / window.innerHeight;
  // 更新摄像机投影矩阵
  camera.updateProjectionMatrix();

  // 更新渲染器
  renderer.setSize(window.innerWidth, window.innerHeight);
  // 设置渲染器像素比
  renderer.setPixelRatio(window.devicePixelRatio);

})
