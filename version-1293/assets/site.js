(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('open');
        });
    }

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }

        function restart() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(parseInt(dot.getAttribute('data-hero-dot'), 10) || 0);
                restart();
            });
        });

        show(0);
        restart();
    });

    function normalize(text) {
        return (text || '').toString().trim().toLowerCase();
    }

    function readQuery() {
        try {
            return new URLSearchParams(window.location.search).get('search') || '';
        } catch (error) {
            return '';
        }
    }

    function applyCardFilters() {
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
        var searchInput = document.querySelector('[data-page-search]');
        var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
        var emptyState = document.querySelector('[data-empty-state]');
        var activeFilter = 'all';

        if (!cards.length) {
            return;
        }

        function run() {
            var keyword = normalize(searchInput ? searchInput.value : '');
            var visible = 0;

            cards.forEach(function (card) {
                var blob = normalize(card.getAttribute('data-search'));
                var category = card.getAttribute('data-category') || '';
                var matchKeyword = !keyword || blob.indexOf(keyword) !== -1;
                var matchFilter = activeFilter === 'all' || category === activeFilter;
                var shouldShow = matchKeyword && matchFilter;
                card.style.display = shouldShow ? '' : 'none';
                if (shouldShow) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.style.display = visible ? 'none' : 'block';
            }
        }

        if (searchInput) {
            var query = readQuery();
            if (query) {
                searchInput.value = query;
            }
            searchInput.addEventListener('input', run);
        }

        filterButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                activeFilter = button.getAttribute('data-filter') || 'all';
                filterButtons.forEach(function (item) {
                    item.classList.toggle('active', item === button);
                });
                run();
            });
        });

        run();
    }

    function enhanceSearchForms() {
        document.querySelectorAll('[data-search-form]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                var input = form.querySelector('input[name="search"]');
                var value = input ? input.value.trim() : '';
                if (!value) {
                    event.preventDefault();
                    return;
                }
                if (document.querySelector('[data-page-search]')) {
                    event.preventDefault();
                    var pageInput = document.querySelector('[data-page-search]');
                    pageInput.value = value;
                    pageInput.dispatchEvent(new Event('input'));
                    pageInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            });
        });
    }

    function initPlayers() {
        document.querySelectorAll('[data-player]').forEach(function (box) {
            var video = box.querySelector('video');
            var overlay = box.querySelector('.player-overlay');
            var url = box.getAttribute('data-video');
            var ready = false;
            var hls = null;

            function load() {
                if (ready || !video || !url) {
                    return;
                }
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = url;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(url);
                    hls.attachMedia(video);
                } else {
                    video.src = url;
                }
                ready = true;
            }

            function play() {
                load();
                box.classList.add('is-playing');
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {
                        box.classList.remove('is-playing');
                    });
                }
            }

            if (overlay) {
                overlay.addEventListener('click', play);
            }

            box.addEventListener('click', function (event) {
                if (event.target === box) {
                    play();
                }
            });

            video.addEventListener('play', function () {
                box.classList.add('is-playing');
            });

            video.addEventListener('ended', function () {
                box.classList.remove('is-playing');
            });

            window.addEventListener('beforeunload', function () {
                if (hls && typeof hls.destroy === 'function') {
                    hls.destroy();
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        enhanceSearchForms();
        applyCardFilters();
        initPlayers();
    });
})();
