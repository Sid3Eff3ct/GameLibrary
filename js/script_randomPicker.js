        const minNumInput = document.getElementById('minNum');
        const maxNumInput = document.getElementById('maxNum');
        const pickBtn = document.getElementById('pickBtn');
        const clearBtn = document.getElementById('clearBtn');
        const resultElement = document.getElementById('result');
        const errorMessage = document.getElementById('errorMessage');
        const historySection = document.getElementById('historySection');
        const historyList = document.getElementById('historyList');

        let history = [];
        let isRolling = false;

        pickBtn.addEventListener('click', pickRandomNumber);
        clearBtn.addEventListener('click', clearHistory);

        minNumInput.addEventListener('input', hideError);
        maxNumInput.addEventListener('input', hideError);

        // Allow Enter key to pick
        minNumInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') pickRandomNumber();
        });
        maxNumInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') pickRandomNumber();
        });

        function hideError() {
            errorMessage.classList.remove('show');
        }

        function pickRandomNumber() {
            if (isRolling) return;

            const min = parseInt(minNumInput.value);
            const max = parseInt(maxNumInput.value);

            // Validation
            if (isNaN(min) || isNaN(max)) {
                showError('Please enter valid numbers!');
                return;
            }

            if (min >= max) {
                showError('Maximum must be greater than minimum!');
                return;
            }

            hideError();
            isRolling = true;
            pickBtn.disabled = true;

            // Rolling animation
            resultElement.classList.add('rolling');
            let rollCount = 0;
            const rollDuration = 1500; // 1.5 seconds
            const rollInterval = 50;
            const totalRolls = rollDuration / rollInterval;

            const rollTimer = setInterval(() => {
                const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
                resultElement.textContent = randomNum;
                rollCount++;

                if (rollCount >= totalRolls) {
                    clearInterval(rollTimer);
                    finalizePick(min, max);
                }
            }, rollInterval);
        }

        function finalizePick(min, max) {
            const finalNumber = Math.floor(Math.random() * (max - min + 1)) + min;
            
            resultElement.classList.remove('rolling');
            resultElement.textContent = finalNumber;
            resultElement.classList.add('show');

            // Add to history
            history.unshift(finalNumber);
            if (history.length > 10) {
                history.pop();
            }
            updateHistory();

            isRolling = false;
            pickBtn.disabled = false;
        }

        function updateHistory() {
            if (history.length > 0) {
                historySection.style.display = 'block';
                historyList.innerHTML = '';
                history.forEach(num => {
                    const item = document.createElement('div');
                    item.className = 'history-item';
                    item.textContent = num;
                    historyList.appendChild(item);
                });
            } else {
                historySection.style.display = 'none';
            }
        }

        function clearHistory() {
            history = [];
            updateHistory();
            resultElement.classList.remove('show');
            resultElement.textContent = '?';
        }

        function showError(message) {
            errorMessage.textContent = message;
            errorMessage.classList.add('show');
        }

        // Initial setup
        resultElement.textContent = '?';