import * as THREE from 'three';
import * as d3 from 'd3';

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
}
const MATERIAL_COLOR1 = "#2defff";
const MATERIAL_COLOR2 = "#3480C4";

class chinaMap {
  constructor() {
    this.scene = undefined  // 场景
    this.camera = undefined // 相机
    this.renderer = undefined // 渲染器
    this.geojson = undefined // 地图json数据
    this.init()
  }

  init() {
    // 第一步新建一个场景
    this.scene = new THREE.Scene()

    this.setCamera()
    // this.addCube();
    // this.activeInstersect = []
    // this.setController()
    // this.setRaycaster()
    this.loadMapData();
    // 创建渲染器
    this.setRender();
    this.render()
    // this.setRenderer()
    // this.animate()
    // 加载3d 字体
    //this.addFont()
    // this.addHelper()
  }

  setRender() {
    this.renderer = new THREE.WebGLRenderer()
    // 渲染器尺寸
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    //设置背景颜色
    this.renderer.setClearColor(0x000000)
    // 将渲染器追加到dom中
    document.body.appendChild(this.renderer.domElement)
  }

  render() {
    this.renderer.render(this.scene, this.camera)
    requestAnimationFrame(this.render.bind(this))
  }

  addCube() {
    // 根据几何体和材质创建物体
    // 添加物体
    // 创建几何体、材质
    const cubeGeometry = new THREE.BoxGeometry();
    const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    console.log('cube', cube);
    this.scene.add(cube);
    // 修改物体的位置
    // cube.position.set(0, 2, 0);
    // 缩放
    // cube.scale.set(1, 2, 1);
    // 旋转
    // cube.rotation.set(Math.PI/3, 0, 0, 'XYZ');

    // 将几何体添加到场景中
  }

  // 加载地图数据
  loadMapData() {
    getGeoJSON(100000).then((jsondata) => {
      this.generateGeometry(jsondata)
    })
  }

  generateGeometry(jsondata) {
    // 初始化一个地图对象
    this.map = new THREE.Object3D()
    // 墨卡托投影转换
    const projection = d3
      .geoMercator()
      .center([104.0, 37.5])
      .translate([0, 0])

    jsondata.features.forEach((elem) => {
      // 定一个省份3D对象
      // const province = new THREE.Object3D()
      const area = new THREE.Object3D()
      // 每个的 坐标 数组
      const coordinates = elem.geometry.coordinates;
      const type = elem.geometry.type;

      // 定义一个画几何体的方法
      const drawPolygon = (polygon) => {
        // Shape（形状）。使用路径以及可选的孔洞来定义一个二维形状平面。 它可以和ExtrudeGeometry、ShapeGeometry一起使用，获取点，或者获取三角面。
        const shape = new THREE.Shape()
        // 存放的点位，最后需要用THREE.Line将点位构成一条线，也就是地图上区域间的边界线
        // 为什么两个数组，因为需要三维地图的两面都画线，且它们的z坐标不同
        let points1 = [];
        let points2 = [];

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
          transparent: true,
          opacity: 0.6,
        });
        // 侧边材质
        const material2 = new THREE.MeshBasicMaterial({
          color: MATERIAL_COLOR2,
          transparent: true,
          opacity: 0.5,
        });
        // 生成一个几何物体（如果是中国地图，那么每一个mesh就是一个省份几何体）
        const mesh = new THREE.Mesh(geometry, [material1, material2]);
        area.add(mesh);

        /**
         * 画线
         * link: https://threejs.org/docs/index.html?q=Line#api/zh/objects/Line
         */
        const lineGeometry1 = new THREE.BufferGeometry().setFromPoints(points1);
        const lineGeometry2 = new THREE.BufferGeometry().setFromPoints(points2);
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
        const line1 = new THREE.Line(lineGeometry1, lineMaterial);
        const line2 = new THREE.Line(lineGeometry2, lineMaterial);
        area.add(line1);
        area.add(line2);
      }

      // type可能是MultiPolygon 也可能是Polygon
      if (type === "MultiPolygon") {
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

      // 循环坐标数组
      // coordinates.forEach((multiPolygon) => {
      //   multiPolygon.forEach((polygon) => {
      //     const shape = new THREE.Shape()
      //     // const lineMaterial = new THREE.LineBasicMaterial({
      //     //   color: 'white',
      //     // })
      //     // const lineGeometry = new THREE.Geometry()

      //     for (let i = 0; i < polygon.length; i++) {
      //       const [x, y] = projection(polygon[i])
      //       if (i === 0) {
      //         shape.moveTo(x, -y)
      //       }
      //       shape.lineTo(x, -y)
      //     // console.log(x, -y);
      //       // lineGeometry.vertices.push(new THREE.Vector3(x, -y, 5))
      //     }

      //     const extrudeSettings = {
      //       depth: 10,
      //       bevelEnabled: false,
      //     }

      //     const geometry = new THREE.ExtrudeGeometry(
      //       shape,
      //       extrudeSettings
      //     )
      //     // 平面部分材质
      //     const material = new THREE.MeshBasicMaterial({
      //       color: '#2defff',
      //       transparent: true,
      //       opacity: 0.6,
      //     })
      //     // 拉高部分材质
      //     const material1 = new THREE.MeshBasicMaterial({
      //       color: '#3480C4',
      //       transparent: true,
      //       opacity: 0.5,
      //     })

      //     const mesh = new THREE.Mesh(geometry, [material, material1])
      //     // const line = new THREE.Line(lineGeometry, lineMaterial)
      //     // 将省份的属性 加进来
      //     // province.properties = elem.properties;
      //     province.add(mesh);
      //     // province.add(line);
      //   })
      // })
      // this.map.add(province)

    })
    console.log('map', this.map);
    this.scene.add(this.map)
  }

  setController() {
    this.controller = new THREE.OrbitControls(
      this.camera,
      document.getElementById('canvas')
    )
  }

  addCube() {
    const geometry = new THREE.BoxGeometry()
    const material = new THREE.MeshBasicMaterial({ color: 0x50ff22 })
    this.cube = new THREE.Mesh(geometry, material)
    this.scene.add(this.cube)
  }

  // addFont() {
  //   const loader = new THREE.FontLoader()
  //   loader.load('../json/alibaba.json', (font) => {
  //     const geometry = new THREE.TextGeometry('我爱掘金', {
  //       font: font,
  //       size: 20,
  //       height: 5,
  //       curveSegments: 12,
  //       bevelEnabled: false,
  //       bevelThickness: 10,
  //       bevelSize: 8,
  //       bevelOffset: 0,
  //       bevelSegments: 5,
  //     })
  //     const material = new THREE.MeshBasicMaterial({ color: 0x49ef4 })
  //     const mesh = new THREE.Mesh(geometry, material)
  //     this.scene.add(mesh)
  //   })
  // }

  addHelper() {
    const helper = new THREE.CameraHelper(this.camera)
    this.scene.add(helper)
  }

  // 新建透视相机
  setCamera() {
    // 第二参数就是 长度和宽度比 默认采用浏览器  返回以像素为单位的窗口的内部宽度和高度
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    this.camera.position.set(0, 0, 120)
    this.scene.add(this.camera)
    // this.camera.lookAt(this.scene.position)
  }

  setRaycaster() {
    this.raycaster = new THREE.Raycaster()
    this.mouse = new THREE.Vector2()
    this.tooltip = document.getElementById('tooltip')
    // const onMouseMove = (event) => {
    //   this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    //   this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
    //   this.tooltip.style.left = event.clientX + 2 + 'px'
    //   this.tooltip.style.top = event.clientY + 2 + 'px'
    // }

    // window.addEventListener('mousemove', onMouseMove, false)
  }

  // 设置渲染器
  setRenderer() {
    this.renderer = new THREE.WebGLRenderer()
    this.renderer.setPixelRatio(window.devicePixelRatio)

    // 设置画布的大小
    this.renderer.setSize(window.innerWidth, window.innerHeight)

    // 将webgl渲染的canvas内容添加到body
    document.body.appendChild(this.renderer.domElement);
  }

  // 设置环境光
  setLight() {
    let ambientLight = new THREE.AmbientLight(191970, 20) // 环境光
    this.scene.add(ambientLight)
  }

  // render() {
  //   this.renderer.render(this.scene, this.camera)
  // }

  animate() {
    requestAnimationFrame(this.animate.bind(this))
    // 通过摄像机和鼠标位置更新射线
    // this.raycaster.setFromCamera(this.mouse, this.camera)
    // // 算出射线 与当场景相交的对象有那些
    // const intersects = this.raycaster.intersectObjects(
    //   this.scene.children,
    //   true
    // )
    // 恢复上一次清空的
    // if (this.lastPick) {
    //   this.lastPick.object.material[0].color.set('#2defff')
    //   this.lastPick.object.material[1].color.set('#3480C4')
    // }
    // this.lastPick = null
    // this.lastPick = intersects.find(
    //   (item) => item.object.material && item.object.material.length === 2
    // )
    // if (this.lastPick) {
    //   this.lastPick.object.material[0].color.set(0xff0000)
    //   this.lastPick.object.material[1].color.set(0xff0000)
    // }
    // this.showTip()
    this.render()
  }

  showTip() {
    // 显示省份的信息
    if (this.lastPick) {
      const properties = this.lastPick.object.parent.properties

      this.tooltip.textContent = properties.name

      this.tooltip.style.visibility = 'visible'
    } else {
      this.tooltip.style.visibility = 'hidden'
    }
  }
}

class Map3D {

}


new chinaMap();


