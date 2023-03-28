import * as THREE from 'three';
import gsap from 'gsap';

// 1. 创建场景
const scene = new THREE.Scene();

// 2. 创建相机（透视相机）
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// 设置相机位置
camera.position.set(0, 0, 10);

// 把摄像机添加到场景里
scene.add(camera);

// 3. 创建物体 并添加到场景中
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
// 几何体 + 材质 = Mesh
const cube = new THREE.Mesh(geometry, material);

// 把物体添加到场景中
scene.add(cube);


// 5. 创建一个环境光 并添加到场景中
const ambientLight = new THREE.AmbientLight(0xffffff); // 环境光
// 将环境光添加到场景
scene.add(ambientLight);


// 创建渲染器
const renderer = new THREE.WebGLRenderer();
// 设置渲染的尺寸大小
renderer.setSize(window.innerWidth, window.innerHeight);
// 将webgl渲染的canvas内容添加到body
document.body.appendChild(renderer.domElement);


console.log(cube);

gsap.to(cube.rotation, { x: 2 * Math.PI, duration: 5, yoyo: true, repeat: -1 });
gsap.to(cube.rotation, { y: 2 * Math.PI, duration: 5, yoyo: true, repeat: -1 });

// 渲染函数
function render() {
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

// 执行渲染
render();


