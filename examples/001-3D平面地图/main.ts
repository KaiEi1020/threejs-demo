import * as THREE from 'three';
import {
  CSS2DRenderer,
  CSS2DObject,
} from 'three/addons/renderers/CSS2DRenderer.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as d3 from 'd3';
import * as dat from 'dat.gui';
import { projection, InitFlyLine } from './utils';
import { City, FlyData } from './types';

// 获取json数据
const getGeoJSON = async (adcode) => {
  const url = `https://cdn.zcycdn.com/zcy-front/data-screen/areas/${adcode}.json`;
  if (!url) {
    return undefined;
  }
  const json = await fetch(url, {
    headers: { 'Content-Type': 'application/json;charset=UTF-8' },
  }).then((r) => r.json());
  return json;
};
const MATERIAL_COLOR1 = '#2defff';
const MATERIAL_COLOR2 = '#3480C4';
const globeRadius = 100;
const earthRadius = 14;

// var vertexShader = document.getElementById('vertex-shader').innerHTML;
// var fragmentShader = document.getElementById('fragment-shader').innerHTML;

var cityList = {
  北京: { name: '北京', longitude: 116.3, latitude: 39.9 },
  上海: { name: '上海', longitude: 121.0, latitude: 31.0 },
  西安: { name: '西安', longitude: 108.0, latitude: 34.0 },
  成都: { name: '成都', longitude: 103.0, latitude: 31.0 },
  乌鲁木齐: { name: '乌鲁木齐', longitude: 87.0, latitude: 43.0 },
  拉萨: { name: '拉萨', longitude: 91.06, latitude: 29.36 },
  广州: { name: '广州', longitude: 113.0, latitude: 23.06 },
  哈尔滨: { name: '哈尔滨', longitude: 127.0, latitude: 45.5 },
  沈阳: { name: '沈阳', longitude: 123.43, latitude: 41.8 },
  武汉: { name: '武汉', longitude: 114.0, latitude: 30.0 },
  海口: { name: '海口', longitude: 110.0, latitude: 20.03 },
  纽约: { name: '纽约', longitude: -74.5, latitude: 40.5 },
  伦敦: { name: '伦敦', longitude: 0.1, latitude: 51.3 },
  巴黎: { name: '巴黎', longitude: 2.2, latitude: 48.5 },
  开普敦: { name: '开普敦', longitude: 18.25, latitude: -33.5 },
  悉尼: { name: '悉尼', longitude: 151.1, latitude: -33.51 },
  东京: { name: '东京', longitude: 139.69, latitude: 35.69 },
  里约热内卢: { name: '里约热内卢', longitude: -43.11, latitude: -22.54 },
};

//城市之间的连线，可以定义颜色（数据来自业务系统）
var flyLineData = [
  {
    from: '北京',
    to: ['上海', '西安'],
    color: `rgba(255, 147, 0, 1)`,
  },
  {
    from: '上海',
    to: ['西安', '成都'],
    color: `rgba(255, 216, 0, 1)`,
  },
];

class Map3D {
  // 场景
  scene: THREE.Scene;
  // 相机
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  // labelRenderer: CSS2DRenderer;
  map: THREE.Object3D;
  // 控制器
  controller: OrbitControls;
  gui: dat.GUI;
  // 墨卡托投影转换
  // projection = d3.geoMercator().center([104.0, 37.5]).translate([0, 0]);
  // groupLines: THREE.Group;
  // animateDots: any[] = []; // 小球运动点轨迹
  // timer = -(Math.PI * 2);
  flyManager: InitFlyLine | null = null;
  constructor() {
    this.gui = new dat.GUI();
    this.init();
    // this.render()
  }

  init() {
    this.scene = new THREE.Scene();
    this.scene.background = null;

    // 设置相机
    this.setCamera();
    // 创建渲染器
    this.setRenderer();
    // 设置光照
    // this.setLight();
    // 创建控制器
    this.setController();

    // 创建地图
    this.loadMapData();

    this.render();

    // 绘制飞线
    this.loadLines();
  }

  render = () => {
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.render.bind(this));
    if (this.flyManager != null) {
      this.flyManager.animation();
    }
  };

  // 新建透视相机
  setCamera() {
    // 第二参数就是 长度和宽度比 默认采用浏览器  返回以像素为单位的窗口的内部宽度和高度
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    this.camera.position.set(0, 0, 120);
    // this.camera.lookAt(this.scene.position);
    this.scene.add(this.camera);
    // this.camera.lookAt(0, 0, 0);
  }

  // 创建渲染器
  setRenderer() {
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);

    // 设置画布的大小
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    // this.renderer.setClearColor(0xffffff, 0);

    // 将webgl渲染的canvas内容添加到body
    document.body.appendChild(this.renderer.domElement);
  }

  // 创建 CSS2DRenderer
  // setCSS2DRenderer() {
  //   this.labelRenderer = new CSS2DRenderer();
  //   this.labelRenderer.setSize(
  //     this.renderer.domElement.clientWidth,
  //     this.renderer.domElement.clientHeight,
  //   );
  //   this.labelRenderer.domElement.style.position = 'absolute';
  //   this.labelRenderer.domElement.style.top = '0px';
  //   this.labelRenderer.domElement.style.left = '0px';
  //   // 设置.pointerEvents=none，以免模型标签HTML元素遮挡鼠标选择场景模型
  //   this.labelRenderer.domElement.style.pointerEvents = 'none';
  //   document.body.appendChild(this.labelRenderer.domElement);
  // }

  setController() {
    this.controller = new OrbitControls(this.camera, this.renderer.domElement);
  }

  // 设置光照
  setLight() {
    // const light = new THREE.DirectionalLight( 0xffffff, 0.5 );
    // light.position.set(20, -50, 20);
    // light.castShadow = true;
    // light.shadow.mapSize.width = 1024;
    // light.shadow.mapSize.height = 1024;
    // this.scene.add(light);

    let ambientLight = new THREE.AmbientLight(191970, 20); // 环境光
    this.scene.add(ambientLight);
  }

  // createLable(item) {
  //   // label
  //   var div = document.createElement('div');
  //   div.innerHTML = item.city + ': ' + item.count + '个';
  //   div.style.display = 'block';
  //   div.style.width = '8vw';
  //   div.style.height = '4vh';
  //   div.style.lineHeight = '4vh';
  //   div.style.textAlign = 'center';
  //   div.style.color = '#fff';
  //   const img = require('@/assets/images/kuang.png');
  //   div.style.background = 'url(' + img + ') no-repeat ';
  //   div.style.backgroundSize = '100% 100%';
  //   div.style.fontSize = '0.6349vw';
  //   div.style.position = 'absolute';
  //   div.style.backgroundColor = 'rgba(25,25,25,0.5)';
  //   div.style.borderRadius = '0.463vh';
  //   var label = new CSS2DObject(div);
  //   // 设置mesh位置
  //   var pos = [item.longitude, item.latitude];
  //   // label.position.set(pos[0] - this.offsetX, pos[1] - this.offsetY, 5.5)
  //   // // this.previousObj = label
  //   // scene.add(label)
  // }

  async loadMapData() {
    const jsondata = await getGeoJSON(100000);
    const areaArr = [330000, 340000, 540000, 110000];
    // 初始化一个地图对象
    this.map = new THREE.Object3D();
    jsondata.features.forEach((elem, index) => {
      const area = new THREE.Object3D();
      // 每个的 坐标 数组
      const coordinates = elem.geometry.coordinates;
      const type = elem.geometry.type;
      const properties = elem.properties;
      const adcode = properties.adcode;

      // if(adcode !== 540000) {
      //   return;
      // }
      // console.log(elem);
      // console.log(adcode);

      // 定义一个画几何体的方法
      const drawPolygon = (polygon) => {
        // Shape（形状）。使用路径以及可选的孔洞来定义一个二维形状平面。 它可以和ExtrudeGeometry、ShapeGeometry一起使用，获取点，或者获取三角面。
        const shape = new THREE.Shape();
        // 存放的点位，最后需要用THREE.Line将点位构成一条线，也就是地图上区域间的边界线
        // 为什么两个数组，因为需要三维地图的两面都画线，且它们的z坐标不同
        let points1: THREE.Vector3[] = [];
        let points2: THREE.Vector3[] = [];

        for (let i = 0; i < polygon.length; i++) {
          // 将经纬度通过墨卡托投影转换成threejs中的坐标
          const [x, y] = projection(polygon[i]);
          // 画二维形状
          if (i === 0) {
            shape.moveTo(x, -y);
          }
          shape.lineTo(x, -y);

          points1.push(new THREE.Vector3(x, -y, 10));
          points2.push(new THREE.Vector3(x, -y, 0));
        }

        /**
         * ExtrudeGeometry （挤压缓冲几何体）
         * 文档链接：https://threejs.org/docs/index.html?q=ExtrudeGeometry#api/zh/geometries/ExtrudeGeometry
         */
        const geometry = new THREE.ExtrudeGeometry(shape, {
          depth: 10,
          bevelEnabled: false,
        });
        /**
         * 基础材质
         */
        // 正反两面的材质
        const material1 = new THREE.MeshBasicMaterial({
          color: MATERIAL_COLOR1,
          // transparent: true,
          opacity: 0.6,
        });
        // 侧边材质
        const material2 = new THREE.MeshBasicMaterial({
          color: MATERIAL_COLOR2,
          transparent: true,
          opacity: 0.5,
        });
        // 生成一个几何物体（如果是中国地图，那么每一个mesh就是一个省份几何体）
        let materialArr: THREE.Material[] = [];
        if (areaArr.includes(adcode)) {
          // 创建纹理贴图
          // const texture = new THREE.TextureLoader().load('https://sitecdn.zcycdn.com/f2e-assets/dc2fdb44-e020-4890-94cf-f8b200c932c2.png');
          const texture = new THREE.TextureLoader().load(
            'https://sitecdn.zcycdn.com/f2e-assets/fa0da933-e258-484f-8b44-7eef0a38c467.png',
          );
          // texture.mapping = THREE.UVMapping;
          texture.rotation = -Math.PI / 4;
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;
          // texture.repeat.set(4, 4);
          // texture.minFilter = THREE.NearestFilter;
          // texture.magFilter = THREE.NearestFilter;
          const material3 = new THREE.MeshBasicMaterial({
            map: texture,
          });
          materialArr = [material3, material2];
        } else {
          materialArr = [material1, material2];
        }
        // console.log('area', area);
        // const texture = new THREE.TextureLoader().load('https://sitecdn.zcycdn.com/f2e-assets/dc2fdb44-e020-4890-94cf-f8b200c932c2.png');
        // const material3 = new THREE.MeshBasicMaterial( {
        //   map: texture,
        //   // side:THREE.DoubleSide,
        //   // color: new THREE.Color('0xFCA837')
        // });
        // materialArr = [material3, material3];

        const mesh = new THREE.Mesh(geometry, materialArr);
        // // 设置高度将省区分开来
        // if (index % 2 === 0) {
        //   mesh.scale.set(1, 1, 1.2);
        // }
        // // 给mesh开启阴影
        // mesh.castShadow = true
        // mesh.receiveShadow = true
        area.add(mesh);
        /**
         * 画线
         * link: https://threejs.org/docs/index.html?q=Line#api/zh/objects/Line
         */
        const lineGeometry1 = new THREE.BufferGeometry().setFromPoints(points1);
        const lineGeometry2 = new THREE.BufferGeometry().setFromPoints(points2);
        let lineMaterial;
        if (areaArr.includes(adcode)) {
          lineMaterial = new THREE.LineBasicMaterial({
            color: 0xfca837,
            linewidth: 2,
          });
        } else {
          lineMaterial = new THREE.LineBasicMaterial({});
        }
        const line1 = new THREE.Line(lineGeometry1, lineMaterial);
        const line2 = new THREE.Line(lineGeometry2, lineMaterial);

        area.add(line1);
        area.add(line2);
      };

      // type可能是MultiPolygon 也可能是Polygon
      if (type === 'MultiPolygon') {
        coordinates.forEach((multiPolygon) => {
          multiPolygon.forEach((polygon) => {
            drawPolygon(polygon);
          });
        });
      } else {
        coordinates.forEach((polygon) => {
          drawPolygon(polygon);
        });
      }

      this.map.add(area);
      // console.log(area);
    });
    this.map.rotation.set(-Math.PI / 4, 0, 0, 'XYZ');
    // gsap.to(this.map.rotation, { x: 2 * Math.PI, duration: 5 });
    this.scene.add(this.map);
  }

  loadLines() {
    // 随机个时间间隔后，再添加连线（以免同时添加连线，显示效果死板）
    const randomAddFlyLine = (
      earth: THREE.Object3D,
      flyManager: InitFlyLine,
      fromCity: City,
      toCity: City,
      color: string,
    ) => {
      setTimeout(function () {
        addFlyLine(earth, flyManager, fromCity, toCity, color);
      }, Math.ceil(Math.random() * 15000));
    };

    // 增加城市之间飞线
    const addFlyLine = (
      earth: THREE.Object3D,
      flyManager: InitFlyLine,
      fromCity: City,
      toCity: City,
      color: string,
    ) => {
      var coefficient = 1;
      var curvePoints = new Array();
      // var fromXyz = lon2xyz(
      //   GlobalConfig.earthRadius,
      //   fromCity.longitude,
      //   fromCity.latitude,
      // );
      const [x1, y1] = projection([fromCity.longitude, fromCity.latitude]);
      const [x2, y2] = projection([toCity.longitude, toCity.latitude]);
      const z1 = 10;
      const z2 = 10;
      // var toXyz = lon2xyz(
      //   GlobalConfig.earthRadius,
      //   toCity.longitude,
      //   toCity.latitude,
      // );
      curvePoints.push(new THREE.Vector3(x1, y1, z1));

      //根据城市之间距离远近，取不同个数个点
      var distanceDivRadius = Math.sqrt(
        (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2) + (z1 - z2) * (z1 - z2),
      )/ earthRadius;
      var partCount = 3 + Math.ceil(distanceDivRadius * 3);
      for (var i = 0; i < partCount; i++) {
        var partCoefficient =
          coefficient + (partCount - Math.abs((partCount - 1) / 2 - i)) * 0.01;
        var partTopXyz = getPartTopPoint(
          {
            x:
              (x1 * (partCount - i)) / partCount +
              (x2 * (i + 1)) / partCount,
            y:
              (y1 * (partCount - i)) / partCount +
              (y2 * (i + 1)) / partCount,
            z:
              (z1 * (partCount - i)) / partCount +
              (z2 * (i + 1)) / partCount,
          },
          earthRadius,
          partCoefficient,
        );
        curvePoints.push(
          new THREE.Vector3(partTopXyz.x, partTopXyz.y, partTopXyz.z),
        );
      }
      curvePoints.push(new THREE.Vector3(x2, y2, z2));

      // 使用B样条，将这些点拟合成一条曲线（这里没有使用贝赛尔曲线，因为拟合出来的点要在地球周围，不能穿过地球）
      const curve = new THREE.CatmullRomCurve3(curvePoints, false);

      // 从B样条里获取点
      const pointCount = Math.ceil(500 * partCount);
      const allPoints = curve.getPoints(pointCount);

      //制作飞线动画
      // @ts-ignore
      const flyMesh = flyManager.addFly({
        curve: allPoints, //飞线飞线其实是N个点构成的
        color: color, //点的颜色
        width: 0.3, //点的半径
        length: Math.ceil((allPoints.length * 3) / 5), //飞线的长度（点的个数）
        speed: partCount + 10, //飞线的速度
        repeat: Infinity, //循环次数
      });

      earth.add(flyMesh);
    };

    const earthAddFlyLine = (
      earth: THREE.Object3D,
      flyLineData: FlyData[],
      cityList: Record<string, City>,
    ) => {
      let flyManager: InitFlyLine | null = null;

      if (flyManager == null) {
        flyManager = new InitFlyLine({
          texture:
            'https://sitecdn.zcycdn.com/f2e-assets/4e81954e-e9c4-40bc-abef-9c5c946c4c62.png',
        });
      }

      for (var i = 0; i < flyLineData.length; i++) {
        var flyLine = flyLineData[i];
        for (var j = 0; j < flyLine.to.length; j++) {
          randomAddFlyLine(
            earth,
            flyManager,
            cityList[flyLine.from],
            cityList[flyLine.to[j]],
            flyLine.color,
          );
        }
      }

      return flyManager;
    };

    const getPartTopPoint = (
      innerPoint: { x: number; y: number; z: number },
      earthRadius: number,
      partCoefficient: number,
    ) => {
      var fromPartLen = Math.sqrt(
        innerPoint.x * innerPoint.x +
          innerPoint.y * innerPoint.y +
          innerPoint.z * innerPoint.z,
      );
      return {
        x: (innerPoint.x * partCoefficient * earthRadius) / fromPartLen,
        y: (innerPoint.y * partCoefficient * earthRadius) / fromPartLen,
        z: (innerPoint.z * partCoefficient * earthRadius) / fromPartLen,
      };
    };

    //添加飞线
    const object3D = new THREE.Object3D();
    this.flyManager = earthAddFlyLine(object3D, flyLineData, cityList);
    // return { object3D, waveMeshArr, flyManager };
    this.scene.add(object3D);
  }
}

new Map3D();
