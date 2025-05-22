import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

let scene, camera, renderer;
const boids = [];
const numBoids = 300;
let targetShape = 'none';
let interactionCount = 0;
let mouse = new THREE.Vector2();
let mouseDownPos = new THREE.Vector3();
let clock = new THREE.Clock();

init();
animate();

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.z = 120;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(1, 1, 1);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0x404040));

  for (let i = 0; i < numBoids; i++) {
    const geo = new THREE.SphereGeometry(0.5, 8, 8);
    const mat = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff, metalness: 0.5 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set((Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100);
    mesh.velocity = new THREE.Vector3((Math.random() - 0.5), (Math.random() - 0.5), (Math.random() - 0.5));
    boids.push(mesh);
    scene.add(mesh);
  }

  window.addEventListener('resize', onResize);
  window.addEventListener('click', onClick);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('keydown', onKeyDown);
}

function onResize() {
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onClick(event) {
  const x = (event.clientX / window.innerWidth) * 2 - 1;
  const y = -(event.clientY / window.innerHeight) * 2 + 1;
  mouse.set(x, y);
  const vector = new THREE.Vector3(mouse.x, mouse.y, 0.5).unproject(camera);
  targetShape = ['sphere', 'cube', 'pyramid'][interactionCount % 3];
  mouseDownPos.copy(vector);
  interactionCount++;
}

function onMouseMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onKeyDown(event) {
  if (event.key === '1') targetShape = 'sphere';
  if (event.key === '2') targetShape = 'humanoid';
  if (event.key === '3') targetShape = 'wall';
}

function animate() {
  requestAnimationFrame(animate);
  updateBoids();
  renderer.render(scene, camera);
}

function updateBoids() {
  const time = clock.getElapsedTime();

  boids.forEach((boid, i) => {
    const force = new THREE.Vector3();

    if (targetShape === 'sphere') {
      const phi = Math.acos(1 - 2 * i / numBoids);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const r = 30;
      const target = new THREE.Vector3(
        mouseDownPos.x + r * Math.cos(theta) * Math.sin(phi),
        mouseDownPos.y + r * Math.sin(theta) * Math.sin(phi),
        mouseDownPos.z + r * Math.cos(phi)
      );
      force.add(target.sub(boid.position).multiplyScalar(0.02));
    }

    if (targetShape === 'cube') {
      const cubeSize = 40;
      const x = (i % 10) * 5 - cubeSize / 2;
      const y = (Math.floor(i / 10) % 10) * 5 - cubeSize / 2;
      const z = (Math.floor(i / 100)) * 5 - cubeSize / 2;
      const target = new THREE.Vector3(mouseDownPos.x + x, mouseDownPos.y + y, mouseDownPos.z + z);
      force.add(target.sub(boid.position).multiplyScalar(0.02));
    }

    if (targetShape === 'pyramid') {
      const level = Math.floor(Math.pow(6 * i, 1/3));
      const row = i % (level + 1);
      const x = row * 5 - level * 2.5;
      const y = -level * 5;
      const z = 0;
      const target = new THREE.Vector3(mouseDownPos.x + x, mouseDownPos.y + y, mouseDownPos.z + z);
      force.add(target.sub(boid.position).multiplyScalar(0.02));
    }

    const center = new THREE.Vector3(mouse.x, mouse.y, 0.5).unproject(camera);
    const toCenter = new THREE.Vector3().subVectors(center, boid.position);
    const swirl = new THREE.Vector3(-toCenter.y, toCenter.x, 0).multiplyScalar(0.001);
    force.add(swirl);

    boid.velocity.add(force);
    boid.velocity.clampLength(0.5, 2);
    boid.position.add(boid.velocity);
  });
}
