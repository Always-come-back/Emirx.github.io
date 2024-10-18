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
      loadingOverlay = document.getElementById('loading-overlay'),
      navigation = document.getElementById('navigation'),
      controls = document.getElementById('controls');

// Dosya yükleme işlemi
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file.type !== 'application/pdf') {
        alert('Lütfen geçerli bir PDF dosyası seçin.');
        return;
    }

    // Yükleme yüzdesi ve dosya boyutunu göster
    fileSizeSpan.textContent = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
    fileSizeMessage.style.display = 'block';

    // Yükleme animasyonu başlat
    loadingOverlay.style.display = 'flex';
    loadingMessage.style.display = 'block';

    const fileReader = new FileReader();
    fileReader.onload = function () {
        const typedarray = new Uint8Array(this.result);
        pdfjsLib.getDocument(typedarray).promise.then(pdf => {
            pdfDoc = pdf;
            document.getElementById('page-count').textContent = pdf.numPages;
            renderPage(pageNum);
            loadingOverlay.style.display = 'none';
            navigation.style.display = 'block';
            controls.style.display = 'block';
        });
    };

    // Yükleme işlemi
    fileReader.onprogress = function (progress) {
        if (progress.lengthComputable) {
            const percent = (progress.loaded / progress.total) * 100;
            progressPercent.textContent = `${percent.toFixed(0)}%`;
            progressMessage.style.display = 'block';
        }
    };

    fileReader.readAsArrayBuffer(file);
});

// Sayfa render işlemi
function renderPage(num) {
    pageIsRendering = true;
    pdfDoc.getPage(num).then(page => {
        const viewport = page.getViewport({ scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };

        page.render(renderContext).promise.then(() => {
            pageIsRendering = false;

            if (pageNumIsPending !== null) {
                renderPage(pageNumIsPending);
                pageNumIsPending = null;
            }
        });
    });

    document.getElementById('page-num').textContent = num;
}

// Önceki ve sonraki sayfa butonları
document.getElementById('prev-page').addEventListener('click', () => {
    if (pageNum <= 1) {
        return;
    }
    pageNum--;
    renderPage(pageNum);
});

document.getElementById('next-page').addEventListener('click', () => {
    if (pageNum >= pdfDoc.numPages) {
        return;
    }
    pageNum++;
    renderPage(pageNum);
});
