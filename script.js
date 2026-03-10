// ============================================
// script.js - ГЛАВНЫЙ ФАЙЛ
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    
    const canvas = document.getElementById('canvas');
    const canvasContainer = document.getElementById('canvasContainer');
    
    if (!canvas) {
        console.error('Canvas не найден!');
        return;
    }
    
    const canvasAPI = CanvasCore.init(canvas);
    
    UIController.init(canvasAPI);
    
    function getCanvasCoordinates(e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        let clientX, clientY;
        
        if (e.touches) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
            e.preventDefault();
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        
        let x = (clientX - rect.left) * scaleX;
        let y = (clientY - rect.top) * scaleY;
        
        x = Math.max(0, Math.min(canvas.width, x));
        y = Math.max(0, Math.min(canvas.height, y));
        
        return { x, y };
    }
    
    // Mouse events
    canvas.addEventListener('mousedown', (e) => {
        e.preventDefault();
        const pos = getCanvasCoordinates(e);
        canvasAPI.startDrawing(pos.x, pos.y);
    });
    
    canvas.addEventListener('mousemove', (e) => {
        e.preventDefault();
        const pos = getCanvasCoordinates(e);
        canvasAPI.draw(pos.x, pos.y);
    });
    
    canvas.addEventListener('mouseup', (e) => {
        e.preventDefault();
        const pos = getCanvasCoordinates(e);
        canvasAPI.stopDrawing(pos.x, pos.y);
    });
    
    canvas.addEventListener('mouseleave', () => {
        canvasAPI.stopDrawing(0, 0);
    });
    
    // Touch events
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const pos = getCanvasCoordinates(e);
        canvasAPI.startDrawing(pos.x, pos.y);
    }, { passive: false });
    
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const pos = getCanvasCoordinates(e);
        canvasAPI.draw(pos.x, pos.y);
    }, { passive: false });
    
    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        canvasAPI.stopDrawing(0, 0);
    }, { passive: false });
    
    canvas.addEventListener('touchcancel', (e) => {
        e.preventDefault();
        canvasAPI.stopDrawing(0, 0);
    }, { passive: false });
    
    function adjustCanvasDisplay() {
        if (!canvasContainer) return;
        canvas.style.width = '100%';
        canvas.style.height = '100%';
    }
    
    window.addEventListener('resize', adjustCanvasDisplay);
    adjustCanvasDisplay();
    
    console.log('Painter Pro готов к работе!');
});