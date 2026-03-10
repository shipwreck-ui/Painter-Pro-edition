// ============================================
// script.js - ГЛАВНЫЙ ФАЙЛ
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    
    // Получаем холст
    const canvas = document.getElementById('canvas');
    
    // Инициализируем ядро рисования
    const canvasAPI = CanvasCore.init(canvas);
    
    // Получаем контекст
    const ctx = canvasAPI.getContext();
    
    // Инициализируем интерфейс
    UIController.init(canvasAPI);
    
    // === ОБРАБОТЧИКИ СОБЫТИЙ ===
    
    function getMousePos(e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        let clientX, clientY;
        
        if (e.touches) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        
        return {
            x: Math.max(0, Math.min(canvas.width, (clientX - rect.left) * scaleX)),
            y: Math.max(0, Math.min(canvas.height, (clientY - rect.top) * scaleY))
        };
    }
    
    // Рисование мышкой
    canvas.addEventListener('mousedown', (e) => {
        const pos = getMousePos(e);
        
        // Специальные инструменты
        const tool = canvasAPI.setTool ? 'special' : null;
        
        if (canvasAPI.setTool && document.activeTool === 'eyedropper') {
            const color = Tools.eyedropper(ctx, canvas, pos.x, pos.y);
            canvasAPI.setColor(color);
            document.getElementById('colorPicker').value = color;
        } 
        else if (canvasAPI.setTool && document.activeTool === 'fill') {
            Tools.floodFill(ctx, canvas, pos.x, pos.y, canvasAPI.getCurrentColor());
            canvasAPI.clear(); // Сохраняем состояние
        }
        else if (canvasAPI.setTool && document.activeTool === 'text') {
            const text = prompt('Введите текст:');
            Tools.addText(ctx, pos.x, pos.y, text, canvasAPI.getCurrentColor(), canvasAPI.getCurrentSize());
        }
        else {
            canvasAPI.startDrawing(pos.x, pos.y);
        }
    });
    
    canvas.addEventListener('mousemove', (e) => {
        const pos = getMousePos(e);
        canvasAPI.draw(pos.x, pos.y);
    });
    
    canvas.addEventListener('mouseup', (e) => {
        const pos = getMousePos(e);
        canvasAPI.stopDrawing(pos.x, pos.y);
    });
    
    canvas.addEventListener('mouseleave', () => {
        canvasAPI.stopDrawing(0, 0);
    });
    
    // Touch события
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const pos = getMousePos(e);
        canvasAPI.startDrawing(pos.x, pos.y);
    });
    
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const pos = getMousePos(e);
        canvasAPI.draw(pos.x, pos.y);
    });
    
    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        canvasAPI.stopDrawing(0, 0);
    });
    
});