(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var opened = mobilePanel.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var prev = document.querySelector('.hero-prev');
  var next = document.querySelector('.hero-next');
  var hero = document.querySelector('.hero-carousel');
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === current);
    });
  }

  function startHero() {
    if (timer || slides.length < 2) {
      return;
    }
    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  function stopHero() {
    if (!timer) {
      return;
    }
    window.clearInterval(timer);
    timer = null;
  }

  if (slides.length) {
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
      });
    }

    if (hero) {
      hero.addEventListener('mouseenter', stopHero);
      hero.addEventListener('mouseleave', startHero);
    }

    startHero();
  }

  var filterInputs = Array.prototype.slice.call(document.querySelectorAll('.card-filter-input'));

  function filterCards(value) {
    var query = String(value || '').trim().toLowerCase();
    var cards = Array.prototype.slice.call(document.querySelectorAll('.filterable-grid .movie-card'));
    var visible = 0;
    var grid = document.querySelector('.filterable-grid');
    var empty = document.querySelector('.no-results');

    cards.forEach(function (card) {
      var source = card.getAttribute('data-search') || card.textContent || '';
      var matched = !query || source.toLowerCase().indexOf(query) !== -1;
      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });

    if (grid) {
      if (!empty) {
        empty = document.createElement('div');
        empty.className = 'no-results';
        empty.textContent = '没有找到匹配影片';
        grid.appendChild(empty);
      }
      empty.style.display = visible === 0 ? '' : 'none';
    }
  }

  filterInputs.forEach(function (input) {
    input.addEventListener('input', function () {
      filterCards(input.value);
    });
  });

  var params = new URLSearchParams(window.location.search);
  var q = params.get('q');
  if (q && filterInputs.length) {
    filterInputs.forEach(function (input) {
      input.value = q;
    });
    filterCards(q);
  }
})();

function setupPlayer(playerId, streamUrl) {
  var shell = document.getElementById(playerId);
  if (!shell) {
    return;
  }

  var video = shell.querySelector('video');
  var button = shell.querySelector('.player-start');
  var hlsInstance = null;
  var prepared = false;

  if (!video || !button) {
    return;
  }

  function prepare() {
    if (prepared) {
      return;
    }

    prepared = true;
    video.controls = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
  }

  function play() {
    prepare();
    shell.classList.add('is-playing');
    var result = video.play();
    if (result && typeof result.catch === 'function') {
      result.catch(function () {});
    }
  }

  button.addEventListener('click', play);
  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
