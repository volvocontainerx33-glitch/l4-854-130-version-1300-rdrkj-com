(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var button = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      var open = panel.classList.toggle('is-open');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function setupHero() {
    var slides = selectAll('.hero-slide');
    var dots = selectAll('.hero-dot');
    if (!slides.length || !dots.length) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      slides[index].classList.remove('is-active');
      dots[index].classList.remove('is-active');
      index = next;
      slides[index].classList.add('is-active');
      dots[index].classList.add('is-active');
    }
    function start() {
      timer = window.setInterval(function () {
        show((index + 1) % slides.length);
      }, 5200);
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        if (timer) {
          window.clearInterval(timer);
        }
        show(dotIndex);
        start();
      });
    });
    start();
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function setupPageFilters() {
    selectAll('.page-filter').forEach(function (input) {
      var section = input.closest('.content-section');
      var cards = selectAll('.movie-card', section);
      input.addEventListener('input', function () {
        var keyword = normalize(input.value);
        cards.forEach(function (card) {
          var matched = !keyword || normalize(card.getAttribute('data-search')).indexOf(keyword) !== -1;
          card.classList.toggle('is-filter-hidden', !matched);
        });
      });
    });
  }

  function setupSearchPage() {
    var input = document.getElementById('search-input');
    var select = document.getElementById('category-select');
    var clear = document.getElementById('clear-search');
    var cards = selectAll('.search-results .movie-card');
    if (!input || !select || !cards.length) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    input.value = initial;
    function apply() {
      var keyword = normalize(input.value);
      var category = normalize(select.value);
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search'));
        var inCategory = !category || text.indexOf(category) !== -1;
        var inSearch = !keyword || text.indexOf(keyword) !== -1;
        card.classList.toggle('is-filter-hidden', !(inCategory && inSearch));
      });
    }
    input.addEventListener('input', apply);
    select.addEventListener('change', apply);
    if (clear) {
      clear.addEventListener('click', function () {
        input.value = '';
        select.value = '';
        apply();
      });
    }
    apply();
  }

  function setupForms() {
    selectAll('form[action="./search.html"]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input || !input.value.trim()) {
          event.preventDefault();
          window.location.href = './search.html';
        }
      });
    });
  }

  window.initPlayer = function (streamUrl) {
    var video = document.getElementById('movie-video');
    var cover = document.querySelector('.video-cover');
    if (!video || !streamUrl) {
      return;
    }
    var attached = false;
    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }
    function play() {
      attach();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }
    if (cover) {
      cover.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupPageFilters();
    setupSearchPage();
    setupForms();
  });
})();
