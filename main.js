
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

let scene, camera, renderer, clock;
let particles = [], dragging = false, selected = null, raycaster, mouse;
const numParticles = 2250;
let activeShape = 'A';
let distortMode = false;
let currentColor;

const shapeMap = {
  A:'Sphere',B:'Spiral',C:'Torus',D:'Grid',E:'Helix',F:'StarBurst',G:'ArcLine',H:'DropTail',
  I:'CrystalCluster',J:'TwistTower',K:'ShellSpiral',L:'CrossPlane',M:'BridgeArch',N:'RingStack',
  O:'FlowerBloom',P:'VortexCore',Q:'RibbonFlow',R:'FlameRise',S:'LatticeNet',T:'FanSpread',
  U:'SpikeBall',V:'WarpFold',W:'DoubleHelix',X:'FractalTree',Y:'HeartBeatOrb',Z:'FlameWhirl'
};

const colorList = [
  0xff5733,0xffbd33,0xdfff33,0x75ff33,0x33ff57,0x33ffbd,0x33dfff,0x3375ff,0x5733ff,0xbd33ff,
  0xff33df,0xff3375,0xff3333,0x33ffaa,0x3388ff,0x8833ff,0xff8833,0x33ff88,0xaa33ff,0x33aaff
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
  const angle = i * 0.05;
  let heartbeat = 1.0;
  if (distortMode) {
    heartbeat = 1.0 + 0.3 * Math.sin(time * 5 + i * 0.01);
  }

  switch(shape) {
    case "Sphere":
      const phi = Math.acos(1 - 2 * (i + 0.5) / numParticles);
      const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);
      return new THREE.Vector3(
        heartbeat * 70 * Math.sin(phi) * Math.cos(theta),
        heartbeat * 70 * Math.sin(phi) * Math.sin(theta),
        heartbeat * 70 * Math.cos(phi)
      );
    case "Spiral":
      return new THREE.Vector3(Math.cos(angle) * i * 0.3 * heartbeat, Math.sin(angle) * i * 0.3 * heartbeat, i * 0.2 - 50);
    case "Torus":
      return new THREE.Vector3(Math.cos(angle) * 40 * heartbeat, Math.sin(angle) * 40 * heartbeat, Math.sin(angle * 2) * 10 * heartbeat);
    case "Grid":
      return new THREE.Vector3((i % 30 - 15) * 5 * heartbeat, Math.floor(i / 30) * 5 * heartbeat - 50, 0);
    case "Helix":
      return new THREE.Vector3(Math.sin(angle * 2) * 30 * heartbeat, i * 0.3 - 40, Math.cos(angle * 2) * 30 * heartbeat);
    default:
      return new THREE.Vector3(Math.cos(angle) * 50 * heartbeat, Math.sin(angle) * 50 * heartbeat, Math.sin(i * 0.1) * 20 * heartbeat);
  }
}

function updateStructure(time) {
  for (let i = 0; i < particles.length; i++) {
    if (particles[i] !== selected) {
      const shapeName = shapeMap[activeShape];
      const target = getShapePosition(i, shapeName, time);
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
