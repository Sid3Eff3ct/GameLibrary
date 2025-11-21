        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const scoreElement = document.getElementById('score');
        const highScoreElement = document.getElementById('highScore');
        const gameOverElement = document.getElementById('gameOver');
        const finalScoreElement = document.getElementById('finalScore');
        const startBtn = document.getElementById('startBtn');

        // Mobile controls
        const upBtn = document.getElementById('upBtn');
        const downBtn = document.getElementById('downBtn');
        const leftBtn = document.getElementById('leftBtn');
        const rightBtn = document.getElementById('rightBtn');

        // Game variables
        const gridSize = 20;
        const tileCount = canvas.width / gridSize;
        let player = { x: 10, y: 10 };
        let projectiles = [];
        let score = 0;
        let highScore = localStorage.getItem('dodgeHighScore') || 0;
        let gameRunning = false;
        let gameLoop;
        let startTime;
        let spawnInterval;
        let difficultyInterval;
        let spawnRate = 1500; // milliseconds between spawns
        let keysPressed = {};

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

            if ((keysPressed[LEFT_KEY] || keysPressed[A_KEY]) && player.x > 0) {
                player.x--;
            }
            if ((keysPressed[RIGHT_KEY] || keysPressed[D_KEY]) && player.x < tileCount - 1) {
                player.x++;
            }
            if ((keysPressed[UP_KEY] || keysPressed[W_KEY]) && player.y > 0) {
                player.y--;
            }
            if ((keysPressed[DOWN_KEY] || keysPressed[S_KEY]) && player.y < tileCount - 1) {
                player.y++;
            }
        }

        // Mobile touch controls
        upBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (!gameRunning) startGame();
            if (player.y > 0) player.y--;
        });

        upBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (!gameRunning) startGame();
            if (player.y > 0) player.y--;
        });

        downBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (!gameRunning) startGame();
            if (player.y < tileCount - 1) player.y++;
        });

        downBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (!gameRunning) startGame();
            if (player.y < tileCount - 1) player.y++;
        });

        leftBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (!gameRunning) startGame();
            if (player.x > 0) player.x--;
        });

        leftBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (!gameRunning) startGame();
            if (player.x > 0) player.x--;
        });

        rightBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (!gameRunning) startGame();
            if (player.x < tileCount - 1) player.x++;
        });

        rightBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (!gameRunning) startGame();
            if (player.x < tileCount - 1) player.x++;
        });

        startBtn.addEventListener('click', startGame);

        function startGame() {
            if (gameRunning) return;
            
            gameRunning = true;
            player = { x: 10, y: 10 };
            projectiles = [];
            score = 0;
            spawnRate = 800;
            startTime = Date.now();
            gameOverElement.classList.remove('show');
            startBtn.textContent = 'Restart';

            // Start spawning projectiles
            spawnProjectile();
            spawnInterval = setInterval(spawnProjectile, spawnRate);

            // Increase difficulty over time
            difficultyInterval = setInterval(() => {
                if (spawnRate > 400) {
                    spawnRate -= 100;
                    clearInterval(spawnInterval);
                    spawnInterval = setInterval(spawnProjectile, spawnRate);
                }
            }, 2000); // Increase difficulty every 2 seconds

            gameLoop = setInterval(updateGame, 50);
        }

        function spawnProjectile() {
            const side = Math.floor(Math.random() * 4); // 0=top, 1=right, 2=bottom, 3=left
            let projectile = { speed: 0.4 };

            switch(side) {
                case 0: // Top
                    projectile.x = Math.random() * tileCount;
                    projectile.y = 0;
                    projectile.dx = 0;
                    projectile.dy = 1;
                    break;
                case 1: // Right
                    projectile.x = tileCount;
                    projectile.y = Math.random() * tileCount;
                    projectile.dx = -1;
                    projectile.dy = 0;
                    break;
                case 2: // Bottom
                    projectile.x = Math.random() * tileCount;
                    projectile.y = tileCount;
                    projectile.dx = 0;
                    projectile.dy = -1;
                    break;
                case 3: // Left
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

            // Update score (time survived)
            score = Math.floor((Date.now() - startTime) / 1000);
            scoreElement.textContent = score;

            // Move projectiles
            projectiles.forEach(proj => {
                proj.x += proj.dx * proj.speed;
                proj.y += proj.dy * proj.speed;
            });

            // Remove projectiles that are off screen
            projectiles = projectiles.filter(proj => {
                return proj.x >= -1 && proj.x <= tileCount + 1 && 
                       proj.y >= -1 && proj.y <= tileCount + 1;
            });

            // Check collision
            if (checkCollision()) {
                endGame();
                return;
            }

            drawGame();
        }

        function checkCollision() {
            for (let proj of projectiles) {
                const projTileX = Math.floor(proj.x);
                const projTileY = Math.floor(proj.y);
                
                // Check if projectile overlaps with player tile
                if (Math.abs(proj.x - player.x) < 0.6 && Math.abs(proj.y - player.y) < 0.6) {
                    return true;
                }
            }
            return false;
        }

        function drawGame() {
            // Clear canvas
            ctx.fillStyle = '#f5f5f5';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw player
            ctx.fillStyle = '#667eea';
            ctx.fillRect(player.x * gridSize, player.y * gridSize, gridSize - 2, gridSize - 2);

            // Draw projectiles
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