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
      navigation = document.getElementById('navigation');

// Sayfayı render et
const renderPage = num => {
    pageIsRendering = true;

    pdfDoc.getPage(num).then(page => {
        const viewport = page.getViewport({ scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderCtx = {
            canvasContext: ctx,
            viewport
        };

        page.render(renderCtx).promise.then(() => {
            pageIsRendering = false;

            if (pageNumIsPending !== null) {
                renderPage(pageNumIsPending);
                pageNumIsPending = null;
            }
        });

        document.getElementById('page-num').textContent = num;
    });
};

// Dosya seçildiğinde yükleme işlemini başlat
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
        // Dosya boyutunu göster
        fileSizeSpan.textContent = (file.size / 1024 / 1024).toFixed(2) + ' MB';
        fileSizeMessage.style.display = 'block';

        // Yükleniyor mesajını göster
        loadingMessage.style.display = 'block';
        progressMessage.style.display = 'block';

        const fileReader = new FileReader();

        fileReader.onprogress = function(event) {
            if (event.lengthComputable) {
                const percentLoaded = Math.round((event.loaded / event.total) * 100);
                progressPercent.textContent = percentLoaded + '%';
            }
        };

        fileReader.onload = function() {
            const typedarray = new Uint8Array(this.result);

            pdfjsLib.getDocument(typedarray).promise.then(pdfDoc_ => {
                pdfDoc = pdfDoc_;
                document.getElementById('page-count').textContent = pdfDoc.numPages;
                renderPage(pageNum);

                // Yükleme işlemi tamamlandı
                loadingMessage.style.display = 'none';
                progressMessage.style.display = 'none';
                pdfContainer.style.display = 'block';
                navigation.style.display = 'flex';
            });
        };

        fileReader.readAsArrayBuffer(file);
    } else {
        alert('Lütfen bir PDF dosyası seçin.');
    }
});

// Butona tıklandığında dosya seçme açılır
uploadBtn.addEventListener('click', () => {
    fileInput.click();
});

// Sayfa kontrolleri
document.getElementById('next-page').addEventListener('click', () => {
    if (pageNum >= pdfDoc.numPages) return;
    pageNum++;
    renderPage(pageNum);
});

document.getElementById('prev-page').addEventListener('click', () => {
    if (pageNum <= 1) return;
    pageNum--;
    renderPage(pageNum);
});

// Tam ekran modu
document.getElementById('fullscreen-btn').addEventListener('click', () => {
    if (pdfContainer.requestFullscreen) {
        pdfContainer.requestFullscreen();
    } else if (pdfContainer.mozRequestFullScreen) {
        pdfContainer.mozRequestFullScreen(); // Firefox
    } else if (pdfContainer.webkitRequestFullscreen) {
        pdfContainer.webkitRequestFullscreen(); // Chrome, Safari, Opera
    } else if (pdfContainer.msRequestFullscreen) {
        pdfContainer.msRequestFullscreen(); // IE/Edge
    }
});
