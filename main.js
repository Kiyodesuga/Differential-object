
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

let scene, camera, renderer;
const boids = [];
const numBoids = 300;
let stage = 0;
let mouse = new THREE.Vector2();
let targetCenter = new THREE.Vector3();
let clock = new THREE.Clock();
let activeShape = 'none';

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
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onKeyDown(event) {
  const key = event.key.toUpperCase();
  if (key === ' ') {
    stage = (stage + 1) % 3;
    if (stage === 1) targetCenter.set(0, 0, 0);
  }
  if (key >= 'A' && key <= 'Z') activeShape = key;
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

    switch (activeShape) {
      case 'A': force.y += Math.sin(time * 2 + i * 0.1) * 0.1; break;
      case 'B': force.add(new THREE.Vector3(Math.sin(i * 0.2) * 30, Math.cos(i * 0.2) * 30, 0).sub(boid.position).multiplyScalar(0.005)); break;
      case 'C': force.add(new THREE.Vector3(Math.sin(i * 0.1) * i * 0.1, Math.cos(i * 0.1) * i * 0.1, i * 0.05).sub(boid.position).multiplyScalar(0.01)); break;
      case 'D': force.add(boid.position.clone().normalize().multiplyScalar(0.2)); break;
      case 'E': force.y += (i % 10) * 0.5; break;
      case 'F': force.x += Math.sin(time + i) * 0.05; force.y += Math.cos(time + i) * 0.05; break;
      case 'G': force.add(new THREE.Vector3(0, -1, 0).multiplyScalar(0.5)); break;
      case 'H': force.add(new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(2)); break;
      case 'I': force.y += Math.sin(time * 4) * 0.2; break;
      case 'J': force.x += ((i % 2 === 0) ? 1 : -1) * 0.3; force.y += ((i % 3 === 0) ? 1 : -1) * 0.3; break;
      case 'K': {
        const angle = time + i * 0.1;
        const radius = 30;
        const center = new THREE.Vector3(0, 0, 0);
        const target = new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
        force.add(target.sub(boid.position).multiplyScalar(0.01));
        break;
      }
      case 'L': {
        const x = (i % 10) * 5 - 25;
        const y = (Math.floor(i / 10) % 10) * 5 - 25;
        const z = (Math.floor(i / 100)) * 5 - 5;
        const target = new THREE.Vector3(x, y, z);
        force.add(target.sub(boid.position).multiplyScalar(0.02));
        break;
      }
      case 'M': {
        const mx = (mouse.x) * 100;
        const my = (mouse.y) * 100;
        const target = new THREE.Vector3(mx, my, 0);
        force.add(target.sub(boid.position).multiplyScalar(0.01));
        break;
      }
      case 'N': force.add(new THREE.Vector3(Math.sin(i + time) * 40, Math.cos(i + time) * 40, 0).sub(boid.position).multiplyScalar(0.01)); break;
      case 'O': force.add(boid.position.clone().normalize().multiplyScalar(-0.3)); break;
      case 'P': force.z += Math.sin(time + i * 0.2) * 0.3; break;
      case 'Q': force.set(0, i * 0.5 - 75, 0).sub(boid.position).multiplyScalar(0.01); break;
      case 'R': force.x += 1.0; break;
      case 'S': force.set(Math.sin(i * 0.1) * 30, Math.cos(i * 0.1) * 30, 0).sub(boid.position).multiplyScalar(0.01); break;
      case 'T': force.add(new THREE.Vector3(((i % 2) * 2 - 1) * 30, 0, 0)); break;
      case 'U': {
        const angle = Math.PI * (i / numBoids);
        const target = new THREE.Vector3(Math.sin(angle) * 40, Math.cos(angle) * 20 - 20, 0);
        force.add(target.sub(boid.position).multiplyScalar(0.01));
        break;
      }
      case 'V': force.set((i % 150) - 75, Math.abs((i % 150) - 75), 0).sub(boid.position).multiplyScalar(0.01); break;
      case 'W': force.y += Math.sin(i + time * 5) * 0.3; break;
      case 'X': {
        const sign = i % 2 === 0 ? 1 : -1;
        force.set(sign * (i % 15) * 2, sign * (i % 15) * 2, 0).sub(boid.position).multiplyScalar(0.01);
        break;
      }
      case 'Y': {
        const yMod = i % 3;
        const target = new THREE.Vector3(
          (yMod - 1) * 30,
          60 - (i % 100) * 1.2,
          0
        );
        force.add(target.sub(boid.position).multiplyScalar(0.01));
        break;
      }
      case 'Z': {
        const target = new THREE.Vector3(i % 30, Math.floor(i / 30) % 2 === 0 ? i % 30 : 30 - (i % 30), 0);
        force.add(target.sub(boid.position).multiplyScalar(0.05));
        break;
      }
    }

    boid.velocity.add(force);
    boid.velocity.clampLength(0.5, 2);
    boid.position.add(boid.velocity);
  });
}
