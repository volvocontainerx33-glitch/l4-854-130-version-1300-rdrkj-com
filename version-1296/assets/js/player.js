(function () {
    window.setupPlayer = function (videoSource) {
        var video = document.getElementById('movieVideo');
        var overlay = document.getElementById('videoOverlay');
        var loaded = false;
        var hls = null;

        function bindSource() {
            if (loaded || !videoSource || !video) {
                return;
            }
            loaded = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = videoSource;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(videoSource);
                hls.attachMedia(video);
            } else {
                video.src = videoSource;
            }
        }

        function begin() {
            bindSource();
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            var playTask = video.play();
            if (playTask && typeof playTask.catch === 'function') {
                playTask.catch(function () {});
            }
        }

        if (!video) {
            return;
        }
        if (overlay) {
            overlay.addEventListener('click', begin);
        }
        video.addEventListener('click', function () {
            if (!loaded) {
                begin();
            }
        });
        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    };
})();
