(function () {
    const toggle = document.querySelector("[data-menu-toggle]");
    const panel = document.querySelector("[data-mobile-panel]");

    if (toggle && panel) {
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", panel.classList.contains("is-open") ? "true" : "false");
        });
    }

    const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
    const prev = document.querySelector("[data-hero-prev]");
    const next = document.querySelector("[data-hero-next]");
    let heroIndex = 0;
    let timer = null;

    function showHero(index) {
        if (!slides.length) {
            return;
        }

        heroIndex = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === heroIndex);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("is-active", dotIndex === heroIndex);
        });
    }

    function startHero() {
        if (slides.length < 2) {
            return;
        }

        timer = window.setInterval(function () {
            showHero(heroIndex + 1);
        }, 5000);
    }

    if (slides.length) {
        showHero(0);
        startHero();

        if (prev) {
            prev.addEventListener("click", function () {
                window.clearInterval(timer);
                showHero(heroIndex - 1);
                startHero();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                window.clearInterval(timer);
                showHero(heroIndex + 1);
                startHero();
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                window.clearInterval(timer);
                showHero(dotIndex);
                startHero();
            });
        });
    }

    const filterRoot = document.querySelector("[data-filter-root]");

    if (filterRoot) {
        const queryInput = filterRoot.querySelector("[data-filter-query]");
        const yearSelect = filterRoot.querySelector("[data-filter-year]");
        const typeSelect = filterRoot.querySelector("[data-filter-type]");
        const categorySelect = filterRoot.querySelector("[data-filter-category]");
        const cards = Array.from(filterRoot.querySelectorAll(".movie-card"));
        const empty = filterRoot.querySelector("[data-empty]");

        const params = new URLSearchParams(window.location.search);
        const queryFromUrl = params.get("q");

        if (queryInput && queryFromUrl) {
            queryInput.value = queryFromUrl;
        }

        function matches(card) {
            const q = queryInput ? queryInput.value.trim().toLowerCase() : "";
            const year = yearSelect ? yearSelect.value : "";
            const type = typeSelect ? typeSelect.value : "";
            const category = categorySelect ? categorySelect.value : "";
            const haystack = [
                card.dataset.title || "",
                card.dataset.tags || "",
                card.dataset.genre || "",
                card.dataset.region || "",
                card.dataset.type || "",
                card.dataset.year || ""
            ].join(" ").toLowerCase();

            if (q && !haystack.includes(q)) {
                return false;
            }

            if (year && card.dataset.year !== year) {
                return false;
            }

            if (type && card.dataset.type !== type) {
                return false;
            }

            if (category && card.dataset.category !== category) {
                return false;
            }

            return true;
        }

        function applyFilters() {
            let visible = 0;

            cards.forEach(function (card) {
                const ok = matches(card);
                card.style.display = ok ? "" : "none";

                if (ok) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        [queryInput, yearSelect, typeSelect, categorySelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilters);
                control.addEventListener("change", applyFilters);
            }
        });

        applyFilters();
    }
})();
