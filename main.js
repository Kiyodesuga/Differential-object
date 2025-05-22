
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

let scene, camera, renderer, clock;
let particles = [], dragging = false, selected = null, raycaster, mouse;
const numParticles = 2250;
let activeShape = 'A';  // 初期状態：球体
let distortMode = false;
let currentColor;

const shapeMap = {
  A:'Sphere',B:'Torus',C:'Spiral',D:'WaveX',E:'WaveY',F:'GridShell',G:'Grid',H:'SpiralShell',
  I:'Star',J:'TwistTower',K:'Drop',L:'ArcLine',M:'Bridge',N:'RingGrid',O:'BloomFan',P:'ShardField',
  Q:'FloatSwirl',R:'FlowerRing',S:'WrapHelix',T:'StackBlock',U:'FanWeb',V:'PipeArray',
  W:'ShellSpiral',X:'LatticeFlow',Y:'FractalSphere',Z:'BurstSpine'
};

const colorList = [
  0xff5733,0xffbd33,0xdfff33,0x75ff33,0x33ff57,0x33ffbd,0x33dfff,0x3375ff,0x5733ff,0xbd33ff,
  0xff33df,0xff3375,0xff3333,0x33ffaa,0x3388ff,0x8833ff,0xff8833,0x33ff88,0xaa33ff,0x33aaff,
  0x44ff44,0xff4444,0x44ffff,0xffff44,0x8877ff,0x9988aa,0xccff88,0x88ccff,0xdd99ff,0xff99dd,
  0xffaa33,0xaaff33,0x33ffaa,0x33aaff,0xaa33ff,0xff33aa,0x33ff33,0x4444ff,0xff4444,0xffdd33
];

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
  currentColor = new THREE.Color(colorList[Math.floor(Math.random() * colorList.length)]);

  for (let i = 0; i < numParticles; i++) {
    const material = new THREE.MeshStandardMaterial({
      color: currentColor,
      emissive: currentColor,
      emissiveIntensity: 1.2,
      transparent: true,
      opacity: 0.85
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    particles.push(mesh);
  }

  const light = new THREE.PointLight(0xffffff, 1.8);
  light.position.set(0, 0, 100);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0x222222));

  document.getElementById('distortModeBtn').addEventListener('click', () => {
    distortMode = !distortMode;
    document.getElementById('distortModeBtn').classList.toggle('active', distortMode);
  });

  window.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', () => { dragging = false; selected = null; });
  window.addEventListener('click', () => { changeToRandomShape(); });
  window.addEventListener('keydown', onKeyDown);
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

function onKeyDown(e) {
  const key = e.key.toUpperCase();
  if (shapeMap[key]) {
    activeShape = key;
    changeColor();
  }
}

function setMouse(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function changeColor() {
  currentColor = new THREE.Color(colorList[Math.floor(Math.random() * colorList.length)]);
  particles.forEach(p => {
    p.material.color.set(currentColor);
    p.material.emissive.set(currentColor);
  });
}

function changeToRandomShape() {
  const keys = Object.keys(shapeMap).filter(k => k !== activeShape);
  activeShape = keys[Math.floor(Math.random() * keys.length)];
  changeColor();
}

function getShapePosition(i, shape, time) {
  const radius = 70;
  const phi = Math.acos(1 - 2 * (i + 0.5) / numParticles);
  const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);
  let offset = 1.0;

  if (distortMode) {
    offset = 1.0 + 0.2 * Math.sin(time * 3 + i * 0.01);
  }

  switch (shape) {
    case 'Torus': return new THREE.Vector3(Math.cos(theta) * 40, Math.sin(theta) * 40, Math.sin(phi) * 20);
    case 'Spiral': return new THREE.Vector3(i * 0.1 * Math.cos(i * 0.05), i * 0.1 * Math.sin(i * 0.05), i * 0.02 - 20);
    case 'WaveX': return new THREE.Vector3(i % 75 - 37, Math.sin(i * 0.1 + time) * 20, 0);
    case 'WaveY': return new THREE.Vector3(Math.sin(i * 0.1 + time) * 20, i % 75 - 37, 0);
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
