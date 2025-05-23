
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

let scene, camera, renderer;
let particles, geometry, material;
let positions, velocities;
const PARTICLE_COUNT = 250000;
const SPHERE_RADIUS = 300;

let colorIndex = 0;
let attractorRange = 800;
let mouseDownTime = 0;
let isDragging = false;
let absorbing = false;
let delayedAbsorbTarget = new THREE.Vector3(-500, 0, 0);
let attractorMesh;
let delayTimer = null;

const COLORS = Array.from({ length: 20 }, (_, i) =>
    new THREE.Color(`hsl(${(360 / 20) * i}, 100%, 60%)`)
);

function initScene() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 5000);
    camera.position.z = 1000;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    const light = new THREE.PointLight(0xffffff, 1);
    light.position.set(200, 200, 200);
    scene.add(ambient, light);
}

function initParticles() {
    geometry = new THREE.BufferGeometry();
    positions = new Float32Array(PARTICLE_COUNT * 3);
    velocities = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        const r = Math.pow(Math.random(), 1.2) * SPHERE_RADIUS;
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos(2 * Math.random() - 1);
        positions[i3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i3 + 2] = r * Math.cos(phi);

        velocities[i3] = 0;
        velocities[i3 + 1] = 0;
        velocities[i3 + 2] = 0;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    material = new THREE.PointsMaterial({ color: COLORS[0], size: 0.15 });
    particles = new THREE.Points(geometry, material);
    scene.add(particles);

    const redDot = new THREE.SphereGeometry(10, 16, 16);
    const redMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    attractorMesh = new THREE.Mesh(redDot, redMat);
    attractorMesh.position.copy(delayedAbsorbTarget);
    scene.add(attractorMesh);
}

function updateParticles() {
    const pos = geometry.attributes.position.array;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;

        const dx = delayedAbsorbTarget.x - pos[i3];
        const dy = delayedAbsorbTarget.y - pos[i3 + 1];
        const dz = delayedAbsorbTarget.z - pos[i3 + 2];
        const distSq = dx * dx + dy * dy + dz * dz;

        if (absorbing && distSq < attractorRange * attractorRange) {
            const strength = 100 / (distSq + 100);
            velocities[i3] += dx * strength * 0.002;
            velocities[i3 + 1] += dy * strength * 0.002;
            velocities[i3 + 2] += dz * strength * 0.002;
        }

        velocities[i3] *= 0.97;
        velocities[i3 + 1] *= 0.97;
        velocities[i3 + 2] *= 0.97;

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
    animate();

    document.addEventListener('mousedown', () => {
        mouseDownTime = Date.now();
        isDragging = true;
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        const held = Date.now() - mouseDownTime;
        if (held > 400) {
            attractorRange = attractorRange === 800 ? 300 : 800;
        } else {
            colorIndex = (colorIndex + 1) % COLORS.length;
            material.color = COLORS[colorIndex];
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const x = (e.clientX / window.innerWidth) * 2 - 1;
        const y = -(e.clientY / window.innerHeight) * 2 + 1;
        attractorMesh.position.x = x * 800;
        attractorMesh.position.y = y * 800;

        if (delayTimer) clearTimeout(delayTimer);
        delayTimer = setTimeout(() => {
            delayedAbsorbTarget.copy(attractorMesh.position);
        }, 300);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === ' ') absorbing = !absorbing;
    });
}

init();
