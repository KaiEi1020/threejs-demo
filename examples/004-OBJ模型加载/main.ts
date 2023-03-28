import * as THREE from 'three'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
// import sculptureObj from './sculpture.obj'

export default class Scene {
  canvas
  renderer
  scene
  camera
  controls
  width = window.innerWidth
  height = window.innerHeight
  material

  constructor(el) {
    this.canvas = el
    this.init()
  }

  init() {
    this.setScene()
    this.setCamera()
    this.setRender()
    this.setModel()
    this.setLight()
    // this.setMaterial()
    // this.setControls()
    this.animate()
  }

  /**
   * Our Webgl renderer, an object that will draw everything in our canvas
   * https://threejs.org/docs/?q=rend#api/en/renderers/WebGLRenderer
   */
  setRender() {
    // const DPR = window.devicePixelRatio ? window.devicePixelRatio : 1
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas
      // antialias: true
    })
    // this.renderer.setPixelRatio(DPR)
    this.renderer.setSize(this.width, this.height)
  }

  /**
   * This is our scene, we'll add any object
   * https://threejs.org/docs/?q=scene#api/en/scenes/Scene
   */
  setScene() {
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x001219)
  }

  /**
   * Our Perspective camera, this is the point of view that we'll have
   * of our scene.
   * A perscpective camera is mimicing the human eyes so something far we'll
   * look smaller than something close
   * https://threejs.org/docs/?q=pers#api/en/cameras/PerspectiveCamera
   */
  setCamera() {
    this.camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    this.camera.position.z = 8
    this.scene.add(this.camera)
  }

  /**
   * Threejs controls to have controls on our scene
   * https://threejs.org/docs/?q=orbi#examples/en/controls/OrbitControls
   */
  setControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.autoRotate = true
  }

  setLight() {
    // this.lights = []

    const spotLight = new THREE.SpotLight()
    spotLight.position.set(-10, 10, 10)
    spotLight.intensity = 1.1
    // this.lights.push(spotLight)
    this.scene.add(spotLight)
  }

  // setMaterial() {
  //   this.material = new THREE.MeshLambertMaterial({
  //     color: 'white'
  //   })
  // }

  setModel() {
    const objLoader = new OBJLoader()

    objLoader.load('./sculpture.obj', (obj) => {
      const s = 0.01
      obj.scale.set(s, s, s)
      this.scene.add(obj)
    })
  }

  animate = () => {
    this.renderer.render(this.scene, this.camera)
    window.requestAnimationFrame(this.animate)
  }
}


const canvasEl = document.getElementById('canvas');
new Scene(canvasEl);


