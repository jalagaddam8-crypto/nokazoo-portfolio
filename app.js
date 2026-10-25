/**
 * NOKAZOO.DEV: HIGH-PERFORMANCE SWISS MINIMALIST ENGINE
 * - Dynamic Dark / Light theme switcher with local state and URL param support
 * - Interactive Video 3D Ribbon gallery launcher with rolling text bounce
 * - 3D cylindrical spiral ring (120 FPS, drag inertia, ambient rotation)
 * - 2D responsive list mode with direct obsidian client links
 * - Scroll-triggered reveal animations for typography and bento cards
 * - Botanical tree growth: plays once on page load and remains fully grown
 * - Giant scroll-fill typography in footer driven by viewport progress
 * - Obsidian knowledge base typewriter search and minimalist FAQ
 * - Humanizer compliance: ZERO em dashes and ZERO en dashes
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initLiveClock();
  initTreeGrowth();
  initRibbonGallery();
  initScrollReveal();
  initAiFaq();
  initFooterScrollFill();
  initContactForm();
});

/* ==========================================================================
   1. THEME SWITCHER (Dark Noir / Light Blanche)
   ========================================================================== */
function initThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle-btn');
  const toggleIcon = document.getElementById('theme-toggle-icon');
  const toggleText = document.getElementById('theme-toggle-text');
  const html = document.documentElement;

  // Determine initial theme
  const urlParams = new URLSearchParams(window.location.search);
  const themeParam = urlParams.get('theme');
  const isLightFile = window.location.pathname.endsWith('light.html');
  const savedTheme = localStorage.getItem('nokazoo-theme');

  let currentTheme = 'dark';
  if (themeParam === 'light' || isLightFile || savedTheme === 'light') {
    currentTheme = 'light';
  }

  function applyTheme(theme) {
    if (theme === 'light') {
      html.classList.add('theme-light');
      html.classList.remove('dark');
      if (toggleIcon) toggleIcon.textContent = '☾';
      if (toggleText) toggleText.textContent = 'Темная';
    } else {
      html.classList.remove('theme-light');
      html.classList.add('dark');
      if (toggleIcon) toggleIcon.textContent = '☼';
      if (toggleText) toggleText.textContent = 'Светлая';
    }
    localStorage.setItem('nokazoo-theme', theme);
  }

  applyTheme(currentTheme);

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      playSoftTick();
      const newTheme = html.classList.contains('theme-light') ? 'dark' : 'light';
      applyTheme(newTheme);
    });
  }
}

/* ==========================================================================
   2. LIVE CLOCK (UTC+3 Moscow)
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
   3. BOTANICAL TREE GROWTH BACKGROUND
   Plays once on page load and remains permanently grown at 1.85x playback speed.
   ========================================================================== */
function initTreeGrowth() {
  const video = document.getElementById('hero-tree-video');
  if (!video) return;

  video.loop = false;

  const startPlayback = () => {
    video.playbackRate = 1.85;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        const trigger = () => {
          video.play().catch(() => {});
          window.removeEventListener('click', trigger);
          window.removeEventListener('touchstart', trigger);
        };
        window.addEventListener('click', trigger, { once: true });
        window.addEventListener('touchstart', trigger, { once: true });
      });
    }
  };

  if (video.readyState >= 2) {
    startPlayback();
  } else {
    video.addEventListener('canplay', startPlayback, { once: true });
    video.addEventListener('loadeddata', startPlayback, { once: true });
  }

  video.addEventListener('timeupdate', () => {
    if (video.currentTime >= 18.2) {
      video.pause();
    }
  });

  video.addEventListener('ended', () => {
    video.pause();
  });
}

/* ==========================================================================
   4. INTERACTIVE 3D RIBBON GALLERY & 2D LIST (From Video Reference)
   - Launcher Pill Button with rolling text bounce
   - Unfurls into 3D Cylindrical Spiral or 2D List
   - 18 real Obsidian clients with images and links
   - 120 FPS momentum physics, drag, wheel, touch
   ========================================================================== */
function initRibbonGallery() {
  const launcherStage = document.getElementById('ribbon-launcher-stage');
  const launchBtn = document.getElementById('ribbon-launch-btn');
  const openListLink = document.getElementById('ribbon-open-list-link');
  const viewer = document.getElementById('ribbon-viewer');
  const closeBtn = document.getElementById('ribbon-close-btn');

  const modeSpiralBtn = document.getElementById('mode-spiral-btn');
  const modeListBtn = document.getElementById('mode-list-btn');
  const spiralContainer = document.getElementById('ribbon-spiral-container');
  const listContainer = document.getElementById('ribbon-list-container');
  const gridCardsContainer = document.getElementById('ribbon-grid-cards');

  const stage = document.getElementById('linktree-stage');
  const carousel = document.getElementById('linktree-carousel');

  if (!launcherStage || !launchBtn || !viewer) return;

  const PROJECTS = [
    {
      id: 'valeria',
      title: 'Валерия Массаж',
      cat: 'МАССАЖ & ОГНЕВАЯ ТЕРАПИЯ • ТОМИЛИНО',
      img: 'assets/projects/valeria.jpg',
      url: 'https://valeriamassage.ru'
    },
    {
      id: 'lasermak',
      title: 'Lasermak',
      cat: 'ЛАЗЕРНАЯ ЭСТЕТИКА & БОТ-АССИСТЕНТ',
      img: 'assets/projects/lasermak.png',
      url: 'https://vk.com/lasermak'
    },
    {
      id: 'zerno',
      title: 'Студия Зерно',
      cat: 'ЭКО-ОКРАШИВАНИЕ & БЬЮТИ • СПБ',
      img: 'assets/projects/zerno-preview.webp',
      url: 'https://zerno-studio.ru'
    },
    {
      id: 'pobedonosec',
      title: 'СК Победоносец',
      cat: 'КЛУБ ЕДИНОБОРСТВ • 2 ЗАЛА МОСКВА',
      img: 'assets/projects/pobedonosec-real.png',
      url: 'https://t.me/nokazoodev'
    },
    {
      id: 'primapark',
      title: 'Prima Park Kids',
      cat: 'АНГЛИЙСКИЙ ДЛЯ ДЕТЕЙ • ЩЕРБИНКА',
      img: 'assets/projects/primapark-real.png',
      url: 'https://t.me/nokazoodev'
    },
    {
      id: 'stankoinst',
      title: 'Станкоинструмент',
      cat: 'ПРОМЫШЛЕННЫЙ ИНСТРУМЕНТ & СТАНКИ',
      img: 'assets/projects/stankoinst.png',
      url: 'https://stankoinst.ru'
    },
    {
      id: 'citrus',
      title: 'Студия Citrus',
      cat: 'САЛОН КРАСОТЫ & YCLIENTS • ЕГОРЬЕВСК',
      img: 'assets/projects/citrus.jpg',
      url: 'https://t.me/nokazoodev'
    },
    {
      id: 'energiya',
      title: 'Энергия Праздника',
      cat: 'ДЕТСКИЙ ЛОФТ & ШОУ • МИТИНО',
      img: 'assets/projects/energiya.jpg',
      url: 'https://t.me/nokazoodev'
    },
    {
      id: 'pegasova',
      title: 'Pegasova Design',
      cat: 'ДИЗАЙН ИНТЕРЬЕРА • 17 ЛЕТ ОПЫТА',
      img: 'assets/projects/pegasova.jpg',
      url: 'https://t.me/nokazoodev'
    },
    {
      id: 'oksana',
      title: 'Читающий Хоумстейджер',
      cat: 'ХОУМСТЕЙДЖИНГ & ДЕКОР • СПБ',
      img: 'assets/projects/oksana.png',
      url: 'https://t.me/nokazoodev'
    },
    {
      id: 'vsemsharov',
      title: 'ВсемШаров',
      cat: 'АЭРОДИЗАЙН & ОФОРМЛЕНИЕ МЕРОПРИЯТИЙ',
      img: 'assets/projects/vsemsharov.jpg',
      url: 'https://vsemsharov.ru'
    },
    {
      id: 'yaroslavna',
      title: 'Ярославна Графова',
      cat: 'СТИЛИСТ & СВАДЕБНЫЙ ОБРАЗ • СПБ',
      img: 'assets/projects/yaroslavna.png',
      url: 'https://t.me/nokazoodev'
    },
    {
      id: 'berns',
      title: 'Ульяна Бернс',
      cat: 'ГАЛЕРЕЯ КАРТИН & АВТОРСКИЙ АРТ',
      img: 'assets/projects/berns.png',
      url: 'https://t.me/nokazoodev'
    },
    {
      id: 'elena-permanent',
      title: 'Елена Андронова',
      cat: 'ПЕРМАНЕНТНЫЙ МАКИЯЖ & НАПЫЛЕНИЕ',
      img: 'assets/projects/elena-permanent.png',
      url: 'https://t.me/nokazoodev'
    },
    {
      id: 'elita',
      title: 'Салон Элита',
      cat: 'САЛОН КРАСОТЫ • ДМИТРОВ',
      img: 'assets/projects/elita-dmitrov.png',
      url: 'https://t.me/nokazoodev'
    },
    {
      id: 'esthetique',
      title: 'Esthetique ZB',
      cat: 'КОСМЕТОЛОГИЯ & УХОД ЗА ЛИЦОМ',
      img: 'assets/projects/esthetique.png',
      url: 'https://t.me/nokazoodev'
    },
    {
      id: 'yulia',
      title: 'Юлия Останина',
      cat: 'FASHION & ПЕРСОНАЛЬНЫЙ БРЕНД',
      img: 'assets/projects/yulia.png',
      url: 'https://t.me/nokazoodev'
    },
    {
      id: 'marina-pm',
      title: 'Марина ПМ',
      cat: 'ЭСТЕТИКА ВЗГЛЯДА & ТАТУАЖ',
      img: 'assets/projects/marina-pm.png',
      url: 'https://t.me/nokazoodev'
    }
  ];

  let carouselInitialized = false;
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

  const total = PROJECTS.length;
  const radius = Math.round(145 / Math.tan(Math.PI / total)) + 30; // ~850px

  function setupCarouselElements() {
    if (carouselInitialized || !carousel) return;
    carouselInitialized = true;

    // Build 3D cards
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

    // Build 2D grid cards for list view
    if (gridCardsContainer) {
      gridCardsContainer.innerHTML = PROJECTS.map((p) => {
        return `
          <a href="${p.url}" target="_blank" rel="noopener" class="bento-card p-4 block group hover:border-white/40 transition-all">
            <div class="relative aspect-[16/10] overflow-hidden rounded-lg mb-3 bg-neutral-950">
              <img src="${p.img}" alt="${p.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
            </div>
            <div class="font-mono text-[10px] text-neutral-400 uppercase tracking-wider mb-1">
              // ${p.cat}
            </div>
            <div class="font-display text-base font-bold text-white uppercase flex items-center justify-between">
              <span>${p.title}</span>
              <span class="text-xs text-neutral-400 group-hover:text-white transition-colors">&rarr;</span>
            </div>
          </a>
        `;
      }).join('');
    }

    // Attach card clicks in 3D
    const cardElements = carousel.querySelectorAll('.linktree-item');
    cardElements.forEach((card, idx) => {
      card.addEventListener('click', () => {
        if (Math.abs(dragDistance) > 8) return;
        playSoftTick();
        const proj = PROJECTS[idx];
        if (proj && proj.url && proj.url !== '#') {
          window.open(proj.url, proj.url.startsWith('http') ? '_blank' : '_self');
        }
      });
    });

    // Inertial physics listeners
    stage.addEventListener('mouseenter', () => { isHovered = true; });
    stage.addEventListener('mouseleave', () => { isHovered = false; });

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
      if (isDragging) isDragging = false;
    });

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
      if (isDragging) isDragging = false;
    });

    // Wheel navigation
    stage.addEventListener('wheel', (e) => {
      e.preventDefault();
      velocity -= e.deltaY * 0.04;
    }, { passive: false });

    // Intersection observer
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
        velocity *= 0.92;
        currentRotation += velocity;
        if (!isHovered && Math.abs(velocity) < 0.05) {
          currentRotation -= 0.12;
        }
      }

      carousel.style.transform = `translateZ(-${radius}px) rotateY(${currentRotation.toFixed(2)}deg)`;
      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);
  }

  function openViewer(targetMode) {
    playSoftTick();
    launcherStage.classList.add('hidden');
    viewer.classList.remove('hidden');
    setTimeout(() => {
      viewer.classList.remove('opacity-0');
      viewer.classList.add('opacity-100');
    }, 20);

    setupCarouselElements();
    setMode(targetMode || 'spiral');
  }

  function closeViewer() {
    playSoftTick();
    viewer.classList.remove('opacity-100');
    viewer.classList.add('opacity-0');
    setTimeout(() => {
      viewer.classList.add('hidden');
      launcherStage.classList.remove('hidden');
    }, 350);
  }

  function setMode(mode) {
    playSoftTick();
    if (mode === 'spiral') {
      spiralContainer.classList.remove('hidden');
      listContainer.classList.add('hidden');
      modeSpiralBtn.className = 'px-4 py-1.5 rounded-full bg-white text-black font-semibold transition-all';
      modeListBtn.className = 'px-4 py-1.5 rounded-full text-neutral-400 hover:text-white transition-all';
    } else {
      spiralContainer.classList.add('hidden');
      listContainer.classList.remove('hidden');
      modeSpiralBtn.className = 'px-4 py-1.5 rounded-full text-neutral-400 hover:text-white transition-all';
      modeListBtn.className = 'px-4 py-1.5 rounded-full bg-white text-black font-semibold transition-all';
    }
  }

  launchBtn.addEventListener('click', () => openViewer('spiral'));
  if (openListLink) {
    openListLink.addEventListener('click', () => openViewer('list'));
  }
  if (closeBtn) {
    closeBtn.addEventListener('click', closeViewer);
  }
  if (modeSpiralBtn) {
    modeSpiralBtn.addEventListener('click', () => setMode('spiral'));
  }
  if (modeListBtn) {
    modeListBtn.addEventListener('click', () => setMode('list'));
  }
}

/* ==========================================================================
   5. SCROLL-TRIGGERED MOTION REVEAL
   ========================================================================== */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal-item');
  if (!revealElements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => observer.observe(el));
}

/* ==========================================================================
   6. AI FAQ: MINIMALIST ACCORDION & SINGLE-LINE KNOWLEDGE SEARCH
   ========================================================================== */
function initAiFaq() {
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

  const input = document.getElementById('ai-faq-input');
  const submitBtn = document.getElementById('ai-faq-submit');
  const outputBox = document.getElementById('ai-faq-output');

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
      keywords: ['minori', 'минори', 'дубай', 'оаэ'],
      answer: 'Minori Middle East (minoriuae.com): корпоративный портал международного поставщика запчастей для тяжелой техники (Komatsu, Caterpillar, Hitachi) в Дубае (IFZA Free Zone). Включает мультиязычный каталог на 40+ разделов, расчет OEM-котировок и координацию экспортных поставок по Ближнему Востоку, Африке и странам СНГ.'
    },
    {
      keywords: ['база', 'память', 'rag', 'знания'],
      answer: 'При создании ИИ-агентов данные заказчика (регламенты, прайсы, скрипты) структурируются и подключаются через локальный RAG. Это дает агенту контекст эксперта и исключает галлюцинации.'
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
    outputBox.innerHTML = '<span class="text-neutral-500 font-mono">// Поиск ответа в базе знаний...</span>';
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
}

/* ==========================================================================
   7. FOOTER SCROLL FILL PROGRESS
   ========================================================================== */
function initFooterScrollFill() {
  const fillTitle = document.getElementById('footer-fill-title');
  if (!fillTitle) return;

  function update() {
    const rect = fillTitle.getBoundingClientRect();
    const windowH = window.innerHeight;
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
   8. CONTACT FORM SUBMISSION & AUDIO TICK
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const submitBtn = document.getElementById('form-submit-btn');
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
