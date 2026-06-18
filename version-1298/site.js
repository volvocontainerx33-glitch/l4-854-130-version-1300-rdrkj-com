(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');
  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dots button'));
  var current = 0;
  function showSlide(index) {
    if (!slides.length) return;
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === current);
    });
  }
  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      showSlide(i);
    });
  });
  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5000);
  }

  var localFilter = document.querySelector('[data-local-filter]');
  var filterSelect = document.querySelector('[data-local-select]');
  var cardRoot = document.querySelector('[data-filter-root]');
  function applyLocalFilter() {
    if (!cardRoot) return;
    var term = localFilter ? localFilter.value.trim().toLowerCase() : '';
    var selectValue = filterSelect ? filterSelect.value : '';
    var cards = Array.prototype.slice.call(cardRoot.querySelectorAll('.movie-card'));
    cards.forEach(function (card) {
      var title = card.getAttribute('data-title') || '';
      var genre = card.getAttribute('data-genre') || '';
      var type = card.getAttribute('data-type') || '';
      var year = card.getAttribute('data-year') || '';
      var textMatched = !term || title.indexOf(term) > -1 || genre.indexOf(term) > -1 || type.indexOf(term) > -1;
      var selectMatched = !selectValue || year === selectValue || genre.indexOf(selectValue.toLowerCase()) > -1 || type.indexOf(selectValue.toLowerCase()) > -1;
      card.style.display = textMatched && selectMatched ? '' : 'none';
    });
  }
  if (localFilter) localFilter.addEventListener('input', applyLocalFilter);
  if (filterSelect) filterSelect.addEventListener('change', applyLocalFilter);

  var searchRoot = document.querySelector('[data-search-results]');
  if (searchRoot && typeof MOVIE_INDEX !== 'undefined') {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim().toLowerCase();
    var titleNode = document.querySelector('[data-search-title]');
    if (titleNode && query) titleNode.textContent = '“' + params.get('q') + '”的搜索结果';
    var results = query ? MOVIE_INDEX.filter(function (item) {
      return item.title.toLowerCase().indexOf(query) > -1 ||
        item.summary.toLowerCase().indexOf(query) > -1 ||
        item.genre.toLowerCase().indexOf(query) > -1 ||
        item.region.toLowerCase().indexOf(query) > -1 ||
        item.tags.join(' ').toLowerCase().indexOf(query) > -1;
    }).slice(0, 120) : [];
    if (!query) {
      searchRoot.innerHTML = '<div class="search-empty">请输入关键词搜索影片。</div>';
    } else if (!results.length) {
      searchRoot.innerHTML = '<div class="search-empty">没有找到匹配内容，可以换一个关键词再试。</div>';
    } else {
      searchRoot.innerHTML = results.map(function (item) {
        var tags = item.tags.slice(0, 3).map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join('');
        return '<article class="movie-card" data-title="' + escapeHtml(item.title.toLowerCase()) + '">' +
          '<a href="' + item.url + '" class="poster-wrap" aria-label="观看' + escapeHtml(item.title) + '">' +
          '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
          '<span class="duration">' + escapeHtml(item.duration) + '</span><span class="play-mark">▶</span></a>' +
          '<div class="card-body"><h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>' +
          '<p>' + escapeHtml(item.summary) + '</p><div class="meta-line"><span>' + escapeHtml(item.year || '热映') + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.rating) + '分</span></div>' +
          '<div class="tag-row">' + tags + '</div></div></article>';
      }).join('');
    }
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, function (char) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char];
    });
  }
})();
