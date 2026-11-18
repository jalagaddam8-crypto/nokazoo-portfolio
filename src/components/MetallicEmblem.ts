import * as THREE from "three";

export function initMetallicEmblem(containerId: string) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const w = container.clientWidth || 320;
  const h = container.clientHeight || 320;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 100);
  camera.position.set(0, 0, 8.2);

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;
  container.innerHTML = "";
  container.appendChild(renderer.domElement);

  // Studio Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambient);

  const keyLight = new THREE.DirectionalLight(0xf2f7ff, 3.2);
  keyLight.position.set(5, 6, 6);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xdde8fc, 1.8);
  fillLight.position.set(-6, -3, 4);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xffffff, 4.0);
  rimLight.position.set(0, 5, -6);
  scene.add(rimLight);

  const bottomBounce = new THREE.DirectionalLight(0xffffff, 1.4);
  bottomBounce.position.set(0, -6, 2);
  scene.add(bottomBounce);

  // Texture Loader
  const textureLoader = new THREE.TextureLoader();
  const bumpTexture = textureLoader.load("assets/coin-bump.png");
  bumpTexture.wrapS = THREE.RepeatWrapping;
  bumpTexture.wrapT = THREE.RepeatWrapping;

  const faceTexture = textureLoader.load("assets/coin-face.png");
  faceTexture.wrapS = THREE.RepeatWrapping;
  faceTexture.wrapT = THREE.RepeatWrapping;

  // Materials
  const sideMaterial = new THREE.MeshStandardMaterial({
    color: 0xecf0f6,
    metalness: 0.98,
    roughness: 0.12,
  });

  const faceMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: faceTexture,
    bumpMap: bumpTexture,
    bumpScale: 0.25,
    metalness: 0.96,
    roughness: 0.13,
  });

  // Cylinder / Coin geometry with rounded bevel ring
  const coinRadius = 2.1;
  const coinDepth = 0.38;
  const cylinderGeo = new THREE.CylinderGeometry(coinRadius, coinRadius, coinDepth, 64);
  
  // Custom UV mapping for top and bottom lids to align the logo cleanly
  const uvs = cylinderGeo.attributes.uv;
  const pos = cylinderGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    if (Math.abs(y - coinDepth / 2) < 0.01) {
      // Top face: oriented upright when facing camera
      const x = pos.getX(i);
      const z = pos.getZ(i);
      uvs.setXY(i, (x / coinRadius) * 0.5 + 0.5, (-z / coinRadius) * 0.5 + 0.5);
    } else if (Math.abs(y + coinDepth / 2) < 0.01) {
      // Bottom face: oriented upright when coin spins 180 degrees
      const x = pos.getX(i);
      const z = pos.getZ(i);
      uvs.setXY(i, (-x / coinRadius) * 0.5 + 0.5, (-z / coinRadius) * 0.5 + 0.5);
    }
  }
  uvs.needsUpdate = true;

  const materials = [sideMaterial, faceMaterial, faceMaterial];
  const coinMesh = new THREE.Mesh(cylinderGeo, materials);
  coinMesh.rotation.x = Math.PI / 2; // Lie flat initially so Y is rotation axis
  
  const coinGroup = new THREE.Group();
  coinGroup.add(coinMesh);
  
  // Add decorative outer chamfer rings for extra metallic highlights
  const ringGeo = new THREE.TorusGeometry(coinRadius + 0.02, 0.06, 16, 64);
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0xf5f8fc,
    metalness: 0.99,
    roughness: 0.08,
  });
  const topRing = new THREE.Mesh(ringGeo, ringMat);
  topRing.position.y = coinDepth / 2;
  topRing.rotation.x = Math.PI / 2;
  coinGroup.add(topRing);

  const bottomRing = new THREE.Mesh(ringGeo, ringMat);
  bottomRing.position.y = -coinDepth / 2;
  bottomRing.rotation.x = Math.PI / 2;
  coinGroup.add(bottomRing);

  scene.add(coinGroup);

  // Interaction: Drag + Auto Rotation + Tilt
  let isDragging = false;
  let prevPointerX = 0;
  let targetRotationY = 0;
  let targetRotationX = 0.22;
  let dragVelocity = 0;
  let isVisible = true;

  const onPointerDown = (e: PointerEvent) => {
    isDragging = true;
    prevPointerX = e.clientX;
    dragVelocity = 0;
    container.style.cursor = "grabbing";
  };

  const onPointerMove = (e: PointerEvent) => {
    const rect = container.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

    if (isDragging) {
      const delta = e.clientX - prevPointerX;
      prevPointerX = e.clientX;
      coinGroup.rotation.y += delta * 0.015;
      dragVelocity = delta * 0.015;
    } else {
      // Subtle tilt toward pointer
      targetRotationX = 0.22 + ny * 0.25;
      targetRotationY = nx * 0.35;
    }
  };

  const onPointerUp = () => {
    isDragging = false;
    container.style.cursor = "grab";
  };

  container.style.cursor = "grab";
  container.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);

  // Visibility observer to pause loop off-screen
  const observer = new IntersectionObserver(([entry]) => {
    isVisible = entry.isIntersecting;
  }, { threshold: 0.05 });
  observer.observe(container);

  // Animation Loop
  let rafId = 0;
  let lastTime = performance.now();

  const animate = (time: number) => {
    rafId = requestAnimationFrame(animate);
    if (!isVisible) return;

    const dt = Math.min((time - lastTime) / 1000, 0.1);
    lastTime = time;

    if (!isDragging) {
      // Apply momentum decay or continuous idle spin
      if (Math.abs(dragVelocity) > 0.001) {
        coinGroup.rotation.y += dragVelocity;
        dragVelocity *= 0.94;
      } else {
        coinGroup.rotation.y += dt * 0.75; // smooth ~45 deg/sec spin
      }

      // Smooth damp for X tilt
      coinGroup.rotation.x += (targetRotationX + Math.sin(time * 0.0015) * 0.08 - coinGroup.rotation.x) * 0.08;
      coinGroup.rotation.z += (Math.cos(time * 0.0012) * 0.06 - coinGroup.rotation.z) * 0.08;
    }

    renderer.render(scene, camera);
  };

  rafId = requestAnimationFrame(animate);

  // Resize handler
  const onResize = () => {
    const nw = container.clientWidth || 320;
    const nh = container.clientHeight || 320;
    camera.aspect = nw / nh;
    camera.updateProjectionMatrix();
    renderer.setSize(nw, nh);
  };

  window.addEventListener("resize", onResize, { passive: true });

  return () => {
    cancelAnimationFrame(rafId);
    observer.disconnect();
    window.removeEventListener("resize", onResize);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
    container.removeEventListener("pointerdown", onPointerDown);
    renderer.dispose();
  };
}
