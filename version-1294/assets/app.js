(function () {
    function all(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function one(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function initMenu() {
        var toggle = one('.menu-toggle');
        var nav = one('.site-nav');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            var opened = nav.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
        });
    }

    function initHero() {
        var hero = one('.hero');
        if (!hero) {
            return;
        }
        var slides = all('.hero-slide', hero);
        var dots = all('.hero-dot', hero);
        var prev = one('.hero-prev', hero);
        var next = one('.hero-next', hero);
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function normalized(value) {
        return String(value || '').trim().toLowerCase();
    }

    function initFilters() {
        var panels = all('.filter-panel');
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        panels.forEach(function (panel) {
            var targetId = panel.getAttribute('data-target');
            var scope = targetId ? document.getElementById(targetId) : document;
            var cards = all('.filter-card', scope || document);
            var search = one('.filter-search', panel);
            var genre = one('.filter-genre', panel);
            var type = one('.filter-type', panel);
            var year = one('.filter-year', panel);

            if (query && search) {
                search.value = query;
            }

            function apply() {
                var keyword = normalized(search && search.value);
                var genreValue = normalized(genre && genre.value);
                var typeValue = normalized(type && type.value);
                var yearValue = normalized(year && year.value);

                cards.forEach(function (card) {
                    var text = normalized(card.getAttribute('data-search') + ' ' + card.textContent);
                    var cardGenre = normalized(card.getAttribute('data-genre'));
                    var cardType = normalized(card.getAttribute('data-type'));
                    var cardYear = normalized(card.getAttribute('data-year'));
                    var visible = true;

                    if (keyword && text.indexOf(keyword) === -1) {
                        visible = false;
                    }
                    if (genreValue && cardGenre.indexOf(genreValue) === -1) {
                        visible = false;
                    }
                    if (typeValue && cardType !== typeValue) {
                        visible = false;
                    }
                    if (yearValue && cardYear !== yearValue) {
                        visible = false;
                    }
                    card.classList.toggle('is-hidden', !visible);
                });
            }

            [search, genre, type, year].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });
            panel.addEventListener('submit', function (event) {
                event.preventDefault();
                apply();
            });
            apply();
        });
    }

    function initGlobalSearch() {
        all('.global-search-form').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                var input = one('input[name="q"]', form);
                var value = input ? input.value.trim() : '';
                if (!value) {
                    return;
                }
                if (!/index\.html$|\/$/.test(window.location.pathname)) {
                    event.preventDefault();
                    window.location.href = 'index.html?q=' + encodeURIComponent(value) + '#all-movies';
                }
            });
        });
    }

    window.initMoviePlayer = function (sourceUrl) {
        var video = document.getElementById('movie-video');
        var trigger = document.querySelector('[data-player-trigger]');
        if (!video || !sourceUrl) {
            return;
        }

        var ready = false;
        var hls = null;

        function bindSource() {
            if (ready) {
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = sourceUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(sourceUrl);
                hls.attachMedia(video);
            } else {
                video.src = sourceUrl;
            }
            ready = true;
        }

        function play() {
            bindSource();
            if (trigger) {
                trigger.classList.add('is-hidden');
            }
            video.controls = true;
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        }

        bindSource();

        if (trigger) {
            trigger.addEventListener('click', play);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener('play', function () {
            if (trigger) {
                trigger.classList.add('is-hidden');
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hls && typeof hls.destroy === 'function') {
                hls.destroy();
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initHero();
        initFilters();
        initGlobalSearch();
    });
}());
