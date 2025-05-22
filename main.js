
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

let scene, camera, renderer;
const numParticles = 2250;
const particles = [];
let activeShape = 'A';
let clock = new THREE.Clock();
let distortMode = false;

const shapeMap = {
  A: 'Sphere', B: 'Torus', C: 'Spiral', D: 'WaveX', E: 'WaveY',
  F: 'WaveZ', G: 'Grid', H: 'Vortex', I: 'Star', J: 'Helix',
  K: 'Drop', L: 'Cross', M: 'Arc', N: 'Ring', O: 'Bloom',
  P: 'Shard', Q: 'Float', R: 'Twist', S: 'Wrap', T: 'Stack',
  U: 'Fan', V: 'Pipe', W: 'Shell', X: 'Lattice', Y: 'Fractal', Z: 'Burst'
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
  camera.position.z = 180;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const light = new THREE.PointLight(0xffffff, 2, 500);
  light.position.set(0, 0, 100);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0x222222));

  for (let i = 0; i < numParticles; i++) {
    const geometry = new THREE.SphereGeometry(0.3, 8, 8);
    const material = new THREE.MeshStandardMaterial({
      color: currentColor,
      emissive: currentColor,
      emissiveIntensity: 1.0,
      transparent: true,
      opacity: 0.8
    });
    const particle = new THREE.Mesh(geometry, material);
    particle.position.set((Math.random() - 0.5) * 300, (Math.random() - 0.5) * 300, (Math.random() - 0.5) * 300);
    particle.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2
    );
    particles.push(particle);
    scene.add(particle);
  }

  window.addEventListener('keydown', (e) => {
    const key = e.key.toUpperCase();
    if (shapeMap[key]) {
      activeShape = key;
      changeColor();
    }
  });

  window.addEventListener('click', () => {
    if (!distortMode) {
      const keys = Object.keys(shapeMap).filter(k => k !== activeShape);
      activeShape = keys[Math.floor(Math.random() * keys.length)];
      changeColor();
    } else {
      distortShape();
    }
  });

  document.getElementById('distortModeBtn').addEventListener('click', () => {
    distortMode = !distortMode;
    document.getElementById('distortModeBtn').innerText = distortMode ? '🔧 変形モード ON' : '🔧 変形モード OFF';
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

function changeColor() {
  currentColor = colors[Math.floor(Math.random() * colors.length)];
  particles.forEach(p => {
    p.material.color.set(currentColor);
    p.material.emissive.set(currentColor);
  });
}

function distortShape() {
  for (let i = 0; i < numParticles; i++) {
    const p = particles[i];
    const noise = new THREE.Vector3(
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 20
    );
    p.position.add(noise);
  }
}

function getCoreTarget(i, shape) {
  const scale = 70;
  const phi = Math.acos(1 - 2 * (i + 0.5) / numParticles);
  const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);
  return new THREE.Vector3(
    scale * Math.sin(phi) * Math.cos(theta),
    scale * Math.sin(phi) * Math.sin(theta),
    scale * Math.cos(phi)
  );
}

function animate() {
  requestAnimationFrame(animate);
  updateParticles();
  renderer.render(scene, camera);
}

function updateParticles() {
  const time = clock.getElapsedTime();
  particles.forEach((p, i) => {
    const target = getCoreTarget(i, shapeMap[activeShape]);
    const toTarget = target.clone().sub(p.position).multiplyScalar(0.02);
    p.velocity.add(toTarget);
    p.velocity.multiplyScalar(0.90);
    p.position.add(p.velocity);
  });
}
