// ============================================
// canvas-core.js - УЛУЧШЕННОЕ ЯДРО РИСОВАНИЯ
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
        
        // Белый фон
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
            clear: clearCanvas,
            save: saveCanvas,
            undo: undo,
            redo: redo
        };
    }
    
    // Изменение размера холста
    function resizeCanvas(newWidth, newHeight) {
        // Сохраняем текущее изображение
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Меняем размер
        canvas.width = newWidth;
        canvas.height = newHeight;
        width = newWidth;
        height = newHeight;
        
        // Восстанавливаем изображение (по центру)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.putImageData(imageData, 0, 0);
        
        saveState();
    }
    
    function getColorWithOpacity() {
        if (currentOpacity === 1.0) return currentColor;
        
        // Конвертируем hex в rgba
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
            // Заливка - делаем сразу
            floodFill(x, y);
            drawing = false;
            return;
        }
        
        if (currentTool === 'eyedropper') {
            pickColor(x, y);
            drawing = false;
            return;
        }
        
        if (currentTool === 'text') {
            addText(x, y);
            drawing = false;
            return;
        }
        
        if (currentShape === 'spray') {
            startSpray(x, y);
        }
        
        // Сохраняем состояние для предпросмотра
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
        } else if (currentShape) {
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
        ctx.fillStyle = getColorWithOpacity().replace(', 1', ', 0.3');
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
                drawArrow(startX, startY, x, y, false);
                break;
            case 'star':
                const r = Math.sqrt(width*width + height*height) / 2;
                drawStar(startX, startY, 5, r, r/2, false);
                break;
        }
    }
    
    function finalizeShape(x, y) {
        restorePreview();
        
        ctx.strokeStyle = getColorWithOpacity();
        ctx.fillStyle = getColorWithOpacity();
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
                drawArrow(startX, startY, x, y, true);
                break;
            case 'star':
                const r = Math.sqrt(width*width + height*height) / 2;
                drawStar(startX, startY, 5, r, r/2, true);
                break;
            case 'stamp':
                drawStamp(x, y);
                break;
        }
    }
    
    function drawArrow(x1, y1, x2, y2, final = true) {
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const length = Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        
        const arrowSize = 15;
        const arrowX = x2 - arrowSize * Math.cos(angle - 0.3);
        const arrowY = y2 - arrowSize * Math.sin(angle - 0.3);
        
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(arrowX, arrowY);
        ctx.stroke();
        
        const arrowX2 = x2 - arrowSize * Math.cos(angle + 0.3);
        const arrowY2 = y2 - arrowSize * Math.sin(angle + 0.3);
        
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(arrowX2, arrowY2);
        ctx.stroke();
    }
    
    function drawStar(cx, cy, spikes, outerR, innerR, final = true) {
        let rot = Math.PI / 2 * 3;
        let step = Math.PI / spikes;
        
        ctx.beginPath();
        for (let i = 0; i < spikes; i++) {
            let x = cx + Math.cos(rot) * outerR;
            let y = cy + Math.sin(rot) * outerR;
            ctx.lineTo(x, y);
            rot += step;
            
            x = cx + Math.cos(rot) * innerR;
            y = cy + Math.sin(rot) * innerR;
            ctx.lineTo(x, y);
            rot += step;
        }
        ctx.closePath();
        
        if (final) {
            ctx.stroke();
        } else {
            ctx.stroke();
        }
    }
    
    function drawStamp(x, y) {
        // Рисуем простой штамп - звезду
        ctx.fillStyle = getColorWithOpacity();
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * 72 - 90) * Math.PI / 180;
            const x1 = x + Math.cos(angle) * 20;
            const y1 = y + Math.sin(angle) * 20;
            if (i === 0) ctx.moveTo(x1, y1);
            else ctx.lineTo(x1, y1);
            
            const angle2 = (i * 72 - 90 + 36) * Math.PI / 180;
            const x2 = x + Math.cos(angle2) * 10;
            const y2 = y + Math.sin(angle2) * 10;
            ctx.lineTo(x2, y2);
        }
        ctx.closePath();
        ctx.fill();
    }
    
    function startSpray(x, y) {
        if (sprayInterval) clearInterval(sprayInterval);
        
        sprayInterval = setInterval(() => {
            for (let i = 0; i < 10; i++) {
                const offsetX = (Math.random() - 0.5) * currentSize * 3;
                const offsetY = (Math.random() - 0.5) * currentSize * 3;
                
                ctx.fillStyle = getColorWithOpacity();
                ctx.beginPath();
                ctx.arc(x + offsetX, y + offsetY, Math.random() * 3 + 1, 0, Math.PI * 2);
                ctx.fill();
            }
        }, 30);
    }
    
    function stopSpray() {
        if (sprayInterval) {
            clearInterval(sprayInterval);
            sprayInterval = null;
        }
    }
    
    // УЛУЧШЕННАЯ ЗАЛИВКА
    function floodFill(x, y) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const targetColor = getPixelColor(imageData, Math.floor(x), Math.floor(y));
        const fillColor = hexToRgba(currentColor, currentOpacity);
        
        if (colorsMatch(targetColor, fillColor)) return;
        
        const stack = [[Math.floor(x), Math.floor(y)]];
        const width = canvas.width;
        const height = canvas.height;
        
        while (stack.length) {
            const [cx, cy] = stack.pop();
            if (cx < 0 || cx >= width || cy < 0 || cy >= height) continue;
            
            const index = (cy * width + cx) * 4;
            
            if (colorsMatch(
                {r: imageData.data[index], g: imageData.data[index+1], b: imageData.data[index+2], a: imageData.data[index+3]},
                targetColor
            )) {
                imageData.data[index] = fillColor.r;
                imageData.data[index+1] = fillColor.g;
                imageData.data[index+2] = fillColor.b;
                imageData.data[index+3] = fillColor.a * 255;
                
                stack.push([cx+1, cy], [cx-1, cy], [cx, cy+1], [cx, cy-1]);
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
    }
    
    function pickColor(x, y) {
        const pixel = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
        const color = rgbToHex(pixel[0], pixel[1], pixel[2]);
        currentColor = color;
        
        // Обновим в интерфейсе позже через ui-controller
    }
    
    function addText(x, y) {
        const text = prompt('Введите текст:', 'Текст');
        if (text) {
            ctx.font = `${currentSize*3}px Arial`;
            ctx.fillStyle = getColorWithOpacity();
            ctx.fillText(text, x, y);
            saveState();
        }
    }
    
    function getPixelColor(imageData, x, y) {
        if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) {
            return {r: 255, g: 255, b: 255, a: 255};
        }
        const index = (y * canvas.width + x) * 4;
        return {
            r: imageData.data[index],
            g: imageData.data[index+1],
            b: imageData.data[index+2],
            a: imageData.data[index+3]
        };
    }
    
    function colorsMatch(c1, c2) {
        return Math.abs(c1.r - c2.r) < 5 && 
               Math.abs(c1.g - c2.g) < 5 && 
               Math.abs(c1.b - c2.b) < 5;
    }
    
    function hexToRgba(hex, alpha) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
            a: alpha || 1.0
        } : {r: 0, g: 0, b: 0, a: 1};
    }
    
    function rgbToHex(r, g, b) {
        return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
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