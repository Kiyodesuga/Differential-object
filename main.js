
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

let scene, camera, renderer, raycaster, mouse;
const numParticles = 2250;
const particles = [];
let activeShape = 'A';
let clock = new THREE.Clock();
let distortMode = false;
let dragging = false;
let selectedParticle = null;

const shapeMap = {
  A:'Sphere',B:'Torus',C:'Spiral',D:'WaveX',E:'WaveY',F:'WaveZ',G:'Grid',H:'Vortex',I:'Star',J:'Helix',
  K:'Drop',L:'Cross',M:'Arc',N:'Ring',O:'Bloom',P:'Shard',Q:'Float',R:'Twist',S:'Wrap',T:'Stack',
  U:'Fan',V:'Pipe',W:'Shell',X:'Lattice',Y:'Fractal',Z:'Burst'
};

init();
animate();

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.z = 200;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  const light = new THREE.PointLight(0xffffff, 2, 500);
  light.position.set(0, 0, 100);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0x222222));

  for (let i = 0; i < numParticles; i++) {
    const geo = new THREE.SphereGeometry(0.3, 8, 8);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 1.0,
      transparent: true,
      opacity: 0.8
    });
    const p = new THREE.Mesh(geo, mat);
    p.position.set((Math.random() - 0.5) * 300, (Math.random() - 0.5) * 300, (Math.random() - 0.5) * 300);
    p.velocity = new THREE.Vector3();
    particles.push(p);
    scene.add(p);
  }

  window.addEventListener('resize', onResize);
  window.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('click', onClick);
  window.addEventListener('keydown', (e) => {
    const key = e.key.toUpperCase();
    if (shapeMap[key]) activeShape = key;
  });

  document.getElementById('distortModeBtn').addEventListener('click', () => {
    distortMode = !distortMode;
    const btn = document.getElementById('distortModeBtn');
    btn.classList.toggle('active', distortMode);
  });
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onPointerDown(event) {
  if (!distortMode) return;
  setMouse(event);
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(particles);
  if (intersects.length > 0) {
    selectedParticle = intersects[0].object;
    dragging = true;
  }
}

function onPointerUp() {
  dragging = false;
  selectedParticle = null;
}

function onPointerMove(event) {
  if (!dragging || !selectedParticle) return;
  setMouse(event);
  raycaster.setFromCamera(mouse, camera);
  const point = raycaster.ray.origin.clone().add(raycaster.ray.direction.clone().multiplyScalar(30));
  selectedParticle.position.lerp(point, 0.3); // Smooth move
}

function onClick() {
  if (distortMode) return; // skip click logic if dragging
  const keys = Object.keys(shapeMap).filter(k => k !== activeShape);
  activeShape = keys[Math.floor(Math.random() * keys.length)];
}

function setMouse(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function getShapePosition(i, shape) {
  const radius = 70;
  const phi = Math.acos(1 - 2 * (i + 0.5) / numParticles);
  const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);
  switch (shape) {
    case 'Torus': return new THREE.Vector3(Math.cos(theta) * 40, Math.sin(theta) * 40, Math.sin(phi) * 20);
    case 'Spiral': return new THREE.Vector3(i * 0.1 * Math.cos(i * 0.05), i * 0.1 * Math.sin(i * 0.05), i * 0.02 - 20);
    case 'WaveX': return new THREE.Vector3(i % 75 - 37, Math.sin(i * 0.1) * 20, 0);
    case 'WaveY': return new THREE.Vector3(Math.sin(i * 0.1) * 20, i % 75 - 37, 0);
    case 'Grid': return new THREE.Vector3((i % 15 - 7) * 6, Math.floor(i / 15 % 10) * 6 - 30, Math.floor(i / 150) * 6 - 30);
    default:
      return new THREE.Vector3(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi)
      );
  }
}

function animate() {
  requestAnimationFrame(animate);
  updateParticles();
  renderer.render(scene, camera);
}

function updateParticles() {
  particles.forEach((p, i) => {
    const target = getShapePosition(i, shapeMap[activeShape]);
    const toTarget = target.clone().sub(p.position).multiplyScalar(0.03);
    if (!dragging || p !== selectedParticle) {
      p.velocity.add(toTarget);
      p.velocity.multiplyScalar(0.90);
      p.position.add(p.velocity);
    }
  });
}
