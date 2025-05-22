import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

let scene, camera, renderer;
const boids = [];
const numBoids = 300;

init();
animate();

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.z = 100;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  for (let i = 0; i < numBoids; i++) {
    const geometry = new THREE.IcosahedronGeometry(0.8, 0);
    const material = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff, roughness: 0.5, metalness: 1 });
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

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(50, 50, 50).normalize();
  scene.add(light);

  const ambient = new THREE.AmbientLight(0x404040);
  scene.add(ambient);

  window.addEventListener('resize', onWindowResize);
}

function animate() {
  requestAnimationFrame(animate);
  updateBoids();
  renderer.render(scene, camera);
}

function updateBoids() {
  boids.forEach((boid, i) => {
    const separation = new THREE.Vector3();
    const alignment = new THREE.Vector3();
    const cohesion = new THREE.Vector3();
    let count = 0;

    boids.forEach((other, j) => {
      if (i === j) return;
      const dist = boid.position.distanceTo(other.position);
      if (dist < 20) {
        const diff = new THREE.Vector3().subVectors(boid.position, other.position).normalize().divideScalar(dist);
        separation.add(diff);
        alignment.add(other.velocity);
        cohesion.add(other.position);
        count++;
      }
    });

    if (count > 0) {
      alignment.divideScalar(count);
      cohesion.divideScalar(count).sub(boid.position);
    }

    boid.velocity.add(separation.multiplyScalar(1.5));
    boid.velocity.add(alignment.multiplyScalar(1.0));
    boid.velocity.add(cohesion.multiplyScalar(0.9));
    boid.velocity.clampLength(0.5, 2.5);
    boid.position.add(boid.velocity);
  });
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
