
// Shape Y - HeartBeatOrb
export function getShapeY(i, numParticles, time) {
    const radius = 70;
    const phi = Math.acos(1 - 2 * (i + 0.5) / numParticles);
    const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);
    switch ("HeartBeatOrb") {
        case "Sphere":
            return new THREE.Vector3(
                radius * Math.sin(phi) * Math.cos(theta),
                radius * Math.sin(phi) * Math.sin(theta),
                radius * Math.cos(phi)
            );
        case "Spiral":
            return new THREE.Vector3(
                Math.cos(i * 0.1) * 20,
                i * 0.2,
                Math.sin(i * 0.1) * 20
            );
        case "Grid":
            return new THREE.Vector3(
                (i % 30 - 15) * 3,
                Math.floor(i / 30) * 3 - 50,
                0
            );
        default:
            return new THREE.Vector3(
                Math.sin(theta) * radius,
                Math.cos(theta) * radius,
                Math.sin(i * 0.1 + time) * 20
            );
    }
}
