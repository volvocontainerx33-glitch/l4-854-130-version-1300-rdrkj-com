(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function initMobileNav() {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var nav = document.querySelector("[data-main-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
        nav.addEventListener("click", function (event) {
            if (event.target.tagName === "A") {
                nav.classList.remove("is-open");
            }
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }

        hero.addEventListener("mouseenter", function () {
            if (timer) {
                window.clearInterval(timer);
            }
        });

        hero.addEventListener("mouseleave", restart);
        show(0);
        restart();
    }

    function initSiteSearch() {
        document.querySelectorAll("[data-site-search]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                var value = input ? input.value.trim() : "";
                if (!value) {
                    return;
                }
                event.preventDefault();
                window.location.href = "./search.html?q=" + encodeURIComponent(value);
            });
        });
    }

    function initFilters() {
        document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
            var search = scope.querySelector("[data-filter-search]");
            var region = scope.querySelector("[data-filter-region]");
            var type = scope.querySelector("[data-filter-type]");
            var year = scope.querySelector("[data-filter-year]");
            var category = scope.querySelector("[data-filter-category]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
            var empty = scope.querySelector("[data-empty-state]");

            function apply() {
                var q = normalize(search && search.value);
                var regionValue = normalize(region && region.value);
                var typeValue = normalize(type && type.value);
                var yearValue = normalize(year && year.value);
                var categoryValue = normalize(category && category.value);
                var visible = 0;

                cards.forEach(function (card) {
                    var text = normalize([
                        card.dataset.title,
                        card.dataset.region,
                        card.dataset.type,
                        card.dataset.year,
                        card.dataset.genre,
                        card.dataset.tags
                    ].join(" "));
                    var matched = true;
                    if (q && text.indexOf(q) === -1) {
                        matched = false;
                    }
                    if (regionValue && normalize(card.dataset.region) !== regionValue) {
                        matched = false;
                    }
                    if (typeValue && normalize(card.dataset.type) !== typeValue) {
                        matched = false;
                    }
                    if (yearValue && normalize(card.dataset.year) !== yearValue) {
                        matched = false;
                    }
                    if (categoryValue && normalize(card.dataset.category) !== categoryValue) {
                        matched = false;
                    }
                    card.hidden = !matched;
                    if (matched) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            [search, region, type, year, category].forEach(function (node) {
                if (!node) {
                    return;
                }
                node.addEventListener("input", apply);
                node.addEventListener("change", apply);
            });

            if (scope.hasAttribute("data-search-page")) {
                var params = new URLSearchParams(window.location.search);
                var initial = params.get("q") || "";
                if (initial && search) {
                    search.value = initial;
                }
            }

            apply();
        });
    }

    function initPlayers() {
        document.querySelectorAll("[data-player]").forEach(function (player) {
            var video = player.querySelector("video");
            var layer = player.querySelector("[data-play-layer]");
            var errorBox = player.querySelector("[data-player-error]");
            var stream = player.dataset.stream;
            var loaded = false;
            var hls = null;

            function showError() {
                if (!errorBox) {
                    return;
                }
                errorBox.textContent = "暂时无法播放，请稍后再试";
                errorBox.classList.add("is-visible");
            }

            function attach() {
                if (loaded || !video || !stream) {
                    return;
                }
                loaded = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: false
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            showError();
                        }
                    });
                } else {
                    video.src = stream;
                }
            }

            function play() {
                attach();
                player.classList.add("is-playing");
                if (video) {
                    video.controls = true;
                    var promise = video.play();
                    if (promise && promise.catch) {
                        promise.catch(function () {});
                    }
                }
            }

            if (layer) {
                layer.addEventListener("click", function (event) {
                    event.preventDefault();
                    play();
                });
            }

            player.addEventListener("click", function (event) {
                if (player.classList.contains("is-playing")) {
                    return;
                }
                if (event.target.closest("a")) {
                    return;
                }
                play();
            });

            if (video) {
                video.addEventListener("error", showError);
            }
        });
    }

    ready(function () {
        initMobileNav();
        initHero();
        initSiteSearch();
        initFilters();
        initPlayers();
    });
})();
