// ============================================
// tools.js - ВСЕ СПЕЦИАЛЬНЫЕ ИНСТРУМЕНТЫ
// ============================================

const Tools = (function() {
    
    // === ПИПЕТКА ===
    function eyedropper(ctx, canvas, x, y) {
        try {
            const pixel = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
            return rgbToHex(pixel[0], pixel[1], pixel[2]);
        } catch (e) {
            console.warn('Пипетка: вне холста');
            return null;
        }
    }
    
    // === ЗАЛИВКА (АЛГОРИТМ) ===
    function floodFill(ctx, canvas, x, y, fillColor, tolerance = 5) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const targetColor = getPixelColor(imageData, Math.floor(x), Math.floor(y), canvas.width);
        const fill = hexToRgb(fillColor);
        
        if (colorsMatch(targetColor, fill, tolerance)) return false;
        
        const stack = [[Math.floor(x), Math.floor(y)]];
        const width = canvas.width;
        const height = canvas.height;
        
        while (stack.length > 0) {
            const [cx, cy] = stack.pop();
            if (cx < 0 || cx >= width || cy < 0 || cy >= height) continue;
            
            const index = (cy * width + cx) * 4;
            
            if (colorsMatch(
                {r: imageData.data[index], g: imageData.data[index+1], b: imageData.data[index+2]},
                targetColor,
                tolerance
            )) {
                imageData.data[index] = fill.r;
                imageData.data[index+1] = fill.g;
                imageData.data[index+2] = fill.b;
                imageData.data[index+3] = 255;
                
                stack.push([cx+1, cy], [cx-1, cy], [cx, cy+1], [cx, cy-1]);
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
        return true;
    }
    
    // === ТЕКСТ ===
    function addText(ctx, x, y, text, color, size, opacity = 1.0) {
        if (!text) return false;
        
        ctx.font = `${size * 3}px Arial`;
        ctx.fillStyle = colorWithOpacity(color, opacity);
        ctx.fillText(text, x, y);
        return true;
    }
    
    // === СТРЕЛКА ===
    function drawArrow(ctx, x1, y1, x2, y2, color, size, opacity = 1.0) {
        const angle = Math.atan2(y2 - y1, x2 - x1);
        
        ctx.strokeStyle = colorWithOpacity(color, opacity);
        ctx.lineWidth = size;
        
        // Линия
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        
        // Наконечник
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
        
        return true;
    }
    
    // === ЗВЕЗДА ===
    function drawStar(ctx, cx, cy, spikes, outerR, innerR, color, size, opacity = 1.0) {
        let rot = Math.PI / 2 * 3;
        let step = Math.PI / spikes;
        
        ctx.strokeStyle = colorWithOpacity(color, opacity);
        ctx.fillStyle = colorWithOpacity(color, opacity * 0.3);
        ctx.lineWidth = size;
        
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
        ctx.stroke();
        
        return true;
    }
    
    // === ШТАМП ===
    function drawStamp(ctx, x, y, color, size, opacity = 1.0) {
        ctx.fillStyle = colorWithOpacity(color, opacity);
        
        // Рисуем звезду как штамп
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * 72 - 90) * Math.PI / 180;
            const x1 = x + Math.cos(angle) * size * 2;
            const y1 = y + Math.sin(angle) * size * 2;
            if (i === 0) ctx.moveTo(x1, y1);
            else ctx.lineTo(x1, y1);
            
            const angle2 = (i * 72 - 90 + 36) * Math.PI / 180;
            const x2 = x + Math.cos(angle2) * size;
            const y2 = y + Math.sin(angle2) * size;
            ctx.lineTo(x2, y2);
        }
        ctx.closePath();
        ctx.fill();
        
        return true;
    }
    
    // === ГРАДИЕНТ ===
    function applyGradient(ctx, canvas, color1, color2 = '#FFFFFF') {
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        return true;
    }
    
    // === СПРЕЙ (ДЫМЧАТАЯ ШТУКА) ===
    function drawSpray(ctx, x, y, color, size, density = 10, opacity = 1.0) {
        for (let i = 0; i < density; i++) {
            const offsetX = (Math.random() - 0.5) * size * 3;
            const offsetY = (Math.random() - 0.5) * size * 3;
            const dotSize = Math.random() * 3 + 1;
            
            ctx.fillStyle = colorWithOpacity(color, opacity * Math.random());
            ctx.beginPath();
            ctx.arc(x + offsetX, y + offsetY, dotSize, 0, Math.PI * 2);
            ctx.fill();
        }
        return true;
    }
    
    // === ЛУПА ===
    function magnify(currentSize, maxSize = 100) {
        return Math.min(maxSize, currentSize + 5);
    }
    
    // === ПАЛИТРА ===
    function openPalette(currentColor, callback) {
        const input = document.createElement('input');
        input.type = 'color';
        input.value = currentColor;
        input.addEventListener('input', (e) => callback(e.target.value));
        input.click();
    }
    
    // === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===
    
    function getPixelColor(imageData, x, y, width) {
        const index = (y * width + x) * 4;
        return {
            r: imageData.data[index],
            g: imageData.data[index+1],
            b: imageData.data[index+2]
        };
    }
    
    function colorsMatch(c1, c2, tolerance = 5) {
        return Math.abs(c1.r - c2.r) <= tolerance &&
               Math.abs(c1.g - c2.g) <= tolerance &&
               Math.abs(c1.b - c2.b) <= tolerance;
    }
    
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : {r: 0, g: 0, b: 0};
    }
    
    function rgbToHex(r, g, b) {
        return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
    
    function colorWithOpacity(hex, opacity) {
        const rgb = hexToRgb(hex);
        return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
    }
    
    // Публичные методы
    return {
        eyedropper,
        floodFill,
        addText,
        drawArrow,
        drawStar,
        drawStamp,
        applyGradient,
        drawSpray,
        magnify,
        openPalette,
        hexToRgb,
        rgbToHex,
        colorWithOpacity
    };
})();