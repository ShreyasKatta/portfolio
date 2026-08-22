/* ================================================================
   V4 — THE SECURITY VAULT: Three.js 3D World Engine
   Features:
   - Morphing dodecahedron "security core" with wireframe + glowing vertices
   - Orbiting particle nebula with color gradients
   - Inner energy pulse sphere
   - Scroll-driven camera movement through 3D space
   - Mouse parallax with smooth interpolation
   - Dynamic shader-like color shifting
   ================================================================ */

(function () {
    const canvas = document.getElementById('scene');
    if (!canvas) return;

    // --- Setup ---
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x050A12, 1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050A12, 0.0008);

    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1500);
    camera.position.set(0, 0, 6);

    // --- Colors ---
    const CYAN = new THREE.Color(0x00E5FF);
    const INDIGO = new THREE.Color(0x6366F1);
    const PURPLE = new THREE.Color(0x8B5CF6);
    const DEEP_BLUE = new THREE.Color(0x1E40AF);
    const WHITE = new THREE.Color(0xE8ECF4);

    // --- Central Dodecahedron (Security Core) ---
    const coreGeo = new THREE.DodecahedronGeometry(1.6, 1);
    const coreWireMat = new THREE.MeshBasicMaterial({
        color: CYAN,
        wireframe: true,
        transparent: true,
        opacity: 0.12
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreWireMat);
    scene.add(coreMesh);

    // Second inner dodecahedron (counter-rotating)
    const innerGeo = new THREE.DodecahedronGeometry(1.1, 0);
    const innerWireMat = new THREE.MeshBasicMaterial({
        color: INDIGO,
        wireframe: true,
        transparent: true,
        opacity: 0.08
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerWireMat);
    scene.add(innerMesh);

    // --- Vertex Glow Points ---
    const vertexPositions = coreGeo.attributes.position;
    const uniqueVerts = [];
    const seenKeys = new Set();
    for (let i = 0; i < vertexPositions.count; i++) {
        const x = vertexPositions.getX(i).toFixed(3);
        const y = vertexPositions.getY(i).toFixed(3);
        const z = vertexPositions.getZ(i).toFixed(3);
        const key = `${x},${y},${z}`;
        if (!seenKeys.has(key)) {
            seenKeys.add(key);
            uniqueVerts.push(new THREE.Vector3(+x, +y, +z));
        }
    }

    const vertGeo = new THREE.BufferGeometry();
    const vPos = new Float32Array(uniqueVerts.length * 3);
    uniqueVerts.forEach((v, i) => { vPos[i*3]=v.x; vPos[i*3+1]=v.y; vPos[i*3+2]=v.z; });
    vertGeo.setAttribute('position', new THREE.BufferAttribute(vPos, 3));

    const vertMat = new THREE.PointsMaterial({
        color: CYAN,
        size: 0.07,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    const vertexPoints = new THREE.Points(vertGeo, vertMat);
    scene.add(vertexPoints);

    // --- Orbiting Particle Nebula ---
    const PARTICLE_COUNT = 1200;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(PARTICLE_COUNT * 3);
    const pColors = new Float32Array(PARTICLE_COUNT * 3);
    const pSizes = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = 3 + Math.random() * 12;

        pPos[i*3] = r * Math.sin(phi) * Math.cos(theta);
        pPos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
        pPos[i*3+2] = r * Math.cos(phi);

        // Color gradient: Cyan → Indigo → Purple
        const t = Math.random();
        let col;
        if (t < 0.4) col = CYAN.clone().lerp(INDIGO, t / 0.4);
        else if (t < 0.7) col = INDIGO.clone().lerp(PURPLE, (t - 0.4) / 0.3);
        else col = PURPLE.clone().lerp(DEEP_BLUE, (t - 0.7) / 0.3);

        pColors[i*3] = col.r;
        pColors[i*3+1] = col.g;
        pColors[i*3+2] = col.b;

        pSizes[i] = 0.02 + Math.random() * 0.04;
    }

    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(pColors, 3));

    const pMat = new THREE.PointsMaterial({
        size: 0.035,
        vertexColors: true,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const particleField = new THREE.Points(pGeo, pMat);
    scene.add(particleField);

    // --- Second Particle Ring (closer, faster) ---
    const RING_COUNT = 400;
    const rGeo = new THREE.BufferGeometry();
    const rPos = new Float32Array(RING_COUNT * 3);
    const rColors = new Float32Array(RING_COUNT * 3);

    for (let i = 0; i < RING_COUNT; i++) {
        const angle = (i / RING_COUNT) * Math.PI * 2 + Math.random() * 0.3;
        const r = 2.5 + Math.random() * 1.5;
        const yOffset = (Math.random() - 0.5) * 0.8;

        rPos[i*3] = Math.cos(angle) * r;
        rPos[i*3+1] = yOffset;
        rPos[i*3+2] = Math.sin(angle) * r;

        const col = CYAN.clone().lerp(WHITE, Math.random() * 0.5);
        rColors[i*3] = col.r;
        rColors[i*3+1] = col.g;
        rColors[i*3+2] = col.b;
    }

    rGeo.setAttribute('position', new THREE.BufferAttribute(rPos, 3));
    rGeo.setAttribute('color', new THREE.BufferAttribute(rColors, 3));

    const rMat = new THREE.PointsMaterial({
        size: 0.025,
        vertexColors: true,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const particleRing = new THREE.Points(rGeo, rMat);
    scene.add(particleRing);

    // --- Energy Core (Inner Glow) ---
    const glowGeo = new THREE.SphereGeometry(1.4, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({
        color: CYAN,
        transparent: true,
        opacity: 0.015,
        blending: THREE.AdditiveBlending
    });
    const glowSphere = new THREE.Mesh(glowGeo, glowMat);
    scene.add(glowSphere);

    // --- Ambient Light Lines (subtle connection lines) ---
    const lineCount = 20;
    const lineGroup = new THREE.Group();
    for (let i = 0; i < lineCount; i++) {
        const points = [];
        const start = new THREE.Vector3(
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20
        );
        const end = new THREE.Vector3(
            start.x + (Math.random() - 0.5) * 8,
            start.y + (Math.random() - 0.5) * 8,
            start.z + (Math.random() - 0.5) * 8
        );
        points.push(start, end);

        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        const lineMat = new THREE.LineBasicMaterial({
            color: CYAN,
            transparent: true,
            opacity: 0.03,
            blending: THREE.AdditiveBlending
        });
        lineGroup.add(new THREE.Line(lineGeo, lineMat));
    }
    scene.add(lineGroup);

    // --- Mouse Parallax State ---
    let mouseX = 0, mouseY = 0;
    let targetMouseX = 0, targetMouseY = 0;
    const halfW = window.innerWidth / 2;
    const halfH = window.innerHeight / 2;

    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX - halfW) / halfW;
        mouseY = (e.clientY - halfH) / halfH;
    });

    // --- Scroll State ---
    let scrollProgress = 0;
    let targetScroll = 0;
    window.addEventListener('scroll', () => {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        targetScroll = docHeight > 0 ? window.pageYOffset / docHeight : 0;
    });

    // --- Resize ---
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // --- Animation Loop ---
    let time = 0;

    function animate() {
        requestAnimationFrame(animate);
        time += 0.004;

        // Smooth interpolation
        targetMouseX += (mouseX - targetMouseX) * 0.04;
        targetMouseY += (mouseY - targetMouseY) * 0.04;
        scrollProgress += (targetScroll - scrollProgress) * 0.05;

        // --- Core Dodecahedron ---
        coreMesh.rotation.y = time * 0.6 + targetMouseX * 0.5;
        coreMesh.rotation.x = Math.sin(time * 0.4) * 0.15 + targetMouseY * 0.3;
        coreMesh.rotation.z = Math.cos(time * 0.3) * 0.05;

        // Inner mesh counter-rotates
        innerMesh.rotation.y = -time * 0.4 + targetMouseX * 0.3;
        innerMesh.rotation.x = Math.cos(time * 0.5) * 0.2 - targetMouseY * 0.2;

        // Sync vertex points with core
        vertexPoints.rotation.copy(coreMesh.rotation);

        // Breathing scale pulse
        const breathe = 1 + Math.sin(time * 1.8) * 0.035;
        coreMesh.scale.setScalar(breathe);
        innerMesh.scale.setScalar(breathe * 0.95);
        vertexPoints.scale.setScalar(breathe);
        glowSphere.scale.setScalar(breathe * 0.9);

        // Energy core glow pulse
        glowMat.opacity = 0.012 + Math.sin(time * 2.5) * 0.008;

        // Color shift based on scroll
        const scrollHue = scrollProgress * 0.3;
        const dynamicColor = new THREE.Color().setHSL(0.52 + scrollHue, 0.85, 0.55);
        coreWireMat.color.lerp(dynamicColor, 0.02);
        vertMat.color.lerp(dynamicColor, 0.02);

        // --- Particle Field orbits ---
        particleField.rotation.y = time * 0.12;
        particleField.rotation.x = time * 0.06;

        // --- Particle Ring spins faster ---
        particleRing.rotation.y = time * 0.5;
        particleRing.rotation.x = Math.sin(time * 0.3) * 0.1;

        // --- Ambient Lines drift ---
        lineGroup.rotation.y = time * 0.03;
        lineGroup.rotation.x = time * 0.02;

        // --- Scroll-Driven Camera Movement ---
        // Camera travels "through the vault" as user scrolls
        const scrollZ = 6 + scrollProgress * 12;
        const scrollY = scrollProgress * -3;
        const scrollLookY = scrollProgress * -2;

        camera.position.x = targetMouseX * 0.8;
        camera.position.y = -targetMouseY * 0.4 + scrollY;
        camera.position.z = scrollZ;
        camera.lookAt(0, scrollLookY, scrollZ - 8);

        // Fade core as we scroll away
        const coreFade = Math.max(0, 1 - scrollProgress * 2.5);
        coreWireMat.opacity = 0.12 * coreFade;
        innerWireMat.opacity = 0.08 * coreFade;
        vertMat.opacity = 0.9 * coreFade;
        glowMat.opacity = (0.012 + Math.sin(time * 2.5) * 0.008) * coreFade;

        renderer.render(scene, camera);
    }

    animate();
})();
