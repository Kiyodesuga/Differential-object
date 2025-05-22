import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

let scene, camera, renderer;
const boids = [];
const numBoids = 300;
let stage = 0;
let mouse = new THREE.Vector2();
let targetCenter = new THREE.Vector3();
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

  const light = new THREE.PointLight(0xffffff, 2, 500);
  light.position.set(0, 0, 100);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0x222222));

  for (let i = 0; i < numBoids; i++) {
    const geo = new THREE.SphereGeometry(0.25, 8, 8);
    const mat = new THREE.MeshStandardMaterial({ 
      color: 0x88ccff, 
      emissive: 0x4488ff, 
      emissiveIntensity: 1.5,
      metalness: 0.3, 
      roughness: 0.4 
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(
      (Math.random() - 0.5) * 200,
      (Math.random() - 0.5) * 200,
      (Math.random() - 0.5) * 200
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
  window.addEventListener('keydown', onKeyDown);
}

function onResize() {
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onKeyDown(event) {
  if (event.key === ' ') {
    stage = (stage + 1) % 3;
    if (stage === 1) {
      targetCenter.set(0, 0, 0);  // 固まりの中心
    }
  }
}

function animate() {
  requestAnimationFrame(animate);
  updateBoids();
  renderer.render(scene, camera);
}

function updateBoids() {
  boids.forEach((boid, i) => {
    const force = new THREE.Vector3();

    if (stage === 1) {
      const target = targetCenter.clone().add(new THREE.Vector3(
        Math.sin(i) * 20,
        Math.cos(i * 1.5) * 20,
        Math.sin(i * 0.3) * 20
      ));
      force.add(target.sub(boid.position).multiplyScalar(0.01));
    } else if (stage === 2) {
      const spread = new THREE.Vector3(
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100
      );
      force.add(spread.sub(boid.position).multiplyScalar(0.002));
    }

    boid.velocity.add(force);
    boid.velocity.clampLength(0.5, 2);
    boid.position.add(boid.velocity);
  });
}
