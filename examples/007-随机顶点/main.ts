import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';
import {
  CSS2DRenderer,
  CSS2DObject,
} from 'three/examples/jsm/renderers/CSS2DRenderer';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import gsap from 'gsap';
import fp from 'lodash/fp';

// const init = async () => {
//   const gltfLoader = new GLTFLoader();
//   // 加载模型
//   const gltf = await gltfLoader.loadAsync('./ball.gltf');

//   // gltf.scene.traverse( function ( child ) {
//   //   if (child.isMesh) {
//   //     child.material.emissive =  child.material.color;
//   //     child.material.emissiveMap = child.material.map;
//   //   }
//   // });
//   const ballGroup = gltf.scene;
//   const mesh1 = ballGroup.children[0] as THREE.Mesh;
//   const mesh2 = ballGroup.children[1] as THREE.Mesh;

//   console.log(gltf.scene);
//   console.log('mesh1', mesh1, 'mesh2', mesh2);

//   const s = 1;
//   gltf.scene.scale.set(s, s, s);

//   const scene = new THREE.Scene();
//   scene.background = null;

//   // 加载环境贴图
//   const texture = await new RGBELoader().loadAsync('./studio_small_04_2k.hdr');
//   texture.mapping = THREE.EquirectangularReflectionMapping;
//   scene.background = texture;
//   scene.environment = texture;

//   const camera = new THREE.PerspectiveCamera(
//     45,
//     window.innerWidth / window.innerHeight,
//     0.1,
//     2000,
//   );
//   camera.position.set(0, 0, 10);
//   scene.add(camera);

//   // 添加坐标轴辅助器
//   const axesHelper = new THREE.AxesHelper(5);
//   scene.add(axesHelper);

//   const balls: any[] = [];
//   for (let i = 0; i < 80; i++) {
//     const ball = SkeletonUtils.clone(mesh1);
//     ball.position.x = THREE.MathUtils.randFloatSpread(40);
//     ball.position.y = THREE.MathUtils.randFloatSpread(40);
//     ball.position.z = THREE.MathUtils.randFloatSpread(40);
//     balls.push(ball);
//   }
//   balls.forEach((b) => scene.add(b));

//   // 灯光相关
//   const directionLight = new THREE.DirectionalLight(0xffffff, 1);
//   const spotLight = new THREE.SpotLight();
//   spotLight.position.set(0, 0, 8);
//   spotLight.intensity = 1;
//   scene.add(spotLight);
//   // scene.add(directionLight);
//   const light = new THREE.AmbientLight(0xcbdcdb, 0.9);
//   light.color;
//   // scene.add(light);

//   const canvas = document.getElementById('canvas')!;
//   const renderer = new THREE.WebGLRenderer({ canvas });
//   // 设置渲染的尺寸大小
//   renderer.setSize(window.innerWidth, window.innerHeight);

//   // 统计
//   const stats = Stats();
//   document.body.appendChild(stats.dom);

//   // 创建轨道控制器
//   const controls = new OrbitControls(camera, renderer.domElement);
//   controls.enableDamping = true;

//   // 添加点击事件
//   renderer.domElement.addEventListener('click', function (event) {
//     // 屏幕坐标转标准坐标
//     const px = event.offsetX;
//     const py = event.offsetY;
//     const x = (px / renderer.domElement.width) * 2 - 1;
//     const y = -(py / renderer.domElement.height) * 2 + 1;
//     const raycaster = new THREE.Raycaster();
//     raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
//     // 未选中对象返回空数组[],选中一个对象，数组1个元素，选中两个对象，数组两个元素
//     const intersects = raycaster.intersectObjects(balls);
//     console.log('与射线相交对象', intersects);
//     // intersects.length大于0说明，说明选中了模型
//     if (intersects.length > 0) {
//       // 先将所有球恢复原来颜色
//       balls.forEach((ball) => {
//         ball.traverse((obj) => {
//           console.log('obj', obj);
//           if ((obj as THREE.Mesh).isMesh) {
//             // obj.material.color.set(new THREE.Color(1, 1, 1));
//           }
//         });
//       });
//       // 将材质复制一份，设置新的颜色
//       // const materialClone = (intersects[0].object as any).material.clone();
//       // materialClone.color.set(0xff0000);
//       // (intersects[0].object as any).material = materialClone;

//       const point = intersects[0].point;
//       const distance = 4;
//       const distRatio = 1 + distance / Math.hypot(point.x, point.y, point.z);
//       const newPos =
//         point.x || point.y || point.z
//           ? {
//               x: point.x * distRatio,
//               y: point.y * distRatio,
//               z: point.z * distRatio,
//             }
//           : { x: 0, y: 0, z: distance }; // special case if node is in (0,0,0)

//       camera.lookAt(point);
//       gsap.to(camera.position, {
//         ...newPos,
//         duration: 3,
//       });
//     }
//   });

//   render();

//   function render() {
//     controls.update();
//     stats.update();
//     renderer.render(scene, camera);
//     requestAnimationFrame(render);
//   }
// };

// init();

class Departments {
  gltfLoader: GLTFLoader;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  css2DRenderer: CSS2DRenderer;
  controls?: OrbitControls;
  stats: Stats;
  balls: any[] = [];
  spotLight: THREE.SpotLight;
  directionLight: THREE.DirectionalLight;
  ambientLight: THREE.AmbientLight;
  normalMesh: THREE.Mesh<THREE.BufferGeometry, THREE.Material>;
  hoverMesh: THREE.Mesh<THREE.BufferGeometry, THREE.Material>;
  defaultCameraPosition = new THREE.Vector3(0, 0, 80);
  constructor(private data: { id: number; name: string }[]) {
    this.gltfLoader = new GLTFLoader();
    this.init();
  }

  async init() {
    this.createScene(); // 创建场景
    this.addCamera(); // 添加相机
    // this.addLights(); // 加灯光
    await this.addHdr(); // 添加环境贴图
    this.addBalls();
    this.addRenderer(); // 添加渲染器
    this.addCss2DRenderer(); //
    this.addListener();
    // 辅助类
    this.createControls();
    this.addStats(); // 添加统计
    this.addGUI();
    this.addAxesHelper();
    this.render();
  }

  render = () => {
    this.controls?.update();
    this.stats.update();
    this.renderer.render(this.scene, this.camera);
    this.css2DRenderer.render(this.scene, this.camera);
    requestAnimationFrame(this.render);
  };

  createScene() {
    this.scene = new THREE.Scene();
    this.scene.background = null;
  }

  createControls() {
    // 创建轨道控制器
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.enablePan = false;
    this.controls.enableZoom = false;
    this.controls.enableRotate = false;
  }

  addCamera() {
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      2000,
    );
    this.camera.position.set(...this.defaultCameraPosition.toArray());
    this.scene.add(this.camera);
  }

  // 统计
  addStats() {
    this.stats = Stats();
    document.body.appendChild(this.stats.dom);
  }

  async addHdr() {
    const texture = await new RGBELoader().loadAsync(
      './studio_small_04_2k.hdr',
    );
    texture.mapping = THREE.EquirectangularReflectionMapping;
    this.scene.background = texture;
    this.scene.environment = texture;
  }

  // 添加坐标轴辅助器
  async addAxesHelper() {
    const axesHelper = new THREE.AxesHelper(5);
    this.scene.add(axesHelper);
  }

  // 灯光相关
  addLights() {
    this.spotLight = new THREE.SpotLight();
    this.spotLight.position.set(0, 0, 8);
    this.spotLight.intensity = 1;
    this.scene.add(this.spotLight);
    this.directionLight = new THREE.DirectionalLight(0xffffff, 1);
    this.scene.add(this.directionLight);
    // 环境光
    this.ambientLight = new THREE.AmbientLight(0xcbdcdb, 0.9);
    this.scene.add(this.ambientLight);
  }

  addGUI() {
    const gui = new GUI();
    if (this.ambientLight) {
      const lightFolder = gui.addFolder('环境光');
      lightFolder.addColor(this.ambientLight, 'color');
      lightFolder.add(this.ambientLight, 'intensity', 0, 1);
    }
    if (this.directionLight) {
      const directionLightFolder = gui.addFolder('平行光');
      directionLightFolder.addColor(this.directionLight, 'color');
      directionLightFolder.add(this.directionLight, 'intensity', 0, 1);
    }
  }

  addRenderer() {
    const canvas = document.getElementById('canvas')!;
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    this.renderer.domElement.style.position = 'relative';
    this.renderer.domElement.style.zIndex = '1';
    this.renderer.outputEncoding = THREE.sRGBEncoding; // 模型颜色偏差
    // 使用算法将HDR值转换为LDR值，使其介于0到1之间， 0 <---> 1
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    // 渲染器将允许多少光线进入
    this.renderer.toneMappingExposure = 2;
    // 设置渲染的尺寸大小
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  addCss2DRenderer() {
    this.css2DRenderer = new CSS2DRenderer();
    this.css2DRenderer.setSize(window.innerWidth, window.innerHeight);
    this.css2DRenderer.domElement.style.position = 'absolute';
    this.css2DRenderer.domElement.style.top = '0px';
    this.css2DRenderer.domElement.style.pointerEvents = 'none';
    this.css2DRenderer.domElement.style.zIndex = '1';
    document.body.append(this.css2DRenderer.domElement);

    // this.css2DRenderer.domElement.style.zIndex = -1;
  }

  async addBalls() {
    const { scene: normalModel } = await this.gltfLoader.loadAsync(
      './金属球.gltf',
    );
    const { scene: hoverModel } = await this.gltfLoader.loadAsync(
      './金属球hover.gltf',
    );
    // gltf.scene.traverse( function ( child ) {
    //   if (child.isMesh) {
    //     child.material.emissive =  child.material.color;
    //     child.material.emissiveMap = child.material.map;
    //   }
    // });
    // const ballGroup = gltf.scene;
    this.normalMesh = normalModel.children[0] as THREE.Mesh<THREE.BufferGeometry, THREE.Material>;
    this.hoverMesh = hoverModel.children[0] as THREE.Mesh<THREE.BufferGeometry, THREE.Material>;
    const len = this.data.length;
    for (let i = 0; i < len; i++) {
      const item = this.data[i];
      const ball = SkeletonUtils.clone(this.normalMesh);

      ball.position.x = THREE.MathUtils.randFloatSpread(40);
      ball.position.y = THREE.MathUtils.randFloatSpread(40);
      ball.position.z = THREE.MathUtils.randFloat(-40, 0);

      // const x0 = 0;
      // const y0 = 0;
      // const r = len / 2;
      // const angle = (360 / len) * i;
      // const radian = (angle * Math.PI) / 180; // 弧度 = 角度 * PI / 180
      // const x = x0 + r * Math.cos(radian);
      // const y = -(y0 + r * Math.sin(radian));
      // const z = -10;
      // ball.position.x = x;
      // ball.position.y = y;
      // ball.position.z = z;

      // console.log(x, y, z);

      // 添加label
      const labelDiv = document.createElement('div');
      labelDiv.className = 'label';
      labelDiv.textContent = item.name;
      // labelDiv.style.marginTop = '1em';
      labelDiv.style.background = 'none';
      const label = new CSS2DObject(labelDiv);
      label.position.set(0, -1.5, 0);
      ball.add(label);

      this.balls.push(ball);
    }
    this.balls.forEach((b) => this.scene.add(b));
  }

  addListener() {
    const width = this.renderer.domElement.width;
    const height = this.renderer.domElement.height;
    // mousemove
    this.renderer.domElement.addEventListener('mousemove', (event) => {
      // 屏幕坐标转标准坐标
      const px = event.offsetX;
      const py = event.offsetY;
      const x = (px / width) * 2 - 1;
      const y = -(py / height) * 2 + 1;
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(x, y), this.camera);
      const intersects = raycaster.intersectObjects(this.balls);
      // 先将所有球恢复原来材质
      this.balls.forEach((ball) => {
        ball.traverse((obj) => {
          if ((obj as THREE.Mesh).isMesh) {
            obj.material = this.normalMesh.material; // obj.material.color.set(new THREE.Color(1, 1, 1));
          }
        });
      });
      if (intersects.length > 0) {
        const material = this.hoverMesh.material;
        (intersects[0].object as any).material = material;
      }
    });

    // click
    let prevBall: THREE.Mesh | undefined;
    let prevPosition: THREE.Vector3;
    this.renderer.domElement.addEventListener('click', (event) => {
      // 屏幕坐标转标准坐标
      const px = event.offsetX;
      const py = event.offsetY;
      const x = (px / width) * 2 - 1;
      const y = -(py / height) * 2 + 1;
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(x, y), this.camera);
      const intersects = raycaster.intersectObjects<
        THREE.Mesh<THREE.BufferGeometry, THREE.Material>
      >(this.balls);
      if (intersects.length > 0) {
        // 先将所有球恢复原来材质
        // this.balls.forEach((ball) => {
        //   ball.traverse((obj) => {
        //     if (obj.isMesh) {
        //       obj.material = this.normalMesh.material.clone(); // obj.material.color.set(new THREE.Color(1, 1, 1));
        //     }
        //   });
        // });
        const material = this.hoverMesh.material.clone();
        intersects[0].object.material = material;
        if (prevBall && prevPosition) {
          // prevBall
          gsap.to(prevBall.material as THREE.Material, {
            opacity: 1,
            duration: 2,
          });
        }

        prevBall = intersects[0].object;
        prevPosition = intersects[0].object.position.clone();
        // gsap.to(intersects[0].object.material, {
        //   opacity: 0,
        //   duration: 2,
        // });

        // 相机移动
        const position = intersects[0].object.position;
        const distance = 20;
        const distRatio =
          1 + distance / Math.hypot(position.x, position.y, position.z);
        const newPos =
          position.x || position.y || position.z
            ? {
                x: position.x * distRatio,
                y: position.y * distRatio,
                z: position.z * distRatio,
              }
            : { x: 0, y: 0, z: distance }; // special case if node is in (0,0,0)
        this.camera.lookAt(position);
        gsap.to(this.camera.position, {
          ...newPos,
          duration: 2,
        });
      }
    });

    this.renderer.domElement.addEventListener('dblclick', (event) => {
      const px = event.offsetX;
      const py = event.offsetY;
      const x = (px / width) * 2 - 1;
      const y = -(py / height) * 2 + 1;
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(x, y), this.camera);
      const intersects = raycaster.intersectObjects(this.balls);
      if (intersects.length === 0) {
        gsap.to(this.camera.position, {
          x: this.defaultCameraPosition.x,
          y: this.defaultCameraPosition.y,
          z: this.defaultCameraPosition.z,
          duration: 3,
        });
      }
    });
  }
}

const data = [
  { id: 0, name: '计量大学' },
  { id: 1, name: '马克思主义学院' },
  { id: 2, name: '现代科技学院' },
  { id: 3, name: '人才办' },
  { id: 4, name: '生命科学学院' },
  { id: 5, name: '理学院' },
  { id: 6, name: '材料与化学学院' },
  { id: 7, name: '统战部' },
  { id: 8, name: '继续（成人）教育学院' },
  { id: 9, name: '海克斯康精密测量与智能制造学院' },
  { id: 10, name: '量新学院' },
  { id: 11, name: '量新学员' },
  { id: 12, name: '量新学员' },
  { id: 13, name: '量新学员' },
  { id: 14, name: '量新学员' },
  { id: 15, name: '量新学员' },
  { id: 16, name: '量新学员' },
  { id: 17, name: '量新学员' },
  { id: 18, name: '量新学员' },
  { id: 19, name: '量新学员' },
  { id: 20, name: '量新学员' },
  { id: 21, name: '量新学员' },
  { id: 22, name: '量新学员' },
  { id: 23, name: '量新学员' },
  { id: 24, name: '量新学员' },
  { id: 25, name: '量新学员' },
  { id: 26, name: '量新学员' },
  { id: 27, name: '量新学员' },
  { id: 28, name: '量新学员' },
  { id: 29, name: '量新学员' },
  { id: 30, name: '量新学员' },
  { id: 31, name: '量新学员' },
  { id: 32, name: '量新学员' },
  { id: 33, name: '量新学员' },
  { id: 34, name: '量新学员' },
  { id: 35, name: '量新学员' },
  { id: 36, name: '量新学员' },
  { id: 37, name: '量新学员' },
  { id: 38, name: '量新学员' },
  { id: 39, name: '量新学员' },
  { id: 40, name: '量新学员' },
  { id: 41, name: '量新学员' },
  { id: 42, name: '量新学员' },
  { id: 43, name: '量新学员' },
  { id: 44, name: '量新学员' },
  { id: 45, name: '量新学员' },
  { id: 46, name: '量新学员' },
  { id: 47, name: '量新学员' },
  { id: 48, name: '量新学员' },
  { id: 49, name: '量新学员' },
  { id: 50, name: '量新学员' },
  { id: 51, name: '量新学员' },
  { id: 52, name: '量新学员' },
  { id: 53, name: '量新学员' },
  { id: 54, name: '量新学员' },
  { id: 55, name: '量新学员' },
  { id: 56, name: '量新学员' },
  { id: 57, name: '量新学员' },
  { id: 58, name: '量新学员' },
  { id: 59, name: '量新学员' },
  { id: 60, name: '量新学员' },
  { id: 61, name: '量新学员' },
  { id: 62, name: '量新学员' },
  { id: 63, name: '量新学员' },
  { id: 64, name: '量新学员' },
  { id: 65, name: '量新学员' },
  { id: 66, name: '量新学员' },
  { id: 67, name: '量新学员' },
  { id: 68, name: '量新学员' },
  { id: 69, name: '量新学员' },
  { id: 70, name: '量新学员' },
  { id: 71, name: '量新学员' },
  { id: 72, name: '量新学员' },
  { id: 73, name: '量新学员' },
  { id: 74, name: '量新学员' },
  { id: 75, name: '量新学员' },
  { id: 76, name: '量新学员' },
  { id: 77, name: '量新学员' },
  { id: 78, name: '量新学员' },
  { id: 79, name: '量新学员' },
  { id: 80, name: '量新学员' },
  { id: 81, name: '量新学员' },
  { id: 82, name: '量新学员' },
  { id: 83, name: '量新学员' },
];

new Departments(data);
