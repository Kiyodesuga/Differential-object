
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

let scene, camera, renderer;
let particles, particlePositions, particleVelocities;
let attractor = new THREE.Vector3(0, 0, 0);
let touchActive = false;

const PARTICLE_COUNT = 3000;
const SPHERE_RADIUS = 30;

function initParticles() {
    const geometry = new THREE.BufferGeometry();
    particlePositions = new Float32Array(PARTICLE_COUNT * 3);
    particleVelocities = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        const r = Math.random() * SPHERE_RADIUS;
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos(2 * Math.random() - 1);

        particlePositions[i3] = r * Math.sin(phi) * Math.cos(theta);
        particlePositions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        particlePositions[i3 + 2] = r * Math.cos(phi);

        particleVelocities[i3] = (Math.random() - 0.5) * 0.02;
        particleVelocities[i3 + 1] = (Math.random() - 0.5) * 0.02;
        particleVelocities[i3 + 2] = (Math.random() - 0.5) * 0.02;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const material = new THREE.PointsMaterial({ color: 0xffffff, size: 0.4 });
    particles = new THREE.Points(geometry, material);
    scene.add(particles);
}

function updateParticles() {
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        const pos = new THREE.Vector3(
            particlePositions[i3],
            particlePositions[i3 + 1],
            particlePositions[i3 + 2]
        );

        const dir = new THREE.Vector3().subVectors(attractor, pos);
        const dist = dir.length();
        if (touchActive && dist < 50) {
            dir.normalize().multiplyScalar(0.05);
            particleVelocities[i3] += dir.x;
            particleVelocities[i3 + 1] += dir.y;
            particleVelocities[i3 + 2] += dir.z;
        }

        particlePositions[i3] += particleVelocities[i3];
        particlePositions[i3 + 1] += particleVelocities[i3 + 1];
        particlePositions[i3 + 2] += particleVelocities[i3 + 2];
    }
    particles.geometry.attributes.position.needsUpdate = true;
}

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.z = 100;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const light = new THREE.PointLight(0xffffff, 1, 0);
    light.position.set(50, 50, 50);
    scene.add(light);

    initParticles();
    animate();

    document.addEventListener('touchstart', onTouch, false);
    document.addEventListener('touchmove', onTouch, false);
    document.addEventListener('touchend', () => { touchActive = false; }, false);
}

function onTouch(event) {
    if (event.touches.length > 0) {
        touchActive = true;
        const touch = event.touches[0];
        const x = (touch.clientX / window.innerWidth) * 2 - 1;
        const y = -(touch.clientY / window.innerHeight) * 2 + 1;
        const vec = new THREE.Vector3(x, y, 0.5).unproject(camera);
        attractor.copy(vec);
    }
}

function animate() {
    requestAnimationFrame(animate);
    updateParticles();
    renderer.render(scene, camera);
}

init();
