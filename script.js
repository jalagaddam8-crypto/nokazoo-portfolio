/**
 * nokazoo portfolio : сценарий управления вариантами оформления
 * - Переключение видео первого экрана: Сакура (Пин 2) / Облака (Пин 1) / Гроза / Дождь
 * - Интерактивная 60fps canvas-анимация падающих лепестков сакуры и светящегося боке
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

  // Читаем начальные значения из URL параметров (по умолчанию Пин 2 Сакура)
  var urlParams = new URLSearchParams(window.location.search);
  var initialHero = urlParams.get('hero');
  var initialAccent = urlParams.get('accent');

  var currentHero = validHeroes.indexOf(initialHero) !== -1 ? initialHero : 'pin2';
  var currentAccent = validAccents.indexOf(initialAccent) !== -1 ? initialAccent : 'a';

  /* ==========================================================================
     Движок интерактивной сакуры (падающие лепестки + светящиеся сферы боке)
     ========================================================================== */
  var sakuraEngine = (function () {
    if (!sakuraCanvas) return null;
    var ctx = sakuraCanvas.getContext('2d');
    if (!ctx) return null;

    var rafId = null;
    var isRunning = false;
    var width = 0;
    var height = 0;
    var dpr = 1;

    var petals = [];
    var bokehs = [];
    var PETAL_COUNT = 48;
    var BOKEH_COUNT = 18;

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
      petals = [];
      for (var i = 0; i < PETAL_COUNT; i++) {
        petals.push({
          x: Math.random() * (width + 100) - 50,
          y: Math.random() * (height + 100) - 50,
          z: 0.6 + Math.random() * 0.8, // глубина 0.6..1.4
          size: 10 + Math.random() * 14,
          vy: 0.9 + Math.random() * 1.5,
          vx: (Math.random() - 0.3) * 0.8,
          roll: Math.random() * Math.PI * 2,
          pitch: Math.random() * Math.PI * 2,
          yaw: Math.random() * Math.PI * 2,
          dRoll: (Math.random() - 0.5) * 0.035,
          dPitch: (Math.random() - 0.5) * 0.025,
          dYaw: (Math.random() - 0.5) * 0.03,
          alpha: 0.65 + Math.random() * 0.3,
        });
      }

      bokehs = [];
      for (var j = 0; j < BOKEH_COUNT; j++) {
        bokehs.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: 18 + Math.random() * 45,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.6) * 0.2, // медленно дрейфуют вверх
          pulseFreq: 0.8 + Math.random() * 1.2,
          pulsePhase: Math.random() * Math.PI * 2,
          baseAlpha: 0.12 + Math.random() * 0.25,
        });
      }
    }

    function drawPetal(p) {
      ctx.save();
      ctx.translate(p.x * dpr, p.y * dpr);
      ctx.rotate(p.yaw);

      // 3D флиппинг в воздухе
      var flip = Math.cos(p.roll);
      var pitchScale = Math.sin(p.pitch) * 0.25 + 0.85;
      ctx.scale(flip * p.z * dpr, pitchScale * p.z * dpr);

      var s = p.size;
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.bezierCurveTo(s * 0.82, -s * 0.72, s * 0.88, s * 0.35, 0, s);
      ctx.bezierCurveTo(-s * 0.88, s * 0.35, -s * 0.82, -s * 0.72, 0, -s);
      ctx.closePath();

      var grad = ctx.createLinearGradient(0, -s, 0, s);
      grad.addColorStop(0, 'rgba(255, 238, 243, ' + (p.alpha * 0.95) + ')');
      grad.addColorStop(0.45, 'rgba(255, 185, 202, ' + (p.alpha * 0.88) + ')');
      grad.addColorStop(1, 'rgba(240, 136, 172, ' + (p.alpha * 0.92) + ')');
      ctx.fillStyle = grad;
      ctx.fill();

      // Тонкая полупрозрачная прожилка
      ctx.beginPath();
      ctx.moveTo(0, s * 0.75);
      ctx.lineTo(0, -s * 0.3);
      ctx.strokeStyle = 'rgba(255, 255, 255, ' + (p.alpha * 0.35) + ')';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      ctx.restore();
    }

    function drawBokeh(b, t) {
      var pulse = b.baseAlpha + 0.08 * Math.sin(t * 0.002 * b.pulseFreq + b.pulsePhase);
      if (pulse <= 0.02) return;

      ctx.save();
      var grad = ctx.createRadialGradient(
        b.x * dpr, b.y * dpr, 0,
        b.x * dpr, b.y * dpr, b.radius * dpr
      );
      grad.addColorStop(0, 'rgba(255, 230, 242, ' + pulse + ')');
      grad.addColorStop(0.5, 'rgba(255, 190, 220, ' + (pulse * 0.6) + ')');
      grad.addColorStop(1, 'rgba(255, 170, 205, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(b.x * dpr, b.y * dpr, b.radius * dpr, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function loop(time) {
      if (!isRunning) return;

      ctx.clearRect(0, 0, sakuraCanvas.width, sakuraCanvas.height);

      // Глобальный мягкий ветер
      var wind = Math.sin(time * 0.001) * 1.3 + Math.sin(time * 0.00045) * 0.7;

      // 1. Рисуем сферы боке на заднем плане
      for (var j = 0; j < bokehs.length; j++) {
        var b = bokehs[j];
        b.x += b.vx + wind * 0.2;
        b.y += b.vy;
        if (b.y < -b.radius) b.y = height + b.radius;
        if (b.x < -b.radius) b.x = width + b.radius;
        if (b.x > width + b.radius) b.x = -b.radius;
        drawBokeh(b, time);
      }

      // 2. Рисуем падающие лепестки
      for (var i = 0; i < petals.length; i++) {
        var p = petals[i];
        p.roll += p.dRoll;
        p.pitch += p.dPitch;
        p.yaw += p.dYaw;

        p.x += (p.vx + wind) * p.z;
        p.y += p.vy * p.z;

        if (p.y > height + 40) {
          p.y = -30;
          p.x = Math.random() * (width + 80) - 40;
        }
        if (p.x > width + 50) p.x = -40;
        if (p.x < -50) p.x = width + 40;

        drawPetal(p);
      }

      rafId = requestAnimationFrame(loop);
    }

    function start() {
      var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (motionQuery.matches) return;
      if (isRunning) return;

      resize();
      initParticles();
      isRunning = true;
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

    // Управление интерактивной сакурой
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

    // Обновляем подпись к фону
    var creditLabel = document.getElementById('hero-credit-label');
    if (creditLabel) {
      if (heroName === 'pin1') {
        creditLabel.textContent = 'Пин 1: Облака над холмами';
      } else if (heroName === 'pin2') {
        creditLabel.textContent = 'Пин 2: Ночная сакура';
      } else if (heroName === 'rain') {
        creditLabel.textContent = 'Дождь по стеклу';
      } else {
        creditLabel.textContent = 'Гроза над горизонтом';
      }
    }

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

  // Оптическая каустика и преломление жидкого стекла Apple при движении курсора
  var glassDeck = document.querySelector('.hero__search-card');
  if (glassDeck) {
    glassDeck.addEventListener('pointermove', function (e) {
      var rect = glassDeck.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      glassDeck.style.setProperty('--mouse-x', x + 'px');
      glassDeck.style.setProperty('--mouse-y', y + 'px');
    }, { passive: true });
    glassDeck.addEventListener('pointerleave', function () {
      glassDeck.style.setProperty('--mouse-x', '50%');
      glassDeck.style.setProperty('--mouse-y', '30%');
    }, { passive: true });
  }

})();
