/**
 * NOKAZOO.DEV: HIGH-PERFORMANCE SWISS MINIMALIST ENGINE
 * - Single Hero Ghost Blob with 12-vertex radial spring jelly physics
 * - Smooth eye gaze tracking, draggable with rebound spring-back to center
 * - Hardware-accelerated 3D Linktree Carousel (120 FPS, drag inertia, ambient drift)
 * - Botanical tree growth: plays once on page load and remains fully grown
 * - Giant scroll-fill typography in footer driven by viewport progress
 * - Obsidian knowledge base typewriter search & minimalist FAQ
 * - Humanizer compliance: ZERO em dashes and ZERO en dashes
 */

document.addEventListener('DOMContentLoaded', () => {
  initLiveClock();
  initTreeGrowth();
  initHeroGhostBlob();
  initLinktreeCarousel();
  initAiFaq();
  initFooterScrollFill();
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
   2. BOTANICAL TREE GROWTH BACKGROUND
   Plays once on page load and remains permanently grown at 1.8x playback speed.
   ========================================================================== */
function initTreeGrowth() {
  const video = document.getElementById('hero-tree-video');
  if (!video) return;

  video.loop = false;
  // Accelerated playback speed for dynamic growth
  video.playbackRate = 1.85;

  video.addEventListener('timeupdate', () => {
    // If it reaches full maturity (18.2s), lock on the final grown state
    if (video.currentTime >= 18.2) {
      video.pause();
    }
  });

  video.addEventListener('ended', () => {
    video.pause();
  });
}

/* ==========================================================================
   2. INTERACTIVE MONOCHROME OBSERVER BLOB (B&W, Mirrored, 120 FPS, Fling-Off Physics)
   - Monochromatic Stark Black & White Palette (#FFFFFF body, #000000 eyes)
   - Horizontally Mirrored contour (droplet tail points right)
   - High-frame-rate physics with Delta-Time (60-120 FPS)
   - Natural periodic blinking and pupil micro-saccades
   - Velocity squash & stretch along motion trajectory
   - Interactive drag anywhere across the entire website
   - Fling/throw off screen with smooth exit and restore pill
   ========================================================================== */
function initHeroGhostBlob() {
  const canvas = document.getElementById("hero-ghost-blob");
  if (!canvas) return;

  const restoreBtn = document.getElementById("restore-blob-btn");

  const ctx = canvas.getContext("2d", { alpha: true });
  const dpr = Math.max(window.devicePixelRatio || 1, 2);

  const width = 220;
  const height = 200;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // Mirrored 16-point contour (tail points to the right)
  const BASE_RADII = [
    65, 92, 80, 64, 65, 68, 71, 74, 76, 78, 78, 77, 74, 71, 65, 62
  ];
  const numPoints = 16;
  const points = BASE_RADII.map((r, i) => ({
    angle: (i / numPoints) * Math.PI * 2,
    baseR: r,
    r: r,
    vr: 0
  }));

  // Initial positioning attached to #blob-anchor in FAQ section
  let isDetached = false;
  let isOffScreen = false;
  let isFlingingOut = false;
  let posX = window.innerWidth / 2 - width / 2;
  let posY = window.innerHeight * 1.5;

  function updateAnchor() {
    if (isDetached || isOffScreen) return;
    const anchor = document.getElementById("blob-anchor");
    if (anchor) {
      const rect = anchor.getBoundingClientRect();
      posX = rect.left + (rect.width - width) / 2;
      posY = rect.top + (rect.height - height) / 2 - 10;
      canvas.style.left = posX + "px";
      canvas.style.top = posY + "px";
    }
  }

  updateAnchor();
  window.addEventListener("scroll", updateAnchor, { passive: true });
  window.addEventListener("resize", updateAnchor, { passive: true });

  // Pointer tracking & Velocity history for realistic flinging
  let globalPointerX = window.innerWidth / 2;
  let globalPointerY = window.innerHeight / 2;
  let isDragging = false;
  let dragOffsetX = 0;
  let dragOffsetY = 0;
  let vx = 0;
  let vy = 0;
  const pointerHistory = [];

  // Animation states
  let currentSquint = 0;
  let surpriseTimer = 0;
  let currentStretch = 1.0;
  let currentAngle = 0;
  let blinkTimer = 0;
  let nextBlinkTime = 3.5 + Math.random() * 2.5;
  let isBlinking = false;
  let blinkProgress = 0;
  let idleTime = 0;
  let autoRestoreTimer = null;

  function playTick() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(620, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, audioCtx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.04);
    } catch (_) {}
  }

  function startDrag(clientX, clientY) {
    isDragging = true;
    isDetached = true;
    isFlingingOut = false;
    isOffScreen = false;
    if (autoRestoreTimer) {
      clearTimeout(autoRestoreTimer);
      autoRestoreTimer = null;
    }
    if (restoreBtn) restoreBtn.style.display = "none";

    dragOffsetX = clientX - posX;
    dragOffsetY = clientY - posY;
    pointerHistory.length = 0;
    pointerHistory.push({ x: clientX, y: clientY, t: performance.now() });
    vx = 0;
    vy = 0;
    surpriseTimer = 0;
    playTick();
  }

  function updateDrag(clientX, clientY) {
    if (!isDragging) return;
    const now = performance.now();
    pointerHistory.push({ x: clientX, y: clientY, t: now });
    if (pointerHistory.length > 5) pointerHistory.shift();

    const nextX = clientX - dragOffsetX;
    const nextY = clientY - dragOffsetY;

    const instVx = (nextX - posX) * 0.45;
    const instVy = (nextY - posY) * 0.45;
    posX = nextX;
    posY = nextY;
    canvas.style.left = posX + "px";
    canvas.style.top = posY + "px";

    for (const p of points) {
      const dirX = Math.cos(p.angle);
      const dirY = Math.sin(p.angle);
      const dot = -(dirX * instVx + dirY * instVy);
      if (dot > 0) {
        p.vr += dot * 0.35;
      }
    }
  }

  function endDrag() {
    if (!isDragging) return;
    isDragging = false;

    if (pointerHistory.length >= 2) {
      const p1 = pointerHistory[0];
      const p2 = pointerHistory[pointerHistory.length - 1];
      const dt = Math.max((p2.t - p1.t) / 1000, 0.016);
      vx = (p2.x - p1.x) / (dt * 60);
      vy = (p2.y - p1.y) / (dt * 60);
    }

    const releaseSpeed = Math.hypot(vx, vy);
    const isNearEdge = (
      posX < 10 ||
      posX > window.innerWidth - width - 10 ||
      posY < 10 ||
      posY > window.innerHeight - height - 10
    );

    if (releaseSpeed > 7 || isNearEdge) {
      isFlingingOut = true;
      surpriseTimer = 45;
      if (releaseSpeed < 7) {
        if (posX < 30) vx = -14;
        else if (posX > window.innerWidth - width - 30) vx = 14;
        if (posY < 30) vy = -14;
        else if (posY > window.innerHeight - height - 30) vy = 14;
      }
    } else {
      surpriseTimer = 24;
      for (const p of points) {
        p.vr += (Math.random() - 0.5) * 8;
      }
    }
  }

  window.addEventListener("mousemove", (e) => {
    globalPointerX = e.clientX;
    globalPointerY = e.clientY;
    if (isDragging) updateDrag(e.clientX, e.clientY);
  }, { passive: true });

  canvas.addEventListener("mousedown", (e) => {
    e.preventDefault();
    startDrag(e.clientX, e.clientY);
  });

  window.addEventListener("mouseup", endDrag);

  canvas.addEventListener("touchstart", (e) => {
    if (e.touches.length === 1) {
      startDrag(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  window.addEventListener("touchmove", (e) => {
    if (isDragging && e.touches.length === 1) {
      globalPointerX = e.touches[0].clientX;
      globalPointerY = e.touches[0].clientY;
      updateDrag(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  window.addEventListener("touchend", endDrag);

  function returnBlob() {
    if (!isOffScreen) return;
    isOffScreen = false;
    isFlingingOut = false;
    if (restoreBtn) restoreBtn.style.display = "none";

    posX = Math.max(30, Math.min(window.innerWidth - width - 30, window.innerWidth * 0.5 - width / 2));
    posY = -height - 20;
    vx = (Math.random() - 0.5) * 3;
    vy = 20;
    canvas.style.left = posX + "px";
    canvas.style.top = posY + "px";
    surpriseTimer = 35;
  }

  if (restoreBtn) {
    restoreBtn.addEventListener("click", returnBlob);
  }

  const cx = width / 2;
  const cy = height / 2;
  const stiffness = 0.18;
  const damping = 0.80;
  let lastTime = performance.now();

  function render(now) {
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    idleTime += dt;

    ctx.clearRect(0, 0, width, height);

    if (!isDragging && !isOffScreen) {
      if (!isDetached) {
        updateAnchor();
      } else {
        posX += vx;
        posY += vy;

        if (isFlingingOut) {
          const pad = 240;
          if (
            posX < -pad ||
            posX > window.innerWidth + pad ||
            posY < -pad ||
            posY > window.innerHeight + pad
          ) {
            isOffScreen = true;
            isFlingingOut = false;
            vx = 0;
            vy = 0;
            if (restoreBtn) restoreBtn.style.display = "inline-flex";
            if (autoRestoreTimer) clearTimeout(autoRestoreTimer);
            autoRestoreTimer = setTimeout(returnBlob, 4500);
          }
        } else {
          vx *= 0.93;
          vy *= 0.93;

          const pad = 12;
          if (posX < pad) { posX = pad; vx = -vx * 0.5; }
          if (posX > window.innerWidth - width - pad) { posX = window.innerWidth - width - pad; vx = -vx * 0.5; }
          if (posY < pad) { posY = pad; vy = -vy * 0.5; }
          if (posY > window.innerHeight - height - pad) {
            posY = window.innerHeight - height - pad;
            if (Math.abs(vy) > 3) {
              currentStretch = 1.35;
              for (const p of points) p.vr += (Math.random() - 0.5) * 6;
            }
            vy = -vy * 0.45;
          }
        }

        canvas.style.left = posX + "px";
        canvas.style.top = posY + "px";
      }
    }

    for (let i = 0; i < numPoints; i++) {
      const p = points[i];
      const prev = points[(i - 1 + numPoints) % numPoints];
      const next = points[(i + 1) % numPoints];

      p.vr += (prev.vr + next.vr - 2 * p.vr) * 0.09;

      const force = (p.baseR - p.r) * stiffness;
      p.vr = (p.vr + force) * damping;
      p.r += p.vr;
    }

    const speed = Math.hypot(vx, vy);
    const targetStretch = 1 + Math.min(speed * 0.007, 0.45);
    currentStretch += (targetStretch - currentStretch) * 0.2;
    const currentSquash = 1 / currentStretch;

    if (speed > 1.5) {
      const targetAngle = Math.atan2(vy, vx);
      currentAngle += (targetAngle - currentAngle) * 0.15;
    } else {
      currentAngle += (0 - currentAngle) * 0.15;
    }

    blinkTimer += dt;
    if (blinkTimer > nextBlinkTime) {
      isBlinking = true;
      blinkProgress += dt * 14;
      if (blinkProgress >= Math.PI) {
        isBlinking = false;
        blinkProgress = 0;
        blinkTimer = 0;
        nextBlinkTime = 3.5 + Math.random() * 3.0;
      }
    }

    const breath = 1.0 + Math.sin(idleTime * 2.2) * 0.012;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(currentAngle * 0.22);
    ctx.scale(currentStretch * breath, currentSquash * breath);
    ctx.translate(-cx, -cy);

    const coords = points.map(p => ({
      x: cx + Math.cos(p.angle) * p.r,
      y: cy + Math.sin(p.angle) * p.r
    }));

    ctx.beginPath();
    ctx.moveTo(
      (coords[0].x + coords[numPoints - 1].x) / 2,
      (coords[0].y + coords[numPoints - 1].y) / 2
    );
    for (let i = 0; i < numPoints; i++) {
      const next = coords[(i + 1) % numPoints];
      const midX = (coords[i].x + next.x) / 2;
      const midY = (coords[i].y + next.y) / 2;
      ctx.quadraticCurveTo(coords[i].x, coords[i].y, midX, midY);
    }
    ctx.closePath();

    // STARK BLACK & WHITE PALETTE (Pure White with subtle monochrome shading)
    const bodyGrad = ctx.createRadialGradient(
      cx + 12, cy - 16, 10,
      cx, cy, 96
    );
    bodyGrad.addColorStop(0, "#FFFFFF");
    bodyGrad.addColorStop(0.72, "#F2F2F5");
    bodyGrad.addColorStop(1, "#DCDCE2");
    ctx.fillStyle = bodyGrad;
    ctx.fill();

    ctx.lineWidth = 1.6;
    ctx.strokeStyle = "rgba(200, 200, 208, 0.85)";
    ctx.stroke();

    const blobCenterX = posX + cx;
    const blobCenterY = posY + cy;
    const distToPointer = Math.hypot(globalPointerX - blobCenterX, globalPointerY - blobCenterY);
    const eyeAngle = Math.atan2(globalPointerY - blobCenterY, globalPointerX - blobCenterX);
    const eyeGazeDist = Math.min(9, distToPointer * 0.02);

    const gazeX = Math.cos(eyeAngle) * eyeGazeDist;
    const gazeY = Math.sin(eyeAngle) * eyeGazeDist;

    const targetSquint = (isDragging || distToPointer < 110) ? 1.0 : 0.0;
    currentSquint += (targetSquint - currentSquint) * 0.22;

    let rx = 11 * (1 + currentSquint * 0.15);
    let ry = Math.max(1.8, 14 * (1 - currentSquint * 0.88));

    if (isBlinking) {
      ry *= Math.max(0.04, 1 - Math.sin(blinkProgress));
    }

    if (surpriseTimer > 0) {
      const widen = (surpriseTimer / 35) * 4.5;
      rx += widen;
      ry += widen;
      surpriseTimer--;
    }

    const leftEyeX = cx - 25 + gazeX;
    const rightEyeX = cx + 25 + gazeX;
    const eyeY = cy - 12 + gazeY;

    // Solid obsidian black eyes (NO catchlights, pure monochrome)
    ctx.fillStyle = "#000000";

    ctx.beginPath();
    ctx.ellipse(leftEyeX, eyeY, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(rightEyeX, eyeY, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

/* ==========================================================================
   4. LINKTREE 3D CAROUSEL (120 FPS Hardware-Accelerated Cylindrical Stage)
   - 8 selected projects arranged in a 3D cylindrical ring
   - Drag / swipe with smooth inertia momentum
   - Ambient idle rotation
   - Pauses rendering when scrolled away via IntersectionObserver
   ========================================================================== */
function initLinktreeCarousel() {
  const stage = document.getElementById('linktree-stage');
  const carousel = document.getElementById('linktree-carousel');
  if (!stage || !carousel) return;

  const PROJECTS = [
    {
      id: 'zerno',
      title: 'Zerno Studio',
      cat: 'КАСТОМНАЯ МЕБЕЛЬ & КУХНИ',
      img: 'assets/projects/zerno-preview.webp',
      url: 'https://zerno-studio.ru'
    },
    {
      id: 'primapark',
      title: 'Prima Park',
      cat: 'ПРЕМИУМ ЖИЛОЙ КОМПЛЕКС',
      img: 'assets/projects/primapark-preview.jpg',
      url: '#'
    },
    {
      id: 'pobedonosec',
      title: 'Победоносец',
      cat: 'ТАКТИЧЕСКАЯ ЭКИПИРОВКА',
      img: 'assets/projects/pobedonosec-preview.jpg',
      url: '#'
    },
    {
      id: 'flowcrm',
      title: 'Flow CRM',
      cat: 'B2B SAAS АНАЛИТИКА',
      img: 'assets/projects/flowcrm-preview.jpg',
      url: '#'
    },
    {
      id: 'nikol',
      title: 'Nikol Cabinet',
      cat: 'ЧАСТНАЯ КОСМЕТОЛОГИЯ',
      img: 'assets/projects/nikol-preview.jpg',
      url: '#'
    },
    {
      id: 'dispatch',
      title: 'Dispatch Hub',
      cat: 'ЛОГИСТИКА И ТРЕКИНГ',
      img: 'assets/projects/dispatch-preview.jpg',
      url: '#'
    },
    {
      id: 'agentic',
      title: 'Agentic Operations',
      cat: 'АВТОНОМНЫЕ ИИ-АГЕНТЫ',
      img: 'assets/projects/agentic-preview.jpg',
      url: '#ai-agents'
    },
    {
      id: 'spoton',
      title: 'Spot On! Platform',
      cat: 'PWA & RUSTORE APK',
      img: 'assets/projects/spoton-screen.png',
      url: 'spoton.html'
    }
  ];

  const total = PROJECTS.length;
  // Calculate radius based on card width (280px) and angle: R = (width / 2) / tan(PI / total)
  const radius = Math.round(145 / Math.tan(Math.PI / total)) + 60; // ~410px

  // Generate HTML cards
  carousel.innerHTML = PROJECTS.map((p, idx) => {
    const angle = (idx / total) * 360;
    return `
      <div 
        class="linktree-item group" 
        data-index="${idx}" 
        style="transform: rotateY(${angle}deg) translateZ(${radius}px);"
      >
        <img src="${p.img}" alt="${p.title}" loading="lazy">
        <div class="linktree-item-overlay">
          <div class="font-mono text-[9px] text-neutral-400 uppercase tracking-widest mb-0.5">
            // ${p.cat}
          </div>
          <div class="font-display text-sm font-bold text-white uppercase flex items-center justify-between">
            <span>${p.title}</span>
            <span class="text-xs text-neutral-400 group-hover:text-white transition-colors">&rarr;</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  const cardElements = carousel.querySelectorAll('.linktree-item');
  cardElements.forEach((card, idx) => {
    card.addEventListener('click', (e) => {
      // If dragged significantly, don't trigger click navigation
      if (Math.abs(dragDistance) > 8) return;
      playSoftTick();
      const proj = PROJECTS[idx];
      if (proj && proj.url && proj.url !== '#') {
        window.open(proj.url, proj.url.startsWith('http') ? '_blank' : '_self');
      }
    });
  });

  // Inertial state
  let currentRotation = 0;
  let targetRotation = 0;
  let velocity = 0;
  let isDragging = false;
  let startX = 0;
  let lastX = 0;
  let dragDistance = 0;
  let isHovered = false;
  let isVisible = false;
  let rafId = null;

  stage.addEventListener('mouseenter', () => { isHovered = true; });
  stage.addEventListener('mouseleave', () => { isHovered = false; });

  // Pointer drag
  stage.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX;
    lastX = e.clientX;
    dragDistance = 0;
    velocity = 0;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const delta = e.clientX - lastX;
    lastX = e.clientX;
    dragDistance += Math.abs(delta);
    velocity = delta * 0.28;
    currentRotation += velocity;
    targetRotation = currentRotation;
  }, { passive: true });

  window.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
    }
  });

  // Touch drag
  stage.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isDragging = true;
      startX = e.touches[0].clientX;
      lastX = e.touches[0].clientX;
      dragDistance = 0;
      velocity = 0;
    }
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const delta = e.touches[0].clientX - lastX;
    lastX = e.touches[0].clientX;
    dragDistance += Math.abs(delta);
    velocity = delta * 0.28;
    currentRotation += velocity;
    targetRotation = currentRotation;
  }, { passive: true });

  window.addEventListener('touchend', () => {
    if (isDragging) {
      isDragging = false;
    }
  });

  // Observer to pause RAF when offscreen
  const observer = new IntersectionObserver((entries) => {
    isVisible = entries[0].isIntersecting;
    if (isVisible && !rafId) {
      rafId = requestAnimationFrame(tick);
    }
  }, { threshold: 0.1 });
  observer.observe(stage);

  function tick() {
    if (!isVisible) {
      rafId = null;
      return;
    }

    if (!isDragging) {
      // Apply momentum decay
      velocity *= 0.92;
      currentRotation += velocity;

      // Slow ambient drift when idle and not hovered
      if (!isHovered && Math.abs(velocity) < 0.05) {
        currentRotation -= 0.12;
      }
    }

    carousel.style.transform = `rotateY(${currentRotation.toFixed(2)}deg)`;
    rafId = requestAnimationFrame(tick);
  }

  rafId = requestAnimationFrame(tick);
}

/* ==========================================================================
   5. AI FAQ: MINIMALIST ACCORDION & SINGLE-LINE OBSIDIAN SEARCH
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

  // Single-Line Query Input
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
      }, 16);
    }, 380);
  }

  function handleQuery() {
    const val = input.value.trim();
    if (!val) return;
    playSoftTick();
    const answer = getAiResponse(val);
    typewrite(answer);
  }

  submitBtn.addEventListener('click', handleQuery);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleQuery();
  });

  quickTags.forEach(tag => {
    tag.addEventListener('click', () => {
      input.value = tag.textContent.replace('+', '').trim();
      handleQuery();
    });
  });
}

/* ==========================================================================
   6. FOOTER SCROLL FILL PROGRESS
   Dynamically fills "nokazoo.dev" with solid white as scrolled into view
   ========================================================================== */
function initFooterScrollFill() {
  const fillTitle = document.getElementById('footer-fill-title');
  if (!fillTitle) return;

  function update() {
    const rect = fillTitle.getBoundingClientRect();
    const windowH = window.innerHeight;

    // Start filling when top touches bottom of window, finish when fully centered
    const start = windowH;
    const end = windowH * 0.45;

    const progress = Math.max(0, Math.min(1, (start - rect.top) / (start - end)));
    fillTitle.style.setProperty('--fill-pct', `${(progress * 100).toFixed(1)}%`);
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();
}

/* ==========================================================================
   7. CONTACT FORM SUBMISSION & AUDIO TICK
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const submitBtn = document.getElementById('submit-btn');
  const feedback = document.getElementById('form-feedback');

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
      feedback.className = 'font-mono text-xs text-center p-3 border border-white/20 bg-white/5 text-white mt-4 rounded-lg';
      feedback.textContent = 'Спасибо за заявку! Я получил ваше сообщение и свяжусь с вами в течение 30 минут.';

      form.reset();
      playSoftTick();

      setTimeout(() => {
        submitBtn.innerHTML = '<span>Отправить заявку &rarr;</span>';
      }, 4000);
    }, 500);
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
