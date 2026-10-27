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
  initOffscreenPause();
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
   0. OFFSCREEN ANIMATION PAUSE
   Бесконечные анимации (пульсирующие точки, вращение) заставляют браузер
   пересчитывать стили на каждом кадре, даже если блок далеко за экраном.
   Секции вне экрана получают класс anim-off, их анимации стоят на паузе.
   На экране всё двигается как раньше.
   ========================================================================== */
function initOffscreenPause() {
  const blocks = document.querySelectorAll('main > section, footer');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => e.target.classList.toggle('anim-off', !e.isIntersecting));
  }, { rootMargin: '100px 0px' });
  blocks.forEach((b) => { b.classList.add('anim-off'); io.observe(b); });
}

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

  // вне экрана видео не декодируется зря, а вернувшись, дерево дорастает с того же кадра
  new IntersectionObserver((entries) => {
    const onScreen = entries[0].isIntersecting;
    if (video.ended || video.currentTime >= 18.2) return;
    if (!onScreen && !video.paused) { video.pause(); video.dataset.held = '1'; }
    else if (onScreen && video.dataset.held) { delete video.dataset.held; video.play().catch(() => {}); }
  }).observe(video);
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
const PERSPECTIVE = 1300;  // как perspective у .work-stage

/* --------------------------------------------------------------------------
   WebGL-рендер сцены работ. Все 21 плитка рисуются одним холстом в полном
   разрешении экрана: текстуры грузятся один раз (с мип-картами), а на кадр
   уходит 21 вызов отрисовки без пересчёта стилей, слоёв и декодирования
   картинок. Перспектива, порядок поворотов, скругление 8px, рамка 1px и
   переход от серого к цвету повторяют CSS-вариант, который остаётся запасным.
   -------------------------------------------------------------------------- */
function createWorksGL(stage, tiles, onLost) {
  const canvas = document.createElement('canvas');
  canvas.className = 'work-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  // без MSAA: края плиток сглаживает сам шейдер по расстоянию до скруглённого прямоугольника
  // непрозрачный холст, залитый цветом фона страницы: выглядит так же, но
  // системе не нужно смешивать 3,5 мегапикселя с фоном на каждом кадре
  const opts = { alpha: false, antialias: false, premultipliedAlpha: true, powerPreference: 'high-performance' };
  let gl = canvas.getContext('webgl2', opts);
  const isGL2 = !!gl;
  if (!gl) gl = canvas.getContext('webgl', opts);
  if (!gl) return null;

  const VS = `
    attribute vec4 aPos; attribute vec2 aUv; attribute vec4 aInfo; attribute vec2 aSize;
    varying vec2 vUv; varying vec4 vInfo; varying vec2 vSize;
    void main() { vUv = aUv; vInfo = aInfo; vSize = aSize; gl_Position = aPos; }`;
  // vInfo: x = доля цвета (0 серый, 1 цвет), y = прозрачность, z = выбрана, w = пикселей экрана на пиксель плитки
  const FS = `
    precision mediump float;
    varying vec2 vUv; varying vec4 vInfo; varying vec2 vSize;
    uniform sampler2D uTex; uniform float uReady; uniform vec3 uBg; uniform vec4 uBorder; uniform vec4 uSel;
    void main() {
      vec2 p = vUv * vSize;
      float r = 8.0;
      vec2 q = abs(p - 0.5 * vSize) - (0.5 * vSize - vec2(r));
      float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
      float aa = 0.75 / max(vInfo.w, 0.0001);
      float inside = 1.0 - smoothstep(-aa, aa, d);
      vec3 tex = uReady > 0.5 ? texture2D(uTex, vUv).rgb : uBg;
      float g = dot(tex, vec3(0.2126, 0.7152, 0.0722)) * 0.92;
      vec3 col = mix(vec3(g), tex, vInfo.x);
      float edge = smoothstep(-1.0 - aa, -1.0 + aa, d);
      vec4 bc = mix(uBorder, uSel, vInfo.z);
      col = mix(col, bc.rgb, edge * bc.a);
      float a = inside * vInfo.y;
      gl_FragColor = vec4(col * a, a);
    }`;

  function shader(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }
  let prog;
  try {
    prog = gl.createProgram();
    gl.attachShader(prog, shader(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  } catch (err) {
    return null;
  }
  gl.useProgram(prog);

  const FLOATS = 12;                                   // pos4 uv2 info4 size2
  const n = tiles.length;
  const data = new Float32Array(n * 4 * FLOATS);
  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, data.byteLength, gl.DYNAMIC_DRAW);
  const idx = new Uint16Array(n * 6);
  for (let i = 0; i < n; i++) idx.set([4 * i, 4 * i + 1, 4 * i + 2, 4 * i, 4 * i + 2, 4 * i + 3], 6 * i);
  const ibo = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);

  const attr = (name, size, offset) => {
    const loc = gl.getAttribLocation(prog, name);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, size, gl.FLOAT, false, FLOATS * 4, offset * 4);
  };
  attr('aPos', 4, 0); attr('aUv', 2, 4); attr('aInfo', 4, 6); attr('aSize', 2, 10);
  const uTex = gl.getUniformLocation(prog, 'uTex');
  const uReady = gl.getUniformLocation(prog, 'uReady');
  const uBg = gl.getUniformLocation(prog, 'uBg');
  const uBorder = gl.getUniformLocation(prog, 'uBorder');
  const uSel = gl.getUniformLocation(prog, 'uSel');
  gl.uniform1i(uTex, 0);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.disable(gl.DEPTH_TEST);

  // цвета темы берутся из тех же CSS-переменных, что и у DOM-варианта
  function cssColor(name, fallback) {
    const probe = document.createElement('i');
    probe.style.color = `var(${name}, ${fallback})`;
    probe.style.display = 'none';
    stage.appendChild(probe);
    const m = getComputedStyle(probe).color.match(/[\d.]+/g) || [0, 0, 0, 1];
    probe.remove();
    return [m[0] / 255, m[1] / 255, m[2] / 255, m[3] !== undefined ? +m[3] : 1];
  }
  let clear = [0, 0, 0];
  function applyTheme() {
    const page = getComputedStyle(document.body).backgroundColor.match(/[\d.]+/g) || [0, 0, 0];
    clear = [page[0] / 255, page[1] / 255, page[2] / 255];
    const bg = cssColor('--card-bg', '#09090C');
    gl.uniform3f(uBg, bg[0], bg[1], bg[2]);
    gl.uniform4fv(uBorder, cssColor('--card-border', 'rgba(255,255,255,0.12)'));
    gl.uniform4fv(uSel, cssColor('--text-main', '#FFFFFF'));
  }
  applyTheme();

  // текстуры: один раз, с мип-картами и анизотропной фильтрацией
  const aniso = gl.getExtension('EXT_texture_filter_anisotropic');
  const maxAniso = aniso ? Math.min(8, gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT)) : 0;
  const pot = (v) => 2 ** Math.ceil(Math.log2(v));
  // Картинки декодируются в фоне (createImageBitmap), а в видеокарту уходят
  // по одной за кадр: раньше 21 декодирование шло в основном потоке разом
  // и давало провал в 600 мс на подходе к сцене.
  const uploads = [];
  async function decodeTile(t) {
    try {
      const blob = await (await fetch(t.src)).blob();
      if (window.createImageBitmap) return await createImageBitmap(blob);
    } catch (err) {}
    const img = new Image();
    img.src = t.src;
    await img.decode();
    return img;
  }
  tiles.forEach((t) => {
    t.tex = null;
    decodeTile(t).then((bmp) => { uploads.push([t, bmp]); api.dirty = true; if (api.onDirty) api.onDirty(); }).catch(() => {});
  });

  function uploadOne() {
    const job = uploads.shift();
    if (!job) return;
    const [t, bmp] = job;
    let source = bmp;
    const bw = bmp.width || bmp.naturalWidth, bh = bmp.height || bmp.naturalHeight;
    if (!isGL2) {                                      // WebGL1: мип-карты только у степеней двойки
      const c = document.createElement('canvas');
      c.width = pot(bw); c.height = pot(bh);
      c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
      source = c;
    }
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    if (maxAniso) gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, maxAniso);
    if (bmp.close) bmp.close();
    t.tex = tex;
    t.texReady = true;
  }

  let cw = 0, ch = 0, dpr = 1;
  function resize(W, H) {
    dpr = Math.min(window.devicePixelRatio || 1, 3);
    const w = Math.round(W * dpr), h = Math.round(H * dpr);
    if (w !== cw || h !== ch) {
      canvas.width = cw = w;
      canvas.height = ch = h;
      gl.viewport(0, 0, w, h);
    }
  }

  // CSS: translate3d rotateZ rotateY rotateX scale, потом наклон мира rotateX rotateZ,
  // потом perspective от центра сцены. Ось y вниз, z к зрителю.
  const corners = [[-0.5, -0.5, 0, 0], [0.5, -0.5, 1, 0], [0.5, 0.5, 1, 1], [-0.5, 0.5, 0, 1]];
  const order = [];
  function draw(W, H, tx, tz) {
    uploadOne();
    resize(W, H);
    const P = PERSPECTIVE;
    const ax = tx * Math.PI / 180, az = tz * Math.PI / 180;
    const cax = Math.cos(ax), sax = Math.sin(ax), caz = Math.cos(az), saz = Math.sin(az);
    order.length = 0;
    for (let i = 0; i < n; i++) {
      const t = tiles[i], r = t.r;
      const w = t.portrait ? 112 : TILE_W, h = TILE_H;
      const rz = r.rz * Math.PI / 180, ry = r.ry * Math.PI / 180, rx = r.rx * Math.PI / 180;
      const cz = Math.cos(rz), sz = Math.sin(rz), cy = Math.cos(ry), sy = Math.sin(ry), cx = Math.cos(rx), sx = Math.sin(rx);
      t.quad = t.quad || [[0, 0], [0, 0], [0, 0], [0, 0]];
      t.proj = t.proj || [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
      let zsum = 0;
      for (let k = 0; k < 4; k++) {
        // локальная точка плитки в пикселях, с масштабом
        let X = corners[k][0] * w * r.s, Y = corners[k][1] * h * r.s, Z = 0;
        // rotateX
        let y1 = Y * cx - Z * sx, z1 = Y * sx + Z * cx; Y = y1; Z = z1;
        // rotateY
        let x1 = X * cy + Z * sy; z1 = -X * sy + Z * cy; X = x1; Z = z1;
        // rotateZ
        x1 = X * cz - Y * sz; y1 = X * sz + Y * cz; X = x1; Y = y1;
        // translate3d
        X += r.x; Y += r.y; Z += r.z;
        // наклон мира: rotateX(tx) rotateZ(tz) применяется к уже собранной точке
        x1 = X * caz - Y * saz; y1 = X * saz + Y * caz; X = x1; Y = y1;
        y1 = Y * cax - Z * sax; z1 = Y * sax + Z * cax; Y = y1; Z = z1;
        const wq = (P - Z) / P;
        t.proj[k][0] = X; t.proj[k][1] = Y; t.proj[k][2] = Z; t.proj[k][3] = wq;
        t.quad[k][0] = W / 2 + X / wq;
        t.quad[k][1] = H / 2 + Y / wq;
        zsum += Z;
      }
      t.depth = zsum / 4;
      order.push(t);
    }
    order.sort((a, b) => a.depth - b.depth);             // дальние первыми

    for (let j = 0; j < n; j++) {
      const t = order[j], r = t.r;
      const w = t.portrait ? 112 : TILE_W, h = TILE_H;
      const pxPer = r.s * dpr * P / Math.max(1, P - t.depth);
      for (let k = 0; k < 4; k++) {
        const o = (j * 4 + k) * FLOATS, pr = t.proj[k];
        data[o] = pr[0] * 2 / W; data[o + 1] = -pr[1] * 2 / H; data[o + 2] = 0; data[o + 3] = pr[3];
        data[o + 4] = corners[k][2]; data[o + 5] = corners[k][3];
        data[o + 6] = r.color; data[o + 7] = r.o; data[o + 8] = t.selected ? 1 : 0; data[o + 9] = pxPer;
        data[o + 10] = w; data[o + 11] = h;
      }
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, data);
    gl.clearColor(clear[0], clear[1], clear[2], 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.activeTexture(gl.TEXTURE0);
    for (let j = 0; j < n; j++) {
      const t = order[j];
      if (t.r.o <= 0.003) continue;
      gl.uniform1f(uReady, t.texReady ? 1 : 0);
      gl.bindTexture(gl.TEXTURE_2D, t.tex);
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, j * 12);
    }
    api.dirty = uploads.length > 0;
  }

  // попадание указателя: ближайшая к зрителю плитка, внутри её четырёхугольника
  function pick(px, py) {
    for (let j = order.length - 1; j >= 0; j--) {
      const t = order[j];
      if (t.r.o < 0.35) continue;
      const q = t.quad;
      let sign = 0, inside = true;
      for (let k = 0; k < 4; k++) {
        const a = q[k], b = q[(k + 1) % 4];
        const cr = (b[0] - a[0]) * (py - a[1]) - (b[1] - a[1]) * (px - a[0]);
        if (cr !== 0) {
          if (sign === 0) sign = Math.sign(cr);
          else if (Math.sign(cr) !== sign) { inside = false; break; }
        }
      }
      if (inside) return t;
    }
    return null;
  }

  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); canvas.remove(); onLost(); });
  stage.insertBefore(canvas, stage.firstChild);

  const api = { draw, pick, applyTheme, dirty: true, upload: uploadOne, pending: () => uploads.length };
  return api;
}

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
  // Кнопки есть всегда: в WebGL-режиме они невидимы и нужны клавиатуре и
  // экранному диктору, в запасном режиме они и есть плитки.
  const tiles = [];
  for (let k = 1; k <= 3; k++) {
    PROJECTS.forEach((p) => {
      const portrait = k === 3;
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'work-tile' + (portrait ? ' is-portrait' : '');
      el.setAttribute('aria-label', `${p.title}, ${SHOT_NAMES[k - 1]}`);
      world.appendChild(el);
      tiles.push({
        el, p, portrait,
        src: `assets/work/${p.id}-${k}.webp`,
        cur: { x: 0, y: 0, z: -600, rx: 0, ry: 0, rz: 0, s: 0.2, o: 0 },
        r: { x: 0, y: 0, z: -600, rx: 0, ry: 0, rz: 0, s: 0.2, o: 0, color: 0 },
        from: null, start: 0,
        hot: 0, hotTarget: 0, color: 0,
        last: '', lastO: '', lastZ: ''
      });
    });
  }
  const n = tiles.length;

  // DOM-вариант: картинки внутри кнопок (запасной путь без WebGL)
  function useDomTiles() {
    stage.classList.remove('is-gl');
    tiles.forEach((t) => {
      if (t.el.querySelector('img')) return;
      const img = document.createElement('img');
      img.src = t.src;
      img.alt = '';
      img.width = t.portrait ? 420 : 720;
      img.height = t.portrait ? 560 : 450;
      img.decoding = 'async';
      img.draggable = false;
      t.el.appendChild(img);
      t.last = '';
    });
  }

  let glr = null;
  const startGL = () => {
    glr = createWorksGL(stage, tiles, () => { glr = null; useDomTiles(); wake(); });
    if (glr) {
      stage.classList.add('is-gl');
      glr.onDirty = () => { if (visible) wake(); else idleUpload(); };
    } else {
      useDomTiles();
    }
  };

  // пока сцена за экраном, текстуры уходят в видеокарту в паузах между кадрами
  let idleQueued = false;
  function idleUpload() {
    if (idleQueued || !glr) return;
    idleQueued = true;
    (window.requestIdleCallback || ((f) => setTimeout(f, 50)))(() => {
      idleQueued = false;
      if (!glr) return;
      glr.upload();
      if (glr.pending()) idleUpload();
    });
  }

  // Размеры сцены
  let W = stage.clientWidth;
  let H = stage.clientHeight;
  const ro = new ResizeObserver(() => { W = stage.clientWidth; H = stage.clientHeight; if (glr) glr.dirty = true; wake(); });
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
    if (selected) { selected.el.classList.remove('is-selected'); selected.selected = false; }
    selected = tile;
    if (tile) { tile.el.classList.add('is-selected'); tile.selected = true; }
    tiles.forEach((t) => { t.hotTarget = t === tile ? 1 : 0; });
    showCaption(tile);
    wake();
  }

  // --- Ввод --------------------------------------------------------------------------
  function tileAt(e) {
    if (glr) {
      if (!e.target.closest?.('#work-stage') || e.target.closest('.work-modes, .work-caption')) return null;
      const rect = stage.getBoundingClientRect();
      return glr.pick(e.clientX - rect.left, e.clientY - rect.top);
    }
    const tileEl = e.target.closest?.('.work-tile');
    return tileEl ? tiles.find((t) => t.el === tileEl) : null;
  }

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
    if (e.pointerType === 'mouse' && !selected && visible) {
      const hot = tileAt(e);
      if (hot === lastHot) return;
      lastHot = hot;
      stage.style.cursor = hot ? 'pointer' : '';
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
      const tile = tileAt(e);
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

  let lastHot = null;
  stage.addEventListener('mouseleave', () => {
    lastHot = null;
    stage.style.cursor = '';
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

  // прокрутка страницы слегка докручивает спираль и круг. scrollY читается
  // только в начале кадра: чтение в обработчике scroll заставляло Chrome
  // пересчитывать стили всей страницы на каждом событии (до 77 мс)
  let lastScroll = null;
  window.addEventListener('scroll', () => wake(), { passive: true });

  // --- Кадр ----------------------------------------------------------------------------
  let visible = false;
  let worldLast = '';
  let started = false;
  let raf = 0;
  let lastT = 0;

  function frame(now) {
    raf = 0;
    const dt = Math.min(0.05, lastT ? (now - lastT) / 1000 : 0.016);
    lastT = now;

    const sy = window.scrollY;                           // до любых записей в стили
    if (lastScroll !== null && mode !== 'grid' && !REDUCED_MOTION) rot[mode] += (sy - lastScroll) * 0.06;
    lastScroll = sy;

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
    if (!glr) {
      const wt = `rotateX(${tx.toFixed(2)}deg) rotateZ(${tz.toFixed(2)}deg)`;
      if (wt !== worldLast) { world.style.transform = wt; worldLast = wt; }
    }

    let busy = !!world3.from || (glr && glr.dirty);
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
      // серый -> цвет за ~0,35 с, как transition: filter у DOM-варианта
      const colorTarget = (tile.hotTarget > 0 || tile.selected) ? 1 : 0;
      tile.color += (colorTarget - tile.color) * Math.min(1, dt * 9);
      if (Math.abs(colorTarget - tile.color) > 0.002) busy = true;

      if (glr) {
        const r = tile.r;
        r.x = c.x; r.y = c.y; r.z = z; r.rx = c.rx; r.ry = c.ry; r.rz = c.rz; r.s = s; r.o = o; r.color = tile.color;
        continue;
      }

      const tr = `translate3d(${c.x.toFixed(1)}px,${c.y.toFixed(1)}px,${z.toFixed(1)}px) rotateZ(${c.rz.toFixed(2)}deg) rotateY(${c.ry.toFixed(2)}deg) rotateX(${c.rx.toFixed(2)}deg) scale(${s.toFixed(4)})`;
      if (tr !== tile.last) {
        tile.el.style.transform = tr;
        tile.last = tr;
      }
      const os = o.toFixed(2);
      if (os !== tile.lastO) { tile.el.style.opacity = os; tile.lastO = os; }
      const zi = tile.hot > 0.5 ? '2' : '';
      if (zi !== tile.lastZ) { tile.el.style.zIndex = zi; tile.lastZ = zi; }
    }

    if (glr) glr.draw(W, H, tx, tz);

    const spinning = mode !== 'grid' && !REDUCED_MOTION && !selected;
    if (visible && (busy || spinning || drag || rotVel)) raf = requestAnimationFrame(frame);
    else { lastT = 0; lastScroll = null; }
  }

  function wake() {
    if (!raf && visible) raf = requestAnimationFrame(frame);
  }

  // кадры идут только пока сцена на экране и вкладка открыта
  const pre = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return;
    pre.disconnect();
    if (!glr && !stage.classList.contains('is-gl') && !stage.querySelector('img')) startGL();
  }, { rootMargin: '1200px 0px' });
  pre.observe(stage);

  const io = new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting && !document.hidden;
    if (visible && !glr && !stage.querySelector('img')) startGL();
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
      keywords: ['оплат', 'договор', 'предоплат', 'счет', 'счёт', 'как платить', 'самозанят', 'чек'],
      answer: 'Стандартный формат: 50% предоплата перед стартом, 50% после демонстрации готовой работы и переноса на ваш домен. Работаю как самозанятый, на каждую оплату присылаю чек.'
    },
    {
      keywords: ['галлюцинац', 'лишнее', 'ошибки', 'скидк', 'наговорит'],
      answer: 'ИИ-агент отвечает строго по вашему прайс-листу и правилам компании. Выдумки исключены. При нестандартном вопросе или готовности записаться агент мгновенно передает диалог вам.'
    },
    {
      keywords: ['контакт', 'связ', 'телефон', 'telegram', 'почта', 'написать', 'тг'],
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
   Залитая копия надписи лежит в обрезающем слое. Слой и копия сдвигаются
   навстречу друг другу через transform, поэтому заливка растёт снизу без
   перерисовки текста: только композиция на видеокарте, раз в кадр и только
   пока подвал виден.
   ========================================================================== */
function initFooterScrollFill() {
  const fillTitle = document.getElementById('footer-fill-title');
  if (!fillTitle) return;
  const clip = fillTitle.querySelector('.footer-fill-clip');
  const solid = fillTitle.querySelector('.footer-fill-solid');
  if (!clip || !solid) return;

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
    const rest = ((1 - progress) * 100).toFixed(2);
    if (rest !== lastPct) {
      clip.style.transform = `translate3d(0, ${rest}%, 0)`;
      solid.style.transform = `translate3d(0, -${rest}%, 0)`;
      lastPct = rest;
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
