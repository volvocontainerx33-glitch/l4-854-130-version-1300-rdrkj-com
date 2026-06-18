function initializePlayer(id, source, poster) {
  var video = document.getElementById(id);
  if (!video) return;
  var shell = video.closest('.player-shell');
  var cover = shell ? shell.querySelector('.player-cover') : null;
  var started = false;
  function start() {
    if (!started) {
      started = true;
      if (poster) video.setAttribute('poster', poster);
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (typeof Hls !== 'undefined' && Hls.isSupported()) {
        var hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }
    if (cover) cover.classList.add('hidden');
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }
  if (cover) cover.addEventListener('click', start);
  video.addEventListener('click', function () {
    if (video.paused) start();
  });
}
