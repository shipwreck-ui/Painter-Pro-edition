// ============================================
// ui-controller.js - УПРАВЛЕНИЕ ИНТЕРФЕЙСОМ
// ============================================

const UIController = (function() {
    
    function init(canvasAPI) {
        const colorPicker = document.getElementById('colorPicker');
        const brushSize = document.getElementById('brushSize');
        const sizeDisplay = document.getElementById('sizeDisplay');
        const clearBtn = document.getElementById('clearBtn');
        const saveBtn = document.getElementById('saveBtn');
        const currentToolDisplay = document.getElementById('currentToolDisplay');
        const statusMessage = document.getElementById('statusMessage');
        
        const opacitySlider = document.getElementById('opacitySlider');
        const opacityValue = document.getElementById('opacityValue');
        const neonOff = document.getElementById('neonOff');
        const neonOn = document.getElementById('neonOn');
        const neonIntensity = document.getElementById('neonIntensity');
        const neonValue = document.getElementById('neonValue');
        const canvasSizeSelect = document.getElementById('canvasSizeSelect');
        const applyCanvasSize = document.getElementById('applyCanvasSize');
        const canvasSizeSpan = document.getElementById('canvasSize');
        
        if (colorPicker) {
            colorPicker.addEventListener('input', (e) => {
                canvasAPI.setColor(e.target.value);
            });
        }
        
        if (brushSize && sizeDisplay) {
            brushSize.addEventListener('input', (e) => {
                const size = parseInt(e.target.value);
                canvasAPI.setSize(size);
                sizeDisplay.textContent = size + 'px';
            });
        }
        
        if (opacitySlider && opacityValue) {
            opacitySlider.addEventListener('input', (e) => {
                const opacity = parseFloat(e.target.value);
                canvasAPI.setOpacity(opacity);
                opacityValue.textContent = Math.round(opacity * 100) + '%';
            });
        }
        
        if (neonOff && neonOn && neonIntensity && neonValue) {
            neonOff.addEventListener('click', () => {
                neonOff.classList.add('active');
                neonOn.classList.remove('active');
                neonIntensity.disabled = true;
                canvasAPI.setNeon(false, parseInt(neonIntensity.value));
                if (statusMessage) statusMessage.textContent = '✨ Неон выключен';
            });
            
            neonOn.addEventListener('click', () => {
                neonOn.classList.add('active');
                neonOff.classList.remove('active');
                neonIntensity.disabled = false;
                canvasAPI.setNeon(true, parseInt(neonIntensity.value));
                if (statusMessage) statusMessage.textContent = '✨ Неон включен';
            });
            
            neonIntensity.addEventListener('input', (e) => {
                const val = e.target.value;
                neonValue.textContent = val + 'px';
                if (neonOn.classList.contains('active')) {
                    canvasAPI.setNeon(true, parseInt(val));
                }
            });
        }
        
        if (applyCanvasSize && canvasSizeSelect && canvasSizeSpan) {
            applyCanvasSize.addEventListener('click', () => {
                const [w, h] = canvasSizeSelect.value.split('x').map(Number);
                canvasAPI.resize(w, h);
                canvasSizeSpan.textContent = `📐 ${w}x${h}`;
                if (statusMessage) statusMessage.textContent = `✨ Размер изменен на ${w}x${h}`;
            });
        }
        
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                canvasAPI.clear();
                if (statusMessage) statusMessage.textContent = '✨ Холст очищен';
            });
        }
        
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                canvasAPI.save();
                if (statusMessage) statusMessage.textContent = '✨ Изображение сохранено';
            });
        }
        
        setupToolButtons(canvasAPI, currentToolDisplay, statusMessage);
        
        setInterval(() => {
            if (currentToolDisplay) {
                const tool = canvasAPI.getCurrentTool();
                const toolNames = {
                    'brush': '✏️ Кисть',
                    'eraser': '🧽 Ластик',
                    'eyedropper': '👁️ Пипетка',
                    'fill': '🪣 Заливка',
                    'palette': '🎨 Палитра',
                    'text': '📝 Текст',
                    'magnifier': '🔍 Лупа',
                    'rectangle': '⬜ Квадрат',
                    'circle': '⚪ Круг',
                    'line': '📏 Линия',
                    'arrow': '➡️ Стрелка',
                    'star': '⭐ Звезда',
                    'spray': '💨 Спрей',
                    'gradient': '🌈 Градиент',
                    'stamp': '🔖 Штамп'
                };
                currentToolDisplay.textContent = toolNames[tool] || tool;
            }
        }, 100);
    }
    
    function setupToolButtons(canvasAPI, currentToolDisplay, statusMessage) {
        const toolButtons = {
            'brush': 'brush',
            'eraser': 'eraser',
            'eyedropper': 'eyedropper',
            'fill': 'fill',
            'palette': 'palette',
            'text': 'text',
            'magnifier': 'magnifier'
        };
        
        const shapeButtons = {
            'rectangle': 'rectangle',
            'circle': 'circle',
            'line': 'line',
            'arrow': 'arrow',
            'star': 'star',
            'spray': 'spray',
            'gradient': 'gradient',
            'stamp': 'stamp'
        };
        
        Object.entries(toolButtons).forEach(([id, tool]) => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.tool-item').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    
                    canvasAPI.setTool(tool);
                    if (currentToolDisplay) {
                        currentToolDisplay.textContent = btn.querySelector('span:last-child').textContent;
                    }
                    if (statusMessage) {
                        statusMessage.textContent = `✨ Выбран инструмент: ${btn.querySelector('span:last-child').textContent}`;
                    }
                });
            }
        });
        
        Object.entries(shapeButtons).forEach(([id, shape]) => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.tool-item').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    
                    canvasAPI.setShape(shape);
                    if (currentToolDisplay) {
                        currentToolDisplay.textContent = btn.querySelector('span:last-child').textContent;
                    }
                    if (statusMessage) {
                        statusMessage.textContent = `✨ Выбрана фигура: ${btn.querySelector('span:last-child').textContent}`;
                    }
                });
            }
        });
    }
    
    return { init };
})();