/**
 * nokazoo.dev : сценарий управления вариантами оформления и анимацией
 * - Переключение первого экрана: Сакура / Облака / Гроза / Дождь
 * - Высокопроизводительный 120+ FPS Canvas-движок сакуры (ProMotion, 120Hz/144Hz):
 *   * Offscreen Sprite Caching: нулевые повторные выделения градиентов в каждом кадре
 *   * Delta-Time Physics: адаптация скорости движения под реальную частоту развёртки дисплея
 *   * Аппаратный композитинг через GPU drawImage
 * - Переключение оттенка красного акцента: A (сигнальный), B (кармин), C (киноварь)
 * - Чтение и сохранение в URL query params (?hero=...&accent=...)
 * - Безопасная работа при prefers-reduced-motion и без JS
 */

(function () {
  'use strict';

  var html = document.documentElement;
  var video = document.getElementById('hero-video');
  var srcWebm = document.getElementById('hero-src-webm');
  var srcMp4 = document.getElementById('hero-src-mp4');
  var sakuraCanvas = document.getElementById('sakura-canvas');

  var validHeroes = ['pin1', 'pin2', 'storm', 'rain'];
  var validAccents = ['a', 'b', 'c'];

  // Читаем начальные значения из URL параметров (по умолчанию Сакура pin2)
  var urlParams = new URLSearchParams(window.location.search);
  var initialHero = urlParams.get('hero');
  var initialAccent = urlParams.get('accent');

  var currentHero = validHeroes.indexOf(initialHero) !== -1 ? initialHero : 'pin2';
  var currentAccent = validAccents.indexOf(initialAccent) !== -1 ? initialAccent : 'a';

  /* ==========================================================================
     Движок интерактивной сакуры: 120+ FPS ProMotion High-Refresh Architecture
     ========================================================================== */
  var sakuraEngine = (function () {
    if (!sakuraCanvas) return null;
    var ctx = sakuraCanvas.getContext('2d', { alpha: true });
    if (!ctx) return null;

    var rafId = null;
    var isRunning = false;
    var width = 0;
    var height = 0;
    var dpr = 1;
    var lastTime = 0;

    var petals = [];
    var bokehs = [];
    var PETAL_COUNT = 48;
    var BOKEH_COUNT = 16;

    // Кэш оффскрин-спрайтов (создаются один раз при старте, затем блитятся через GPU)
    var petalSprites = [];
    var bokehSprites = [];

    function buildSpriteCache() {
      if (petalSprites.length > 0) return;

      // 6 типов лепестков (разные размеры и нежные оттенки сакуры)
      var petalDefs = [
        { w: 28, h: 36, c0: 'rgba(255, 240, 245, 0.95)', c1: 'rgba(255, 185, 204, 0.90)', c2: 'rgba(240, 136, 172, 0.92)' },
        { w: 22, h: 28, c0: 'rgba(255, 245, 248, 0.96)', c1: 'rgba(255, 195, 212, 0.88)', c2: 'rgba(244, 143, 177, 0.90)' },
        { w: 16, h: 22, c0: 'rgba(255, 235, 242, 0.94)', c1: 'rgba(255, 180, 200, 0.86)', c2: 'rgba(235, 125, 160, 0.88)' },
        { w: 34, h: 44, c0: 'rgba(255, 242, 246, 0.95)', c1: 'rgba(255, 190, 208, 0.90)', c2: 'rgba(242, 138, 175, 0.92)' },
        { w: 20, h: 26, c0: 'rgba(255, 248, 250, 0.96)', c1: 'rgba(255, 205, 220, 0.85)', c2: 'rgba(248, 150, 185, 0.88)' },
        { w: 14, h: 18, c0: 'rgba(255, 230, 238, 0.92)', c1: 'rgba(250, 170, 195, 0.84)', c2: 'rgba(230, 115, 150, 0.85)' }
      ];

      for (var i = 0; i < petalDefs.length; i++) {
        var def = petalDefs[i];
        var sCanvas = document.createElement('canvas');
        var scale = 2; // high-DPI crispness
        var sw = def.w * scale;
        var sh = def.h * scale;
        sCanvas.width = sw;
        sCanvas.height = sh;
        var sCtx = sCanvas.getContext('2d');

        var cx = sw / 2;
        var cy = sh / 2;
        var rx = sw * 0.42;
        var ry = sh * 0.46;

        sCtx.beginPath();
        sCtx.moveTo(cx, cy - ry);
        sCtx.bezierCurveTo(cx + rx * 0.95, cy - ry * 0.72, cx + rx * 0.98, cy + ry * 0.4, cx, cy + ry);
        sCtx.bezierCurveTo(cx - rx * 0.98, cy + ry * 0.4, cx - rx * 0.95, cy - ry * 0.72, cx, cy - ry);
        sCtx.closePath();

        var grad = sCtx.createLinearGradient(cx, cy - ry, cx, cy + ry);
        grad.addColorStop(0, def.c0);
        grad.addColorStop(0.45, def.c1);
        grad.addColorStop(1, def.c2);
        sCtx.fillStyle = grad;
        sCtx.fill();

        // Нежная прожилка
        sCtx.beginPath();
        sCtx.moveTo(cx, cy + ry * 0.75);
        sCtx.lineTo(cx, cy - ry * 0.35);
        sCtx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        sCtx.lineWidth = 1.2;
        sCtx.stroke();

        petalSprites.push({
          canvas: sCanvas,
          w: def.w,
          h: def.h
        });
      }

      // 4 спрайта боке с мягким радиальным спадом
      var bokehDefs = [
        { r: 24, c: '255, 225, 240' },
        { r: 38, c: '255, 200, 225' },
        { r: 54, c: '255, 185, 215' },
        { r: 72, c: '250, 175, 210' }
      ];

      for (var j = 0; j < bokehDefs.length; j++) {
        var bDef = bokehDefs[j];
        var bCanvas = document.createElement('canvas');
        var dim = bDef.r * 2 * 2;
        bCanvas.width = dim;
        bCanvas.height = dim;
        var bCtx = bCanvas.getContext('2d');
        var bcx = dim / 2;
        var bcy = dim / 2;
        var br = bDef.r * 2;

        var bGrad = bCtx.createRadialGradient(bcx, bcy, 0, bcx, bcy, br);
        bGrad.addColorStop(0, 'rgba(' + bDef.c + ', 1)');
        bGrad.addColorStop(0.45, 'rgba(' + bDef.c + ', 0.45)');
        bGrad.addColorStop(1, 'rgba(' + bDef.c + ', 0)');

        bCtx.fillStyle = bGrad;
        bCtx.beginPath();
        bCtx.arc(bcx, bcy, br, 0, Math.PI * 2);
        bCtx.fill();

        bokehSprites.push({
          canvas: bCanvas,
          r: bDef.r
        });
      }
    }

    function resize() {
      if (!sakuraCanvas) return;
      var parent = sakuraCanvas.parentElement || sakuraCanvas;
      var rect = parent.getBoundingClientRect();
      width = rect.width || window.innerWidth;
      height = rect.height || window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      sakuraCanvas.width = Math.floor(width * dpr);
      sakuraCanvas.height = Math.floor(height * dpr);
      sakuraCanvas.style.width = width + 'px';
      sakuraCanvas.style.height = height + 'px';
    }

    function initParticles() {
      buildSpriteCache();
      petals = [];
      for (var i = 0; i < PETAL_COUNT; i++) {
        petals.push({
          x: Math.random() * (width + 100) - 50,
          y: Math.random() * (height + 100) - 50,
          z: 0.65 + Math.random() * 0.75, // глубина 0.65..1.4
          spriteIdx: Math.floor(Math.random() * petalSprites.length),
          vy: 0.85 + Math.random() * 1.35,
          vx: (Math.random() - 0.3) * 0.75,
          roll: Math.random() * Math.PI * 2,
          pitch: Math.random() * Math.PI * 2,
          yaw: Math.random() * Math.PI * 2,
          dRoll: (Math.random() - 0.5) * 0.032,
          dPitch: (Math.random() - 0.5) * 0.022,
          dYaw: (Math.random() - 0.5) * 0.028,
          alpha: 0.7 + Math.random() * 0.28,
        });
      }

      bokehs = [];
      for (var j = 0; j < BOKEH_COUNT; j++) {
        var bSpriteIdx = Math.floor(Math.random() * bokehSprites.length);
        var bSprite = bokehSprites[bSpriteIdx];
        bokehs.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: bSprite.r,
          spriteIdx: bSpriteIdx,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.55) * 0.18,
          pulseFreq: 0.8 + Math.random() * 1.2,
          pulsePhase: Math.random() * Math.PI * 2,
          baseAlpha: 0.10 + Math.random() * 0.22,
        });
      }
    }

    function loop(currentTime) {
      if (!isRunning) return;

      if (!lastTime) lastTime = currentTime;
      // Дельта-тайм относительно эталона 60fps (16.6667ms)
      // На 120Hz экране ProMotion dt = ~0.5, частота обновления в 2 раза выше!
      var dt = (currentTime - lastTime) / 16.6667;
      if (dt > 2.5 || dt <= 0 || isNaN(dt)) dt = 1.0;
      lastTime = currentTime;

      ctx.clearRect(0, 0, sakuraCanvas.width, sakuraCanvas.height);

      // Мягкий весенний бриз
      var wind = Math.sin(currentTime * 0.001) * 1.3 + Math.sin(currentTime * 0.00045) * 0.7;

      // 1. Парящие сферы боке (быстрый drawImage с альфа-модуляцией)
      for (var j = 0; j < bokehs.length; j++) {
        var b = bokehs[j];
        b.x += (b.vx + wind * 0.15) * dt;
        b.y += b.vy * dt;
        if (b.y < -b.r) b.y = height + b.r;
        if (b.x < -b.r) b.x = width + b.r;
        if (b.x > width + b.r) b.x = -b.r;

        var alpha = b.baseAlpha + 0.08 * Math.sin(currentTime * 0.002 * b.pulseFreq + b.pulsePhase);
        if (alpha > 0.02) {
          ctx.globalAlpha = Math.min(alpha, 1.0);
          var bSpr = bokehSprites[b.spriteIdx];
          var diam = b.r * 2 * dpr;
          ctx.drawImage(bSpr.canvas, (b.x - b.r) * dpr, (b.y - b.r) * dpr, diam, diam);
        }
      }

      // 2. Падающие лепестки сакуры (аппаратный GPU drawImage с 3D флиппингом)
      for (var i = 0; i < petals.length; i++) {
        var p = petals[i];
        p.roll += p.dRoll * dt;
        p.pitch += p.dPitch * dt;
        p.yaw += p.dYaw * dt;

        p.x += (p.vx + wind) * p.z * dt;
        p.y += p.vy * p.z * dt;

        if (p.y > height + 40) {
          p.y = -35;
          p.x = Math.random() * (width + 80) - 40;
        }
        if (p.x > width + 50) p.x = -40;
        if (p.x < -50) p.x = width + 40;

        ctx.save();
        ctx.translate(p.x * dpr, p.y * dpr);
        ctx.rotate(p.yaw);

        var flip = Math.cos(p.roll);
        var pitchScale = Math.sin(p.pitch) * 0.25 + 0.85;
        ctx.scale(flip * p.z * dpr, pitchScale * p.z * dpr);
        ctx.globalAlpha = p.alpha;

        var pSpr = petalSprites[p.spriteIdx];
        ctx.drawImage(pSpr.canvas, -pSpr.w / 2, -pSpr.h / 2, pSpr.w, pSpr.h);
        ctx.restore();
      }

      ctx.globalAlpha = 1.0;
      rafId = requestAnimationFrame(loop);
    }

    function start() {
      var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (motionQuery.matches) return;
      if (isRunning) return;

      resize();
      initParticles();
      isRunning = true;
      lastTime = 0;
      rafId = requestAnimationFrame(loop);
    }

    function stop() {
      isRunning = false;
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      if (ctx && sakuraCanvas) {
        ctx.clearRect(0, 0, sakuraCanvas.width, sakuraCanvas.height);
      }
    }

    window.addEventListener('resize', function () {
      if (isRunning) {
        resize();
      }
    }, { passive: true });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        if (isRunning && rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      } else {
        if (isRunning && currentHero === 'pin2' && !rafId) {
          lastTime = 0;
          rafId = requestAnimationFrame(loop);
        }
      }
    });

    return {
      start: start,
      stop: stop,
      resize: resize,
    };
  })();

  function updateUrl(hero, accent) {
    if (window.history && window.history.replaceState) {
      var params = new URLSearchParams(window.location.search);
      if (params.get('hero') === hero && params.get('accent') === accent) return;
      params.set('hero', hero);
      params.set('accent', accent);
      var newUrl = window.location.pathname + '?' + params.toString() + window.location.hash;
      window.history.replaceState(null, '', newUrl);
    }
  }

  function updateHeroButtons(heroName) {
    var heroBtns = document.querySelectorAll('[data-set-hero]');
    for (var i = 0; i < heroBtns.length; i++) {
      var btn = heroBtns[i];
      var isCurrent = btn.getAttribute('data-set-hero') === heroName;
      btn.setAttribute('aria-pressed', isCurrent ? 'true' : 'false');
    }
  }

  function updateAccentButtons(accentName) {
    var accentBtns = document.querySelectorAll('[data-set-accent]');
    for (var i = 0; i < accentBtns.length; i++) {
      var btn = accentBtns[i];
      var isCurrent = btn.getAttribute('data-set-accent') === accentName;
      btn.setAttribute('aria-pressed', isCurrent ? 'true' : 'false');
    }
  }

  function setHero(heroName, forceVideoReload) {
    if (validHeroes.indexOf(heroName) === -1) return;
    var changed = currentHero !== heroName;
    currentHero = heroName;
    html.dataset.hero = heroName;

    updateHeroButtons(heroName);

    // Управление интерактивной сакурой (120 FPS)
    if (sakuraEngine) {
      if (heroName === 'pin2') {
        sakuraEngine.start();
      } else {
        sakuraEngine.stop();
      }
    }

    // Обновляем постер
    var posterWebp = document.getElementById('hero-poster-webp');
    var posterImg = document.getElementById('hero-poster-img');
    if (posterWebp) posterWebp.srcset = 'video/' + heroName + '-poster.webp';
    if (posterImg) posterImg.src = 'video/' + heroName + '-poster.webp';

    // Обновляем видео только если герой изменился или явно запрошено
    if (video && srcWebm && srcMp4 && (changed || forceVideoReload)) {
      var posterPath = 'video/' + heroName + '-poster.webp';
      var webmPath = 'video/' + heroName + '.webm';
      var mp4Path = 'video/' + heroName + '.mp4';

      video.poster = posterPath;
      srcWebm.src = webmPath;
      srcMp4.src = mp4Path;
      video.load();

      var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (!motionQuery.matches) {
        var playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(function () {});
        }
      } else {
        video.pause();
      }
    }

    updateUrl(currentHero, currentAccent);
  }

  function setAccent(accentName) {
    if (validAccents.indexOf(accentName) === -1) return;
    currentAccent = accentName;
    html.dataset.accent = accentName;

    updateAccentButtons(accentName);
    updateUrl(currentHero, currentAccent);
  }

  // Навешиваем слушатели клика на панель вариантов
  document.addEventListener('click', function (e) {
    var target = e.target;
    var heroTarget = target.closest('[data-set-hero]');
    if (heroTarget) {
      setHero(heroTarget.getAttribute('data-set-hero'), true);
      return;
    }

    var accentTarget = target.closest('[data-set-accent]');
    if (accentTarget) {
      setAccent(accentTarget.getAttribute('data-set-accent'));
      return;
    }
  });

  // Инициализация кнопок и атрибутов при загрузке
  if (initialHero && initialHero !== 'pin2' && validHeroes.indexOf(initialHero) !== -1) {
    setHero(initialHero, true);
  } else {
    updateHeroButtons(currentHero);
    if (currentHero === 'pin2' && sakuraEngine) {
      sakuraEngine.start();
    }
  }

  if (initialAccent && initialAccent !== 'a' && validAccents.indexOf(initialAccent) !== -1) {
    setAccent(initialAccent);
  } else {
    updateAccentButtons(currentAccent);
  }

  // Обработка формы в поисковой строке героя
  var heroForm = document.getElementById('hero-cta-form');
  var heroInput = document.getElementById('hero-cta-input');
  if (heroForm) {
    heroForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var query = heroInput ? heroInput.value.trim() : '';
      if (query) {
        var tgLinks = document.querySelectorAll('a[href^="https://t.me/nokazoo"]');
        for (var i = 0; i < tgLinks.length; i++) {
          tgLinks[i].href = 'https://t.me/nokazoo?text=' + encodeURIComponent('Здравствуйте! Хочу бесплатный разбор: ' + query);
        }
      }
      var contactsSection = document.getElementById('contacts');
      if (contactsSection) {
        contactsSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // Запуск фонового видео сразу на мобильных и десктопах с фолбэком на первое касание
  function initVideoPlayback() {
    if (!video) return;
    var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionQuery.matches) {
      video.pause();
      return;
    }

    var playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(function () {
        function onTouchStart() {
          window.removeEventListener('touchstart', onTouchStart);
          window.removeEventListener('scroll', onTouchStart);
          window.removeEventListener('click', onTouchStart);
          video.play().catch(function () {});
        }
        window.addEventListener('touchstart', onTouchStart, { passive: true, once: true });
        window.addEventListener('scroll', onTouchStart, { passive: true, once: true });
        window.addEventListener('click', onTouchStart, { passive: true, once: true });
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVideoPlayback);
  } else {
    initVideoPlayback();
  }

  // Моушн-анимации появления блоков при скролле (IntersectionObserver)
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        var entry = entries[i];
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      }
    }, {
      rootMargin: '0px 0px -6% 0px',
      threshold: 0.08
    });

    var revealTargets = document.querySelectorAll('.minori-card, .case-card, .price-card, .counter-item, .step-card, .simple-list__item');
    for (var j = 0; j < revealTargets.length; j++) {
      revealTargets[j].classList.add('reveal-on-scroll');
      observer.observe(revealTargets[j]);
    }
  }

  // Оптическая каустика и преломление жидкого стекла Apple с RAF-синхронизацией под 120 FPS
  var glassDeck = document.querySelector('.hero__search-card');
  if (glassDeck) {
    var glassRect = null;
    var targetMouseX = 0;
    var targetMouseY = 0;
    var rafPointerId = null;

    function refreshGlassRect() {
      if (glassDeck) glassRect = glassDeck.getBoundingClientRect();
    }
    window.addEventListener('resize', refreshGlassRect, { passive: true });
    window.addEventListener('scroll', refreshGlassRect, { passive: true });

    glassDeck.addEventListener('pointerenter', function () {
      refreshGlassRect();
    }, { passive: true });

    glassDeck.addEventListener('pointermove', function (e) {
      if (!glassRect) refreshGlassRect();
      targetMouseX = e.clientX - glassRect.left;
      targetMouseY = e.clientY - glassRect.top;

      if (!rafPointerId) {
        rafPointerId = requestAnimationFrame(function () {
          glassDeck.style.setProperty('--mouse-x', targetMouseX + 'px');
          glassDeck.style.setProperty('--mouse-y', targetMouseY + 'px');
          rafPointerId = null;
        });
      }
    }, { passive: true });

    glassDeck.addEventListener('pointerleave', function () {
      if (rafPointerId) {
        cancelAnimationFrame(rafPointerId);
        rafPointerId = null;
      }
      glassDeck.style.setProperty('--mouse-x', '50%');
      glassDeck.style.setProperty('--mouse-y', '30%');
    }, { passive: true });
  }

})();
