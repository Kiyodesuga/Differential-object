
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

let scene, camera, renderer;
const boids = [];
const numBoids = 1500;
let activeShape = 'O';
let prevShape = 'O';
let clock = new THREE.Clock();
let shapeMap = {};
const azShapes = {
  A: 'TShape',
  B: 'LetterLine',
  C: 'CylinderWall',
  D: 'FlatRing',
  E: 'GridCross',
  F: 'ConeSpiral',
  G: 'UShape',
  H: 'Helix',
  I: 'PyramidStack',
  J: 'Shell',
  K: 'VShape',
  L: 'Star',
  M: 'YBranch',
  N: 'Staircase',
  O: 'Sphere',
  P: 'ZigzagWall',
  Q: 'RandomCloud',
  R: 'XShape',
  S: 'TorusRing',
  T: 'CirclePlane',
  U: 'Spiral',
  V: 'WaveY',
  W: 'WaveZ',
  X: 'LShape',
  Y: 'CubeGrid',
  Z: 'WaveX'
};

const colors = [
  0xff5733, 0xffbd33, 0xdfff33, 0x75ff33, 0x33ff57,
  0x33ffbd, 0x33dfff, 0x3375ff, 0x5733ff, 0xbd33ff,
  0xff33df, 0xff3375, 0xff3333, 0x33ffaa, 0x3388ff,
  0x8833ff, 0xff8833, 0x33ff88, 0xaa33ff, 0x33aaff
];
let currentColor = colors[Math.floor(Math.random() * colors.length)];

init();
animate();

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.z = 150;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const light = new THREE.PointLight(0xffffff, 2, 500);
  light.position.set(0, 0, 100);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0x222222));

  for (let i = 0; i < numBoids; i++) {
    const geo = new THREE.SphereGeometry(0.4, 8, 8);
    const mat = new THREE.MeshStandardMaterial({
      color: currentColor,
      emissive: currentColor,
      emissiveIntensity: 1.0,
      transparent: true,
      opacity: 0.75
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set((Math.random() - 0.5) * 300, (Math.random() - 0.5) * 300, (Math.random() - 0.5) * 300);
    mesh.velocity = new THREE.Vector3((Math.random() - 0.5), (Math.random() - 0.5), (Math.random() - 0.5));
    boids.push(mesh);
    scene.add(mesh);
  }

  window.addEventListener('resize', onResize);
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('click', onClick);

  for (let code = 65; code <= 90; code++) {
    const char = String.fromCharCode(code);
    shapeMap[char] = true;
  }
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onClick() {
  let keys = Object.keys(shapeMap);
  let nextShape = activeShape;
  while (nextShape === activeShape) {
    nextShape = keys[Math.floor(Math.random() * keys.length)];
  }
  prevShape = activeShape;
  activeShape = nextShape;
  changeColor();
}

function onKeyDown(e) {
  const key = e.key.toUpperCase();
  if (key >= 'A' && key <= 'Z') {
    if (activeShape === key) {
      const keys = Object.keys(shapeMap).filter(k => k !== activeShape);
      activeShape = keys[Math.floor(Math.random() * keys.length)];
    } else {
      activeShape = key;
    }
    changeColor();
  }
}

function changeColor() {
  currentColor = colors[Math.floor(Math.random() * colors.length)];
  boids.forEach(b => {
    b.material.color.set(currentColor);
    b.material.emissive.set(currentColor);
  });
}

function generateShapePosition(i, shape) {
  const s = azShapes[shape];
  switch (s) {
    case 'Sphere': return goldenSphere(i, numBoids);
    case 'CirclePlane': return new THREE.Vector3(Math.cos(i) * 60, Math.sin(i) * 60, 0);
    case 'FlatRing': return new THREE.Vector3(Math.cos(i * 0.05) * 60, 0, Math.sin(i * 0.05) * 60);
    case 'Spiral': return new THREE.Vector3(i * 0.3 * Math.cos(i * 0.1), i * 0.3 * Math.sin(i * 0.1), i * 0.1 % 60 - 30);
    case 'CubeGrid': return new THREE.Vector3((i % 10) * 6 - 30, (Math.floor(i / 10) % 10) * 6 - 30, Math.floor(i / 100) * 6 - 30);
    case 'WaveX': return new THREE.Vector3(i % 150 - 75, Math.sin(i * 0.1) * 30, 0);
    case 'WaveY': return new THREE.Vector3(Math.sin(i * 0.1) * 30, i % 150 - 75, 0);
    case 'WaveZ': return new THREE.Vector3(0, Math.sin(i * 0.1) * 30, i % 150 - 75);
    case 'TorusRing': return new THREE.Vector3(Math.cos(i * 0.05) * 40, Math.sin(i * 0.05) * 40, Math.sin(i * 0.1) * 10);
    case 'Star': return new THREE.Vector3((i % 2 == 0 ? 1.5 : 1) * Math.cos(i * 0.1) * 40, (i % 2 == 0 ? 1.5 : 1) * Math.sin(i * 0.1) * 40, 0);
    default: return goldenSphere(i, numBoids);
  }
}

function goldenSphere(i, n, radius = 60) {
  const phi = Math.acos(1 - 2 * (i + 0.5) / n);
  const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);
  return new THREE.Vector3(
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.sin(phi) * Math.sin(theta),
    radius * Math.cos(phi)
  );
}

function animate() {
  requestAnimationFrame(animate);
  updateBoids();
  renderer.render(scene, camera);
}

function updateBoids() {
  boids.forEach((boid, i) => {
    const force = new THREE.Vector3();
    const target = generateShapePosition(i, activeShape);
    force.add(target.sub(boid.position).multiplyScalar(0.05));

    boid.velocity.multiplyScalar(0.9);
    boid.velocity.add(force);
    boid.velocity.clampLength(0, 2);
    boid.position.add(boid.velocity);
  });
}
