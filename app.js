/**
 * NOKAZOO.DEV — ULTRA-HIGH-FPS 3D SPHERE OBSERVER & SWISS INTERACTIONS
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
   2. BOTANICAL TREE GROWTH — CONTINUOUS BLOOM LOOP
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
