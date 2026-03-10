// ============================================
// ui-controller.js - УПРАВЛЕНИЕ ИНТЕРФЕЙСОМ
// ============================================

const UIController = (function() {
    
    function init(canvasAPI) {
        const colorPicker = document.getElementById('colorPicker');
        const brushSize = document.getElementById('brushSize');
        const clearBtn = document.getElementById('clearBtn');
        const saveBtn = document.getElementById('saveBtn');
        
        // Цвет
        colorPicker.addEventListener('input', (e) => {
            canvasAPI.setColor(e.target.value);
        });
        
        // Размер кисти
        brushSize.addEventListener('input', (e) => {
            canvasAPI.setSize(parseInt(e.target.value));
        });
        
        // Очистка
        clearBtn.addEventListener('click', () => {
            canvasAPI.clear();
        });
        
        // Сохранение
        saveBtn.addEventListener('click', () => {
            canvasAPI.save();
        });
        
        // Инструменты
        setupToolButtons(canvasAPI);
    }
    
    function setupToolButtons(canvasAPI) {
        // Инструменты
        document.getElementById('brush').addEventListener('click', () => {
            canvasAPI.setTool('brush');
            canvasAPI.setShape(null);
        });
        
        document.getElementById('eraser').addEventListener('click', () => {
            canvasAPI.setTool('eraser');
            canvasAPI.setShape(null);
        });
        
        document.getElementById('eyedropper').addEventListener('click', async () => {
            canvasAPI.setTool('eyedropper');
            canvasAPI.setShape(null);
        });
        
        document.getElementById('fill').addEventListener('click', () => {
            canvasAPI.setTool('fill');
            canvasAPI.setShape(null);
        });
        
        document.getElementById('text').addEventListener('click', () => {
            canvasAPI.setTool('text');
            canvasAPI.setShape(null);
        });
        
        // Фигуры
        document.getElementById('rectangle').addEventListener('click', () => {
            canvasAPI.setShape('rectangle');
            canvasAPI.setTool(null);
        });
        
        document.getElementById('circle').addEventListener('click', () => {
            canvasAPI.setShape('circle');
            canvasAPI.setTool(null);
        });
        
        document.getElementById('line').addEventListener('click', () => {
            canvasAPI.setShape('line');
            canvasAPI.setTool(null);
        });
        
        document.getElementById('arrow').addEventListener('click', () => {
            canvasAPI.setShape('arrow');
            canvasAPI.setTool(null);
        });
        
        document.getElementById('star').addEventListener('click', () => {
            canvasAPI.setShape('star');
            canvasAPI.setTool(null);
        });
        
        document.getElementById('spray').addEventListener('click', () => {
            canvasAPI.setShape('spray');
            canvasAPI.setTool(null);
        });
    }
    
    return { init };
})();