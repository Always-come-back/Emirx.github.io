let pdfDoc = null,
    pageNum = 1,
    pageIsRendering = false,
    pageNumIsPending = null;

const scale = 1.5,
      canvas = document.querySelector('#pdf-render'),
      ctx = canvas.getContext('2d'),
      fileInput = document.getElementById('file-input'),
      uploadBtn = document.getElementById('upload-btn'),
      loadingMessage = document.getElementById('loading-message'),
      progressMessage = document.getElementById('progress-message'),
      progressPercent = document.getElementById('progress-percent'),
      fileSizeMessage = document.getElementById('file-size-message'),
      fileSizeSpan = document.getElementById('file-size'),
      pdfContainer = document.getElementById('pdf-container'),
      fullscreenBtn = document.getElementById('fullscreen-btn'),
      exitFullscreenBtn = document.getElementById('exit-fullscreen-btn'),
      navigation = document.getElementById('navigation');

// Tam ekran modunu kontrol et
fullscreenBtn.addEventListener('click', () => {
    if (pdfContainer.requestFullscreen) {
        pdfContainer.requestFullscreen();
        fullscreenBtn.style.display = 'none';
        exitFullscreenBtn.style.display = 'block';
    } else if (pdfContainer.webkitRequestFullscreen) {
        pdfContainer.webkitRequestFullscreen(); // Safari
        fullscreenBtn.style.display = 'none';
        exitFullscreenBtn.style.display = 'block';
    }
});

exitFullscreenBtn.addEventListener('click', () => {
    if (document.exitFullscreen) {
        document.exitFullscreen();
        exitFullscreenBtn.style.display = 'none';
        fullscreenBtn.style.display = 'block';
    }
});

document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
        exitFullscreenBtn.style.display = 'none';
        fullscreenBtn.style.display = 'block';
    }
});

// Diğer özellikler...
