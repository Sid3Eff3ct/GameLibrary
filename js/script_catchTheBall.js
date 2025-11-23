        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const scoreElement = document.getElementById('score');
        const highScoreElement = document.getElementById('highScore');
        const gameOverElement = document.getElementById('gameOver');
        const finalScoreElement = document.getElementById('finalScore');
        const startBtn = document.getElementById('startBtn');
        const timerBar = document.getElementById('timerBar');
        const timerText = document.getElementById('timerText');

        // Joystick elements
        const joystickBase = document.getElementById('joystickBase');
        const joystickKnob = document.getElementById('joystickKnob');

        // Game variables
        const playerWidth = 50;
        const playerHeight = 20;
        const playerY = canvas.height - 60;
        const orbRadius = 12;
        
        let player = { x: canvas.width / 2 - playerWidth / 2, speed: 0 };
        let orbs = [];
        let score = 0;
        let highScore = localStorage.getItem('catchOrbsHighScore') || 0;
        let gameRunning = false;
        let gameLoop;
        let spawnInterval;
        let spawnRate = 800;
        let keysPressed = {};
        let timeUntilDeath = 5000; // 5 seconds to catch an orb
        let maxTime = 5000;
        let lastCatchTime = 0;

        // Joystick state
        let joystickActive = false;
        let joystickDirection = 0;

        highScoreElement.textContent = highScore;

        // Keyboard controls
        document.addEventListener('keydown', (event) => {
            const key = event.keyCode;
            keysPressed[key] = true;
            if (!gameRunning && (key === 37 || key === 39 || key === 65 || key === 68)) {
                startGame();
            }
        });

        document.addEventListener('keyup', (event) => {
            keysPressed[event.keyCode] = false;
        });

        function handleKeyboardMovement() {
            const LEFT_KEY = 37, RIGHT_KEY = 39;
            const A_KEY = 65, D_KEY = 68;
            const moveSpeed = 5;

            if (keysPressed[LEFT_KEY] || keysPressed[A_KEY]) {
                player.x -= moveSpeed;
            }
            if (keysPressed[RIGHT_KEY] || keysPressed[D_KEY]) {
                player.x += moveSpeed;
            }

            // Keep player in bounds
            player.x = Math.max(0, Math.min(canvas.width - playerWidth, player.x));
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

                let deltaX = touch.clientX - centerX;
                const maxDistance = rect.width / 2 - 30;

                if (Math.abs(deltaX) > maxDistance) {
                    deltaX = Math.sign(deltaX) * maxDistance;
                }

                joystickKnob.style.transform = `translate(calc(-50% + ${deltaX}px), -50%)`;
                joystickDirection = deltaX / maxDistance;
            };

            const handleEnd = () => {
                joystickActive = false;
                joystickKnob.classList.remove('active');
                joystickKnob.style.transform = 'translate(-50%, -50%)';
                joystickDirection = 0;
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
            const moveSpeed = 7;
            player.x += joystickDirection * moveSpeed;
            player.x = Math.max(0, Math.min(canvas.width - playerWidth, player.x));
        }

        setupJoystick();
        startBtn.addEventListener('click', startGame);

        function startGame() {
            if (gameRunning) return;
            
            gameRunning = true;
            player.x = canvas.width / 2 - playerWidth / 2;
            orbs = [];
            score = 0;
            scoreElement.textContent = score;
            spawnRate = 800;
            timeUntilDeath = 5000;
            maxTime = 5000;
            lastCatchTime = Date.now();
            gameOverElement.classList.remove('show');
            startBtn.textContent = 'Restart';

            spawnOrb();
            spawnInterval = setInterval(() => {
                spawnOrb();
                // Increase difficulty faster
                if (spawnRate > 300) {
                    spawnRate -= 20;
                    clearInterval(spawnInterval);
                    spawnInterval = setInterval(spawnOrb, spawnRate);
                }
            }, spawnRate);

            gameLoop = setInterval(updateGame, 1000 / 60);
        }

        function spawnOrb() {
            const isGood = Math.random() > 0.25; // 75% good orbs, 25% bad orbs
            const orb = {
                x: Math.random() * (canvas.width - orbRadius * 2) + orbRadius,
                y: -orbRadius,
                speed: 3 + Math.random() * 3, // Faster orbs (3-6 speed)
                good: isGood
            };
            orbs.push(orb);
        }

        function updateGame() {
            handleKeyboardMovement();
            handleJoystickMovement();

            // Update timer
            const currentTime = Date.now();
            const timeSinceLastCatch = currentTime - lastCatchTime;
            const timeRemaining = Math.max(0, timeUntilDeath - timeSinceLastCatch);
            
            // Update timer bar
            const percentage = (timeRemaining / maxTime) * 100;
            timerBar.style.width = percentage + '%';
            timerText.textContent = (timeRemaining / 1000).toFixed(1) + 's';

            // Check if time ran out
            if (timeRemaining <= 0) {
                endGame('time');
                return;
            }

            // Update orbs
            orbs.forEach(orb => {
                orb.y += orb.speed;
            });

            // Remove orbs that fell off screen
            orbs = orbs.filter(orb => orb.y < canvas.height + orbRadius);

            // Check collisions
            for (let i = orbs.length - 1; i >= 0; i--) {
                const orb = orbs[i];
                
                if (orb.y + orbRadius >= playerY && 
                    orb.y - orbRadius <= playerY + playerHeight) {
                    
                    if (orb.x >= player.x && orb.x <= player.x + playerWidth) {
                        if (orb.good) {
                            score++;
                            scoreElement.textContent = score;
                            orbs.splice(i, 1);
                            
                            // Reset timer to 5 seconds (static)
                            lastCatchTime = Date.now();
                        } else {
                            endGame('red');
                            return;
                        }
                    }
                }
            }

            drawGame();
        }

        function drawGame() {
            // Clear canvas with gradient background
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, '#87CEEB');
            gradient.addColorStop(1, '#E0F6FF');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw player zone line
            ctx.strokeStyle = 'rgba(102, 126, 234, 0.3)';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(0, playerY);
            ctx.lineTo(canvas.width, playerY);
            ctx.stroke();
            ctx.setLineDash([]);

            // Draw player (basket/platform)
            ctx.fillStyle = '#667eea';
            ctx.fillRect(player.x, playerY, playerWidth, playerHeight);
            
            // Add shine effect
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillRect(player.x, playerY, playerWidth, 5);

            // Draw orbs
            orbs.forEach(orb => {
                // Draw orb
                ctx.fillStyle = orb.good ? '#1e33f2ff' : '#fb1313ff';
                ctx.beginPath();
                ctx.arc(orb.x, orb.y, orbRadius, 0, 2 * Math.PI);
                ctx.fill();
                
                // Add glow
                ctx.strokeStyle = orb.good ? 'rgba(78, 205, 196, 0.5)' : 'rgba(255, 107, 107, 0.5)';
                ctx.lineWidth = 3;
                ctx.stroke();

                // Add shine
                ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
                ctx.beginPath();
                ctx.arc(orb.x - 4, orb.y - 4, 3, 0, 2 * Math.PI);
                ctx.fill();
            });
        }

        function endGame(reason) {
            clearInterval(gameLoop);
            clearInterval(spawnInterval);
            gameRunning = false;
            gameOverElement.classList.add('show');
            
            if (reason === 'time') {
                gameOverElement.innerHTML = '⏰ Time\'s Up! Final Score: <span id="finalScore">' + score + '</span>';
            } else {
                gameOverElement.innerHTML = '💥 Hit Red Orb! Final Score: <span id="finalScore">' + score + '</span>';
            }

            if (score > highScore) {
                highScore = score;
                highScoreElement.textContent = highScore;
                localStorage.setItem('catchOrbsHighScore', highScore);
            }
        }

        // Initial draw
        drawGame();