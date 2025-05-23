
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

let scene, camera, renderer;
let particles, geometry, material;
let positions, velocities;
let attractors = [];
let attractorRange = 200;
const PARTICLE_COUNT = 200000;
const SPHERE_RADIUS = 250;

function initScene() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 3000);
    camera.position.z = 1000;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(200, 200, 200);
    scene.add(ambientLight, pointLight);
}

function initParticles() {
    geometry = new THREE.BufferGeometry();
    positions = new Float32Array(PARTICLE_COUNT * 3);
    velocities = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        const r = Math.pow(Math.random(), 1.5) * SPHERE_RADIUS;
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos(2 * Math.random() - 1);

        positions[i3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i3 + 2] = r * Math.cos(phi);

        velocities[i3] = (Math.random() - 0.5) * 0.05;
        velocities[i3 + 1] = (Math.random() - 0.5) * 0.05;
        velocities[i3 + 2] = (Math.random() - 0.5) * 0.05;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    material = new THREE.PointsMaterial({ color: 0xffffff, size: 0.15 });
    particles = new THREE.Points(geometry, material);
    scene.add(particles);
}

function initAttractors() {
    attractors = [
        new THREE.Vector3(-300, 200, 0),
        new THREE.Vector3(300, 200, 0),
        new THREE.Vector3(0, -300, 0),
        new THREE.Vector3(0, 0, 300)
    ];
}

function updateParticles() {
    const pos = geometry.attributes.position.array;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        let px = pos[i3];
        let py = pos[i3 + 1];
        let pz = pos[i3 + 2];

        let fx = 0, fy = 0, fz = 0;

        for (const attractor of attractors) {
            const dx = attractor.x - px;
            const dy = attractor.y - py;
            const dz = attractor.z - pz;
            const distSq = dx*dx + dy*dy + dz*dz;

            if (distSq < attractorRange * attractorRange) {
                const strength = 50 / (distSq + 10);
                fx += dx * strength;
                fy += dy * strength;
                fz += dz * strength;
            }
        }

        velocities[i3] += fx * 0.01;
        velocities[i3 + 1] += fy * 0.01;
        velocities[i3 + 2] += fz * 0.01;

        velocities[i3] *= 0.95;
        velocities[i3 + 1] *= 0.95;
        velocities[i3 + 2] *= 0.95;

        pos[i3] += velocities[i3];
        pos[i3 + 1] += velocities[i3 + 1];
        pos[i3 + 2] += velocities[i3 + 2];
    }

    geometry.attributes.position.needsUpdate = true;
}

function animate() {
    requestAnimationFrame(animate);
    updateParticles();
    renderer.render(scene, camera);
}

function init() {
    initScene();
    initParticles();
    initAttractors();
    animate();
}

init();
