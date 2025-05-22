
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

let scene, camera, renderer;
let currentObject = null;
let previousKey = null;
let state = 0; // 0: sphere, 1: random A-Z, 2: sphere

const objects = {};
const colors = {};
const keys = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

let particles, particlePositions, particleVelocities;

const PARTICLE_COUNT = 500;
const PARTICLE_RANGE = 60;

function initParticles() {
    const geometry = new THREE.BufferGeometry();
    particlePositions = new Float32Array(PARTICLE_COUNT * 3);
    particleVelocities = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        particlePositions[i3] = (Math.random() - 0.5) * PARTICLE_RANGE;
        particlePositions[i3 + 1] = (Math.random() - 0.5) * PARTICLE_RANGE;
        particlePositions[i3 + 2] = (Math.random() - 0.5) * PARTICLE_RANGE;

        particleVelocities[i3] = (Math.random() - 0.5) * 0.1;
        particleVelocities[i3 + 1] = (Math.random() - 0.5) * 0.1;
        particleVelocities[i3 + 2] = (Math.random() - 0.5) * 0.1;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const material = new THREE.PointsMaterial({ color: 0xffffff, size: 1.5 });
    particles = new THREE.Points(geometry, material);
    scene.add(particles);
}

function updateParticles() {
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        for (let j = 0; j < 3; j++) {
            particlePositions[i3 + j] += particleVelocities[i3 + j];
            if (Math.abs(particlePositions[i3 + j]) > PARTICLE_RANGE / 2) {
                particleVelocities[i3 + j] *= -1;
            }
        }
    }
    particles.geometry.attributes.position.needsUpdate = true;
}

function createObject(key) {
    const geometryTypes = [
        new THREE.BoxGeometry(20, 20, 20),
        new THREE.SphereGeometry(15, 32, 32),
        new THREE.ConeGeometry(15, 30, 32),
        new THREE.CylinderGeometry(10, 10, 30, 32),
        new THREE.TorusGeometry(10, 3, 16, 100),
        new THREE.DodecahedronGeometry(15),
        new THREE.TetrahedronGeometry(15),
        new THREE.OctahedronGeometry(15)
    ];
    const geometry = geometryTypes[key.charCodeAt(0) % geometryTypes.length];
    const color = new THREE.Color(`hsl(${Math.floor(Math.random() * 360)}, 100%, 50%)`);
    colors[key] = color;
    const material = new THREE.MeshStandardMaterial({ color });
    const mesh = new THREE.Mesh(geometry, material);
    return mesh;
}

keys.forEach(key => {
    objects[key] = createObject(key);
});

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 100;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const light = new THREE.PointLight(0xffffff, 1, 0);
    light.position.set(50, 50, 50);
    scene.add(light);

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('click', onClick);

    initParticles();
    showSphere();
    animate();
}

function showObjectByKey(key) {
    if (currentObject) scene.remove(currentObject);
    const object = objects[key].clone();
    currentObject = object;
    scene.add(currentObject);
    previousKey = key;
}

function showRandomObject() {
    let newKey;
    do {
        newKey = keys[Math.floor(Math.random() * keys.length)];
    } while (newKey === previousKey);
    showObjectByKey(newKey);
}

function showSphere() {
    if (currentObject) scene.remove(currentObject);
    const geometry = new THREE.SphereGeometry(15, 32, 32);
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
    currentObject = new THREE.Mesh(geometry, material);
    scene.add(currentObject);
    previousKey = null;
}

function onKeyDown(event) {
    const key = event.key.toUpperCase();
    if (keys.includes(key)) {
        showObjectByKey(key);
        state = 1;
    }
}

function onClick() {
    if (state === 0 || state === 2) {
        showRandomObject();
        state = 1;
    } else if (state === 1) {
        showSphere();
        state = 2;
    }
}

function animate() {
    requestAnimationFrame(animate);
    if (currentObject) {
        currentObject.rotation.x += 0.01;
        currentObject.rotation.y += 0.01;
    }
    updateParticles();
    renderer.render(scene, camera);
}

init();
