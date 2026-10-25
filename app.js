/**
 * NOKAZOO.DEV: ULTRA-HIGH-FPS 3D SPHERE OBSERVER & SWISS INTERACTIONS
 * Re-engineered to match reference video:
 * - Pure 3D Kinetic Observer floating organically (no box/frames)
 * - Thicker circle outlines (2.2px) and vector dashed meridians
 * - Hatched eyes with vector control points (squares and circles)
 * - Proximity squint physics and 360° spin
 * - Background botanical tree continuous bloom loop
 */

document.addEventListener('DOMContentLoaded', () => {
  initLiveClock();
  initHighFpsSphere();
  initHeroCloudParallax();
  initGhostBlob();
  initInteractiveArchive();
  initAiFaq();
  initTreeGrowth();
  initContactForm();
});

/* ==========================================================================
   1. LIVE CLOCK (UTC+3 Moscow)
   ========================================================================== */
function initLiveClock() {
  const clockEl = document.getElementById('live-clock');
  if (!clockEl) return;

  function update() {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const moscowTime = new Date(utc + (3600000 * 3));
    
    const h = String(moscowTime.getHours()).padStart(2, '0');
    const m = String(moscowTime.getMinutes()).padStart(2, '0');
    const s = String(moscowTime.getSeconds()).padStart(2, '0');
    
    clockEl.textContent = `UTC+3 ${h}:${m}:${s}`;
  }

  update();
  setInterval(update, 1000);
}

/* ==========================================================================
   2. BOTANICAL TREE GROWTH: CONTINUOUS BLOOM LOOP
   When the tree finishes initial growth (18.4s), it stays fully grown and
   continues swaying and animating in a seamless ambient loop (14.2s - 18.4s).
   ========================================================================== */
function initTreeGrowth() {
  const video = document.getElementById('hero-tree-video');
  if (!video) return;

  video.loop = false;

  video.addEventListener('timeupdate', () => {
    // If it reached the end of growth, loop the mature blooming tree state
    if (video.currentTime >= 18.3) {
      video.currentTime = 14.2;
      video.play().catch(() => {});
    }
  });

  video.addEventListener('ended', () => {
    video.currentTime = 14.2;
    video.play().catch(() => {});
  });
}

/* ==========================================================================
   3. ULTRA-HIGH-FPS 3D EYE-SPHERE OBSERVER (Reference Matching)
   Pure vector aesthetic: Thicker outlines, dashed coordinate axes,
   cross-hatched eyes with vector anchor handles, zero container frames.
   ========================================================================== */
function initHighFpsSphere() {
  const canvas = document.getElementById('sphere-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });

  let dpr = window.devicePixelRatio || 1;
  let width = 0;
  let height = 0;
  let sphereRadius = 120;

  // Real-time tracking values
  let targetYaw = 0.2;
  let targetPitch = 0.05;
  let currentYaw = 0.2;
  let currentPitch = 0.05;
  let squintFactor = 0;
  let targetSquint = 0;
  let spinAngle = 0;
  let isWinking = false;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    if (width === 0 || height === 0) return;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.scale(dpr, dpr);
    // Fill ~82% of canvas
    sphereRadius = Math.min(width, height) * 0.42;
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });

  // Instant pointer tracking (passive, zero lag)
  function onPointerMove(e) {
    const rect = canvas.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    const dist = Math.hypot(dx, dy);

    // Target angles with wide dynamic range
    const maxAngle = 0.85;
    targetYaw = Math.max(-maxAngle, Math.min(maxAngle, dx / (window.innerWidth * 0.35)));
    targetPitch = Math.max(-maxAngle, Math.min(maxAngle, dy / (window.innerHeight * 0.35)));

    // Proximity Squint Calculation
    const triggerDist = sphereRadius * 2.2;
    if (dist < triggerDist) {
      targetSquint = 1.0 - Math.max(0, (dist - sphereRadius * 0.4) / (triggerDist - sphereRadius * 0.4));
    } else {
      targetSquint = 0;
    }
  }

  window.addEventListener('mousemove', onPointerMove, { passive: true });
  window.addEventListener('pointermove', onPointerMove, { passive: true });

  // Click Interaction: 360 Spin & Wink
  canvas.addEventListener('click', () => {
    isWinking = true;
    spinAngle += Math.PI * 2;
    setTimeout(() => {
      isWinking = false;
    }, 380);
    playSoftTick();
  });

  // 120 FPS Animation Loop with Snappy Damping
  function render() {
    ctx.clearRect(0, 0, width, height);

    currentYaw += (targetYaw - currentYaw) * 0.32;
    currentPitch += (targetPitch - currentPitch) * 0.32;
    squintFactor += (targetSquint - squintFactor) * 0.35;
    spinAngle *= 0.86;

    const cx = width / 2;
    const cy = height / 2;
    const R = sphereRadius;

    ctx.save();
    ctx.translate(cx, cy);

    drawReferenceSphere(ctx, R, currentYaw + spinAngle, currentPitch, squintFactor, isWinking);

    ctx.restore();
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

/**
 * Draw 3D Sphere matching the exact visual reference:
 * - Thick solid perimeter circle
 * - Dashed horizontal equator & dashed vertical meridian
 * - Center circular intersection node
 * - 3D Spherical deformed eyes with 45° diagonal hatching & vector control points
 */
function drawReferenceSphere(ctx, R, yaw, pitch, squint, winking) {
  const primaryStroke = '#FFFFFF';
  const dashedStroke = 'rgba(255, 255, 255, 0.48)';

  // 1. Base Perimeter Circle (Thicker outline as requested)
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, R, 0, Math.PI * 2);
  ctx.strokeStyle = primaryStroke;
  ctx.lineWidth = 2.2;
  ctx.stroke();
  ctx.restore();

  // 2. Dashed Coordinate Ellipses (Equator & Meridian)
  ctx.save();
  ctx.setLineDash([5, 4]);
  ctx.strokeStyle = dashedStroke;
  ctx.lineWidth = 1.6;

  // Horizontal Equator ellipse tilted by pitch
  const eqY = Math.sin(pitch) * (R * 0.72);
  const eqH = Math.max(2, Math.cos(pitch) * (R * 0.38));
  ctx.beginPath();
  ctx.ellipse(0, eqY, R, eqH, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Vertical Meridian ellipse tilted by yaw
  const merX = Math.sin(yaw) * (R * 0.72);
  const merW = Math.max(2, Math.cos(yaw) * (R * 0.38));
  ctx.beginPath();
  ctx.ellipse(merX, 0, merW, R, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Center Gaze Intersection Node (small hollow ring)
  ctx.setLineDash([]);
  const nodeX = merX * Math.cos(pitch);
  const nodeY = eqY * Math.cos(yaw);
  ctx.beginPath();
  ctx.arc(nodeX, nodeY, 3.5, 0, Math.PI * 2);
  ctx.fillStyle = '#070709';
  ctx.fill();
  ctx.strokeStyle = primaryStroke;
  ctx.lineWidth = 1.6;
  ctx.stroke();
  ctx.restore();

  // 3. 3D Projective Eyes with Hatching & Vector Anchor Points
  drawProjectiveHatchedEyes(ctx, R, yaw, pitch, squint, winking);
}

/**
 * 3D Projective Eyes:
 * Follows spherical curvature, deforms towards edges, hatched inside,
 * with alternating square and circle anchor points.
 */
function drawProjectiveHatchedEyes(ctx, R, yaw, pitch, squint, winking) {
  const eyeSeparation = 0.32;
  const eyeBaseW = R * 0.20;
  const eyeBaseH = R * 0.48;

  // Squint compression
  const eyeW = eyeBaseW * (1.0 - squint * 0.12);
  const eyeH = eyeBaseH * (1.0 - squint * 0.78);

  const eyes = [
    { offsetAngle: -eyeSeparation / 2, isLeft: true },
    { offsetAngle: eyeSeparation / 2, isLeft: false }
  ];

  for (let i = 0; i < 2; i++) {
    const eye = eyes[i];
    const totalYaw = yaw + eye.offsetAngle;
    const cosPitch = Math.cos(pitch);
    const sinPitch = Math.sin(pitch);
    const cosYaw = Math.cos(totalYaw);
    const sinYaw = Math.sin(totalYaw);

    const nx = sinYaw * cosPitch;
    const ny = sinPitch;
    const nz = cosYaw * cosPitch;

    // Only draw if on front visible hemisphere
    if (nz > 0.04) {
      const eyeX = nx * R;
      const eyeY = ny * R;
      const scaleX = Math.max(0.18, nz);
      const currentH = (winking && eye.isLeft) ? 2.5 : eyeH;

      ctx.save();
      ctx.translate(eyeX, eyeY);
      ctx.scale(scaleX, 1);

      const x = -eyeW / 2;
      const y = -currentH / 2;
      const w = eyeW;
      const h = currentH;
      const r = Math.min(w / 2, h / 2);

      // Create path for the pill capsule
      ctx.beginPath();
      drawPillPath(ctx, x, y, w, h, r);

      // 1. Fill with soft translucent background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.fill();

      // 2. Draw 45-degree diagonal hatching inside the eye (clipped)
      ctx.save();
      ctx.clip();
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.lineWidth = 1.2;
      const step = 5;
      const diagMax = w + h + 20;
      for (let d = -diagMax; d <= diagMax; d += step) {
        ctx.moveTo(x + d, y - 10);
        ctx.lineTo(x + d + h + 20, y + h + 10);
      }
      ctx.stroke();
      ctx.restore();

      // 3. Thick solid outline for the eye
      ctx.beginPath();
      drawPillPath(ctx, x, y, w, h, r);
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2.2;
      ctx.stroke();

      // 4. Vector control points (alternating squares and circles along perimeter)
      drawFigmaVectorHandles(ctx, x, y, w, h);

      ctx.restore();
    }
  }
}

/**
 * Draw pill path (capsule)
 */
function drawPillPath(ctx, x, y, w, h, r) {
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * Alternating square and circle vector anchor handles (Figma / CAD style)
 */
function drawFigmaVectorHandles(ctx, x, y, w, h) {
  const handles = [
    { x: x + w / 2, y: y, isSquare: true },
    { x: x + w, y: y + h * 0.2, isSquare: false },
    { x: x + w, y: y + h * 0.5, isSquare: true },
    { x: x + w, y: y + h * 0.8, isSquare: false },
    { x: x + w / 2, y: y + h, isSquare: true },
    { x: x, y: y + h * 0.8, isSquare: false },
    { x: x, y: y + h * 0.5, isSquare: true },
    { x: x, y: y + h * 0.2, isSquare: false }
  ];

  for (let i = 0; i < handles.length; i++) {
    const pt = handles[i];
    ctx.fillStyle = '#070709';
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.2;

    if (pt.isSquare) {
      ctx.fillRect(pt.x - 2, pt.y - 2, 4, 4);
      ctx.strokeRect(pt.x - 2, pt.y - 2, 4, 4);
    } else {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }
}

/* ==========================================================================
   4. CONTACT FORM
   ========================================================================= */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const feedback = document.getElementById('form-feedback');
  const submitBtn = document.getElementById('form-submit-btn');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!submitBtn || !feedback) return;

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Отправка...</span>';

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span>Отправлено &check;</span>';
      
      feedback.classList.remove('hidden');
      feedback.className = 'font-mono text-xs text-center p-3 border border-white/20 bg-white/5 text-white mt-4';
      feedback.textContent = 'Спасибо за заявку! Я получил ваше сообщение и свяжусь с вами в течение 30 минут.';
      
      form.reset();
      playSoftTick();

      setTimeout(() => {
        submitBtn.innerHTML = '<span>Отправить заявку &rarr;</span>';
      }, 4000);
    }, 600);
  });
}

function playSoftTick() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(500, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);
  } catch (err) {}
}

/* ==========================================================================
   5. HERO CLOUD PARALLAX (Image 1 "NOTHIN'" concept)
   ========================================================================== */
function initHeroCloudParallax() {
  const container = document.querySelector('.hero-cloud-container');
  const cloud = document.querySelector('.hero-cloud-img');
  if (!container || !cloud) return;

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;

  window.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    if (e.clientY < rect.top - 200 || e.clientY > rect.bottom + 200) return;
    const relX = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const relY = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    targetX = relX * 28;
    targetY = relY * 18;
  }, { passive: true });

  function loop() {
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;
    cloud.style.transform = `translate(calc(-50% + ${currentX.toFixed(2)}px), calc(-50% + ${currentY.toFixed(2)}px))`;
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

/* ==========================================================================
   6. B&W GHOST-BLOB (Draggable Jelly Physics from Video 2)
   ========================================================================== */
function initGhostBlob() {
  const canvas = document.getElementById('ghost-blob-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  const width = 130;
  const height = 130;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  // Position on screen (bottom right default)
  let posX = Math.max(20, window.innerWidth - 180);
  let posY = Math.max(20, window.innerHeight - 180);
  canvas.style.left = `${posX}px`;
  canvas.style.top = `${posY}px`;
  canvas.style.right = 'auto';
  canvas.style.bottom = 'auto';

  let vx = 0;
  let vy = 0;
  let isDragging = false;
  let dragOffsetX = 0;
  let dragOffsetY = 0;
  let lastPointerX = 0;
  let lastPointerY = 0;
  let isVisible = true;

  // 12 Vertex Radial Spring System
  const numPoints = 12;
  const baseRadius = 42;
  const points = [];
  for (let i = 0; i < numPoints; i++) {
    points.push({
      angle: (i / numPoints) * Math.PI * 2,
      r: baseRadius,
      vr: 0
    });
  }

  let pointerX = window.innerWidth / 2;
  let pointerY = window.innerHeight / 2;

  window.addEventListener('mousemove', (e) => {
    pointerX = e.clientX;
    pointerY = e.clientY;
    if (isDragging) {
      const nextX = Math.max(0, Math.min(window.innerWidth - width, e.clientX - dragOffsetX));
      const nextY = Math.max(0, Math.min(window.innerHeight - height, e.clientY - dragOffsetY));
      vx = (e.clientX - lastPointerX) * 0.45;
      vy = (e.clientY - lastPointerY) * 0.45;
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;
      posX = nextX;
      posY = nextY;
      canvas.style.left = `${posX}px`;
      canvas.style.top = `${posY}px`;

      // Velocity deform impulse
      for (let p of points) {
        const dirX = Math.cos(p.angle);
        const dirY = Math.sin(p.angle);
        const dot = dirX * vx + dirY * vy;
        p.vr += dot * 0.12;
      }
    }
  }, { passive: true });

  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    dragOffsetX = e.clientX - posX;
    dragOffsetY = e.clientY - posY;
    lastPointerX = e.clientX;
    lastPointerY = e.clientY;
    vx = 0;
    vy = 0;
    playSoftTick();
  });

  window.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      for (let p of points) {
        p.vr += (Math.random() - 0.5) * 8;
      }
    }
  });

  // Touch Support
  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isDragging = true;
      const t = e.touches[0];
      dragOffsetX = t.clientX - posX;
      dragOffsetY = t.clientY - posY;
      lastPointerX = t.clientX;
      lastPointerY = t.clientY;
    }
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (isDragging && e.touches.length === 1) {
      const t = e.touches[0];
      pointerX = t.clientX;
      pointerY = t.clientY;
      posX = Math.max(0, Math.min(window.innerWidth - width, t.clientX - dragOffsetX));
      posY = Math.max(0, Math.min(window.innerHeight - height, t.clientY - dragOffsetY));
      vx = (t.clientX - lastPointerX) * 0.45;
      vy = (t.clientY - lastPointerY) * 0.45;
      lastPointerX = t.clientX;
      lastPointerY = t.clientY;
      canvas.style.left = `${posX}px`;
      canvas.style.top = `${posY}px`;
    }
  }, { passive: true });

  window.addEventListener('touchend', () => {
    isDragging = false;
  });

  // Toggle & Reset Dock
  const toggleBtn = document.getElementById('toggle-blob-btn');
  const resetBtn = document.getElementById('reset-blob-btn');

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      isVisible = !isVisible;
      canvas.style.display = isVisible ? 'block' : 'none';
      toggleBtn.textContent = isVisible ? 'Блёб: Вкл' : 'Блёб: Выкл';
      playSoftTick();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      posX = Math.max(20, window.innerWidth - 180);
      posY = Math.max(20, window.innerHeight - 180);
      vx = 0;
      vy = 0;
      canvas.style.left = `${posX}px`;
      canvas.style.top = `${posY}px`;
      canvas.style.display = 'block';
      isVisible = true;
      if (toggleBtn) toggleBtn.textContent = 'Блёб: Вкл';
      playSoftTick();
    });
  }

  let time = 0;
  function render() {
    if (!isVisible) {
      requestAnimationFrame(render);
      return;
    }

    time += 0.04;
    ctx.clearRect(0, 0, width, height);

    if (!isDragging) {
      posX += vx;
      posY += vy;
      vx *= 0.94;
      vy *= 0.94;

      if (posX <= 10) { posX = 10; vx = -vx * 0.6; }
      if (posX >= window.innerWidth - width - 10) { posX = window.innerWidth - width - 10; vx = -vx * 0.6; }
      if (posY <= 10) { posY = 10; vy = -vy * 0.6; }
      if (posY >= window.innerHeight - height - 10) { posY = window.innerHeight - height - 10; vy = -vy * 0.6; }

      canvas.style.left = `${posX}px`;
      canvas.style.top = `${posY}px`;
    }

    const cx = width / 2;
    const cy = height / 2;

    const stiffness = 0.12;
    const damping = 0.85;

    for (let i = 0; i < numPoints; i++) {
      const p = points[i];
      const wobble = Math.sin(time * 2.2 + i * 0.8) * 3;
      const targetR = baseRadius + wobble;
      const force = (targetR - p.r) * stiffness;
      p.vr = (p.vr + force) * damping;
      p.r += p.vr;
    }

    // Draw smooth blob body
    ctx.beginPath();
    const coords = points.map(p => ({
      x: cx + Math.cos(p.angle) * p.r,
      y: cy + Math.sin(p.angle) * p.r
    }));

    ctx.moveTo((coords[0].x + coords[numPoints - 1].x) / 2, (coords[0].y + coords[numPoints - 1].y) / 2);
    for (let i = 0; i < numPoints; i++) {
      const next = coords[(i + 1) % numPoints];
      const midX = (coords[i].x + next.x) / 2;
      const midY = (coords[i].y + next.y) / 2;
      ctx.quadraticCurveTo(coords[i].x, coords[i].y, midX, midY);
    }
    ctx.closePath();

    // B&W White surface with soft gradient
    const grad = ctx.createRadialGradient(cx - 10, cy - 12, 5, cx, cy, baseRadius + 10);
    grad.addColorStop(0, '#FFFFFF');
    grad.addColorStop(0.85, '#EDEDF2');
    grad.addColorStop(1, '#D5D5DE');
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.lineWidth = 1.6;
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();

    // Two black dot eyes looking towards pointer
    const blobCenterX = posX + cx;
    const blobCenterY = posY + cy;
    const eyeAngle = Math.atan2(pointerY - blobCenterY, pointerX - blobCenterX);
    const eyeDist = Math.min(8, Math.hypot(pointerX - blobCenterX, pointerY - blobCenterY) * 0.02);

    const eyeOffsetX = Math.cos(eyeAngle) * eyeDist;
    const eyeOffsetY = Math.sin(eyeAngle) * eyeDist;

    const leftEyeBaseX = cx - 11;
    const rightEyeBaseX = cx + 11;
    const eyeBaseY = cy - 4;

    ctx.fillStyle = '#050507';
    ctx.beginPath();
    ctx.arc(leftEyeBaseX + eyeOffsetX, eyeBaseY + eyeOffsetY, 5.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(rightEyeBaseX + eyeOffsetX, eyeBaseY + eyeOffsetY, 5.5, 0, Math.PI * 2);
    ctx.fill();

    // Catchlights
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(leftEyeBaseX + eyeOffsetX - 1.5, eyeBaseY + eyeOffsetY - 1.5, 1.6, 0, Math.PI * 2);
    ctx.arc(rightEyeBaseX + eyeOffsetX - 1.5, eyeBaseY + eyeOffsetY - 1.5, 1.6, 0, Math.PI * 2);
    ctx.fill();

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

/* ==========================================================================
   7. INTERACTIVE ARCHIVE (01 RING + 02 CONSTELLATION from Video 1 & Image 2)
   ========================================================================== */
function initInteractiveArchive() {
  const viewport = document.getElementById('archive-viewport');
  const canvas = document.getElementById('constellation-canvas');
  const ringStage = document.getElementById('ring-3d-stage');
  const ringCarousel = document.getElementById('ring-3d-carousel');
  const btnConstellation = document.getElementById('mode-constellation-btn');
  const btnRing = document.getElementById('mode-ring-btn');
  const cardsContainer = document.getElementById('archive-cards-container');

  if (!viewport || !canvas || !cardsContainer) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  let currentMode = 'constellation'; // 'constellation' | 'ring'
  let width = 0;
  let height = 0;

  const PROJECTS = [
    { id: 'spoton', title: 'Spot On! Platform', cat: 'MOBILE PWA', img: 'assets/projects/spoton-cover.png', url: 'spoton.html', normX: 0.22, normY: 0.24 },
    { id: 'minori', title: 'Minori Middle East', cat: 'ENTERPRISE', img: 'assets/projects/minori-preview.webp', url: 'https://minoriuae.com', normX: 0.78, normY: 0.22 },
    { id: 'pobedonosec', title: 'Победоносец', cat: 'MARTIAL ARTS', img: 'assets/projects/pobedonosec-preview.jpg', url: '#', normX: 0.16, normY: 0.60 },
    { id: 'primapark', title: 'Прима Парк', cat: 'EDUCATION', img: 'assets/projects/primapark-preview.jpg', url: '#', normX: 0.84, normY: 0.58 },
    { id: 'zerno', title: 'Зерно Studio', cat: 'COFFEE NOIR', img: 'assets/projects/zerno-preview.webp', url: '#', normX: 0.32, normY: 0.80 },
    { id: 'nikol', title: 'Nikol Cabinet', cat: 'COSMETOLOGY', img: 'assets/projects/nikol-preview.jpg', url: '#', normX: 0.68, normY: 0.82 },
    { id: 'flowcrm', title: 'Flow CRM Engine', cat: 'AUTOMATION', img: 'assets/projects/flowcrm-preview.jpg', url: '#', normX: 0.12, normY: 0.40 },
    { id: 'agentic', title: 'Obsidian RAG Agent', cat: 'AI BRAIN', img: 'assets/projects/agentic-preview.jpg', url: '#', normX: 0.88, normY: 0.40 },
    { id: 'dispatch', title: 'Telegram Dispatch', cat: 'DISPATCHER', img: 'assets/projects/dispatch-preview.jpg', url: '#', normX: 0.50, normY: 0.14 },
    { id: 'spoton-ui', title: 'Spot On UI Booking', cat: 'BOOKING FLOW', img: 'assets/projects/spoton-screen.png', url: 'spoton.html', normX: 0.50, normY: 0.86 }
  ];

  // Dynamic simulation nodes
  const nodes = PROJECTS.map((p, idx) => ({
    ...p,
    index: idx,
    baseX: 0,
    baseY: 0,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    cardEl: null,
    coordEl: null
  }));

  function resize() {
    const rect = viewport.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.scale(dpr, dpr);

    nodes.forEach(n => {
      n.baseX = width * n.normX;
      n.baseY = height * n.normY;
      if (n.x === 0 && n.y === 0) {
        n.x = n.baseX;
        n.y = n.baseY;
      }
    });
  }

  // Build card elements in DOM
  cardsContainer.innerHTML = '';
  nodes.forEach(n => {
    const card = document.createElement('a');
    card.href = n.url;
    if (n.url.startsWith('http')) {
      card.target = '_blank';
      card.rel = 'noopener';
    }
    card.className = 'archive-node-card group';
    card.innerHTML = `
      <div class="relative overflow-hidden bg-black">
        <img src="${n.img}" alt="${n.title}" loading="lazy">
        <div class="absolute top-1 left-1 bg-black/80 font-mono text-[8px] text-neutral-300 px-1 border border-white/10 uppercase">
          ${n.cat}
        </div>
      </div>
      <div class="font-mono text-[10px] text-white font-semibold truncate mt-1">
        ${n.title}
      </div>
      <div class="archive-node-coord">
        <span class="coord-val">x ${Math.round(n.x)} &bull; y ${Math.round(n.y)}</span>
      </div>
    `;
    cardsContainer.appendChild(card);
    n.cardEl = card;
    n.coordEl = card.querySelector('.coord-val');
  });

  // Build 3D Ring elements
  if (ringCarousel) {
    ringCarousel.innerHTML = '';
    const angleStep = 360 / PROJECTS.length;
    const radius = 380;

    PROJECTS.forEach((p, i) => {
      const item = document.createElement('a');
      item.href = p.url;
      if (p.url.startsWith('http')) {
        item.target = '_blank';
        item.rel = 'noopener';
      }
      item.className = 'ring-3d-item group';
      item.style.transform = `rotateY(${i * angleStep}deg) translateZ(${radius}px)`;
      item.innerHTML = `
        <img src="${p.img}" alt="${p.title}" loading="lazy">
        <div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex flex-col justify-end p-2.5">
          <div class="font-mono text-[9px] text-neutral-400 uppercase">${p.cat}</div>
          <div class="font-mono text-xs text-white font-bold uppercase truncate">${p.title}</div>
        </div>
      `;
      ringCarousel.appendChild(item);
    });
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });

  // Mouse interaction on Constellation
  let mouseX = width / 2;
  let mouseY = height / 2;
  let isMouseOver = false;

  viewport.addEventListener('mouseenter', () => { isMouseOver = true; });
  viewport.addEventListener('mouseleave', () => { isMouseOver = false; });
  viewport.addEventListener('mousemove', (e) => {
    const rect = viewport.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  }, { passive: true });

  // Ring dragging
  let ringAngle = 0;
  let ringTargetAngle = 0;
  let ringDragging = false;
  let ringStartX = 0;

  viewport.addEventListener('mousedown', (e) => {
    if (currentMode === 'ring') {
      ringDragging = true;
      ringStartX = e.clientX;
    }
  });

  window.addEventListener('mousemove', (e) => {
    if (ringDragging && currentMode === 'ring') {
      const dx = e.clientX - ringStartX;
      ringTargetAngle += dx * 0.4;
      ringStartX = e.clientX;
    }
  });

  window.addEventListener('mouseup', () => {
    ringDragging = false;
  });

  // Mode Switchers
  if (btnConstellation && btnRing) {
    btnConstellation.addEventListener('click', () => {
      currentMode = 'constellation';
      btnConstellation.classList.add('bg-white', 'text-black');
      btnConstellation.classList.remove('text-neutral-400');
      btnRing.classList.remove('bg-white', 'text-black');
      btnRing.classList.add('text-neutral-400');
      canvas.style.display = 'block';
      cardsContainer.style.display = 'block';
      ringStage.style.display = 'none';
      playSoftTick();
    });

    btnRing.addEventListener('click', () => {
      currentMode = 'ring';
      btnRing.classList.add('bg-white', 'text-black');
      btnRing.classList.remove('text-neutral-400');
      btnConstellation.classList.remove('bg-white', 'text-black');
      btnConstellation.classList.add('text-neutral-400');
      canvas.style.display = 'none';
      cardsContainer.style.display = 'none';
      ringStage.style.display = 'flex';
      playSoftTick();
    });
  }

  // Animation Loop
  function loop() {
    if (currentMode === 'constellation') {
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // Draw Central Hub: glowing core
      ctx.beginPath();
      ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = '#FFFFFF';
      ctx.shadowBlur = 14;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Central Hub Label
      ctx.font = '600 10px "JetBrains Mono", monospace';
      ctx.fillStyle = '#A1A1AA';
      ctx.textAlign = 'center';
      ctx.fillText('NOKAZOO ARCHIVE · 10 SITES', centerX, centerY + 22);

      // Update nodes & draw connecting curved lines
      nodes.forEach(n => {
        // Spring to base
        const forceX = (n.baseX - n.x) * 0.04;
        const forceY = (n.baseY - n.y) * 0.04;
        n.vx = (n.vx + forceX) * 0.84;
        n.vy = (n.vy + forceY) * 0.84;

        // Mouse repulsion
        if (isMouseOver) {
          const dx = n.x - mouseX;
          const dy = n.y - mouseY;
          const dist = Math.hypot(dx, dy);
          if (dist < 180 && dist > 1) {
            const push = (180 - dist) * 0.015;
            n.vx += (dx / dist) * push;
            n.vy += (dy / dist) * push;
          }
        }

        n.x += n.vx;
        n.y += n.vy;

        // Position DOM card
        if (n.cardEl) {
          n.cardEl.style.transform = `translate(${n.x - 65}px, ${n.y - 50}px)`;
          if (n.coordEl) {
            n.coordEl.textContent = `x ${Math.round(n.x * 2.2)} · y ${Math.round(n.y * 2.2)}`;
          }
        }

        // Draw curved bezier connector
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        const midX = (centerX + n.x) / 2;
        const midY = (centerY + n.y) / 2 - 20;
        ctx.quadraticCurveTo(midX, midY, n.x, n.y);
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.stroke();

        // Small anchor node
        ctx.beginPath();
        ctx.arc(n.x, n.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
      });
    } else {
      // Ring 3D rotation with damping
      ringAngle += (ringTargetAngle - ringAngle) * 0.12;
      ringCarousel.style.transform = `rotateY(${ringAngle}deg)`;
    }

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

/* ==========================================================================
   8. INTERACTIVE AI FAQ & OBSIDIAN TERMINAL (from Video 3)
   ========================================================================== */
function initAiFaq() {
  // Accordion Items
  const items = document.querySelectorAll('.faq-accordion-item');
  items.forEach(item => {
    const btn = item.querySelector('.faq-accordion-btn');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      items.forEach(i => i.classList.remove('open'));
      if (!isOpen) {
        item.classList.add('open');
      }
      playSoftTick();
    });
  });

  // AI Prompt Terminal
  const input = document.getElementById('ai-faq-input');
  const submitBtn = document.getElementById('ai-faq-submit');
  const outputBox = document.getElementById('ai-faq-output');
  const quickTags = document.querySelectorAll('.ai-faq-tag');

  if (!input || !submitBtn || !outputBox) return;

  const KNOWLEDGE_BASE = [
    {
      keywords: ['цена', 'стоимость', 'сколько', 'прайс', 'руб'],
      answer: 'Разработка сайта с чистым кодом и скоростью 100/100 Lighthouse стоит 20 000 рублей. Внедрение автономного ИИ-агента для Telegram или CRM стоит от 15 000 до 20 000 рублей. Комплексная система (сайт + ИИ-агент под ключ) стоит от 35 000 рублей. Все цены фиксируются в договоре до начала работ.'
    },
    {
      keywords: ['стек', 'технологии', 'язык', 'на чем', 'python'],
      answer: 'Стек ориентирован на максимальную производительность: чистый семантический HTML5, кастомный CSS и ванильный JavaScript на клиенте. Для бэкенда и автоматизации использую Python (FastAPI/Jinja), PostgreSQL, SQLite и Docker. В ИИ-системах применяются локальные векторные эмбеддинги и двухконтурная проверка LLM Council.'
    },
    {
      keywords: ['spot on', 'спот он', 'приложение', 'кейс'],
      answer: 'Spot On! (spotonhub.ru): социальная платформа и система онлайн-записи для бьюти-мастеров и предпринимателей Москвы. Ключевая особенность: рейтинг строится на подтвержденных повторных визитах, а не накрученных подписчиках. Включает PWA, нативный Android APK для RuStore и встроенного ИИ-ассистента Спотти.'
    },
    {
      keywords: ['обсидиан', 'obsidian', 'база', 'память', 'rag'],
      answer: 'Мой рабочий процесс и архитектурные решения ведутся в личном графе Obsidian. При создании ИИ-агентов данные заказчика (регламенты, прайсы, скрипты) структурируются и подключаются через локальный RAG. Это дает агенту контекст эксперта и исключает галлюцинации.'
    },
    {
      keywords: ['кто ты', 'максим', 'о себе', 'разработчик', 'nokazoo'],
      answer: 'Максим (nokazoo.dev): разработчик интерфейсов и архитектор ИИ-систем из Москвы. Создаю скоростные сайты без шаблонного кода и настраиваю автономных цифровых сотрудников для реального бизнеса.'
    },
    {
      keywords: ['срок', 'долго', 'дни', 'дедлайн'],
      answer: 'Лендинг или сайт компании готов за 3-7 рабочих дней. Настройка и интеграция ИИ-агента занимает от 3 до 5 рабочих дней. Работа над комплексной системой занимает до двух недель.'
    }
  ];

  function getAiResponse(query) {
    const q = query.toLowerCase().trim();
    for (const entry of KNOWLEDGE_BASE) {
      if (entry.keywords.some(k => q.includes(k))) {
        return entry.answer;
      }
    }
    return `Хороший вопрос о "${query}". В базе знаний nokazoo зафиксировано: мы строим решения строго под специфику бизнеса без шаблонных конструкторов. Чтобы рассчитать точную архитектуру для вашей задачи, напишите мне в Telegram @nokazoodev.`;
  }

  function typewrite(text) {
    outputBox.innerHTML = '<span class="text-neutral-500 font-mono">// Поиск по базе знаний Obsidian...</span>';
    submitBtn.disabled = true;

    setTimeout(() => {
      outputBox.innerHTML = '';
      let index = 0;
      const cursor = document.createElement('span');
      cursor.className = 'inline-block w-2 h-3.5 bg-white ml-1 animate-pulse align-middle';
      outputBox.appendChild(cursor);

      const interval = setInterval(() => {
        if (index < text.length) {
          cursor.before(document.createTextNode(text[index]));
          index++;
        } else {
          clearInterval(interval);
          cursor.remove();
          submitBtn.disabled = false;
        }
      }, 14);
    }, 320);
  }

  function handleQuery(text) {
    if (!text.trim()) return;
    playSoftTick();
    const answer = getAiResponse(text);
    typewrite(answer);
  }

  submitBtn.addEventListener('click', () => {
    handleQuery(input.value);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleQuery(input.value);
    }
  });

  quickTags.forEach(tag => {
    tag.addEventListener('click', () => {
      const q = tag.getAttribute('data-query') || tag.textContent;
      input.value = q;
      handleQuery(q);
    });
  });
}
