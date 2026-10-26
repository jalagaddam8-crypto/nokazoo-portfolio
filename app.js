/**
 * NOKAZOO.DEV: HIGH-PERFORMANCE SWISS MINIMALIST ENGINE
 * - Dynamic Dark / Light theme switcher with local state and URL param support
 * - Interactive Video 3D Ribbon gallery launcher with rolling text bounce
 * - 3D cylindrical spiral ring (120 FPS, drag inertia, ambient rotation)
 * - 2D responsive list mode with links to live client sites
 * - Scroll-triggered reveal animations for typography and bento cards
 * - Botanical tree growth: plays once on page load and remains fully grown
 * - Giant scroll-fill typography in footer driven by viewport progress
 * - Minimalist FAQ accordion
 * - Contact form opens a Telegram chat with the request prefilled
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
   - Paid client projects with screenshots, links only to live domains
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

  // Только клиенты, которые заказали и оплатили работу. url: null, пока сайт
  // не переехал на домен клиента. Студия эпиляции без названия и ссылки:
  // по её товарному знаку идёт спор.
  const PROJECTS = [
    {
      id: 'valeria',
      title: 'Валерия, массаж',
      cat: 'МАССАЖ ДЛЯ ЖЕНЩИН • ТОМИЛИНО',
      img: 'assets/projects/valeria-site.webp',
      url: 'https://valeriamassage.ru'
    },
    {
      id: 'energiya',
      title: 'Энергия праздника',
      cat: 'ДЕТСКИЙ КЛУБ И ЛОФТ • МИТИНО',
      img: 'assets/projects/energiya-site.webp',
      url: 'https://energiya-prazdnika.ru'
    },
    {
      id: 'epilation',
      title: 'Студия лазерной эпиляции',
      cat: 'САЙТ С КАЛЬКУЛЯТОРОМ И TELEGRAM-БОТ',
      img: 'assets/projects/epilation-prices.webp',
      url: null
    },
    {
      id: 'citrus',
      title: 'Цитрус',
      cat: 'САЛОН КРАСОТЫ • ЕГОРЬЕВСК',
      img: 'assets/projects/citrus-site.webp',
      url: null
    },
    {
      id: 'stankoinst',
      title: 'Станкоинструмент',
      cat: 'СТРАНИЦА ДЛЯ РЕКЛАМОДАТЕЛЕЙ ЖУРНАЛА',
      img: 'assets/projects/stankoinst-site.webp',
      url: null
    },
    {
      id: 'primapark',
      title: 'Английский в «Прима Парке»',
      cat: 'КУРСЫ ДЛЯ ШКОЛЬНИКОВ • ЩЕРБИНКА',
      img: 'assets/projects/primapark-real.png',
      url: null
    },
    {
      id: 'pobedonosec',
      title: 'СК «Победоносец»',
      cat: 'БОКС И МУАЙ-ТАЙ • 2 ЗАЛА В МОСКВЕ',
      img: 'assets/projects/pobedonosec-real.png',
      url: null
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
          <img src="${p.img}" alt="Сайт: ${p.title}" loading="lazy">
          <div class="linktree-item-overlay">
            <div class="font-mono text-[9px] text-neutral-400 uppercase tracking-widest mb-0.5">
              // ${p.cat}
            </div>
            <div class="font-display text-sm font-bold text-white uppercase flex items-center justify-between">
              <span>${p.title}</span>
              ${p.url ? '<span class="text-xs text-neutral-400 group-hover:text-white transition-colors" aria-hidden="true">&rarr;</span>' : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Build 2D grid cards for list view: карточка-ссылка, только если сайт на домене клиента
    if (gridCardsContainer) {
      gridCardsContainer.innerHTML = PROJECTS.map((p) => {
        const tag = p.url ? 'a' : 'div';
        const attrs = p.url ? `href="${p.url}" target="_blank" rel="noopener"` : '';
        return `
          <${tag} ${attrs} class="bento-card p-4 block group ${p.url ? 'hover:border-white/40' : ''} transition-all">
            <div class="relative aspect-[16/10] overflow-hidden rounded-lg mb-3 bg-neutral-950">
              <img src="${p.img}" alt="Сайт: ${p.title}" loading="lazy" class="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500">
            </div>
            <div class="font-mono text-[10px] text-neutral-400 uppercase tracking-wider mb-1">
              // ${p.cat}
            </div>
            <div class="font-display text-base font-bold text-white uppercase flex items-center justify-between">
              <span>${p.title}</span>
              ${p.url ? '<span class="text-xs text-neutral-400 group-hover:text-white transition-colors" aria-hidden="true">&rarr;</span>' : ''}
            </div>
          </${tag}>
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
   6. MINIMALIST FAQ ACCORDION & INSTANT QUESTION SEARCH
   ========================================================================== */
function initAiFaq() {
  const items = document.querySelectorAll('.faq-accordion-item');
  items.forEach(item => {
    const btn = item.querySelector('.faq-accordion-btn');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      items.forEach(i => {
        i.classList.remove('open');
        i.querySelector('.faq-accordion-btn')?.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
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
      keywords: ['цена', 'стоимость', 'сколько', 'прайс', 'руб', 'тариф'],
      answer: 'Разработка сайта под ключ стоит 20 000 рублей. Внедрение автономного ИИ-агента для Telegram или VK стоит от 15 000 до 20 000 рублей. Комплексная система (сайт + ИИ-ассистент) стоит от 35 000 рублей. Все цены фиксируются в договоре до начала работ.'
    },
    {
      keywords: ['срок', 'долго', 'дни', 'когда', 'дедлайн', 'время'],
      answer: 'Сайт делаю за 3-7 рабочих дней, ИИ-бота за 3-5 дней. Сайт вместе с ботом занимает до двух недель. Срок считаю с того дня, когда переданы прайс и материалы.'
    },
    {
      keywords: ['демо', 'бесплатно', 'посмотреть', 'пример', 'тест'],
      answer: 'Да. До оплаты я собираю бесплатное интерактивное демо на ваших данных: сайт с вашими услугами и ценами или бота, который отвечает по вашему прайсу. Если не устроит, вы ничего не платите.'
    },
    {
      keywords: ['нужно от меня', 'что нужно', 'материалы', 'исходники', 'данные'],
      answer: 'От вас нужны только прайс, адрес, часы работы и фото при наличии. Все остальное я соберу сам из ваших соцсетей и Яндекс Карт, вам останется только согласовать.'
    },
    {
      keywords: ['тильда', 'tilda', 'конструктор', 'стек', 'технологии', 'код'],
      answer: 'Я пишу чистый код на HTML5, CSS и JavaScript без конструкторов. Страница весит 100-200 КБ, моментально открывается на мобильном интернете и не требует ежемесячной абонентской платы за платформу.'
    },
    {
      keywords: ['оплата', 'договор', 'предоплата', 'счет', 'как платить'],
      answer: 'Стандартный формат: 50% предоплата перед стартом, 50% после демонстрации готовой работы и переноса на ваш домен.'
    },
    {
      keywords: ['галлюцинац', 'лишнее', 'ошибки', 'скидк', 'наговорит'],
      answer: 'ИИ-агент отвечает строго по вашему прайс-листу и правилам компании. Выдумки исключены. При нестандартном вопросе или готовности записаться агент мгновенно передает диалог вам.'
    },
    {
      keywords: ['контакт', 'связь', 'телефон', 'telegram', 'почта', 'написать', 'тг'],
      answer: 'Напишите мне напрямую в Telegram @maxthemacedonian или на почту nokazoo@yandex.ru. Отвечаю оперативно в течение 30 минут.'
    }
  ];

  function getAiResponse(query) {
    const q = query.toLowerCase().trim();
    for (const entry of KNOWLEDGE_BASE) {
      if (entry.keywords.some(k => q.includes(k))) {
        return entry.answer;
      }
    }
    return `Хороший вопрос о «${query}». Чтобы рассчитать точную архитектуру для вашей задачи, напишите мне в Telegram @maxthemacedonian или на почту nokazoo@yandex.ru. Отвечу в течение 30 минут.`;
  }

  function typewrite(text) {
    outputBox.innerHTML = '<span class="text-neutral-400 font-mono text-xs">// Поиск ответа...</span>';
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
    }, 280);
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
    if (e.key === 'Enter') {
      e.preventDefault();
      handleQuery();
    }
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
   8. CONTACT FORM: ЗАЯВКА УХОДИТ В TELEGRAM & AUDIO TICK
   У страницы нет сервера, поэтому форма собирает текст заявки и открывает
   чат с @nokazoodev, где этот текст уже стоит в поле сообщения. На случай,
   если клиент Telegram не подставит текст, он заранее копируется в буфер.
   ========================================================================== */
const TELEGRAM_USERNAME = 'maxthemacedonian';

function initContactForm() {
  const form = document.getElementById('contact-form');
  const feedback = document.getElementById('form-feedback');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = (document.getElementById('client-name')?.value || '').trim();
    const type = form.querySelector('input[name="project-type"]:checked')?.value || 'Сайт';
    const message = (document.getElementById('client-message')?.value || '').trim();

    const lines = ['Здравствуйте! Пишу с сайта nokazoo.dev.'];
    if (name) lines.push(`Меня зовут: ${name}`);
    lines.push(`Нужно: ${type}`);
    if (message) lines.push(`Задача: ${message}`);
    const text = lines.join('\n');

    try {
      navigator.clipboard?.writeText(text).catch(() => {});
    } catch (err) {}

    window.open(`https://t.me/${TELEGRAM_USERNAME}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
    playSoftTick();

    if (feedback) {
      feedback.className = 'font-mono text-xs text-center p-3 border border-white/20 bg-white/5 text-white mt-4 rounded-lg';
      feedback.textContent = 'Открываю Telegram. Если текст не появился в поле сообщения, он уже скопирован: вставьте его в чат.';
    }
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
