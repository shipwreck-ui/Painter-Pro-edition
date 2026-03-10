// ============================================
// canvas-core.js - ЯДРО РИСОВАНИЯ
// ============================================

const CanvasCore = (function() {
    // Приватные переменные
    let canvas, ctx;
    let width = 800, height = 500;
    
    // Состояние рисования
    let drawing = false;
    let startX, startY, lastX, lastY;
    let currentTool = 'brush';
    let currentShape = null;
    let currentColor = '#000000';
    let currentSize = 5;
    
    // История
    let history = [];
    let historyIndex = -1;
    
    // Инициализация
    function init(canvasElement) {
        canvas = canvasElement;
        ctx = canvas.getContext('2d');
        
        canvas.width = width;
        canvas.height = height;
        
        // Белый фон
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        
        saveState();
        
        return {
            startDrawing: startDrawing,
            draw: draw,
            stopDrawing: stopDrawing,
            setTool: (tool) => currentTool = tool,
            setShape: (shape) => currentShape = shape,
            setColor: (color) => currentColor = color,
            setSize: (size) => currentSize = size,
            getContext: () => ctx,
            getCanvas: () => canvas,
            clear: clearCanvas,
            save: saveCanvas,
            getCurrentColor: () => currentColor,
            getCurrentSize: () => currentSize
        };
    }
    
    // === ОСНОВНЫЕ ФУНКЦИИ РИСОВАНИЯ ===
    
    function startDrawing(x, y) {
        startX = x;
        startY = y;
        lastX = x;
        lastY = y;
        drawing = true;
        
        ctx.beginPath();
        ctx.moveTo(x, y);
        
        return { x, y };
    }
    
    function draw(x, y) {
        if (!drawing) return;
        
        // Кисть
        if (currentTool === 'brush') {
            drawBrush(x, y);
        }
        // Ластик
        else if (currentTool === 'eraser') {
            drawEraser(x, y);
        }
        // Фигуры
        else if (currentShape) {
            drawShapePreview(x, y);
        }
        
        lastX = x;
        lastY = y;
    }
    
    function stopDrawing(x, y) {
        if (!drawing) return;
        
        drawing = false;
        
        // Финализируем фигуру
        if (currentShape && (currentShape === 'rectangle' || currentShape === 'circle' || currentShape === 'line' || currentShape === 'arrow')) {
            finalizeShape(x, y);
        }
        
        saveState();
    }
    
    // === КИСТЬ ===
    function drawBrush(x, y) {
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = currentSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    }
    
    // === ЛАСТИК ===
    function drawEraser(x, y) {
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = currentSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    }
    
    // === ПРЕДПРОСМОТР ФИГУР ===
    function drawShapePreview(x, y) {
        restorePreview();
        
        ctx.strokeStyle = currentColor;
        ctx.fillStyle = currentColor + '33';
        ctx.lineWidth = currentSize;
        
        const width = x - startX;
        const height = y - startY;
        
        switch(currentShape) {
            case 'rectangle':
                ctx.strokeRect(startX, startY, width, height);
                break;
            case 'circle':
                const radius = Math.sqrt(width*width + height*height);
                ctx.beginPath();
                ctx.arc(startX, startY, radius, 0, Math.PI * 2);
                ctx.stroke();
                break;
            case 'line':
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(x, y);
                ctx.stroke();
                break;
        }
    }
    
    function finalizeShape(x, y) {
        const width = x - startX;
        const height = y - startY;
        
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = currentSize;
        
        switch(currentShape) {
            case 'rectangle':
                ctx.strokeRect(startX, startY, width, height);
                break;
            case 'circle':
                const radius = Math.sqrt(width*width + height*height);
                ctx.beginPath();
                ctx.arc(startX, startY, radius, 0, Math.PI * 2);
                ctx.stroke();
                break;
            case 'line':
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(x, y);
                ctx.stroke();
                break;
        }
    }
    
    // === ИСТОРИЯ ===
    function saveState() {
        if (historyIndex < history.length - 1) {
            history = history.slice(0, historyIndex + 1);
        }
        
        history.push(canvas.toDataURL());
        historyIndex++;
    }
    
    function restorePreview() {
        if (historyIndex >= 0) {
            const img = new Image();
            img.src = history[historyIndex];
            img.onload = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
            };
        }
    }
    
    // === ОЧИСТКА ===
    function clearCanvas() {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        saveState();
    }
    
    // === СОХРАНЕНИЕ ===
    function saveCanvas() {
        const link = document.createElement('a');
        link.download = 'painter-pro.png';
        link.href = canvas.toDataURL();
        link.click();
    }
    
    return { init };
})();