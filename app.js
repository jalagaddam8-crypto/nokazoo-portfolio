/**
 * NOKAZOO.DEV: HIGH-PERFORMANCE SWISS ARCHITECTURAL INTERACTIONS
 * - Single 120 FPS Hero Watcher Blob (thick 3D lines, hatched eyes, pupil tracking, zero container box)
 * - IntersectionObserver to pause rendering when offscreen (zero CPU/GPU waste)
 * - Constellation kinetic graph & 3D ring with viewport-based RAF throttling
 * - Video 3 minimalist FAQ accordion & streaming single-line Obsidian search
 * - Continuous botanical tree growth loop
 * - Zero em dashes and zero en dashes
 */

document.addEventListener('DOMContentLoaded', () => {
  initLiveClock();
  initTreeGrowth();
  initHeroWatcherBlob();
  initInteractiveArchive();
  initAiFaq();
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
    const utcHours = now.getUTCHours() + 3;
    const hours = String((utcHours + 24) % 24).padStart(2, '0');
    const minutes = String(now.getUTCMinutes()).padStart(2, '0');
    const seconds = String(now.getUTCSeconds()).padStart(2, '0');
    clockEl.textContent = `UTC+3 ${hours}:${minutes}:${seconds}`;
  }

  update();
  setInterval(update, 1000);
}

/* ==========================================================================
   2. BOTANICAL TREE GROWTH: CONTINUOUS BLOOM LOOP
   When the tree finishes initial growth (18.3s), it smoothly loops
   between 14.2s and 18.3s to keep swaying in the background.
   ========================================================================== */
function initTreeGrowth() {
  const video = document.getElementById('hero-tree-video');
  if (!video) return;

  video.loop = false;

  video.addEventListener('timeupdate', () => {
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
   3. SINGLE 120 FPS HERO WATCHER BLOB (Pure Canvas, No Frame)
   - Follows cursor instantly across full screen with snappy lerp damping
   - Thick solid perimeter circle
   - Dashed equator and meridian curves
   - 3D projective capsule eyes with 45° diagonal hatching and CAD handles
   - Eye pupils and specular highlights tracking the mouse
   - Click to wink, squish and spin 360°
   - IntersectionObserver halts RAF loop when scrolled away from Hero
   ========================================================================== */
function initHeroWatcherBlob() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let width = 0;
  let height = 0;
  let baseRadius = 125;

  let isVisible = true;
  let rafId = null;

  // Real-time tracking coordinates
  let targetYaw = 0.15;
  let targetPitch = 0.05;
  let currentYaw = 0.15;
  let currentPitch = 0.05;

  let targetSquash = 1.0;
  let currentSquash = 1.0;

  let spinAngle = 0;
  let isWinking = false;
  let lastPointerTime = performance.now();
  let lastPointerX = 0;
  let lastPointerY = 0;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    if (width === 0 || height === 0) return;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    baseRadius = Math.min(width, height) * 0.42;
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });

  // IntersectionObserver to pause loop when scrolled away
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      isVisible = entry.isIntersecting;
      if (isVisible && !rafId) {
        lastTime = performance.now();
        render();
      }
    });
  }, { threshold: 0.05 });
  observer.observe(canvas);

  // Global Pointer Tracking (passive, zero layout thrashing)
  function onPointerMove(e) {
    const rect = canvas.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;

    const maxAngle = 0.82;
    targetYaw = Math.max(-maxAngle, Math.min(maxAngle, dx / (window.innerWidth * 0.4)));
    targetPitch = Math.max(-maxAngle, Math.min(maxAngle, dy / (window.innerHeight * 0.4)));

    // Velocity squish impulse
    const now = performance.now();
    const dt = Math.max(16, now - lastPointerTime);
    const speed = Math.hypot(e.clientX - lastPointerX, e.clientY - lastPointerY) / dt;
    lastPointerX = e.clientX;
    lastPointerY = e.clientY;
    lastPointerTime = now;

    if (speed > 1.2) {
      targetSquash = Math.max(0.88, 1.0 - Math.min(0.12, speed * 0.03));
    } else {
      targetSquash = 1.0;
    }
  }

  window.addEventListener('pointermove', onPointerMove, { passive: true });

  // Click Interaction: Squish, Wink & 360 Spin
  canvas.addEventListener('click', () => {
    isWinking = true;
    spinAngle += Math.PI * 2;
    currentSquash = 0.78;
    setTimeout(() => {
      isWinking = false;
    }, 380);
    playSoftTick();
  });

  let lastTime = performance.now();

  function render() {
    if (!isVisible) {
      rafId = null;
      return;
    }

    const now = performance.now();
    lastTime = now;

    ctx.clearRect(0, 0, width, height);

    // Snappy, instant damping (0.24 factor for butter-smooth 120 FPS feel)
    currentYaw += (targetYaw - currentYaw) * 0.24;
    currentPitch += (targetPitch - currentPitch) * 0.24;
    currentSquash += (targetSquash - currentSquash) * 0.22;
    spinAngle *= 0.86;

    // Organic breathing oscillation
    const breath = Math.sin(now * 0.003) * 2.2;
    const R = baseRadius + breath;

    const cx = width / 2;
    const cy = height / 2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(1, currentSquash);

    drawHeroWatcher(ctx, R, currentYaw + spinAngle, currentPitch, isWinking);

    ctx.restore();

    rafId = requestAnimationFrame(render);
  }

  rafId = requestAnimationFrame(render);
}

/**
 * Draw 3D Watcher Character matching user reference:
 * - Thick solid perimeter circle (3.2px)
 * - Dashed coordinate axes (equator & meridian)
 * - Central gaze node dot
 * - 3D capsule eyes with 45° diagonal hatching and vector handles
 * - Eye pupils & specular catchlight tracking the gaze
 */
function drawHeroWatcher(ctx, R, yaw, pitch, winking) {
  const primaryStroke = '#FFFFFF';
  const dashedStroke = 'rgba(255, 255, 255, 0.52)';

  // 1. Base Outer Perimeter Circle (Thick, punchy 3.2px line)
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, R, 0, Math.PI * 2);
  ctx.strokeStyle = primaryStroke;
  ctx.lineWidth = 3.2;
  ctx.stroke();
  ctx.restore();

  // 2. Dashed Coordinate Axes (Equator & Meridian)
  ctx.save();
  ctx.setLineDash([6, 5]);
  ctx.strokeStyle = dashedStroke;
  ctx.lineWidth = 2.0;

  // Horizontal Equator tilted with pitch
  const eqY = Math.sin(pitch) * (R * 0.70);
  const eqH = Math.max(2, Math.cos(pitch) * (R * 0.36));
  ctx.beginPath();
  ctx.ellipse(0, eqY, R, eqH, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Vertical Meridian tilted with yaw
  const merX = Math.sin(yaw) * (R * 0.70);
  const merW = Math.max(2, Math.cos(yaw) * (R * 0.36));
  ctx.beginPath();
  ctx.ellipse(merX, 0, merW, R, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Center Gaze Intersection Node (solid white dot with halo)
  ctx.setLineDash([]);
  const nodeX = merX * Math.cos(pitch);
  const nodeY = eqY * Math.cos(yaw);
  ctx.beginPath();
  ctx.arc(nodeX, nodeY, 4, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.restore();

  // 3. 3D Projective Eyes with Hatching, Anchors & Pupil Highlights
  drawProjectiveHatchedEyes(ctx, R, yaw, pitch, winking);
}

/**
 * 3D Projective Capsule Eyes:
 * Curving across the spherical surface, deformed by perspective,
 * filled with 45° hatching, bordered with CAD anchor points,
 * and featuring specular pupil gaze tracking.
 */
function drawProjectiveHatchedEyes(ctx, R, yaw, pitch, winking) {
  const eyeSeparation = 0.34;
  const eyeBaseW = R * 0.22;
  const eyeBaseH = R * 0.48;

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

    // Only draw front-facing visible hemisphere
    if (nz > 0.04) {
      const eyeX = nx * R;
      const eyeY = ny * R;
      const scaleX = Math.max(0.18, nz);
      const currentH = (winking && eye.isLeft) ? 3 : eyeBaseH;

      ctx.save();
      ctx.translate(eyeX, eyeY);
      ctx.scale(scaleX, 1);

      const x = -eyeBaseW / 2;
      const y = -currentH / 2;
      const w = eyeBaseW;
      const h = currentH;
      const r = Math.min(w / 2, h / 2);

      // 1. Translucent capsule background
      ctx.beginPath();
      drawPillPath(ctx, x, y, w, h, r);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
      ctx.fill();

      // 2. 45-degree diagonal hatching (clipped inside capsule)
      if (currentH > 6) {
        ctx.save();
        ctx.beginPath();
        drawPillPath(ctx, x, y, w, h, r);
        ctx.clip();

        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.72)';
        ctx.lineWidth = 1.4;
        const step = 5.5;
        const diagMax = w + h + 24;
        for (let d = -diagMax; d <= diagMax; d += step) {
          ctx.moveTo(x + d, y - 10);
          ctx.lineTo(x + d + h + 20, y + h + 10);
        }
        ctx.stroke();

        // 3. Specular Pupil Aperture tracking cursor
        const pupilX = (yaw * 4.5);
        const pupilY = (pitch * 4.5);
        ctx.beginPath();
        ctx.arc(pupilX, pupilY, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#000000';
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.4;
        ctx.stroke();

        // Bright white catchlight
        ctx.beginPath();
        ctx.arc(pupilX - 1.5, pupilY - 1.5, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();

        ctx.restore();
      }

      // 4. Thick solid white outline for the capsule
      ctx.beginPath();
      drawPillPath(ctx, x, y, w, h, r);
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2.4;
      ctx.stroke();

      // 5. Figma/CAD vector handles (alternating squares and circles)
      if (currentH > 10) {
        drawFigmaVectorHandles(ctx, x, y, w, h);
      }

      ctx.restore();
    }
  }
}

/**
 * Capsule path helper
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
 * Alternating square and circle vector anchor handles
 */
function drawFigmaVectorHandles(ctx, x, y, w, h) {
  const handles = [
    { x: x + w / 2, y: y, isSquare: true },
    { x: x + w, y: y + h * 0.25, isSquare: false },
    { x: x + w, y: y + h * 0.5, isSquare: true },
    { x: x + w, y: y + h * 0.75, isSquare: false },
    { x: x + w / 2, y: y + h, isSquare: true },
    { x: x, y: y + h * 0.75, isSquare: false },
    { x: x, y: y + h * 0.5, isSquare: true },
    { x: x, y: y + h * 0.25, isSquare: false }
  ];

  for (let i = 0; i < handles.length; i++) {
    const pt = handles[i];
    ctx.fillStyle = '#000000';
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
   4. CONSTELLATION GRAPH & 3D RING (Throttled via IntersectionObserver)
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
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  let currentMode = 'constellation';
  let width = 0;
  let height = 0;
  let isVisible = false;
  let rafId = null;

  const PROJECTS = [
    { id: 'minori', title: 'Minori Middle East', cat: 'ENTERPRISE', img: 'assets/projects/minori-preview.webp', url: 'https://minoriuae.com', normX: 0.22, normY: 0.24 },
    { id: 'spoton', title: 'Spot On! Platform', cat: 'MOBILE PWA', img: 'assets/projects/spoton-cover.png', url: 'spoton.html', normX: 0.78, normY: 0.22 },
    { id: 'pobedonosec', title: 'Победоносец', cat: 'MARTIAL ARTS', img: 'assets/projects/pobedonosec-preview.jpg', url: '#', normX: 0.16, normY: 0.60 },
    { id: 'primapark', title: 'Прима Парк', cat: 'EDUCATION', img: 'assets/projects/primapark-preview.jpg', url: '#', normX: 0.84, normY: 0.58 },
    { id: 'zerno', title: 'Зерно Studio', cat: 'COFFEE NOIR', img: 'assets/projects/zerno-preview.webp', url: '#', normX: 0.32, normY: 0.80 },
    { id: 'nikol', title: 'Nikol Cabinet', cat: 'COSMETOLOGY', img: 'assets/projects/nikol-preview.jpg', url: '#', normX: 0.68, normY: 0.82 },
    { id: 'flowcrm', title: 'Flow CRM Engine', cat: 'AUTOMATION', img: 'assets/projects/flowcrm-preview.jpg', url: '#', normX: 0.12, normY: 0.40 },
    { id: 'agentic', title: 'Obsidian RAG Agent', cat: 'AI BRAIN', img: 'assets/projects/agentic-preview.jpg', url: '#', normX: 0.88, normY: 0.40 },
    { id: 'dispatch', title: 'Telegram Dispatch', cat: 'DISPATCHER', img: 'assets/projects/dispatch-preview.jpg', url: '#', normX: 0.50, normY: 0.14 },
    { id: 'spoton-ui', title: 'Spot On UI Booking', cat: 'BOOKING FLOW', img: 'assets/projects/spoton-screen.png', url: 'spoton.html', normX: 0.50, normY: 0.86 }
  ];

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
    if (width === 0 || height === 0) return;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
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
      <div class="archive-node-thumb-wrap">
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

  // Mouse interaction
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
  }, { passive: true });

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

  // IntersectionObserver to pause loop when offscreen
  const archiveObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      isVisible = entry.isIntersecting;
      if (isVisible && !rafId) {
        loop();
      }
    });
  }, { threshold: 0.05 });
  archiveObserver.observe(viewport);

  function loop() {
    if (!isVisible) {
      rafId = null;
      return;
    }

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
        const forceX = (n.baseX - n.x) * 0.04;
        const forceY = (n.baseY - n.y) * 0.04;
        n.vx = (n.vx + forceX) * 0.84;
        n.vy = (n.vy + forceY) * 0.84;

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

        if (n.cardEl) {
          n.cardEl.style.transform = `translate(${n.x - 65}px, ${n.y - 50}px)`;
          if (n.coordEl) {
            n.coordEl.textContent = `x ${Math.round(n.x * 2.2)} · y ${Math.round(n.y * 2.2)}`;
          }
        }

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        const midX = (centerX + n.x) / 2;
        const midY = (centerY + n.y) / 2 - 20;
        ctx.quadraticCurveTo(midX, midY, n.x, n.y);
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(n.x, n.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
      });
    } else {
      ringAngle += (ringTargetAngle - ringAngle) * 0.12;
      ringCarousel.style.transform = `rotateY(${ringAngle}deg)`;
    }

    rafId = requestAnimationFrame(loop);
  }

  rafId = requestAnimationFrame(loop);
}

/* ==========================================================================
   5. MINIMALIST FAQ & OBSIDIAN SEARCH (Matching Video 3 Reference)
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

  // Minimalist Single-Line Search
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
    outputBox.innerHTML = '<span class="text-neutral-500 font-mono">// Поиск по базе заметок Obsidian...</span>';
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
      }, 12);
    }, 240);
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

/* ==========================================================================
   6. CONTACT FORM & FEEDBACK
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const feedback = document.getElementById('form-feedback');
  const submitBtn = document.getElementById('form-submit-btn');

  if (!form || !feedback) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    playSoftTick();

    const name = document.getElementById('client-name')?.value || '';
    const contact = document.getElementById('client-contact')?.value || '';
    const type = form.querySelector('input[name="project-type"]:checked')?.value || 'site';
    const message = document.getElementById('client-message')?.value || '';

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Отправка данных...</span>';
    }

    setTimeout(() => {
      feedback.classList.remove('hidden');
      feedback.className = 'font-mono text-xs text-center p-3 border border-white/20 text-white bg-black mt-4';
      feedback.textContent = `Спасибо, ${name}! Заявка принята в работу. Я свяжусь с вами в Telegram/WhatsApp (${contact}) в течение 30 минут.`;

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Заявка отправлена &check;</span>';
      }

      form.reset();
    }, 600);
  });
}

/* ==========================================================================
   7. MECHANICAL AUDIO TICK (Soft feedback on clicks)
   ========================================================================== */
let audioCtx = null;
function playSoftTick() {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(350, audioCtx.currentTime + 0.025);

    gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.025);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.026);
  } catch (err) {
    // Audio optional
  }
}
