(function () {
    function selectAll(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function initMobileMenu() {
        var button = document.querySelector('.mobile-menu-button');
        var panel = document.querySelector('.mobile-panel');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            panel.classList.toggle('open');
        });
    }

    function initHero() {
        var slides = selectAll('.hero-slide');
        if (!slides.length) {
            return;
        }
        var dots = selectAll('.hero-dot');
        var prev = document.querySelector('.hero-prev');
        var next = document.querySelector('.hero-next');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                start();
            });
        });
        start();
    }

    function normalize(text) {
        return String(text || '').toLowerCase().trim();
    }

    function initFilters() {
        var list = document.querySelector('.searchable-list');
        if (!list) {
            return;
        }
        var cards = selectAll('.movie-card', list);
        var input = document.querySelector('.local-search');
        var sort = document.querySelector('.local-sort');
        var chips = selectAll('.filter-chip');
        var activeFilter = '';

        function apply() {
            var query = normalize(input ? input.value : '');
            cards.forEach(function (card) {
                var text = normalize(card.getAttribute('data-search'));
                var matchQuery = !query || text.indexOf(query) >= 0;
                var filterText = normalize(activeFilter);
                var matchFilter = !filterText || text.indexOf(filterText) >= 0;
                card.classList.toggle('is-hidden', !(matchQuery && matchFilter));
            });
        }

        function sortCards(mode) {
            var sorted = cards.slice();
            sorted.sort(function (a, b) {
                if (mode === 'year-desc') {
                    return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
                }
                if (mode === 'year-asc') {
                    return Number(a.getAttribute('data-year')) - Number(b.getAttribute('data-year'));
                }
                if (mode === 'title') {
                    return String(a.getAttribute('data-title')).localeCompare(String(b.getAttribute('data-title')), 'zh-Hans-CN');
                }
                return 0;
            });
            sorted.forEach(function (card) {
                list.appendChild(card);
            });
        }

        if (input) {
            var params = new URLSearchParams(window.location.search);
            var q = params.get('q');
            if (q) {
                input.value = q;
            }
            input.addEventListener('input', apply);
        }
        if (sort) {
            sort.addEventListener('change', function () {
                sortCards(sort.value);
                apply();
            });
        }
        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                chips.forEach(function (item) {
                    item.classList.remove('active');
                });
                chip.classList.add('active');
                activeFilter = chip.getAttribute('data-filter') || '';
                apply();
            });
        });
        apply();
    }

    initMobileMenu();
    initHero();
    initFilters();
})();
