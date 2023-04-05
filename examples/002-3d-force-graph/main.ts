import * as THREE from 'three';
import ForceGraph3D from '3d-force-graph';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const deg2rad = (deg) => {
  return (deg * Math.PI) / 180;
};

const init = async () => {
  const gltfLoader = new GLTFLoader();
  const graphElem = document.getElementById('3d-graph')!;
  const distance = 300;
  const gltf = await gltfLoader.loadAsync('./basketball.gltf');

  // gltf.scene..postProcessingComposer.addPass(bloomPass);

  const s = 0.1;
  gltf.scene.scale.set(s, s, s);

  const n = 81;
  const gData = {
    nodes: [...Array(n).keys()].map((i) => ({ id: i, val: 100 })),
    links: [...Array(n).keys()].map((i) => ({
      source: i,
      target: 0,
    })),
  };
  // 添加辅助线
  // const axesHelper = new THREE.AxesHelper(20);
  // gltf.scene.add(axesHelper);
  const Graph = ForceGraph3D({ rendererConfig: { alpha: true } })(graphElem)
    .nodeThreeObject(gltf.scene)
    .cameraPosition({ z: distance })
    .nodeRelSize(10)
    .nodeOpacity(0.8)
    .nodeVisibility(({ id }) => (id === 0 ? false : true))
    .graphData(gData);

  // Graph.enableNodeDrag(false);
  // Graph.enableNavigationControls(true);
  // Graph.enablePointerInteraction(false);
  // Graph.showNavInfo(false);

  // Graph.nodeRelSize(10);
  // Graph.nodeOpacity(0.8);

  // Graph.linkVisibility(false);
  // Graph.backgroundColor('rgba(0, 0, 0, 0)');

  // const bloomPass = new UnrealBloomPass();
  // bloomPass.strength = 3;
  // bloomPass.radius = 1;
  // bloomPass.threshold = 0.5;
  // Graph.postProcessingComposer().addPass(bloomPass);
  // Graph.cooldownTicks(100);

  Graph;

  let currentAngle = 0;
  let pause = false;
  // setInterval(() => {
  //   if (pause) return;
  //   Graph.cameraPosition({
  //     x: distance * Math.sin(deg2rad(currentAngle)),
  //     z: distance * Math.cos(deg2rad(currentAngle)),
  //   });

  //   currentAngle += 0.5;
  // }, 10);

  Graph.onNodeClick((node: any) => {
    const distance = 200;
    const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);

    const newPos =
      node.x || node.y || node.z
        ? {
            x: node.x * distRatio,
            y: node.y * distRatio,
            z: node.z * distRatio,
          }
        : { x: 0, y: 0, z: distance }; // special case if node is in (0,0,0)

    Graph.cameraPosition(
      newPos, // new position
      node, // lookAt ({ x, y, z })
      3000, // ms transition duration
    );
  });

  graphElem.addEventListener('mouseover', () => {
    pause = true;
  });
  graphElem.addEventListener('mouseout', () => {
    pause = false;
  });

  Graph.onEngineStop(() => Graph.zoomToFit(800));
};

init();
