let pdfDoc = null,
    pageNum = 1,
    pageIsRendering = false,
    pageNumIsPending = null;

const scale = 1.5,
    canvas = document.querySelector('#pdf-render'),
    ctx = canvas.getContext('2d');

// PDF Yükleme
const url = 'senin-pdf-dosyan.pdf';

// Sayfa Render Et
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

// Sonraki Sayfa
const nextPage = () => {
    if (pageNum >= pdfDoc.numPages) {
        return;
    }
    pageNum++;
    renderPage(pageNum);
};

// Önceki Sayfa
const prevPage = () => {
    if (pageNum <= 1) {
        return;
    }
    pageNum--;
    renderPage(pageNum);
};

// PDF'yi yükle
pdfjsLib.getDocument(url).promise.then(pdfDoc_ => {
    pdfDoc = pdfDoc_;
    document.querySelector('#page-count').textContent = pdfDoc.numPages;
    renderPage(pageNum);
});

// Olaylar
document.querySelector('#next-page').addEventListener('click', nextPage);
document.querySelector('#prev-page').addEventListener('click', prevPage);

// Çizim İşlemleri
let isDrawing = false;
let x = 0;
let y = 0;

const canvasElement = document.querySelector('#pdf-render');
const context = canvasElement.getContext('2d');

canvasElement.addEventListener('mousedown', (e) => {
    x = e.offsetX;
    y = e.offsetY;
    isDrawing = true;
});

canvasElement.addEventListener('mousemove', (e) => {
    if (isDrawing === true) {
        drawLine(context, x, y, e.offsetX, e.offsetY);
        x = e.offsetX;
        y = e.offsetY;
    }
});

window.addEventListener('mouseup', () => {
    if (isDrawing === true) {
        isDrawing = false;
    }
});

function drawLine(context, x1, y1, x2, y2) {
    context.beginPath();
    context.strokeStyle = 'black';
    context.lineWidth = 2;
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
    context.closePath();
}

document.querySelector('#pen').addEventListener('click', () => {
    context.strokeStyle = 'black';
});

document.querySelector('#eraser').addEventListener('click', () => {
    context.strokeStyle = 'white';
    context.lineWidth = 10;
});

document.querySelector('#clear-all').addEventListener('click', () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
});
