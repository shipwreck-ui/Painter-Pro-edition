// ============================================
// tools.js - СПЕЦИАЛЬНЫЕ ИНСТРУМЕНТЫ
// ============================================

const Tools = (function() {
    
    // === ПИПЕТКА ===
    function eyedropper(ctx, canvas, x, y) {
        const pixel = ctx.getImageData(x, y, 1, 1).data;
        const color = rgbToHex(pixel[0], pixel[1], pixel[2]);
        return color;
    }
    
    // === ЗАЛИВКА ===
    function floodFill(ctx, canvas, x, y, fillColor) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const targetColor = getPixelColor(imageData, x, y, canvas.width);
        const fill = hexToRgb(fillColor);
        
        if (colorsMatch(targetColor, fill)) return;
        
        const pixelsToCheck = [x, y];
        const width = canvas.width;
        const height = canvas.height;
        
        while (pixelsToCheck.length > 0) {
            const y = pixelsToCheck.pop();
            const x = pixelsToCheck.pop();
            
            const index = (y * width + x) * 4;
            
            if (colorsMatch(
                {r: imageData.data[index], g: imageData.data[index+1], b: imageData.data[index+2], a: imageData.data[index+3]},
                targetColor
            )) {
                imageData.data[index] = fill.r;
                imageData.data[index+1] = fill.g;
                imageData.data[index+2] = fill.b;
                imageData.data[index+3] = 255;
                
                if (x > 0) pixelsToCheck.push(x-1, y);
                if (x < width-1) pixelsToCheck.push(x+1, y);
                if (y > 0) pixelsToCheck.push(x, y-1);
                if (y < height-1) pixelsToCheck.push(x, y+1);
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
    }
    
    // === ТЕКСТ ===
    function addText(ctx, x, y, text, color, size) {
        if (text) {
            ctx.font = `${size*3}px Arial`;
            ctx.fillStyle = color;
            ctx.fillText(text, x, y);
        }
    }
    
    // === СТРЕЛКА ===
    function drawArrow(ctx, x1, y1, x2, y2, color, size) {
        const angle = Math.atan2(y2 - y1, x2 - x1);
        
        ctx.strokeStyle = color;
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
    }
    
    // === ЗВЕЗДА ===
    function drawStar(ctx, cx, cy, spikes, outerR, innerR, color, size) {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        let step = Math.PI / spikes;
        
        ctx.strokeStyle = color;
        ctx.lineWidth = size;
        
        ctx.beginPath();
        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerR;
            y = cy + Math.sin(rot) * outerR;
            ctx.lineTo(x, y);
            rot += step;
            
            x = cx + Math.cos(rot) * innerR;
            y = cy + Math.sin(rot) * innerR;
            ctx.lineTo(x, y);
            rot += step;
        }
        ctx.closePath();
        ctx.stroke();
    }
    
    // === ГРАДИЕНТ ===
    function applyGradient(ctx, canvas, color1, color2 = '#FFFFFF') {
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===
    
    function getPixelColor(imageData, x, y, width) {
        const index = (y * width + x) * 4;
        return {
            r: imageData.data[index],
            g: imageData.data[index+1],
            b: imageData.data[index+2],
            a: imageData.data[index+3]
        };
    }
    
    function colorsMatch(c1, c2) {
        return c1.r === c2.r && c1.g === c2.g && c1.b === c2.b && c1.a === c2.a;
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
    
    // Публичные методы
    return {
        eyedropper,
        floodFill,
        addText,
        drawArrow,
        drawStar,
        applyGradient,
        hexToRgb,
        rgbToHex
    };
})();