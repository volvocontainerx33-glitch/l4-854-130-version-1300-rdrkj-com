(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function initMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (slides.length <= 1) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                var active = dotIndex === current;
                dot.classList.toggle("is-active", active);
                dot.setAttribute("aria-pressed", active ? "true" : "false");
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        start();
    }

    function initListingTools() {
        var grid = document.querySelector("[data-card-grid]");
        if (!grid) {
            return;
        }
        var input = document.querySelector("[data-page-filter]");
        var select = document.querySelector("[data-page-sort]");
        var original = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));

        function normalize(value) {
            return String(value || "").toLowerCase();
        }

        function applyFilter() {
            var query = normalize(input ? input.value : "");
            original.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-tags")
                ].join(" "));
                card.classList.toggle("is-hidden", query && haystack.indexOf(query) === -1);
            });
        }

        function applySort() {
            var mode = select ? select.value : "default";
            var sorted = original.slice();
            if (mode === "rating") {
                sorted.sort(function (a, b) {
                    return Number(b.getAttribute("data-rating")) - Number(a.getAttribute("data-rating"));
                });
            }
            if (mode === "views") {
                sorted.sort(function (a, b) {
                    return Number(b.getAttribute("data-views")) - Number(a.getAttribute("data-views"));
                });
            }
            if (mode === "year") {
                sorted.sort(function (a, b) {
                    return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
                });
            }
            sorted.forEach(function (card) {
                grid.appendChild(card);
            });
            applyFilter();
        }

        if (input) {
            input.addEventListener("input", applyFilter);
        }
        if (select) {
            select.addEventListener("change", applySort);
        }
    }

    function initSearchPage() {
        var form = document.querySelector("[data-search-form]");
        var input = document.querySelector("[data-search-input]");
        var results = document.querySelector("[data-search-results]");
        if (!form || !input || !results || !window.MOVIE_INDEX) {
            return;
        }

        function text(value) {
            return String(value || "").replace(/[&<>"]/g, function (char) {
                return {
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    "\"": "&quot;"
                }[char];
            });
        }

        function card(movie) {
            return [
                '<article class="movie-card">',
                '<a href="' + text(movie.href) + '" class="poster-link" aria-label="观看' + text(movie.title) + '">',
                '<img src="' + text(movie.image) + '" alt="' + text(movie.title) + '" loading="lazy">',
                '<span class="badge badge-hot">' + text(movie.category) + '</span>',
                '<span class="duration">' + text(movie.duration) + '</span>',
                '</a>',
                '<div class="card-body">',
                '<h3><a href="' + text(movie.href) + '">' + text(movie.title) + '</a></h3>',
                '<p>' + text(movie.description || movie.genre || movie.title) + '</p>',
                '<div class="card-meta">',
                '<span>★ ' + text(movie.rating) + '</span>',
                '<span>' + text(movie.year) + '</span>',
                '<span>' + text(movie.region) + '</span>',
                '</div>',
                '</div>',
                '</article>'
            ].join("");
        }

        function run(query) {
            var q = String(query || "").trim().toLowerCase();
            input.value = query || "";
            if (!q) {
                results.innerHTML = '<div class="empty-state">请输入关键词开始搜索</div>';
                return;
            }
            var words = q.split(/\s+/).filter(Boolean);
            var list = window.MOVIE_INDEX.filter(function (movie) {
                var haystack = [
                    movie.title,
                    movie.description,
                    movie.year,
                    movie.region,
                    movie.type,
                    movie.genre,
                    movie.category,
                    (movie.tags || []).join(" ")
                ].join(" ").toLowerCase();
                return words.every(function (word) {
                    return haystack.indexOf(word) !== -1;
                });
            }).slice(0, 120);
            if (!list.length) {
                results.innerHTML = '<div class="empty-state">没有找到匹配内容</div>';
                return;
            }
            results.innerHTML = list.map(card).join("");
        }

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            var query = input.value.trim();
            var url = new URL(window.location.href);
            url.searchParams.set("q", query);
            window.history.replaceState(null, "", url.toString());
            run(query);
        });

        run(new URLSearchParams(window.location.search).get("q") || "");
    }

    function initPlayer() {
        var panel = document.querySelector("[data-player]");
        if (!panel) {
            return;
        }
        var video = panel.querySelector("video");
        var button = panel.querySelector(".player-overlay");
        var streamUrl = panel.getAttribute("data-stream-url");
        var hlsInstance = null;
        var started = false;

        function playVideo() {
            if (!video) {
                return;
            }
            var result = video.play();
            if (result && typeof result.catch === "function") {
                result.catch(function () {});
            }
        }

        function start() {
            if (started || !streamUrl || !video) {
                playVideo();
                return;
            }
            started = true;
            panel.classList.add("is-playing");
            if (button) {
                button.setAttribute("aria-hidden", "true");
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    playVideo();
                });
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hlsInstance.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hlsInstance.recoverMediaError();
                    } else {
                        hlsInstance.destroy();
                    }
                });
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                video.addEventListener("loadedmetadata", playVideo, { once: true });
                video.load();
                return;
            }
            video.src = streamUrl;
            video.load();
            playVideo();
        }

        if (button) {
            button.addEventListener("click", start);
        }
        video.addEventListener("click", function () {
            if (!started) {
                start();
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initListingTools();
        initSearchPage();
        initPlayer();
    });
})();
