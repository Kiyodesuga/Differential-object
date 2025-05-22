
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

let scene, camera, renderer;
const numParticles = 1500;
const particles = [];
let activeShape = 'A';
let clock = new THREE.Clock();

const shapeMap = {
  A: 'Splash', B: 'StormSpiral', C: 'FireCrack', D: 'PulseWave', E: 'MagneticPull',
  F: 'CrystalBloom', G: 'RainField', H: 'SmokeRise', I: 'EnergyCore', J: 'ExplosionRing',
  K: 'RippleMirror', L: 'ElectricArc', M: 'FloatChaos', N: 'LightBurst', O: 'CoreGravity',
  P: 'SandTwist', Q: 'PlasmaVibe', R: 'SonicWave', S: 'MeteorCrack', T: 'BloomFade',
  U: 'ShadowPulse', V: 'EchoSpikes', W: 'FireTrail', X: 'VortexDrop', Y: 'AuroraDance', Z: 'MagneticDisperse'
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
      currentColor = colors[Math.floor(Math.random() * colors.length)];
      particles.forEach(p => {
        p.material.color.set(currentColor);
        p.material.emissive.set(currentColor);
      });
    }
  });

  
  window.addEventListener('click', () => {
    const keys = Object.keys(shapeMap).filter(k => k !== activeShape);
    activeShape = keys[Math.floor(Math.random() * keys.length)];
    currentColor = colors[Math.floor(Math.random() * colors.length)];
    particles.forEach(p => {
      p.material.color.set(currentColor);
      p.material.emissive.set(currentColor);
    });
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

function getCoreTarget(i, shape) {
  const r = 60;
  const phi = Math.acos(1 - 2 * (i + 0.5) / numParticles);
  const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);
  return new THREE.Vector3(
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.sin(phi) * Math.sin(theta),
    r * Math.cos(phi)
  );
}

function getFieldForce(pos, shape, time, i) {
  const dist = pos.length();
  const dir = pos.clone().normalize();
  let f = new THREE.Vector3();

  switch (shape) {
    case 'Splash':
      f = dir.multiplyScalar(Math.sin(time * 4 + i * 0.1) * 0.5); break;
    case 'StormSpiral':
      f = new THREE.Vector3(
        Math.sin(i * 0.1 + time) * 1.5,
        Math.cos(i * 0.1 + time) * 1.5,
        Math.sin(time + i * 0.03) * 2
      ); break;
    case 'PulseWave':
      f = dir.multiplyScalar(Math.sin(dist * 0.1 - time * 4) * 1.5); break;
    case 'FireCrack':
      f = new THREE.Vector3(
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 8
      ).multiplyScalar(0.2); break;
    case 'MagneticPull':
      f = dir.negate().multiplyScalar(0.3); break;
    case 'CrystalBloom':
      f = new THREE.Vector3(
        Math.sin(i * 0.5 + time) * 0.4,
        Math.cos(i * 0.5 + time) * 0.4,
        Math.sin(i * 0.3 + time) * 0.4
      ); break;
    default:
      f = new THREE.Vector3(0, 0, 0); break;
  }
  return f;
}

function animate() {
  requestAnimationFrame(animate);
  updateParticles();
  renderer.render(scene, camera);
}

function updateParticles() {
  const time = clock.getElapsedTime();
  particles.forEach((p, i) => {
    const coreTarget = getCoreTarget(i, activeShape);
    const toCore = coreTarget.clone().sub(p.position).multiplyScalar(0.02);
    const fieldEffect = getFieldForce(p.position, shapeMap[activeShape], time, i);
    p.velocity.add(toCore).add(fieldEffect);
    p.velocity.multiplyScalar(0.92);
    p.position.add(p.velocity);
  });
}
