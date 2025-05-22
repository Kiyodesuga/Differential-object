
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

let scene, camera, renderer;
const boids = [];
const numBoids = 1500;
let activeShape = 'A';
let clock = new THREE.Clock();
let shapeMap = {};

const azShapes = {
  A: 'Splash',
  B: 'StormSpiral',
  C: 'FireCrack',
  D: 'PulseWave',
  E: 'MagneticPull',
  F: 'CrystalBloom',
  G: 'RainField',
  H: 'SmokeRise',
  I: 'EnergyCore',
  J: 'ExplosionRing',
  K: 'RippleMirror',
  L: 'ElectricArc',
  M: 'FloatChaos',
  N: 'LightBurst',
  O: 'CoreGravity',
  P: 'SandTwist',
  Q: 'PlasmaVibe',
  R: 'SonicWave',
  S: 'MeteorCrack',
  T: 'BloomFade',
  U: 'ShadowPulse',
  V: 'EchoSpikes',
  W: 'FireTrail',
  X: 'VortexDrop',
  Y: 'AuroraDance',
  Z: 'MagneticDisperse'
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
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
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
  window.addEventListener('keydown', (e) => {{
    const key = e.key.toUpperCase();
    if (key >= 'A' && key <= 'Z') {{
      activeShape = key;
      changeColor();
    }}
  }});
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function changeColor() {
  currentColor = colors[Math.floor(Math.random() * colors.length)];
  boids.forEach(b => {
    b.material.color.set(currentColor);
    b.material.emissive.set(currentColor);
  });
}

function getDynamicForce(shape, boid, i, time) {
  const pos = boid.position.clone();
  const center = new THREE.Vector3(0, 0, 0);
  const dist = pos.distanceTo(center);
  const force = new THREE.Vector3();

  switch (shape) {
    case 'Splash':
      return pos.clone().normalize().multiplyScalar(Math.sin(time * 4 + i * 0.1) * 0.6);
    case 'StormSpiral':
      return new THREE.Vector3(
        Math.sin(i * 0.1 + time) * 1.5,
        Math.cos(i * 0.1 + time) * 1.5,
        Math.sin(time + i * 0.03) * 2
      );
    case 'PulseWave':
      return pos.clone().normalize().multiplyScalar(Math.sin(dist * 0.1 - time * 4) * 2);
    case 'FireCrack':
      return new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      ).multiplyScalar(0.1);
    case 'MagneticPull':
      return center.clone().sub(pos).multiplyScalar(0.03 + Math.sin(time + i) * 0.01);
    case 'CrystalBloom':
      return new THREE.Vector3(
        Math.sin(i * 0.5) * 0.2,
        Math.cos(i * 0.5) * 0.2,
        Math.sin(i * 0.3) * 0.2
      ).multiplyScalar(time % 2 < 1 ? 2 : 0);
    
    case 'RainField':
      return new THREE.Vector3(0, -Math.abs(Math.sin(time * 5 + i * 0.1)) * 2, 0);
    case 'SmokeRise':
      return new THREE.Vector3(0, 1 + Math.sin(time + i * 0.1), Math.sin(i * 0.1) * 0.5);
    case 'EnergyCore':
      return pos.clone().normalize().multiplyScalar(Math.sin(time * 6) * 3);
    case 'ExplosionRing':
      return new THREE.Vector3(
        Math.cos(i) * Math.sin(time * 3),
        Math.sin(i) * Math.sin(time * 3),
        0
      ).multiplyScalar(2);
    case 'RippleMirror':
      return new THREE.Vector3(
        Math.sin(time * 3 + i * 0.1) * 2,
        Math.sin(time * 3 + i * 0.1) * 2,
        0
      );
    case 'ElectricArc':
      return new THREE.Vector3(
        (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * 3
      );
    case 'FloatChaos':
      return new THREE.Vector3(
        Math.sin(time + i * 0.05),
        Math.cos(time + i * 0.05),
        Math.sin(i * 0.1)
      );
    case 'LightBurst':
      return pos.clone().normalize().multiplyScalar(Math.abs(Math.sin(time * 10)) * 4);
    case 'CoreGravity':
      return center.clone().sub(pos).normalize().multiplyScalar(5 / (dist + 5));
    case 'SandTwist':
      return new THREE.Vector3(
        Math.sin(i * 0.1 + time * 2) * 2,
        Math.cos(i * 0.1 + time * 2) * 2,
        -1
      );
    case 'PlasmaVibe':
      return new THREE.Vector3(
        Math.sin(i + time * 20),
        Math.cos(i + time * 20),
        Math.sin(i + time * 20)
      ).multiplyScalar(0.5);
    case 'SonicWave':
      return pos.clone().normalize().multiplyScalar(Math.sin(time * 8 - dist * 0.3) * 2);
    case 'MeteorCrack':
      return new THREE.Vector3(
        1 + Math.sin(i + time * 5),
        -2,
        0
      );
    case 'BloomFade':
      return pos.clone().normalize().multiplyScalar((Math.sin(time * 3) + 1) * 1.5);
    case 'ShadowPulse':
      return new THREE.Vector3(
        -pos.x * Math.sin(time * 2) * 0.01,
        -pos.y * Math.sin(time * 2) * 0.01,
        -pos.z * Math.sin(time * 2) * 0.01
      );
    case 'EchoSpikes':
      return new THREE.Vector3(
        Math.sin(i * 0.3 + time * 10) * 3,
        Math.cos(i * 0.3 + time * 10) * 3,
        0
      );
    case 'FireTrail':
      return new THREE.Vector3(0, 1, 0).add(new THREE.Vector3(
        (Math.random() - 0.5) * 0.5,
        Math.random() * 2,
        (Math.random() - 0.5) * 0.5
      ));
    case 'VortexDrop':
      return new THREE.Vector3(
        -Math.sin(i * 0.1 + time) * 2,
        -Math.cos(i * 0.1 + time) * 2,
        -5
      );
    case 'AuroraDance':
      return new THREE.Vector3(
        Math.sin(i * 0.1 + time) * 2,
        Math.sin(i * 0.1 + time * 0.5) * 2,
        Math.cos(i * 0.1 + time) * 2
      );
    case 'MagneticDisperse':
      return pos.clone().normalize().multiplyScalar((Math.sin(i + time * 5) + 1) * 3);

    default:
      return new THREE.Vector3();
  }
}

function animate() {
  requestAnimationFrame(animate);
  updateBoids();
  renderer.render(scene, camera);
}

function updateBoids() {
  const t = clock.getElapsedTime();
  boids.forEach((boid, i) => {
    const force = getDynamicForce(azShapes[activeShape], boid, i, t);
    boid.velocity.add(force);
    boid.velocity.multiplyScalar(0.92);
    boid.position.add(boid.velocity);
  });
}
