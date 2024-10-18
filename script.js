let pdfDoc = null,
    pageNum = 1,
    pageIsRendering = false,
    pageNumIsPending = null;

const scale = 1.5,
      canvas = document.querySelector('#pdf-render'),
      ctx = canvas.getContext('2d'),
      fileInput = document.getElementById('file-input'),
      uploadBtn = document.getElementById('upload-btn'),
      uploadSection = document.getElementById('upload-section'),
      pdfContainer = document.getElementById('pdf-container'),
      navigation = document.getElementById('navigation'),
      loadingMessage = document.getElementById('loading-message');

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

// PDF dosyasını yükle
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
        loadingMessage.style.display = 'block';  // "Yükleniyor..." göster
        const fileReader = new FileReader();

        fileReader.onload = function() {
            const typedarray = new Uint8Array(this.result);

            pdfjsLib.getDocument(typedarray).promise.then(pdfDoc_ => {
                pdfDoc = pdfDoc_;
                document.getElementById('page-count').textContent = pdfDoc.numPages;
                renderPage(pageNum);

                loadingMessage.style.display = 'none'; // "Yükleniyor..." gizle
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
