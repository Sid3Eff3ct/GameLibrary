        const canvas = document.getElementById('drawingCanvas');
        const ctx = canvas.getContext('2d');
        const rowsInput = document.getElementById('rowsInput');
        const colsInput = document.getElementById('colsInput');
        const applyBtn = document.getElementById('applyBtn');
        const clearBtn = document.getElementById('clearBtn');
        const resetBtn = document.getElementById('resetBtn');
        const saveBtn = document.getElementById('saveBtn');
        const showDotsCheckbox = document.getElementById('showDotsCheckbox');
        const statusText = document.getElementById('statusText');

        let dots = [];
        let lines = [];
        let drawing = false;
        let startDot = null;
        let showDots = true;
        const dotSize = 20;

        class Dot {
            constructor(x, y, size) {
                this.x = x;
                this.y = y;
                this.size = size;
                this.color = '#333';
            }

            draw() {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
                ctx.fill();
            }

            contains(px, py) {
                const dx = px - this.x;
                const dy = py - this.y;
                // Increased hitbox - 2x larger for easier clicking/tapping
                return Math.sqrt(dx * dx + dy * dy) <= this.size * 1.5;
            }

            getCenter() {
                return { x: this.x, y: this.y };
            }
        }

        class Line {
            constructor(startX, startY, endX, endY) {
                this.startX = startX;
                this.startY = startY;
                this.endX = endX;
                this.endY = endY;
            }

            draw() {
                ctx.strokeStyle = '#333';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(this.startX, this.startY);
                ctx.lineTo(this.endX, this.endY);
                ctx.stroke();
            }
        }

        function createDots() {
            dots = [];
            const rows = parseInt(rowsInput.value);
            const cols = parseInt(colsInput.value);

            if (rows <= 0 || cols <= 0) return;

            const columnSpace = canvas.width / cols;
            const rowSpace = canvas.height / rows;

            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < cols; j++) {
                    const centerX = j * columnSpace + columnSpace / 2;
                    const centerY = i * rowSpace + rowSpace / 2;
                    dots.push(new Dot(centerX, centerY, dotSize));
                }
            }
        }

        function redraw() {
            // Clear canvas
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw lines first (behind dots)
            lines.forEach(line => line.draw());

            // Draw dots only if showDots is true
            if (showDots) {
                dots.forEach(dot => dot.draw());
            }
        }

        function getDotAtPosition(x, y) {
            for (let dot of dots) {
                if (dot.contains(x, y)) {
                    return dot;
                }
            }
            return null;
        }

        canvas.addEventListener('click', handleCanvasInteraction);
        
        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            const touch = e.changedTouches[0];
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const x = (touch.clientX - rect.left) * scaleX;
            const y = (touch.clientY - rect.top) * scaleY;
            
            processClick(x, y);
        });

        function handleCanvasInteraction(e) {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const x = (e.clientX - rect.left) * scaleX;
            const y = (e.clientY - rect.top) * scaleY;
            
            processClick(x, y);
        }

        function processClick(x, y) {

            const clickedDot = getDotAtPosition(x, y);

            if (!clickedDot) return;

            if (!drawing) {
                // First click - select starting dot
                drawing = true;
                startDot = clickedDot;
                startDot.color = '#4ECDC4'; // Highlight selected dot
                statusText.textContent = 'Now click on another dot to complete the line';
                statusText.style.color = '#4ECDC4';
                redraw();
            } else {
                // Second click - draw line and reset
                const endDot = clickedDot;
                const startCenter = startDot.getCenter();
                const endCenter = endDot.getCenter();
                
                lines.push(new Line(startCenter.x, startCenter.y, endCenter.x, endCenter.y));
                
                startDot.color = '#333'; // Reset color
                drawing = false;
                startDot = null;
                statusText.textContent = 'Line drawn! Click on two dots to draw another line';
                statusText.style.color = '#667eea';
                redraw();
            }
        }

        applyBtn.addEventListener('click', () => {
            createDots();
            lines = [];
            drawing = false;
            startDot = null;
            statusText.textContent = 'Grid updated! Click on two dots to draw a line';
            statusText.style.color = '#667eea';
            redraw();
        });

        clearBtn.addEventListener('click', () => {
            lines = [];
            drawing = false;
            if (startDot) {
                startDot.color = '#333';
                startDot = null;
            }
            statusText.textContent = 'All lines cleared! Click on two dots to draw a line';
            statusText.style.color = '#667eea';
            redraw();
        });

        resetBtn.addEventListener('click', () => {
            rowsInput.value = 5;
            colsInput.value = 5;
            createDots();
            lines = [];
            drawing = false;
            startDot = null;
            statusText.textContent = 'Grid reset! Click on two dots to draw a line';
            statusText.style.color = '#667eea';
            redraw();
        });

        showDotsCheckbox.addEventListener('change', () => {
            showDots = showDotsCheckbox.checked;
            redraw();
        });

        saveBtn.addEventListener('click', () => {
            // Create a temporary link to download the canvas as image
            const link = document.createElement('a');
            link.download = 'dot-drawing.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        });

        // Initialize
        createDots();
        redraw();