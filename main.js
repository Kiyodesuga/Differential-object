
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

let scene, camera, renderer;
let particles, particlePositions, particleVelocities;
let objects = [];
let currentObject = null;
let previousIndex = -1;

const PARTICLE_COUNT = 10000;
const SPHERE_RADIUS = 40;
const OBJECT_COUNT = 20;

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
        const color = new THREE.Color(`hsl(${(360 / OBJECT_COUNT) * i}, 100%, 60%)`);
        const mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.6 });
        const mesh = new THREE.Mesh(geom, mat);
        objects.push(mesh);
    }
}

function switchObject() {
    if (currentObject) scene.remove(currentObject);
    let index;
    do {
        index = Math.floor(Math.random() * OBJECT_COUNT);
    } while (index === previousIndex);
    previousIndex = index;
    currentObject = objects[index].clone();
    scene.add(currentObject);
}

function initParticles() {
    const geometry = new THREE.BufferGeometry();
    particlePositions = new Float32Array(PARTICLE_COUNT * 3);
    particleVelocities = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        const r = Math.pow(Math.random(), 1.5) * SPHERE_RADIUS;
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos(2 * Math.random() - 1);

        particlePositions[i3] = r * Math.sin(phi) * Math.cos(theta);
        particlePositions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        particlePositions[i3 + 2] = r * Math.cos(phi);

        particleVelocities[i3] = (Math.random() - 0.5) * 0.01;
        particleVelocities[i3 + 1] = (Math.random() - 0.5) * 0.01;
        particleVelocities[i3 + 2] = (Math.random() - 0.5) * 0.01;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const material = new THREE.PointsMaterial({ color: 0xffffff, size: 0.3, transparent: true, opacity: 1 });
    particles = new THREE.Points(geometry, material);
    scene.add(particles);
}

function updateParticles() {
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        for (let j = 0; j < 3; j++) {
            particlePositions[i3 + j] += particleVelocities[i3 + j];
            if (Math.abs(particlePositions[i3 + j]) > SPHERE_RADIUS) {
                particleVelocities[i3 + j] *= -1;
            }
        }
    }
    particles.geometry.attributes.position.needsUpdate = true;
}

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 100;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(50, 50, 50);
    scene.add(ambientLight, pointLight);

    createObjects();
    initParticles();
    switchObject();
    animate();

    document.addEventListener('click', switchObject);
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
