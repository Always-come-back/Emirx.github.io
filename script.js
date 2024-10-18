let pdfDoc = null,
    pageNum = 1,
    pageIsRendering = false,
    pageNumIsPending = null,
    fileInput = document.getElementById('file-input');

const scale = 1.5,
      canvas = document.querySelector('#pdf-render'),
      ctx = canvas.getContext('2d');

// PDF'yi render et
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

        document.querySelector('#page-num').textContent = num;
    });
};

// Dosya seçildiğinde çalışacak işlev
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
        const fileReader = new FileReader();

        fileReader.onload = function() {
            const typedarray = new Uint8Array(this.result);

            // PDF'yi yükle
            pdfjsLib.getDocument(typedarray).promise.then(pdfDoc_ => {
                pdfDoc = pdfDoc_;
                document.querySelector('#page-count').textContent = pdfDoc.numPages;
                renderPage(pageNum);
            });
        };

        fileReader.readAsArrayBuffer(file);
    } else {
        alert('Lütfen bir PDF dosyası seçin.');
    }
});

// Sayfa kontrolleri
document.querySelector('#next-page').addEventListener('click', () => {
    if (pageNum >= pdfDoc.numPages) return;
    pageNum++;
    renderPage(pageNum);
});

document.querySelector('#prev-page').addEventListener('click', () => {
    if (pageNum <= 1) return;
    pageNum--;
    renderPage(pageNum);
});
