import * as THREE from 'three';
import ForceGraph3D from '3d-force-graph';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const deg2rad = (deg) => {
  return (deg * Math.PI) / 180;
};

const n = 81;
const nodes = [...Array(n).keys()].map((i) => ({
  id: i,
  val: Math.random() * 1.5 + 1,
}));
function generateLinks(nodes) {
  let links: any[] = [];
  nodes.forEach((node) => {
    let numNodeLinks = Math.round(Math.random() * (0.75 + Math.random())) + 1;
    for (let i = 0; i < numNodeLinks; i++) {
      links.push({
        source: node.id,
        target: Math.round(
          Math.random() * (node.id > 0 ? node.id - 1 : node.id),
        ),
      });
    }
  });
  return links;
}
const gData = {
  nodes,
  links: generateLinks(nodes),
};

const links = generateLinks(nodes);

const distance = 1500;
const graphElem = document.getElementById('3d-graph')!;
const Graph = ForceGraph3D({ rendererConfig: { alpha: true } })(graphElem);
// Graph.nodeThreeObject(gltf.scene);
Graph.enableNodeDrag(false);
Graph.enableNavigationControls(true);
// Graph.enablePointerInteraction(false);
Graph.showNavInfo(false);
Graph.cameraPosition({ z: distance });
Graph.nodeRelSize(10);
Graph.nodeOpacity(0.8);

// Graph.linkVisibility(false);
Graph.backgroundColor('rgba(0, 0, 0, 0)');
Graph.nodeVisibility(({ id }) => (id === 0 ? false : true));

const bloomPass = new UnrealBloomPass();
bloomPass.strength = 3;
bloomPass.radius = 1;
bloomPass.threshold = 0.5;
Graph.postProcessingComposer().addPass(bloomPass);

console.log('Graph.scene()', Graph.scene());

Graph.graphData(gData);

let currentAngle = 0;
let pause = false;
setInterval(() => {
  if (pause) return;
  Graph.cameraPosition({
    x: distance * Math.sin(deg2rad(currentAngle)),
    z: distance * Math.cos(deg2rad(currentAngle)),
  });

  currentAngle += 0.5;
}, 10);


window.addEventListener('resize', (e) => {
  let width = window.innerWidth;
  let height = window.innerHeight;

  Graph.width(width);
  Graph.height(height);
  Graph.refresh();
});

// function onClick(e) {
//   e.preventDefault();
//   e = e.touches && e.touches.length ? e.touches[0] : e;

//   let x = e.pageX;
//   let y = e.pageY;

//   const links = generateLinks(nodes);
//   const gData = { nodes, links };
//   Graph.graphData(gData);
// }

// window.addEventListener('click', onClick, false);
// window.addEventListener('touchstart', onClick, false);
