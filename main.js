
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

let scene, camera, renderer;
let particles, geometry, material;
let positions, velocities;
let attractors = [];
let attractorMesh;
const PARTICLE_COUNT = 250000;
const SPHERE_RADIUS = 300;
let colorIndex = 0;
const COLORS = Array.from({ length: 20 }, (_, i) =>
    new THREE.Color(`hsl(${(360 / 20) * i}, 100%, 60%)`)
);

let attractorRange = 800; // default full screen
let mouseDownTime = 0;
let isDragging = false;
let delayedAttractorPos = new THREE.Vector3();
let delayTimer = null;

function initScene() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 1, 5000);
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
    material = new THREE.PointsMaterial({ color: COLORS[0], size: 0.15 });
    particles = new THREE.Points(geometry, material);
    scene.add(particles);
}

function initAttractors() {
    attractors = [new THREE.Vector3(0, 0, 0)];
    const geo = new THREE.SphereGeometry(20, 16, 16);
    const mat = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
    attractorMesh = new THREE.Mesh(geo, mat);
    attractorMesh.position.copy(attractors[0]);
    scene.add(attractorMesh);
    delayedAttractorPos.copy(attractors[0]);
}

function updateParticles() {
    const pos = geometry.attributes.position.array;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        let px = pos[i3];
        let py = pos[i3 + 1];
        let pz = pos[i3 + 2];

        let dx = delayedAttractorPos.x - px;
        let dy = delayedAttractorPos.y - py;
        let dz = delayedAttractorPos.z - pz;
        let distSq = dx*dx + dy*dy + dz*dz;

        let fx = 0, fy = 0, fz = 0;

        if (distSq < attractorRange * attractorRange) {
            const strength = 40 / (distSq + 50);
            fx = dx * strength;
            fy = dy * strength;
            fz = dz * strength;
        }

        velocities[i3] += fx * 0.01;
        velocities[i3 + 1] += fy * 0.01;
        velocities[i3 + 2] += fz * 0.01;

        velocities[i3] *= 0.94;
        velocities[i3 + 1] *= 0.94;
        velocities[i3 + 2] *= 0.94;

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
            delayedAttractorPos.copy(attractorMesh.position);
        }, 300);
    });
}

init();
