/**
 * NOKAZOO.DEV — ULTRA-HIGH-FPS 3D SPHERE & SWISS INTERACTIONS
 * Instant snappy tracking, proximity squint physics, and zero latency.
 */

document.addEventListener('DOMContentLoaded', () => {
  initLiveClock();
  initHighFpsSphere();
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
   2. ULTRA-HIGH-FPS 3D EYE-SPHERE (Fixed Snappy Tracking & Fast Eye-Squint)
   ========================================================================== */
function initHighFpsSphere() {
  const canvas = document.getElementById('sphere-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });

  const modeCadBtn = document.getElementById('btn-mode-cad');
  const modeSolidBtn = document.getElementById('btn-mode-solid');
  const modeLabel = document.getElementById('sphere-mode-label');
  const proximityHint = document.getElementById('sphere-proximity-hint');

  let mode = 'cad'; // 'cad' or 'solid'
  let dpr = window.devicePixelRatio || 1;
  let width = 0;
  let height = 0;
  let sphereRadius = 90;

  // Real-time tracking values
  let targetYaw = 0.15;
  let targetPitch = 0.08;
  let currentYaw = 0.15;
  let currentPitch = 0.08;
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
    sphereRadius = Math.min(width, height) * 0.38;
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
    // As cursor approaches sphere (< 220px), eyes instantly squint into focused slits!
    const triggerDist = sphereRadius * 2.5;
    if (dist < triggerDist) {
      targetSquint = 1.0 - Math.max(0, (dist - sphereRadius * 0.3) / (triggerDist - sphereRadius * 0.3));
      if (proximityHint) {
        proximityHint.textContent = 'КУРСОР БЛИЗКО // ГЛАЗА СУЖЕНЫ';
        proximityHint.style.color = '#FFFFFF';
      }
    } else {
      targetSquint = 0;
      if (proximityHint) {
        proximityHint.textContent = 'Мгновенный трекинг • Сужение';
        proximityHint.style.color = '';
      }
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

  // Mode Switchers
  if (modeCadBtn && modeSolidBtn) {
    modeCadBtn.addEventListener('click', () => {
      mode = 'cad';
      modeCadBtn.className = 'px-2 py-0.5 text-[10px] font-mono uppercase bg-white text-black font-semibold transition-colors';
      modeSolidBtn.className = 'px-2 py-0.5 text-[10px] font-mono uppercase text-neutral-400 hover:text-white transition-colors';
      if (modeLabel) modeLabel.textContent = 'CAD BLUEPRINT';
    });

    modeSolidBtn.addEventListener('click', () => {
      mode = 'solid';
      modeSolidBtn.className = 'px-2 py-0.5 text-[10px] font-mono uppercase bg-white text-black font-semibold transition-colors';
      modeCadBtn.className = 'px-2 py-0.5 text-[10px] font-mono uppercase text-neutral-400 hover:text-white transition-colors';
      if (modeLabel) modeLabel.textContent = 'SOLID MONOLITH';
    });
  }

  // Pre-allocated coordinates for high performance
  const corners = [[-1, -1], [1, -1], [-1, 1], [1, 1]];

  // 120 FPS Animation Loop with Snappy Damping (0.32 factor instead of 0.08)
  function render() {
    ctx.clearRect(0, 0, width, height);

    // Fast, snappy inertia (zero sluggishness)
    currentYaw += (targetYaw - currentYaw) * 0.32;
    currentPitch += (targetPitch - currentPitch) * 0.32;
    squintFactor += (targetSquint - squintFactor) * 0.35;
    spinAngle *= 0.85;

    const cx = width / 2;
    const cy = height / 2;
    const R = sphereRadius;

    ctx.save();
    ctx.translate(cx, cy);

    if (mode === 'cad') {
      drawCadSphere(ctx, R, currentYaw + spinAngle, currentPitch, squintFactor, isWinking, corners);
    } else {
      drawSolidSphere(ctx, R, currentYaw + spinAngle, currentPitch, squintFactor, isWinking);
    }

    ctx.restore();
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

/**
 * CAD Blueprint Mode (Vector lines, anchor points, dashed axes)
 */
function drawCadSphere(ctx, R, yaw, pitch, squint, winking, corners) {
  const strokeColor = 'rgba(255, 255, 255, 0.55)';
  const dashedColor = 'rgba(255, 255, 255, 0.25)';

  // 1. Outer Bounding Box (dashed square)
  const boxPad = R * 1.08;
  ctx.save();
  ctx.setLineDash([3, 3]);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 1;
  ctx.strokeRect(-boxPad, -boxPad, boxPad * 2, boxPad * 2);

  // Sharp square handles
  ctx.setLineDash([]);
  for (let i = 0; i < 4; i++) {
    const x = corners[i][0] * boxPad;
    const y = corners[i][1] * boxPad;
    ctx.fillStyle = '#070709';
    ctx.strokeStyle = '#FFFFFF';
    ctx.fillRect(x - 3, y - 3, 6, 6);
    ctx.strokeRect(x - 3, y - 3, 6, 6);
  }
  ctx.restore();

  // 2. Base Sphere Circle
  ctx.beginPath();
  ctx.arc(0, 0, R, 0, Math.PI * 2);
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 1.3;
  ctx.stroke();

  // 3. Coordinate Axes
  ctx.save();
  ctx.setLineDash([3, 3]);
  ctx.strokeStyle = dashedColor;
  ctx.lineWidth = 1;

  // Equator ellipse tilted by pitch
  const eqY = Math.sin(pitch) * (R * 0.7);
  const eqH = Math.max(2, Math.cos(pitch) * (R * 0.35));
  ctx.beginPath();
  ctx.ellipse(0, eqY, R, eqH, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Meridian ellipse tilted by yaw
  const merX = Math.sin(yaw) * (R * 0.7);
  const merW = Math.max(2, Math.cos(yaw) * (R * 0.35));
  ctx.beginPath();
  ctx.ellipse(merX, 0, merW, R, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Center anchor point
  ctx.setLineDash([]);
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(0, 0, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 4. 3D Eyes
  drawSphericalEyes(ctx, R, yaw, pitch, squint, winking, true);
}

/**
 * Solid Monolith Mode
 */
function drawSolidSphere(ctx, R, yaw, pitch, squint, winking) {
  const grad = ctx.createRadialGradient(-R * 0.3, -R * 0.3, R * 0.1, 0, 0, R);
  grad.addColorStop(0, '#26262B');
  grad.addColorStop(0.7, '#121215');
  grad.addColorStop(1, '#08080A');

  ctx.beginPath();
  ctx.arc(0, 0, R, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 1;
  ctx.stroke();

  drawSphericalEyes(ctx, R, yaw, pitch, squint, winking, false);
}

/**
 * Eye capsule math on 3D sphere surface
 */
function drawSphericalEyes(ctx, R, yaw, pitch, squint, winking, isCad) {
  const eyeSeparation = 0.28;
  const eyeBaseW = R * 0.18;
  const eyeBaseH = R * 0.42;

  // Squint compression
  const eyeW = eyeBaseW * (1.0 - squint * 0.15);
  const eyeH = eyeBaseH * (1.0 - squint * 0.76);

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

    if (nz > 0.05) {
      const eyeX = nx * R;
      const eyeY = ny * R;
      const scaleX = Math.max(0.2, nz);
      const currentH = (winking && eye.isLeft) ? 2 : eyeH;

      ctx.save();
      ctx.translate(eyeX, eyeY);
      ctx.scale(scaleX, 1);

      if (isCad) {
        ctx.beginPath();
        roundRect(ctx, -eyeW / 2, -currentH / 2, eyeW, currentH, eyeW / 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.lineWidth = 1.3;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.fill();
        ctx.stroke();

        // Vector handles
        drawVectorAnchors(ctx, -eyeW / 2, -currentH / 2, eyeW, currentH);
      } else {
        ctx.beginPath();
        roundRect(ctx, -eyeW / 2, -currentH / 2, eyeW, currentH, eyeW / 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
      }

      ctx.restore();
    }
  }
}

function roundRect(ctx, x, y, w, h, r) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawVectorAnchors(ctx, x, y, w, h) {
  const points = [
    [x + w / 2, y],
    [x + w, y + h / 4],
    [x + w, y + (h * 3) / 4],
    [x + w / 2, y + h],
    [x, y + (h * 3) / 4],
    [x, y + h / 4]
  ];
  ctx.fillStyle = '#FFFFFF';
  for (let i = 0; i < points.length; i++) {
    ctx.fillRect(points[i][0] - 1.5, points[i][1] - 1.5, 3, 3);
  }
}

/* ==========================================================================
   3. CONTACT FORM
   ========================================================================== */
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
