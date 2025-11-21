        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const scoreElement = document.getElementById('score');
        const highScoreElement = document.getElementById('highScore');
        const gameOverElement = document.getElementById('gameOver');
        const finalScoreElement = document.getElementById('finalScore');
        const startBtn = document.getElementById('startBtn');

        // Joystick elements
        const joystickBase = document.getElementById('joystickBase');
        const joystickKnob = document.getElementById('joystickKnob');

        // Game variables
        const gridSize = 20;
        const tileCount = canvas.width / gridSize;
        let player = { x: 10, y: 10, vx: 0, vy: 0 };
        let projectiles = [];
        let score = 0;
        let highScore = localStorage.getItem('dodgeHighScore') || 0;
        let gameRunning = false;
        let gameLoop;
        let startTime;
        let spawnInterval;
        let difficultyInterval;
        let spawnRate = 500;
        let keysPressed = {};

        // Joystick state
        let joystickActive = false;
        let joystickDirection = { x: 0, y: 0 };

        highScoreElement.textContent = highScore;

        // Keyboard controls
        document.addEventListener('keydown', (event) => {
            const key = event.keyCode;
            keysPressed[key] = true;
            if (!gameRunning && (key === 37 || key === 38 || key === 39 || key === 40 || 
                                  key === 65 || key === 87 || key === 68 || key === 83)) {
                startGame();
            }
        });

        document.addEventListener('keyup', (event) => {
            keysPressed[event.keyCode] = false;
        });

        function handleKeyboardMovement() {
            const LEFT_KEY = 37, RIGHT_KEY = 39, UP_KEY = 38, DOWN_KEY = 40;
            const A_KEY = 65, D_KEY = 68, W_KEY = 87, S_KEY = 83;
            const moveSpeed = 0.15;

            let vx = 0, vy = 0;

            if (keysPressed[LEFT_KEY] || keysPressed[A_KEY]) {
                vx -= moveSpeed;
            }
            if (keysPressed[RIGHT_KEY] || keysPressed[D_KEY]) {
                vx += moveSpeed;
            }
            if (keysPressed[UP_KEY] || keysPressed[W_KEY]) {
                vy -= moveSpeed;
            }
            if (keysPressed[DOWN_KEY] || keysPressed[S_KEY]) {
                vy += moveSpeed;
            }

            // Apply movement
            player.x += vx;
            player.y += vy;

            // Clamp to boundaries
            player.x = Math.max(0, Math.min(tileCount - 1, player.x));
            player.y = Math.max(0, Math.min(tileCount - 1, player.y));
        }

        // Joystick controls
        function setupJoystick() {
            const handleStart = (e) => {
                if (!gameRunning) startGame();
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

                // Normalize direction
                joystickDirection.x = deltaX / maxDistance;
                joystickDirection.y = deltaY / maxDistance;
            };

            const handleEnd = () => {
                joystickActive = false;
                joystickKnob.classList.remove('active');
                joystickKnob.style.transform = 'translate(-50%, -50%)';
                joystickDirection.x = 0;
                joystickDirection.y = 0;
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

        function handleJoystickMovement() {
            if (!joystickActive) return;

            const moveSpeed = 0.15;
            player.x += joystickDirection.x * moveSpeed;
            player.y += joystickDirection.y * moveSpeed;

            // Clamp to boundaries
            player.x = Math.max(0, Math.min(tileCount - 1, player.x));
            player.y = Math.max(0, Math.min(tileCount - 1, player.y));
        }

        setupJoystick();
        startBtn.addEventListener('click', startGame);

        function startGame() {
            if (gameRunning) return;
            
            gameRunning = true;
            player = { x: 10, y: 10, vx: 0, vy: 0 };
            projectiles = [];
            score = 0;
            spawnRate = 800;
            startTime = Date.now();
            gameOverElement.classList.remove('show');
            startBtn.textContent = 'Restart';

            spawnProjectile();
            spawnInterval = setInterval(spawnProjectile, spawnRate);

            difficultyInterval = setInterval(() => {
                if (spawnRate > 400) {
                    spawnRate -= 100;
                    clearInterval(spawnInterval);
                    spawnInterval = setInterval(spawnProjectile, spawnRate);
                }
            }, 2000);

            gameLoop = setInterval(updateGame, 1000 / 60); // 60 FPS for smooth movement
        }

        function spawnProjectile() {
            const side = Math.floor(Math.random() * 4);
            let projectile = { speed: 0.3 };

            switch(side) {
                case 0:
                    projectile.x = Math.random() * tileCount;
                    projectile.y = 0;
                    projectile.dx = 0;
                    projectile.dy = 1;
                    break;
                case 1:
                    projectile.x = tileCount;
                    projectile.y = Math.random() * tileCount;
                    projectile.dx = -1;
                    projectile.dy = 0;
                    break;
                case 2:
                    projectile.x = Math.random() * tileCount;
                    projectile.y = tileCount;
                    projectile.dx = 0;
                    projectile.dy = -1;
                    break;
                case 3:
                    projectile.x = 0;
                    projectile.y = Math.random() * tileCount;
                    projectile.dx = 1;
                    projectile.dy = 0;
                    break;
            }

            projectiles.push(projectile);
        }

        function updateGame() {
            handleKeyboardMovement();
            handleJoystickMovement();

            score = Math.floor((Date.now() - startTime) / 1000);
            scoreElement.textContent = score;

            projectiles.forEach(proj => {
                proj.x += proj.dx * proj.speed;
                proj.y += proj.dy * proj.speed;
            });

            projectiles = projectiles.filter(proj => {
                return proj.x >= -1 && proj.x <= tileCount + 1 && 
                       proj.y >= -1 && proj.y <= tileCount + 1;
            });

            if (checkCollision()) {
                endGame();
                return;
            }

            drawGame();
        }

        function checkCollision() {
            for (let proj of projectiles) {
                if (Math.abs(proj.x - player.x) < 0.6 && Math.abs(proj.y - player.y) < 0.6) {
                    return true;
                }
            }
            return false;
        }

        function drawGame() {
            ctx.fillStyle = '#f5f5f5';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = '#667eea';
            ctx.fillRect(player.x * gridSize, player.y * gridSize, gridSize - 2, gridSize - 2);

            projectiles.forEach(proj => {
                ctx.fillStyle = '#ff6b6b';
                ctx.beginPath();
                ctx.arc(
                    proj.x * gridSize + gridSize / 2,
                    proj.y * gridSize + gridSize / 2,
                    gridSize / 2 - 2,
                    0,
                    2 * Math.PI
                );
                ctx.fill();
            });
        }

        function endGame() {
            clearInterval(gameLoop);
            clearInterval(spawnInterval);
            clearInterval(difficultyInterval);
            gameRunning = false;
            gameOverElement.classList.add('show');
            finalScoreElement.textContent = score;

            if (score > highScore) {
                highScore = score;
                highScoreElement.textContent = highScore;
                localStorage.setItem('dodgeHighScore', highScore);
            }
        }

        // Initial draw
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#667eea';
        ctx.fillRect(player.x * gridSize, player.y * gridSize, gridSize - 2, gridSize - 2);