import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

let scene, camera, renderer, boids = [];
const numBoids = 200;

init();
animate();

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 50;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  for (let i = 0; i < numBoids; i++) {
    const geometry = new THREE.SphereGeometry(0.5, 8, 8);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    const boid = new THREE.Mesh(geometry, material);
    boid.position.set(
      (Math.random() - 0.5) * 100,
      (Math.random() - 0.5) * 100,
      (Math.random() - 0.5) * 100
    );
    boid.velocity = new THREE.Vector3(
      (Math.random() - 0.5),
      (Math.random() - 0.5),
      (Math.random() - 0.5)
    );
    scene.add(boid);
    boids.push(boid);
  }

  window.addEventListener('resize', onWindowResize);
}

function animate() {
  requestAnimationFrame(animate);
  updateBoids();
  renderer.render(scene, camera);
}

function updateBoids() {
  boids.forEach((boid, i) => {
    const sep = new THREE.Vector3();
    const ali = new THREE.Vector3();
    const coh = new THREE.Vector3();
    let neighborCount = 0;

    boids.forEach((other, j) => {
      if (i === j) return;
      const dist = boid.position.distanceTo(other.position);
      if (dist < 15) {
        const diff = new THREE.Vector3().subVectors(boid.position, other.position).normalize().divideScalar(dist);
        sep.add(diff);
        ali.add(other.velocity);
        coh.add(other.position);
        neighborCount++;
      }
    });

    if (neighborCount > 0) {
      ali.divideScalar(neighborCount);
      coh.divideScalar(neighborCount).sub(boid.position);
    }

    boid.velocity.add(sep.multiplyScalar(1.5));
    boid.velocity.add(ali.multiplyScalar(1.0));
    boid.velocity.add(coh.multiplyScalar(0.8));
    boid.velocity.clampLength(0, 2);
    boid.position.add(boid.velocity);
  });
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
