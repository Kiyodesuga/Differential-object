import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

let scene, camera, renderer;
const boids = [];
const numBoids = 1500;
let activeShape = 'O';
let clock = new THREE.Clock();

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
    const geo = new THREE.SphereGeometry(0.15, 6, 6);
    const mat = new THREE.MeshStandardMaterial({ 
      color: 0x88ccff, 
      emissive: 0x4488ff, 
      emissiveIntensity: 1.2,
      metalness: 0.2,
      roughness: 0.4,
      transparent: true,
      opacity: 0.7
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(
      (Math.random() - 0.5) * 300,
      (Math.random() - 0.5) * 300,
      (Math.random() - 0.5) * 300
    );
    mesh.velocity = new THREE.Vector3(
      (Math.random() - 0.5),
      (Math.random() - 0.5),
      (Math.random() - 0.5)
    );
    boids.push(mesh);
    scene.add(mesh);
  }

  window.addEventListener('resize', onResize);
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function goldenSpherePosition(i, n, radius = 60) {
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
  const time = clock.getElapsedTime();

  boids.forEach((boid, i) => {
    const force = new THREE.Vector3();

    if (activeShape === 'O') {
      const target = goldenSpherePosition(i, numBoids);
      const toTarget = target.sub(boid.position).multiplyScalar(0.05);
      force.add(toTarget);
    }

    // 摩擦減衰
    boid.velocity.multiplyScalar(0.95);
    boid.velocity.add(force);
    boid.velocity.clampLength(0, 2);
    boid.position.add(boid.velocity);
  });
}
