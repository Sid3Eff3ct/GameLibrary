        // Game state
        let board = ['', '', '', '', '', '', '', '', ''];
        let currentPlayer = 'X';
        let gameActive = false;
        let gameMode = ''; // 'hvh' or 'hvb'
        let scores = { X: 0, O: 0, draw: 0 };

        // Winning combinations
        const winningConditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]              // Diagonals
        ];

        // DOM elements
        const modeSelection = document.getElementById('modeSelection');
        const humanVsHumanBtn = document.getElementById('humanVsHuman');
        const humanVsBotBtn = document.getElementById('humanVsBot');
        const boardElement = document.getElementById('board');
        const cells = document.querySelectorAll('.cell');
        const gameInfo = document.getElementById('gameInfo');
        const controls = document.getElementById('controls');
        const restartBtn = document.getElementById('restartBtn');
        const changeModeBtn = document.getElementById('changeModeBtn');
        const scoreBoard = document.getElementById('scoreBoard');
        const scoreXElement = document.getElementById('scoreX');
        const scoreOElement = document.getElementById('scoreO');
        const scoreDrawElement = document.getElementById('scoreDraw');

        // Event listeners
        humanVsHumanBtn.addEventListener('click', () => startGame('hvh'));
        humanVsBotBtn.addEventListener('click', () => startGame('hvb'));
        restartBtn.addEventListener('click', restartGame);
        changeModeBtn.addEventListener('click', changeMode);

        cells.forEach(cell => {
            cell.addEventListener('click', handleCellClick);
        });

        function startGame(mode) {
            gameMode = mode;
            gameActive = true;
            board = ['', '', '', '', '', '', '', '', ''];
            currentPlayer = 'X';

            modeSelection.classList.add('hidden');
            boardElement.classList.remove('hidden');
            controls.classList.remove('hidden');
            scoreBoard.classList.remove('hidden');

            updateGameInfo();
            resetBoard();
        }

        function handleCellClick(event) {
            const cell = event.target;
            const index = parseInt(cell.getAttribute('data-index'));

            if (board[index] !== '' || !gameActive) {
                return;
            }

            makeMove(index, currentPlayer);

            if (gameActive && gameMode === 'hvb' && currentPlayer === 'O') {
                // Bot's turn
                setTimeout(botMove, 500);
            }
        }

        function makeMove(index, player) {
            board[index] = player;
            cells[index].textContent = player;
            cells[index].classList.add('taken', player.toLowerCase());

            if (checkWin(player)) {
                endGame(`Player ${player} wins! 🎉`);
                highlightWinningCells(player);
                scores[player]++;
                updateScores();
            } else if (checkDraw()) {
                endGame("It's a draw! 🤝");
                scores.draw++;
                updateScores();
            } else {
                currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
                updateGameInfo();
            }
        }

        function botMove() {
            if (!gameActive) return;

            // Simple AI: Try to win, block player, or random move
            let move = findBestMove();
            makeMove(move, 'O');
        }

        function findBestMove() {
            // Try to win
            for (let condition of winningConditions) {
                const [a, b, c] = condition;
                if (board[a] === 'O' && board[b] === 'O' && board[c] === '') return c;
                if (board[a] === 'O' && board[c] === 'O' && board[b] === '') return b;
                if (board[b] === 'O' && board[c] === 'O' && board[a] === '') return a;
            }

            // Try to block
            for (let condition of winningConditions) {
                const [a, b, c] = condition;
                if (board[a] === 'X' && board[b] === 'X' && board[c] === '') return c;
                if (board[a] === 'X' && board[c] === 'X' && board[b] === '') return b;
                if (board[b] === 'X' && board[c] === 'X' && board[a] === '') return a;
            }

            // Take center if available
            if (board[4] === '') return 4;

            // Take a corner
            const corners = [0, 2, 6, 8];
            const availableCorners = corners.filter(i => board[i] === '');
            if (availableCorners.length > 0) {
                return availableCorners[Math.floor(Math.random() * availableCorners.length)];
            }

            // Take any available space
            const availableMoves = board.map((cell, index) => cell === '' ? index : null).filter(val => val !== null);
            return availableMoves[Math.floor(Math.random() * availableMoves.length)];
        }

        function checkWin(player) {
            return winningConditions.some(condition => {
                return condition.every(index => board[index] === player);
            });
        }

        function checkDraw() {
            return board.every(cell => cell !== '');
        }

        function highlightWinningCells(player) {
            for (let condition of winningConditions) {
                if (condition.every(index => board[index] === player)) {
                    condition.forEach(index => {
                        cells[index].classList.add('winner');
                    });
                    break;
                }
            }
        }

        function endGame(message) {
            gameActive = false;
            gameInfo.textContent = message;
            gameInfo.classList.add('highlight');
            setTimeout(() => gameInfo.classList.remove('highlight'), 500);
        }

        function updateGameInfo() {
            if (gameMode === 'hvh') {
                gameInfo.textContent = `Player ${currentPlayer}'s turn`;
            } else {
                gameInfo.textContent = currentPlayer === 'X' ? "Your turn (X)" : "Bot's turn (O)";
            }
        }

        function updateScores() {
            scoreXElement.textContent = scores.X;
            scoreOElement.textContent = scores.O;
            scoreDrawElement.textContent = scores.draw;
        }

        function restartGame() {
            board = ['', '', '', '', '', '', '', '', ''];
            currentPlayer = 'X';
            gameActive = true;
            resetBoard();
            updateGameInfo();
        }

        function resetBoard() {
            cells.forEach(cell => {
                cell.textContent = '';
                cell.classList.remove('taken', 'x', 'o', 'winner');
            });
        }

        function changeMode() {
            modeSelection.classList.remove('hidden');
            boardElement.classList.add('hidden');
            controls.classList.add('hidden');
            scoreBoard.classList.add('hidden');
            gameActive = false;
            gameInfo.textContent = 'Choose a game mode to start';
            scores = { X: 0, O: 0, draw: 0 };
            updateScores();
        }