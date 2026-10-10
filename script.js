/**
 * nokazoo portfolio : сценарий управления вариантами оформления
 * - Переключение видео первого экрана: Гроза / Дождь
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

  var validHeroes = ['storm', 'rain'];
  var validAccents = ['a', 'b', 'c'];

  // Читаем начальные значения из URL параметров
  var urlParams = new URLSearchParams(window.location.search);
  var initialHero = urlParams.get('hero');
  var initialAccent = urlParams.get('accent');

  var currentHero = validHeroes.indexOf(initialHero) !== -1 ? initialHero : 'storm';
  var currentAccent = validAccents.indexOf(initialAccent) !== -1 ? initialAccent : 'a';

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

    // Обновляем постер
    var posterWebp = document.getElementById('hero-poster-webp');
    var posterImg = document.getElementById('hero-poster-img');
    if (posterWebp) posterWebp.srcset = 'video/' + heroName + '-poster.webp';
    if (posterImg) posterImg.src = 'video/' + heroName + '-poster.webp';

    // Обновляем подпись к видео
    var creditLabel = document.getElementById('hero-credit-label');
    if (creditLabel) {
      creditLabel.textContent = heroName === 'rain' ? 'Дождь по стеклу' : 'Гроза над горизонтом';
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
  if (initialHero && initialHero !== 'storm' && validHeroes.indexOf(initialHero) !== -1) {
    setHero(initialHero, true);
  } else {
    updateHeroButtons(currentHero);
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

  function initVideoPlayback() {
    if (!video) return;
    var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionQuery.matches) return;

    if (navigator.connection && (navigator.connection.saveData || navigator.connection.effectiveType === 'slow-2g' || navigator.connection.effectiveType === '2g' || navigator.connection.effectiveType === '3g')) {
      return;
    }

    // На узких мобильных экранах постер даёт нулевое время LCP и отсутствие лагов
    var isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (isMobile) {
      return;
    }

    var playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(function () {});
    }
  }

  // Запуск фонового видео для десктопа по первому взаимодействию или после стабилизации
  var videoStarted = false;
  function startDesktopVideo() {
    if (videoStarted) return;
    videoStarted = true;
    window.removeEventListener('scroll', startDesktopVideo);
    window.removeEventListener('mousemove', startDesktopVideo);
    window.removeEventListener('touchstart', startDesktopVideo);
    initVideoPlayback();
  }

  window.addEventListener('scroll', startDesktopVideo, { passive: true, once: true });
  window.addEventListener('mousemove', startDesktopVideo, { passive: true, once: true });
  window.addEventListener('touchstart', startDesktopVideo, { passive: true, once: true });
  setTimeout(startDesktopVideo, 6000);

  })();
