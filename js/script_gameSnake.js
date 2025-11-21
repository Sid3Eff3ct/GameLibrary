        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const scoreElement = document.getElementById('score');
        const highScoreElement = document.getElementById('highScore');
        const gameOverElement = document.getElementById('gameOver');
        const restartBtn = document.getElementById('restartBtn');

        // Joystick elements
        const joystickBase = document.getElementById('joystickBase');
        const joystickKnob = document.getElementById('joystickKnob');

        // Game variables
        const gridSize = 20;
        const tileCount = canvas.width / gridSize;
        let snake = [{ x: 10, y: 10 }];
        let food = { x: 15, y: 15 };
        let dx = 0;
        let dy = 0;
        let score = 0;
        let highScore = localStorage.getItem('snakeHighScore') || 0;
        let gameRunning = false;
        let gameLoop;

        // Joystick state
        let joystickActive = false;
        let pendingDirection = null;

        highScoreElement.textContent = highScore;

        // Keyboard controls (Arrow keys + WASD)
        document.addEventListener('keydown', changeDirection);

        function changeDirection(event) {
            const LEFT_KEY = 37;
            const RIGHT_KEY = 39;
            const UP_KEY = 38;
            const DOWN_KEY = 40;
            const A_KEY = 65;
            const D_KEY = 68;
            const W_KEY = 87;
            const S_KEY = 83;

            const keyPressed = event.keyCode;
            const goingUp = dy === -1;
            const goingDown = dy === 1;
            const goingRight = dx === 1;
            const goingLeft = dx === -1;

            if ((keyPressed === LEFT_KEY || keyPressed === A_KEY) && !goingRight) {
                dx = -1;
                dy = 0;
                if (!gameRunning) startGame();
            }

            if ((keyPressed === UP_KEY || keyPressed === W_KEY) && !goingDown) {
                dx = 0;
                dy = -1;
                if (!gameRunning) startGame();
            }

            if ((keyPressed === RIGHT_KEY || keyPressed === D_KEY) && !goingLeft) {
                dx = 1;
                dy = 0;
                if (!gameRunning) startGame();
            }

            if ((keyPressed === DOWN_KEY || keyPressed === S_KEY) && !goingUp) {
                dx = 0;
                dy = 1;
                if (!gameRunning) startGame();
            }
        }

        // Joystick controls
        function setupJoystick() {
            const handleStart = (e) => {
                e.preventDefault();
                joystickActive = true;
                joystickKnob.classList.add('active');
                handleMove(e);
            };

            const handleMove = (e) => {
                if (!joystickActive) return;

                const touch = e.touches ? e.touches[0] : e;
                const rect = joystickBase.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;

                let deltaX = touch.clientX - centerX;
                let deltaY = touch.clientY - centerY;

                const maxDistance = rect.width / 2 - 30;
                const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

                if (distance > maxDistance) {
                    deltaX = (deltaX / distance) * maxDistance;
                    deltaY = (deltaY / distance) * maxDistance;
                }

                joystickKnob.style.transform = `translate(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px))`;

                // Determine direction based on angle
                const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
                
                if (distance > 20) { // Dead zone
                    const goingUp = dy === -1;
                    const goingDown = dy === 1;
                    const goingRight = dx === 1;
                    const goingLeft = dx === -1;

                    // Right: -45 to 45
                    if (angle > -45 && angle <= 45 && !goingLeft) {
                        pendingDirection = { dx: 1, dy: 0 };
                    }
                    // Down: 45 to 135
                    else if (angle > 45 && angle <= 135 && !goingUp) {
                        pendingDirection = { dx: 0, dy: 1 };
                    }
                    // Left: 135 to -135
                    else if ((angle > 135 || angle <= -135) && !goingRight) {
                        pendingDirection = { dx: -1, dy: 0 };
                    }
                    // Up: -135 to -45
                    else if (angle > -135 && angle <= -45 && !goingDown) {
                        pendingDirection = { dx: 0, dy: -1 };
                    }
                }
            };

            const handleEnd = () => {
                joystickActive = false;
                joystickKnob.classList.remove('active');
                joystickKnob.style.transform = 'translate(-50%, -50%)';
                
                if (pendingDirection && !gameRunning) {
                    dx = pendingDirection.dx;
                    dy = pendingDirection.dy;
                    startGame();
                } else if (pendingDirection) {
                    dx = pendingDirection.dx;
                    dy = pendingDirection.dy;
                }
                pendingDirection = null;
            };

            // Touch events
            joystickBase.addEventListener('touchstart', handleStart);
            document.addEventListener('touchmove', handleMove);
            document.addEventListener('touchend', handleEnd);

            // Mouse events
            joystickBase.addEventListener('mousedown', handleStart);
            document.addEventListener('mousemove', handleMove);
            document.addEventListener('mouseup', handleEnd);
        }

        setupJoystick();

        // Swipe controls for canvas
        let touchStartX = 0;
        let touchStartY = 0;

        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });

        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const diffX = touchEndX - touchStartX;
            const diffY = touchEndY - touchStartY;

            if (Math.abs(diffX) > Math.abs(diffY)) {
                // Horizontal swipe
                if (diffX > 30 && dx !== -1) {
                    dx = 1;
                    dy = 0;
                    if (!gameRunning) startGame();
                } else if (diffX < -30 && dx !== 1) {
                    dx = -1;
                    dy = 0;
                    if (!gameRunning) startGame();
                }
            } else {
                // Vertical swipe
                if (diffY > 30 && dy !== -1) {
                    dx = 0;
                    dy = 1;
                    if (!gameRunning) startGame();
                } else if (diffY < -30 && dy !== 1) {
                    dx = 0;
                    dy = -1;
                    if (!gameRunning) startGame();
                }
            }
        });

        restartBtn.addEventListener('click', resetGame);

        function startGame() {
            gameRunning = true;
            gameOverElement.classList.remove('show');
            gameLoop = setInterval(updateGame, 100);
        }

        function updateGame() {
            // Apply pending joystick direction
            if (pendingDirection) {
                dx = pendingDirection.dx;
                dy = pendingDirection.dy;
                pendingDirection = null;
            }

            moveSnake();
            
            if (checkCollision()) {
                endGame();
                return;
            }

            if (snake[0].x === food.x && snake[0].y === food.y) {
                score++;
                scoreElement.textContent = score;
                generateFood();
            } else {
                snake.pop();
            }

            drawGame();
        }

        function moveSnake() {
            const head = { x: snake[0].x + dx, y: snake[0].y + dy };
            snake.unshift(head);
        }

        function checkCollision() {
            const head = snake[0];

            // Wall collision
            if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
                return true;
            }

            // Self collision
            for (let i = 1; i < snake.length; i++) {
                if (head.x === snake[i].x && head.y === snake[i].y) {
                    return true;
                }
            }

            return false;
        }

        function generateFood() {
            food.x = Math.floor(Math.random() * tileCount);
            food.y = Math.floor(Math.random() * tileCount);

            // Make sure food doesn't spawn on snake
            for (let segment of snake) {
                if (food.x === segment.x && food.y === segment.y) {
                    generateFood();
                    return;
                }
            }
        }

        function drawGame() {
            // Clear canvas
            ctx.fillStyle = '#f5f5f5';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw snake
            snake.forEach((segment, index) => {
                ctx.fillStyle = index === 0 ? '#667eea' : '#764ba2';
                ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
            });

            // Draw food
            ctx.fillStyle = '#ff6b6b';
            ctx.beginPath();
            ctx.arc(
                food.x * gridSize + gridSize / 2,
                food.y * gridSize + gridSize / 2,
                gridSize / 2 - 2,
                0,
                2 * Math.PI
            );
            ctx.fill();
        }

        function endGame() {
            clearInterval(gameLoop);
            gameRunning = false;
            gameOverElement.classList.add('show');

            if (score > highScore) {
                highScore = score;
                highScoreElement.textContent = highScore;
                localStorage.setItem('snakeHighScore', highScore);
            }
        }

        function resetGame() {
            snake = [{ x: 10, y: 10 }];
            food = { x: 15, y: 15 };
            dx = 0;
            dy = 0;
            score = 0;
            scoreElement.textContent = score;
            gameOverElement.classList.remove('show');
            drawGame();
        }

        // Initial draw
        drawGame();