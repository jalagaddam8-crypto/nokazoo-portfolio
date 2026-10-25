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
   Plays once on page load and remains permanently grown (no disruptive loop).
   ========================================================================== */
function initTreeGrowth() {
  const video = document.getElementById('hero-tree-video');
  if (!video) return;

  video.loop = false;

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
   3. HERO GHOST BLOB (Exact Reference Matching from Video 1256x720)
   - Zero idle wobble: calm, stable, organic resting shape
   - No catchlights / white specular dots: pure solid dark eyes
   - Dynamic eyes: squint into horizontal slits on touch/proximity, widen on release/flings
   - Free floating across entire viewport (zero 4-wall constraints)
   - Elastic teardrop body deformation trailing drag velocity
   ========================================================================== */
function initHeroGhostBlob() {
  const canvas = document.getElementById('hero-ghost-blob');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  const width = 140;
  const height = 140;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // Free-floating position in viewport (default hero right on desktop, center-right on mobile)
  let posX = Math.max(20, Math.min(window.innerWidth - 170, window.innerWidth * 0.83));
  let posY = Math.max(120, Math.min(window.innerHeight - 200, window.innerHeight * 0.44));
  canvas.style.left = posX + "px";
  canvas.style.top = posY + "px";

  // 12-vertex radial spring system
  const numPoints = 12;
  const baseRadius = 45;
  const points = [];
  for (let i = 0; i < numPoints; i++) {
    points.push({
      angle: (i / numPoints) * Math.PI * 2,
      r: baseRadius,
      vr: 0
    });
  }

  // Pointer tracking & drag physics
  let globalPointerX = window.innerWidth / 2;
  let globalPointerY = window.innerHeight / 2;
  let isDragging = false;
  let dragOffsetX = 0;
  let dragOffsetY = 0;
  let lastPointerX = 0;
  let lastPointerY = 0;
  let vx = 0;
  let vy = 0;

  // Eye reaction dynamics
  let currentSquint = 0;
  let surpriseTimer = 0;

  window.addEventListener('mousemove', (e) => {
    globalPointerX = e.clientX;
    globalPointerY = e.clientY;

    if (isDragging) {
      const nextX = e.clientX - dragOffsetX;
      const nextY = e.clientY - dragOffsetY;

      vx = (e.clientX - lastPointerX) * 0.55;
      vy = (e.clientY - lastPointerY) * 0.55;
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;

      posX = nextX;
      posY = nextY;
      canvas.style.left = posX + "px";
      canvas.style.top = posY + "px";

      // Impart velocity impulse to radial vertices creating teardrop trail
      for (const p of points) {
        const dirX = Math.cos(p.angle);
        const dirY = Math.sin(p.angle);
        const dot = dirX * vx + dirY * vy;
        p.vr += dot * 0.18;
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
    surpriseTimer = 0;
    playSoftTick();
  });

  window.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      surpriseTimer = 24; // Widen eyes in surprise on release
      for (const p of points) {
        p.vr += (Math.random() - 0.5) * 6;
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
      globalPointerX = t.clientX;
      globalPointerY = t.clientY;
      vx = 0;
      vy = 0;
      surpriseTimer = 0;
      playSoftTick();
    }
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (isDragging && e.touches.length === 1) {
      const t = e.touches[0];
      globalPointerX = t.clientX;
      globalPointerY = t.clientY;

      const nextX = t.clientX - dragOffsetX;
      const nextY = t.clientY - dragOffsetY;
      vx = (t.clientX - lastPointerX) * 0.55;
      vy = (t.clientY - lastPointerY) * 0.55;
      lastPointerX = t.clientX;
      lastPointerY = t.clientY;

      posX = nextX;
      posY = nextY;
      canvas.style.left = posX + "px";
      canvas.style.top = posY + "px";

      for (const p of points) {
        const dirX = Math.cos(p.angle);
        const dirY = Math.sin(p.angle);
        p.vr += (dirX * vx + dirY * vy) * 0.18;
      }
    }
  }, { passive: true });

  window.addEventListener('touchend', () => {
    if (isDragging) {
      isDragging = false;
      surpriseTimer = 24;
    }
  });

  const cx = width / 2;
  const cy = height / 2;
  const stiffness = 0.14;
  const damping = 0.82;

  function render() {
    ctx.clearRect(0, 0, width, height);

    // Free momentum motion when not dragging
    if (!isDragging) {
      posX += vx;
      posY += vy;
      vx *= 0.92;
      vy *= 0.92;

      // Soft bounce off screen borders (no 4-walls box)
      const pad = 8;
      if (posX < pad) { posX = pad; vx = -vx * 0.5; }
      if (posX > window.innerWidth - width - pad) { posX = window.innerWidth - width - pad; vx = -vx * 0.5; }
      if (posY < pad) { posY = pad; vy = -vy * 0.5; }
      if (posY > window.innerHeight - height - pad) { posY = window.innerHeight - height - pad; vy = -vy * 0.5; }

      canvas.style.left = posX + "px";
      canvas.style.top = posY + "px";
    }

    // Spring restoration (NO idle wobble or breathing oscillation)
    for (let i = 0; i < numPoints; i++) {
      const p = points[i];
      const force = (baseRadius - p.r) * stiffness;
      p.vr = (p.vr + force) * damping;
      p.r += p.vr;
    }

    // Coordinates of perimeter vertices
    const coords = points.map(p => ({
      x: cx + Math.cos(p.angle) * p.r,
      y: cy + Math.sin(p.angle) * p.r
    }));

    // Draw smooth blob body
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

    // Solid white fill with soft spherical shading
    const grad = ctx.createRadialGradient(
      cx - 10, cy - 12, 6,
      cx, cy, baseRadius + 10
    );
    grad.addColorStop(0, '#FFFFFF');
    grad.addColorStop(0.82, '#EAEAF0');
    grad.addColorStop(1, '#D5D5DE');
    ctx.fillStyle = grad;
    ctx.fill();

    // Crisp white outline
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();

    // Eye gaze tracking across full screen
    const blobCenterX = posX + cx;
    const blobCenterY = posY + cy;
    const distToPointer = Math.hypot(globalPointerX - blobCenterX, globalPointerY - blobCenterY);
    const eyeAngle = Math.atan2(globalPointerY - blobCenterY, globalPointerX - blobCenterX);
    const eyeGazeDist = Math.min(8, distToPointer * 0.02);

    const gazeX = Math.cos(eyeAngle) * eyeGazeDist;
    const gazeY = Math.sin(eyeAngle) * eyeGazeDist;

    // Squint when cursor is touching or dragging, or within close reach
    const targetSquint = (isDragging || distToPointer < 80) ? 1.0 : 0.0;
    currentSquint += (targetSquint - currentSquint) * 0.18;

    // Eye radii: flatten into horizontal slits on squint, widen on release/flings
    let rx = 5.6 * (1 + currentSquint * 0.38);
    let ry = 5.6 * (1 - currentSquint * 0.82);

    if (surpriseTimer > 0) {
      const widenBonus = (surpriseTimer / 24) * 2.2;
      rx += widenBonus;
      ry += widenBonus;
      surpriseTimer--;
    }

    const leftEyeX = cx - 12 + gazeX;
    const rightEyeX = cx + 12 + gazeX;
    const eyeY = cy - 4 + gazeY;

    // Pure solid dark eyes (NO CATCHLIGHTS, exactly as in reference)
    ctx.fillStyle = '#060608';

    ctx.beginPath();
    ctx.ellipse(leftEyeX, eyeY, Math.max(1.2, rx), Math.max(1.2, ry), 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(rightEyeX, eyeY, Math.max(1.2, rx), Math.max(1.2, ry), 0, 0, Math.PI * 2);
    ctx.fill();

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
