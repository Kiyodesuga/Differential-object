
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

let scene, camera, renderer, clock;
let particles = [], dragging = false, selected = null, raycaster, mouse;
const numParticles = 2250;
let activeShape = 'A';
let distortMode = false;

const shapeMap = {
  A:'Sphere',B:'Torus',C:'Spiral',D:'WaveX',E:'WaveY',F:'WaveZ',G:'Grid',H:'Vortex',
  I:'Star',J:'Helix',K:'Drop',L:'Cross',M:'Arc',N:'Ring',O:'Bloom',P:'Shard',
  Q:'Float',R:'Twist',S:'Wrap',T:'Stack',U:'Fan',V:'Pipe',W:'Shell',X:'Lattice',Y:'Fractal',Z:'Burst'
};
const pulseShapes = ['A','C','E','G','I','K','M','O','Q','S','U','W','Y'];
const smoothShapes = ['B','D','F','H','J','L','N','P','R','T','V','X','Z'];

init();
animate();

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 140;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  clock = new THREE.Clock();
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  const geometry = new THREE.SphereGeometry(0.3, 8, 8);
  const color = new THREE.Color(0x33ffaa);
  const material = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 1.2,
    transparent: true,
    opacity: 0.85
  });

  for (let i = 0; i < numParticles; i++) {
    const mesh = new THREE.Mesh(geometry, material.clone());
    scene.add(mesh);
    particles.push(mesh);
  }

  const light = new THREE.PointLight(0xffffff, 1.8);
  light.position.set(0, 0, 100);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0x222222));

  document.getElementById('distortModeBtn').addEventListener('click', () => {
    distortMode = !distortMode;
    const btn = document.getElementById('distortModeBtn');
    btn.classList.toggle('active', distortMode);
  });

  window.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', () => { dragging = false; selected = null; });
  window.addEventListener('click', onClick);
}

function onPointerDown(e) {
  if (!distortMode) return;
  setMouse(e);
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(particles);
  if (intersects.length > 0) {
    selected = intersects[0].object;
    dragging = true;
  }
}

function onPointerMove(e) {
  if (!dragging || !selected) return;
  setMouse(e);
  raycaster.setFromCamera(mouse, camera);
  const point = raycaster.ray.origin.clone().add(raycaster.ray.direction.clone().multiplyScalar(30));
  selected.position.lerp(point, 0.3);
}

function onClick() {
  if (distortMode) return;
  const keys = Object.keys(shapeMap).filter(k => k !== activeShape);
  const next = keys[Math.floor(Math.random() * keys.length)];
  activeShape = next;
}

function setMouse(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function getShapePosition(i, shape, time) {
  const radius = 70;
  const phi = Math.acos(1 - 2 * (i + 0.5) / numParticles);
  const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);
  let offset = 1.0;

  if (pulseShapes.includes(activeShape)) {
    offset = 1.0 + 0.1 * Math.sin(time * 3 + i * 0.01);
  } else if (smoothShapes.includes(activeShape)) {
    offset = 1.0 + 0.05 * Math.sin(i * 0.3 + time * 2);
  }

  switch (shape) {
    case 'Torus': return new THREE.Vector3(Math.cos(theta) * 40 * offset, Math.sin(theta) * 40 * offset, Math.sin(phi) * 20);
    case 'Spiral': return new THREE.Vector3(i * 0.1 * Math.cos(i * 0.05) * offset, i * 0.1 * Math.sin(i * 0.05) * offset, i * 0.02 - 20);
    case 'WaveX': return new THREE.Vector3(i % 75 - 37, Math.sin(i * 0.1 + time) * 20 * offset, 0);
    case 'WaveY': return new THREE.Vector3(Math.sin(i * 0.1 + time) * 20 * offset, i % 75 - 37, 0);
    case 'Grid': return new THREE.Vector3((i % 15 - 7) * 6, Math.floor(i / 15 % 10) * 6 - 30, Math.floor(i / 150) * 6 - 30);
    default:
      return new THREE.Vector3(
        radius * Math.sin(phi) * Math.cos(theta) * offset,
        radius * Math.sin(phi) * Math.sin(theta) * offset,
        radius * Math.cos(phi) * offset
      );
  }
}

function updateStructure(time) {
  for (let i = 0; i < particles.length; i++) {
    if (particles[i] !== selected) {
      const target = getShapePosition(i, shapeMap[activeShape], time);
      particles[i].position.lerp(target, 0.1);
    }
  }
}

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();
  updateStructure(t);
  renderer.render(scene, camera);
}
