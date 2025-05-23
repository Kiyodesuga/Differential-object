
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

let scene, camera, renderer;
let particles, particleGeometry, particleMaterial;
let positions, velocities, targetPositions, delayedTargetPositions;
let objects = [];
let currentTargetIndex = 0;
let waveTime = 0;
let isDragging = false;
let dragOffset = new THREE.Vector3();
let targetMesh;
let delayTime = 0;

const PARTICLE_COUNT = 150000;
const SPHERE_RADIUS = 120;
const OBJECT_COUNT = 20;
const DELAY_MS = 300;

const colors = Array.from({ length: OBJECT_COUNT }, (_, i) =>
    new THREE.Color(`hsl(${(360 / OBJECT_COUNT) * i}, 100%, 60%)`)
);

function createObjects() {
    const geometries = [
        new THREE.BoxGeometry(80, 80, 80),
        new THREE.SphereGeometry(60, 64, 64),
        new THREE.ConeGeometry(60, 100, 64),
        new THREE.CylinderGeometry(60, 60, 100, 64),
        new THREE.TorusGeometry(50, 15, 32, 100),
        new THREE.DodecahedronGeometry(70),
        new THREE.TetrahedronGeometry(70),
        new THREE.OctahedronGeometry(70),
        new THREE.TorusKnotGeometry(50, 5, 200, 32),
        new THREE.IcosahedronGeometry(70),
        new THREE.PlaneGeometry(160, 160, 64, 64),
    ];
    for (let i = 0; i < OBJECT_COUNT; i++) {
        const geom = geometries[i % geometries.length].clone();
        geom.scale(1.5, 1.5, 1.5);
        objects.push(geom);
    }
}

function initParticles() {
    particleGeometry = new THREE.BufferGeometry();
    positions = new Float32Array(PARTICLE_COUNT * 3);
    velocities = new Float32Array(PARTICLE_COUNT * 3);
    targetPositions = new Float32Array(PARTICLE_COUNT * 3);
    delayedTargetPositions = new Float32Array(PARTICLE_COUNT * 3);

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
    particleMaterial = new THREE.PointsMaterial({ color: colors[0], size: 0.15 });
    particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
}

function switchToObject(index) {
    const geom = objects[index];
    const source = geom.attributes.position.array;
    const len = source.length;

    if (targetMesh) scene.remove(targetMesh);
    const mat = new THREE.MeshBasicMaterial({ color: colors[index], wireframe: true });
    targetMesh = new THREE.Mesh(geom, mat);
    scene.add(targetMesh);

    for (let i = 0; i < PARTICLE_COUNT * 3; i++) {
        const j = i % len;
        targetPositions[i] = source[j];
    }

    setTimeout(() => {
        for (let i = 0; i < PARTICLE_COUNT * 3; i++) {
            delayedTargetPositions[i] = targetPositions[i];
        }
    }, DELAY_MS);
}

function updateParticles() {
    const pos = particleGeometry.attributes.position.array;
    for (let i = 0; i < PARTICLE_COUNT * 3; i++) {
        const diff = delayedTargetPositions[i] - pos[i];
        pos[i] += diff * 0.05 + velocities[i];
    }
    particleGeometry.attributes.position.needsUpdate = true;
}

function onMouseDown(event) {
    isDragging = true;
}

function onMouseMove(event) {
    if (isDragging && targetMesh) {
        const x = (event.clientX / window.innerWidth) * 2 - 1;
        const y = -(event.clientY / window.innerHeight) * 2 + 1;
        targetMesh.position.x = x * 100;
        targetMesh.position.y = y * 100;
    }
}

function onMouseUp() {
    isDragging = false;
}

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 200;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(100, 100, 100);
    scene.add(ambient, pointLight);

    createObjects();
    initParticles();
    switchToObject(currentTargetIndex);
    animate();

    document.addEventListener('click', () => {
        currentTargetIndex = (currentTargetIndex + 1) % objects.length;
        switchToObject(currentTargetIndex);
    });

    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
}

function animate() {
    requestAnimationFrame(animate);
    updateParticles();
    if (targetMesh) {
        targetMesh.rotation.x += 0.002;
        targetMesh.rotation.y += 0.002;
    }
    renderer.render(scene, camera);
}

init();
