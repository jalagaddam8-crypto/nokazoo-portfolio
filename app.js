/**
 * NOKAZOO.DEV: SWISS MINIMALIST ENGINE
 * - Dark / Light theme switcher with local state and URL param support
 * - Works stage: 21 real screenshots in three layouts (spiral, grid, circle),
 *   tiles fly between layouts; rAF runs only while the stage is on screen
 * - Scroll-triggered reveal animations for typography and bento cards
 * - Botanical tree growth: plays once on page load and remains fully grown
 * - Giant scroll-fill typography in footer, updated once per frame and only in view
 * - Minimalist FAQ accordion and a keyword answer row for custom questions
 * - Contact form opens a Telegram chat with the request prefilled
 * - Humanizer compliance: ZERO em dashes and ZERO en dashes
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initTreeGrowth();
  initWorksStage();
  initScrollReveal();
  initAiFaq();
  initFooterScrollFill();
  initContactForm();
});

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
  let savedTheme = null;
  try { savedTheme = localStorage.getItem('nokazoo-theme'); } catch (err) {}

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
    try { localStorage.setItem('nokazoo-theme', theme); } catch (err) {}
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
   2. BOTANICAL TREE GROWTH (plays once, stays fully grown)
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
   3. WORKS STAGE: SPIRAL / GRID / CIRCLE
   21 плитка (по 3 настоящих скриншота на проект) живут в одном 3D-пространстве.
   У каждой раскладки своя функция координат, при смене режима плитка летит
   из текущего положения в новое со своей задержкой. Всё движение считается
   от времени кадра, поэтому скорость одинакова на 60 и на 120 Гц.
   ========================================================================== */

// Только клиенты, которые заказали и оплатили работу. url: null, пока сайт
// не переехал на домен клиента. Студия эпиляции без названия и ссылки:
// по её товарному знаку идёт спор.
const PROJECTS = [
  { id: 'valeria', title: 'Валерия, массаж', cat: 'МАССАЖ ДЛЯ ЖЕНЩИН • ТОМИЛИНО', url: 'https://valeriamassage.ru' },
  { id: 'energiya', title: 'Энергия праздника', cat: 'ДЕТСКИЙ КЛУБ И ЛОФТ • МИТИНО', url: 'https://energiya-prazdnika.ru' },
  { id: 'epilation', title: 'Студия лазерной эпиляции', cat: 'САЙТ С КАЛЬКУЛЯТОРОМ И TELEGRAM-БОТ', url: null },
  { id: 'citrus', title: 'Цитрус', cat: 'САЛОН КРАСОТЫ • ЕГОРЬЕВСК', url: null },
  { id: 'stankoinst', title: 'Станкоинструмент', cat: 'СТРАНИЦА ДЛЯ РЕКЛАМОДАТЕЛЕЙ ЖУРНАЛА', url: null },
  { id: 'primapark', title: 'Английский в «Прима Парке»', cat: 'КУРСЫ ДЛЯ ШКОЛЬНИКОВ • ЩЕРБИНКА', url: null },
  { id: 'pobedonosec', title: 'СК «Победоносец»', cat: 'БОКС И МУАЙ-ТАЙ • 2 ЗАЛА В МОСКВЕ', url: null }
];

const SHOT_NAMES = ['первый экран', 'раздел сайта', 'вид с телефона'];
const TILE_W = 240;        // базовый размер плитки в CSS, раскладки задают масштаб
const TILE_H = 150;

function initWorksStage() {
  const stage = document.getElementById('work-stage');
  const world = document.getElementById('work-world');
  if (!stage || !world) return;

  const caption = document.getElementById('work-caption');
  const capCat = caption?.querySelector('.work-caption-cat');
  const capTitle = caption?.querySelector('.work-caption-title');
  const capLink = caption?.querySelector('.work-caption-link');
  const modeBtns = [...stage.querySelectorAll('[data-mode]')];

  // Плитки: сначала все первые экраны, потом разделы, потом телефоны.
  // В спирали это три витка, в сетке на 7 колонок три ряда по типу кадра.
  const tiles = [];
  for (let k = 1; k <= 3; k++) {
    PROJECTS.forEach((p) => {
      const portrait = k === 3;
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'work-tile' + (portrait ? ' is-portrait' : '');
      el.setAttribute('aria-label', `${p.title}, ${SHOT_NAMES[k - 1]}`);
      const img = document.createElement('img');
      img.src = `assets/work/${p.id}-${k}.webp`;
      img.alt = '';
      img.width = portrait ? 420 : 720;
      img.height = portrait ? 560 : 450;
      img.decoding = 'async';
      img.loading = 'lazy';
      img.draggable = false;
      el.appendChild(img);
      world.appendChild(el);
      tiles.push({
        el, p, portrait,
        cur: { x: 0, y: 0, z: -600, rx: 0, ry: 0, rz: 0, s: 0.2, o: 0 },
        from: null, start: 0,
        hot: 0, hotTarget: 0,
        last: ''
      });
    });
  }
  const n = tiles.length;

  // Размеры сцены
  let W = stage.clientWidth;
  let H = stage.clientHeight;
  const ro = new ResizeObserver(() => { W = stage.clientWidth; H = stage.clientHeight; });
  ro.observe(stage);

  // Состояние
  let mode = 'spiral';
  const rot = { spiral: 0, circle: 0 };   // градусы
  let rotVel = 0;                         // градусы в секунду (инерция после броска)
  const pan = { x: 0, y: 0 };
  const world3 = { cur: { tx: 0, tz: 0 }, from: null, start: 0 };
  const DUR = REDUCED_MOTION ? 0 : 950;
  const STAGGER = REDUCED_MOTION ? 0 : 18;
  let selected = null;

  // --- Раскладки -----------------------------------------------------------
  function spiralLayout(i) {
    const small = W < 640;
    const s = small ? 0.56 : 0.74;
    const R = Math.max(150, Math.min(W * 0.26, 340));
    const perTurn = 7;
    const theta = (i * 360) / perTurn + rot.spiral;
    const rad = theta * Math.PI / 180;
    const rise = TILE_H * s * 1.35;                     // подъём за виток
    const y = (i - (n - 1) / 2) * (rise / perTurn);
    const depth = (Math.cos(rad) + 1) / 2;              // 1 спереди, 0 сзади
    return { x: R * Math.sin(rad), y, z: R * Math.cos(rad), rx: 0, ry: theta, rz: 0, s, o: 0.3 + 0.7 * depth };
  }

  function gridLayout(i) {
    const cols = W >= 1100 ? 7 : W >= 700 ? 5 : 3;
    const rows = Math.ceil(n / cols);
    const padX = 16, gap = W < 640 ? 10 : 18;
    const cw = Math.min((W - padX * 2 - gap * (cols - 1)) / cols, 230);
    const s = cw / TILE_W;
    const ch = TILE_H * s;
    const col = i % cols, row = Math.floor(i / cols);
    return {
      x: (col - (cols - 1) / 2) * (cw + gap) + pan.x,
      y: (row - (rows - 1) / 2) * (ch + gap) + pan.y + 24,
      z: 0, rx: 0, ry: 0, rz: 0, s, o: 1
    };
  }

  function circleLayout(i) {
    const R = Math.min(W * 0.42, H * 0.36);
    const phi = (i * 360) / n + rot.circle - 90;
    const rad = phi * Math.PI / 180;
    const s = Math.max(0.16, ((2 * Math.PI * R) / n / TILE_W) * 0.78);
    return { x: R * Math.cos(rad), y: R * Math.sin(rad) + 10, z: 0, rx: 0, ry: 0, rz: phi + 90, s, o: 1 };
  }

  const LAYOUTS = { spiral: spiralLayout, grid: gridLayout, circle: circleLayout };
  const WORLD_TILT = { spiral: { tx: -6, tz: -9 }, grid: { tx: 0, tz: 0 }, circle: { tx: 0, tz: 0 } };

  // --- Твин ------------------------------------------------------------------
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const lerp = (a, b, t) => a + (b - a) * t;
  const lerpAngle = (a, b, t) => {
    let d = ((b - a) % 360 + 540) % 360 - 180;           // кратчайший путь
    return a + d * t;
  };

  function setMode(next, force = false) {
    if (next === mode && !force) return;
    mode = next;
    const t0 = performance.now();
    tiles.forEach((tile, i) => {
      tile.from = { ...tile.cur };
      tile.start = t0 + i * STAGGER;
    });
    world3.from = { ...world3.cur };
    world3.start = t0;
    rotVel = 0;
    pan.x = 0; pan.y = 0;
    modeBtns.forEach((b) => {
      const on = b.dataset.mode === mode;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    wake();
  }

  // --- Подпись -------------------------------------------------------------------
  function showCaption(tile) {
    if (!caption) return;
    if (!tile) { caption.classList.remove('is-visible'); return; }
    capCat.textContent = '// ' + tile.p.cat;
    capTitle.textContent = tile.p.title;
    if (tile.p.url) {
      capLink.hidden = false;
      capLink.href = tile.p.url;
      capLink.textContent = tile.p.url.replace(/^https?:\/\//, '') + ' →';
    } else {
      capLink.hidden = true;
    }
    caption.classList.add('is-visible');
  }

  function select(tile) {
    if (selected) selected.el.classList.remove('is-selected');
    selected = tile;
    if (tile) tile.el.classList.add('is-selected');
    tiles.forEach((t) => { t.hotTarget = t === tile ? 1 : 0; });
    showCaption(tile);
    wake();
  }

  // --- Ввод --------------------------------------------------------------------------
  let drag = null;
  stage.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.work-modes, .work-caption')) return;
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, lx: e.clientX, ly: e.clientY, t: performance.now(), moved: 0, type: e.pointerType };
    rotVel = 0;
    stage.classList.add('is-dragging');
  });

  window.addEventListener('pointermove', (e) => {
    if (drag && e.pointerId === drag.id) {
      const dx = e.clientX - drag.lx, dy = e.clientY - drag.ly;
      const now = performance.now();
      const dt = Math.max(1, now - drag.t);
      drag.moved += Math.abs(dx) + Math.abs(dy);
      if (mode === 'grid') {
        pan.x += dx;
        if (drag.type === 'mouse') pan.y += dy;
      } else {
        const k = mode === 'spiral' ? 0.32 : 0.22;
        rot[mode] += dx * k;
        rotVel = (dx * k) / dt * 1000;
      }
      drag.lx = e.clientX; drag.ly = e.clientY; drag.t = now;
      wake();
      return;
    }
    // наведение мышью: плитка подсвечивается и показывает, чей это сайт
    if (e.pointerType === 'mouse' && !selected) {
      const tileEl = e.target.closest?.('.work-tile');
      const hot = tileEl ? tiles.find((t) => t.el === tileEl) : null;
      tiles.forEach((t) => {
        t.hotTarget = t === hot ? 1 : 0;
        t.el.classList.toggle('is-hot', t === hot);
      });
      showCaption(hot);
      wake();
    }
  }, { passive: true });

  const endDrag = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    stage.classList.remove('is-dragging');
    if (drag.moved < 6) {
      const tileEl = e.target.closest?.('.work-tile');
      const tile = tileEl ? tiles.find((t) => t.el === tileEl) : null;
      select(tile && tile !== selected ? tile : null);
      if (tile) playSoftTick();
    } else if (performance.now() - drag.t > 80) {
      rotVel = 0;                                       // отпустили без броска
    }
    if (mode === 'grid') clampPan();
    drag = null;
  };
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);

  stage.addEventListener('mouseleave', () => {
    if (selected) return;
    tiles.forEach((t) => { t.hotTarget = 0; t.el.classList.remove('is-hot'); });
    showCaption(null);
  });

  // клавиатура: фокус с Tab выбирает плитку (фокус от клика мышью обрабатывает endDrag)
  world.addEventListener('focusin', (e) => {
    if (!e.target.matches(':focus-visible')) return;
    const tile = tiles.find((t) => t.el === e.target);
    if (tile) select(tile);
  });

  modeBtns.forEach((b) => b.addEventListener('click', () => { playSoftTick(); select(null); setMode(b.dataset.mode); }));

  function clampPan() {
    const cols = W >= 1100 ? 7 : W >= 700 ? 5 : 3;
    const rows = Math.ceil(n / cols);
    const s = gridLayout(0).s;
    const gridH = rows * (TILE_H * s + 18);
    const maxY = Math.max(0, (gridH - H) / 2 + 40);
    const maxX = W * 0.25;
    pan.x = Math.max(-maxX, Math.min(maxX, pan.x));
    pan.y = Math.max(-maxY, Math.min(maxY, pan.y));
  }

  // прокрутка страницы слегка докручивает спираль и круг
  let lastScroll = window.scrollY;
  window.addEventListener('scroll', () => {
    const d = window.scrollY - lastScroll;
    lastScroll = window.scrollY;
    if (!visible || REDUCED_MOTION || mode === 'grid') return;
    rot[mode] += d * 0.06;
  }, { passive: true });

  // --- Кадр ----------------------------------------------------------------------------
  let visible = false;
  let started = false;
  let raf = 0;
  let lastT = 0;

  function frame(now) {
    raf = 0;
    const dt = Math.min(0.05, lastT ? (now - lastT) / 1000 : 0.016);
    lastT = now;

    if (!drag && mode !== 'grid') {
      if (Math.abs(rotVel) > 1) {
        rot[mode] += rotVel * dt;
        rotVel *= Math.pow(0.04, dt);                    // плавное торможение броска
      } else {
        rotVel = 0;
        if (!REDUCED_MOTION && !selected) rot[mode] += (mode === 'spiral' ? 7 : 5) * dt;
      }
    }

    // наклон всего мира
    const tilt = WORLD_TILT[mode];
    let tx = tilt.tx, tz = tilt.tz;
    if (world3.from) {
      const t = DUR ? Math.min(1, (now - world3.start) / DUR) : 1;
      const e = ease(t);
      tx = lerp(world3.from.tx, tilt.tx, e);
      tz = lerp(world3.from.tz, tilt.tz, e);
      if (t >= 1) world3.from = null;
    }
    world3.cur.tx = tx; world3.cur.tz = tz;
    world.style.transform = `rotateX(${tx.toFixed(2)}deg) rotateZ(${tz.toFixed(2)}deg)`;

    let busy = !!world3.from;
    const layout = LAYOUTS[mode];
    for (let i = 0; i < n; i++) {
      const tile = tiles[i];
      const target = layout(i);
      let c;
      if (tile.from) {
        const t = DUR ? Math.max(0, Math.min(1, (now - tile.start) / DUR)) : 1;
        const e = ease(t);
        const f = tile.from;
        c = {
          x: lerp(f.x, target.x, e), y: lerp(f.y, target.y, e), z: lerp(f.z, target.z, e),
          rx: lerpAngle(f.rx, target.rx, e), ry: lerpAngle(f.ry, target.ry, e), rz: lerpAngle(f.rz, target.rz, e),
          s: lerp(f.s, target.s, e), o: lerp(f.o, target.o, e)
        };
        // в полёте плитка делает лишние пол-оборота, как в образце
        c.rz += Math.sin(e * Math.PI) * (i % 2 ? 40 : -40);
        if (t >= 1) tile.from = null; else busy = true;
      } else {
        c = target;
      }
      tile.cur = c;

      tile.hot += (tile.hotTarget - tile.hot) * Math.min(1, dt * 12);
      if (Math.abs(tile.hotTarget - tile.hot) > 0.002) busy = true;
      const grow = mode === 'circle' ? 1.6 : 0.22;
      const s = c.s * (1 + grow * tile.hot);
      const z = c.z + 60 * tile.hot;
      const o = Math.max(c.o, tile.hot);

      const tr = `translate3d(${c.x.toFixed(1)}px,${c.y.toFixed(1)}px,${z.toFixed(1)}px) rotateZ(${c.rz.toFixed(2)}deg) rotateY(${c.ry.toFixed(2)}deg) rotateX(${c.rx.toFixed(2)}deg) scale(${s.toFixed(4)})`;
      if (tr !== tile.last) {
        tile.el.style.transform = tr;
        tile.last = tr;
      }
      const os = o.toFixed(2);
      if (tile.el.style.opacity !== os) tile.el.style.opacity = os;
      tile.el.style.zIndex = tile.hot > 0.5 ? '2' : '';
    }

    const spinning = mode !== 'grid' && !REDUCED_MOTION && !selected;
    if (visible && (busy || spinning || drag || rotVel)) raf = requestAnimationFrame(frame);
    else lastT = 0;
  }

  function wake() {
    if (!raf && visible) raf = requestAnimationFrame(frame);
  }

  // кадры идут только пока сцена на экране и вкладка открыта
  const io = new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting && !document.hidden;
    if (visible && !started) {
      started = true;
      setMode('spiral', true);                           // влёт из глубины при первом показе
    }
    wake();
  }, { rootMargin: '120px 0px' });
  io.observe(stage);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) visible = false;
    else visible = stage.getBoundingClientRect().top < window.innerHeight && stage.getBoundingClientRect().bottom > 0;
    wake();
  });
}

/* ==========================================================================
   4. SCROLL-TRIGGERED MOTION REVEAL
   ========================================================================== */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal-item');
  if (!revealElements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);               // показали один раз, дальше не следим
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => observer.observe(el));
}

/* ==========================================================================
   5. MINIMALIST FAQ ACCORDION & INSTANT QUESTION SEARCH
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
      answer: 'Напишите мне напрямую в Telegram @nokazoodev или на почту nokazoo@yandex.ru. Отвечаю оперативно в течение 30 минут.'
    }
  ];

  function getAiResponse(query) {
    const q = query.toLowerCase().trim();
    for (const entry of KNOWLEDGE_BASE) {
      if (entry.keywords.some(k => q.includes(k))) {
        return entry.answer;
      }
    }
    return `Хороший вопрос о «${query}». Чтобы рассчитать точную архитектуру для вашей задачи, напишите мне в Telegram @nokazoodev или на почту nokazoo@yandex.ru. Отвечу в течение 30 минут.`;
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
   6. FOOTER SCROLL FILL PROGRESS
   Огромная надпись перерисовывается не на каждое событие прокрутки, а не чаще
   одного раза за кадр и только пока подвал виден.
   ========================================================================== */
function initFooterScrollFill() {
  const fillTitle = document.getElementById('footer-fill-title');
  if (!fillTitle) return;

  let inView = false;
  let ticking = false;
  let lastPct = '';

  function update() {
    ticking = false;
    const rect = fillTitle.getBoundingClientRect();
    const windowH = window.innerHeight;
    const start = windowH;
    const end = windowH * 0.45;
    const progress = Math.max(0, Math.min(1, (start - rect.top) / (start - end)));
    const pct = `${(progress * 100).toFixed(1)}%`;
    if (pct !== lastPct) {
      fillTitle.style.setProperty('--fill-pct', pct);
      lastPct = pct;
    }
  }

  const schedule = () => {
    if (!inView || ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  new IntersectionObserver((entries) => {
    inView = entries[0].isIntersecting;
    schedule();
  }).observe(fillTitle);

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
}

/* ==========================================================================
   7. CONTACT FORM: ЗАЯВКА УХОДИТ В TELEGRAM
   У страницы нет сервера, поэтому форма собирает текст заявки и открывает
   чат с @nokazoodev, где этот текст уже стоит в поле сообщения. На случай,
   если клиент Telegram не подставит текст, он заранее копируется в буфер.
   ========================================================================== */
const TELEGRAM_USERNAME = 'nokazoodev';

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

/* ==========================================================================
   8. AUDIO TICK
   Один AudioContext на страницу: раньше он создавался на каждый клик и копился.
   ========================================================================== */
let tickCtx = null;

function playSoftTick() {
  try {
    tickCtx = tickCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (tickCtx.state === 'suspended') tickCtx.resume();
    const t = tickCtx.currentTime;
    const osc = tickCtx.createOscillator();
    const gain = tickCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(500, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.04);
    gain.gain.setValueAtTime(0.06, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    osc.connect(gain);
    gain.connect(tickCtx.destination);
    osc.start(t);
    osc.stop(t + 0.05);
  } catch (err) {}
}
