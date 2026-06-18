(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[type='search']");
        var query = input ? input.value.trim() : "";
        var target = "./search.html";
        if (query) {
          target += "?q=" + encodeURIComponent(query);
        }
        window.location.href = target;
      });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (slides.length > 1) {
      var active = 0;
      var timer;
      var showSlide = function (index) {
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === active);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === active);
        });
      };
      var start = function () {
        timer = window.setInterval(function () {
          showSlide(active + 1);
        }, 5200);
      };
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          window.clearInterval(timer);
          showSlide(i);
          start();
        });
      });
      showSlide(0);
      start();
    }

    var localInput = document.querySelector("[data-local-filter]");
    var typeSelect = document.querySelector("[data-type-filter]");
    var regionSelect = document.querySelector("[data-region-filter]");
    var localCards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    if (localCards.length && (localInput || typeSelect || regionSelect)) {
      var applyLocalFilter = function () {
        var text = localInput ? localInput.value.trim().toLowerCase() : "";
        var type = typeSelect ? typeSelect.value : "";
        var region = regionSelect ? regionSelect.value : "";
        localCards.forEach(function (card) {
          var hay = (card.getAttribute("data-title") + " " + card.getAttribute("data-genre") + " " + card.getAttribute("data-tags")).toLowerCase();
          var matchText = !text || hay.indexOf(text) !== -1;
          var matchType = !type || card.getAttribute("data-type") === type;
          var matchRegion = !region || card.getAttribute("data-region") === region;
          card.classList.toggle("hidden-card", !(matchText && matchType && matchRegion));
        });
      };
      [localInput, typeSelect, regionSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applyLocalFilter);
          control.addEventListener("change", applyLocalFilter);
        }
      });
      applyLocalFilter();
    }

    var searchGrid = document.querySelector("[data-search-results]");
    var searchInput = document.querySelector("[data-search-input]");
    var empty = document.querySelector("[data-search-empty]");
    if (searchGrid && searchInput && typeof MOVIE_SEARCH_DATA !== "undefined") {
      var params = new URLSearchParams(window.location.search);
      searchInput.value = params.get("q") || "";
      var render = function () {
        var query = searchInput.value.trim().toLowerCase();
        var list = MOVIE_SEARCH_DATA.filter(function (movie) {
          var hay = (movie.title + " " + movie.genre + " " + movie.tags + " " + movie.region + " " + movie.type).toLowerCase();
          return !query || hay.indexOf(query) !== -1;
        }).slice(0, 120);
        searchGrid.innerHTML = list.map(function (movie) {
          return [
            '<article class="movie-card">',
            '<a class="movie-poster" href="' + movie.href + '">',
            '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '<span class="poster-badge">' + escapeHtml(movie.type) + '</span>',
            '<span class="rating-badge">' + escapeHtml(movie.rating) + '</span>',
            '</a>',
            '<div class="movie-card-body">',
            '<div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span></div>',
            '<h3><a href="' + movie.href + '">' + escapeHtml(movie.title) + '</a></h3>',
            '<p>' + escapeHtml(movie.oneLine) + '</p>',
            '<div class="tag-row"><span class="tag">' + escapeHtml(movie.category) + '</span><span class="tag">' + escapeHtml(movie.genre) + '</span></div>',
            '</div>',
            '</article>'
          ].join("");
        }).join("");
        if (empty) {
          empty.style.display = list.length ? "none" : "block";
        }
      };
      searchInput.addEventListener("input", render);
      render();
    }
  });

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;"
      }[char];
    });
  }
})();

function setupMoviePlayer(streamUrl) {
  var video = document.querySelector("[data-movie-player]");
  var overlay = document.querySelector("[data-player-overlay]");
  if (!video || !streamUrl) {
    return;
  }

  var hlsInstance = null;
  var prepared = false;
  var requested = false;

  function prepare() {
    if (prepared) {
      return;
    }
    prepared = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      return;
    }
    if (typeof Hls !== "undefined" && Hls.isSupported()) {
      hlsInstance = new Hls({ enableWorker: true, lowLatencyMode: true });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
      hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
        if (requested) {
          video.play().catch(function () {});
        }
      });
    }
  }

  function startPlayback() {
    requested = true;
    prepare();
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    video.play().catch(function () {});
  }

  if (overlay) {
    overlay.addEventListener("click", startPlayback);
  }
  video.addEventListener("click", function () {
    if (video.paused) {
      startPlayback();
    }
  });
  video.addEventListener("play", function () {
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
  });
  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
