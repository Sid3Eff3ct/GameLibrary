        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const scoreElement = document.getElementById('score');
        const highScoreElement = document.getElementById('highScore');
        const scoreLabelElement = document.getElementById('scoreLabel');
        const highScoreLabelElement = document.getElementById('highScoreLabel');
        const gameOverElement = document.getElementById('gameOver');
        const gameOverText = document.getElementById('gameOverText');
        const startBtn = document.getElementById('startBtn');
        const modeInstructions = document.getElementById('modeInstructions');

        // Mode buttons
        const survivalModeBtn = document.getElementById('survivalMode');
        const collectModeBtn = document.getElementById('collectMode');

        // Joystick elements
        const joystickBase = document.getElementById('joystickBase');
        const joystickKnob = document.getElementById('joystickKnob');

        // Game variables
        const gridSize = 20;
        const tileCount = canvas.width / gridSize;
        let player = { x: 10, y: 10, vx: 0, vy: 0 };
        let projectiles = [];
        let collectible = null;
        let score = 0;
        let highScore = 0;
        let gameRunning = false;
        let gameMode = 'survival'; // 'survival' or 'collect'
        let gameLoop;
        let startTime;
        let spawnInterval;
        let difficultyInterval;
        let spawnRate = 800;
        let keysPressed = {};

        // Joystick state
        let joystickActive = false;
        let joystickDirection = { x: 0, y: 0 };

        loadHighScore();

        // Mode switching
        survivalModeBtn.addEventListener('click', () => {
            if (gameRunning) return;
            gameMode = 'survival';
            survivalModeBtn.classList.add('active');
            collectModeBtn.classList.remove('active');
            updateModeUI();
            loadHighScore();
        });

        collectModeBtn.addEventListener('click', () => {
            if (gameRunning) return;
            gameMode = 'collect';
            collectModeBtn.classList.add('active');
            survivalModeBtn.classList.remove('active');
            updateModeUI();
            loadHighScore();
        });

        function updateModeUI() {
            if (gameMode === 'survival') {
                scoreLabelElement.innerHTML = 'Time: <span id="score">0</span>s';
                highScoreLabelElement.innerHTML = 'Best: <span id="highScore">0</span>s';
                modeInstructions.textContent = 'Dodge the projectiles for as long as you can!';
            } else {
                scoreLabelElement.innerHTML = 'Orbs: <span id="score">0</span>';
                highScoreLabelElement.innerHTML = 'Best: <span id="highScore">0</span>';
                modeInstructions.textContent = 'Collect blue orbs while dodging red projectiles!';
            }
            // Re-get score elements after innerHTML change
            const newScoreElement = document.getElementById('score');
            const newHighScoreElement = document.getElementById('highScore');
            newScoreElement.textContent = 0;
            newHighScoreElement.textContent = highScore;
        }

        function loadHighScore() {
            const key = gameMode === 'survival' ? 'dodgeSurvivalHighScore' : 'dodgeCollectHighScore';
            highScore = localStorage.getItem(key) || 0;
            document.getElementById('highScore').textContent = highScore;
        }

        function saveHighScore() {
            const key = gameMode === 'survival' ? 'dodgeSurvivalHighScore' : 'dodgeCollectHighScore';
            localStorage.setItem(key, highScore);
        }

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
            const moveSpeed = 0.2;

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

            player.x += vx;
            player.y += vy;

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

            joystickBase.addEventListener('touchstart', handleStart);
            document.addEventListener('touchmove', handleMove);
            document.addEventListener('touchend', handleEnd);

            joystickBase.addEventListener('mousedown', handleStart);
            document.addEventListener('mousemove', handleMove);
            document.addEventListener('mouseup', handleEnd);
        }

        function handleJoystickMovement() {
            if (!joystickActive) return;

            const moveSpeed = 0.15;
            player.x += joystickDirection.x * moveSpeed;
            player.y += joystickDirection.y * moveSpeed;

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
            collectible = null;
            score = 0;
            spawnRate = 800;
            startTime = Date.now();
            gameOverElement.classList.remove('show');
            startBtn.textContent = 'Restart';

            if (gameMode === 'collect') {
                spawnCollectible();
            }

            spawnProjectile();
            spawnInterval = setInterval(spawnProjectile, spawnRate);

            difficultyInterval = setInterval(() => {
                if (spawnRate > 400) {
                    spawnRate -= 100;
                    clearInterval(spawnInterval);
                    spawnInterval = setInterval(spawnProjectile, spawnRate);
                }
            }, gameMode === 'survival' ? 2000 : 5000);

            gameLoop = setInterval(updateGame, 1000 / 60);
        }

        function spawnCollectible() {
            let validPosition = false;
            let attempts = 0;
            
            while (!validPosition && attempts < 50) {
                collectible = {
                    x: Math.floor(Math.random() * (tileCount - 4)) + 2,
                    y: Math.floor(Math.random() * (tileCount - 4)) + 2
                };
                
                const distFromPlayer = Math.sqrt(
                    Math.pow(collectible.x - player.x, 2) + 
                    Math.pow(collectible.y - player.y, 2)
                );
                
                if (distFromPlayer > 3) {
                    validPosition = true;
                }
                attempts++;
            }
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

            if (gameMode === 'survival') {
                score = Math.floor((Date.now() - startTime) / 1000);
            }

            document.getElementById('score').textContent = gameMode === 'survival' ? score + 's' : score;

            projectiles.forEach(proj => {
                proj.x += proj.dx * proj.speed;
                proj.y += proj.dy * proj.speed;
            });

            projectiles = projectiles.filter(proj => {
                return proj.x >= -1 && proj.x <= tileCount + 1 && 
                       proj.y >= -1 && proj.y <= tileCount + 1;
            });

            if (gameMode === 'collect' && collectible) {
                if (Math.abs(player.x - collectible.x) < 0.8 && 
                    Math.abs(player.y - collectible.y) < 0.8) {
                    score++;
                    spawnCollectible();
                }
            }

            if (checkCollision()) {
                endGame();
                return;
            }

            drawGame();
        }

        function checkCollision() {
            for (let proj of projectiles) {
                if (Math.abs(proj.x - player.x) < 0.5 && Math.abs(proj.y - player.y) < 0.5) {
                    return true;
                }
            }
            return false;
        }

        function drawGame() {
            ctx.fillStyle = '#f5f5f5';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            if (gameMode === 'collect' && collectible) {
                ctx.fillStyle = '#4ECDC4';
                ctx.beginPath();
                ctx.arc(
                    collectible.x * gridSize + gridSize / 2,
                    collectible.y * gridSize + gridSize / 2,
                    gridSize / 2 - 2,
                    0,
                    2 * Math.PI
                );
                ctx.fill();
                
                ctx.strokeStyle = 'rgba(78, 205, 196, 0.5)';
                ctx.lineWidth = 3;
                ctx.stroke();
            }

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
            
            if (gameMode === 'survival') {
                gameOverText.textContent = `Game Over! You survived ${score} seconds!`;
            } else {
                gameOverText.textContent = `Game Over! You collected ${score} orbs!`;
            }

            if (score > highScore) {
                highScore = score;
                document.getElementById('highScore').textContent = highScore;
                saveHighScore();
            }
        }

        // Initial draw
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#667eea';
        ctx.fillRect(player.x * gridSize, player.y * gridSize, gridSize - 2, gridSize - 2);