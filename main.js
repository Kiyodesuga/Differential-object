
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

let scene, camera, renderer;
let particles, particleGeometry, particleMaterial;
let positions, velocities, targetPositions;
let objects = [];
let currentTarget = null;
let particleColorIndex = 0;

const PARTICLE_COUNT = 10000;
const SPHERE_RADIUS = 40;
const OBJECT_COUNT = 20;

const colors = Array.from({ length: OBJECT_COUNT }, (_, i) =>
    new THREE.Color(`hsl(${(360 / OBJECT_COUNT) * i}, 100%, 60%)`)
);

function createObjects() {
    const geometries = [
        new THREE.BoxGeometry(15, 15, 15),
        new THREE.SphereGeometry(12, 32, 32),
        new THREE.ConeGeometry(10, 20, 32),
        new THREE.CylinderGeometry(10, 10, 20, 32),
        new THREE.TorusGeometry(8, 2, 16, 100),
        new THREE.DodecahedronGeometry(10),
        new THREE.TetrahedronGeometry(10),
        new THREE.OctahedronGeometry(10),
        new THREE.TorusKnotGeometry(10, 1, 100, 16),
        new THREE.IcosahedronGeometry(10),
        new THREE.PlaneGeometry(20, 20),
        new THREE.RingGeometry(5, 10, 32),
        new THREE.CircleGeometry(10, 32),
        new THREE.SphereGeometry(10, 12, 12),
        new THREE.BoxGeometry(10, 30, 10),
        new THREE.ConeGeometry(15, 10, 8),
        new THREE.TorusKnotGeometry(5, 1.5, 50, 10),
        new THREE.DodecahedronGeometry(7),
        new THREE.SphereGeometry(8, 16, 16),
        new THREE.CylinderGeometry(5, 5, 15, 16)
    ];
    for (let i = 0; i < OBJECT_COUNT; i++) {
        const geom = geometries[i % geometries.length];
        geom.scale(0.8, 0.8, 0.8);
        objects.push(geom);
    }
}

function initParticles() {
    particleGeometry = new THREE.BufferGeometry();
    positions = new Float32Array(PARTICLE_COUNT * 3);
    velocities = new Float32Array(PARTICLE_COUNT * 3);
    targetPositions = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        const r = Math.pow(Math.random(), 1.5) * SPHERE_RADIUS;
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos(2 * Math.random() - 1);
        positions[i3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i3 + 2] = r * Math.cos(phi);

        velocities[i3] = (Math.random() - 0.5) * 0.01;
        velocities[i3 + 1] = (Math.random() - 0.5) * 0.01;
        velocities[i3 + 2] = (Math.random() - 0.5) * 0.01;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleMaterial = new THREE.PointsMaterial({ color: colors[0], size: 0.3 });
    particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
}

function switchToObject(index) {
    const geom = objects[index];
    geom.computeBoundingBox();
    const source = geom.attributes.position.array;
    for (let i = 0; i < PARTICLE_COUNT * 3; i++) {
        const j = i % source.length;
        targetPositions[i] = source[j];
    }
    particleMaterial.color = colors[index];
}

function updateParticles() {
    const pos = particleGeometry.attributes.position.array;
    for (let i = 0; i < PARTICLE_COUNT * 3; i++) {
        const diff = targetPositions[i] - pos[i];
        pos[i] += diff * 0.05 + velocities[i];
    }
    particleGeometry.attributes.position.needsUpdate = true;
}

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 100;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(50, 50, 50);
    scene.add(ambient, pointLight);

    createObjects();
    initParticles();
    switchToObject(0);
    animate();

    document.addEventListener('click', () => {
        particleColorIndex = (particleColorIndex + 1) % OBJECT_COUNT;
        switchToObject(particleColorIndex);
    });
}

function animate() {
    requestAnimationFrame(animate);
    updateParticles();
    renderer.render(scene, camera);
}

init();
