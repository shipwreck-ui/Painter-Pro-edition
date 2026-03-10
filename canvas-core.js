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
    let currentColor = '#cba6f7';
    let currentSize = 5;
    let currentOpacity = 1.0;
    let neonMode = false;
    let neonIntensity = 5;
    
    // История
    let history = [];
    let historyIndex = -1;
    
    // Для спрея
    let sprayInterval = null;
    
    // Для предпросмотра фигур
    let previewImage = null;
    
    // Инициализация
    function init(canvasElement) {
        canvas = canvasElement;
        ctx = canvas.getContext('2d');
        
        canvas.width = width;
        canvas.height = height;
        
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        
        saveState();
        
        return {
            startDrawing: startDrawing,
            draw: draw,
            stopDrawing: stopDrawing,
            setTool: (tool) => { currentTool = tool; currentShape = null; },
            setShape: (shape) => { currentShape = shape; currentTool = null; },
            setColor: (color) => currentColor = color,
            setSize: (size) => currentSize = size,
            setOpacity: (opacity) => currentOpacity = opacity,
            setNeon: (enabled, intensity) => { neonMode = enabled; neonIntensity = intensity; },
            resize: resizeCanvas,
            getContext: () => ctx,
            getCanvas: () => canvas,
            getCurrentTool: () => currentTool || currentShape || 'brush',
            getCurrentColor: () => currentColor,
            getCurrentSize: () => currentSize,
            getCurrentOpacity: () => currentOpacity,
            clear: clearCanvas,
            save: saveCanvas,
            undo: undo,
            redo: redo
        };
    }
    
    function resizeCanvas(newWidth, newHeight) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        canvas.width = newWidth;
        canvas.height = newHeight;
        width = newWidth;
        height = newHeight;
        
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.putImageData(imageData, 0, 0);
        
        saveState();
    }
    
    function getColorWithOpacity() {
        if (currentOpacity === 1.0) return currentColor;
        
        let r, g, b;
        if (currentColor.startsWith('#')) {
            const hex = currentColor.slice(1);
            r = parseInt(hex.substring(0, 2), 16);
            g = parseInt(hex.substring(2, 4), 16);
            b = parseInt(hex.substring(4, 6), 16);
        } else {
            r = 0; g = 0; b = 0;
        }
        return `rgba(${r}, ${g}, ${b}, ${currentOpacity})`;
    }
    
    function applyNeonEffect() {
        if (!neonMode) return;
        ctx.shadowColor = currentColor;
        ctx.shadowBlur = neonIntensity;
    }
    
    function resetNeonEffect() {
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
    }
    
    function startDrawing(x, y) {
        startX = x;
        startY = y;
        lastX = x;
        lastY = y;
        drawing = true;
        
        if (currentTool === 'fill') {
            Tools.floodFill(ctx, canvas, x, y, currentColor);
            drawing = false;
            saveState();
            return;
        }
        
        if (currentTool === 'eyedropper') {
            const color = Tools.eyedropper(ctx, canvas, x, y);
            if (color) currentColor = color;
            drawing = false;
            return;
        }
        
        if (currentTool === 'text') {
            const text = prompt('Введите текст:');
            if (text) {
                Tools.addText(ctx, x, y, text, currentColor, currentSize, currentOpacity);
                saveState();
            }
            drawing = false;
            return;
        }
        
        if (currentShape === 'gradient') {
            Tools.applyGradient(ctx, canvas, currentColor, '#FFFFFF');
            drawing = false;
            saveState();
            return;
        }
        
        if (currentShape === 'stamp') {
            Tools.drawStamp(ctx, x, y, currentColor, currentSize, currentOpacity);
            drawing = false;
            saveState();
            return;
        }
        
        if (currentShape === 'spray') {
            startSpray(x, y);
        }
        
        savePreview();
        
        ctx.beginPath();
        ctx.moveTo(x, y);
    }
    
    function draw(x, y) {
        if (!drawing) return;
        
        applyNeonEffect();
        
        if (currentTool === 'brush') {
            drawBrush(x, y);
        } else if (currentTool === 'eraser') {
            drawEraser(x, y);
        } else if (currentShape) {
            drawShapePreview(x, y);
        }
        
        lastX = x;
        lastY = y;
    }
    
    function stopDrawing(x, y) {
        if (!drawing) return;
        
        drawing = false;
        
        if (currentShape === 'spray') {
            stopSpray();
        } else if (currentShape && currentShape !== 'stamp' && currentShape !== 'gradient') {
            finalizeShape(x, y);
        }
        
        resetNeonEffect();
        saveState();
    }
    
    function drawBrush(x, y) {
        ctx.strokeStyle = getColorWithOpacity();
        ctx.lineWidth = currentSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    }
    
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
    
    function savePreview() {
        previewImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }
    
    function restorePreview() {
        if (previewImage) {
            ctx.putImageData(previewImage, 0, 0);
        }
    }
    
    function drawShapePreview(x, y) {
        restorePreview();
        
        ctx.strokeStyle = getColorWithOpacity();
        ctx.fillStyle = getColorWithOpacity().replace('1)', '0.3)');
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
            case 'arrow':
                Tools.drawArrow(ctx, startX, startY, x, y, currentColor, currentSize, currentOpacity * 0.5);
                break;
            case 'star':
                const r = Math.sqrt(width*width + height*height) / 2;
                Tools.drawStar(ctx, startX, startY, 5, r, r/2, currentColor, currentSize, currentOpacity * 0.5);
                break;
        }
    }
    
    function finalizeShape(x, y) {
        restorePreview();
        
        const width = x - startX;
        const height = y - startY;
        
        switch(currentShape) {
            case 'rectangle':
                ctx.strokeStyle = getColorWithOpacity();
                ctx.lineWidth = currentSize;
                ctx.strokeRect(startX, startY, width, height);
                break;
            case 'circle':
                const radius = Math.sqrt(width*width + height*height);
                ctx.strokeStyle = getColorWithOpacity();
                ctx.lineWidth = currentSize;
                ctx.beginPath();
                ctx.arc(startX, startY, radius, 0, Math.PI * 2);
                ctx.stroke();
                break;
            case 'line':
                ctx.strokeStyle = getColorWithOpacity();
                ctx.lineWidth = currentSize;
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(x, y);
                ctx.stroke();
                break;
            case 'arrow':
                Tools.drawArrow(ctx, startX, startY, x, y, currentColor, currentSize, currentOpacity);
                break;
            case 'star':
                const r = Math.sqrt(width*width + height*height) / 2;
                Tools.drawStar(ctx, startX, startY, 5, r, r/2, currentColor, currentSize, currentOpacity);
                break;
        }
    }
    
    function startSpray(x, y) {
        if (sprayInterval) clearInterval(sprayInterval);
        
        sprayInterval = setInterval(() => {
            Tools.drawSpray(ctx, x, y, currentColor, currentSize, 10, currentOpacity);
        }, 30);
    }
    
    function stopSpray() {
        if (sprayInterval) {
            clearInterval(sprayInterval);
            sprayInterval = null;
        }
    }
    
    function saveState() {
        if (historyIndex < history.length - 1) {
            history = history.slice(0, historyIndex + 1);
        }
        history.push(canvas.toDataURL());
        historyIndex++;
    }
    
    function undo() {
        if (historyIndex > 0) {
            historyIndex--;
            const img = new Image();
            img.src = history[historyIndex];
            img.onload = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
            };
        }
    }
    
    function redo() {
        if (historyIndex < history.length - 1) {
            historyIndex++;
            const img = new Image();
            img.src = history[historyIndex];
            img.onload = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
            };
        }
    }
    
    function clearCanvas() {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        saveState();
    }
    
    function saveCanvas() {
        const link = document.createElement('a');
        link.download = 'painter-pro.png';
        link.href = canvas.toDataURL();
        link.click();
    }
    
    return { init };
})();