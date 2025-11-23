        const lengthSlider = document.getElementById('lengthSlider');
        const lengthValue = document.getElementById('lengthValue');
        const lowercaseCheck = document.getElementById('lowercase');
        const uppercaseCheck = document.getElementById('uppercase');
        const numbersCheck = document.getElementById('numbers');
        const specialCheck = document.getElementById('special');
        const passwordDisplay = document.getElementById('passwordDisplay');
        const generateBtn = document.getElementById('generateBtn');
        const copyBtn = document.getElementById('copyBtn');
        const errorMessage = document.getElementById('errorMessage');
        const strengthMeter = document.getElementById('strengthMeter');
        const strengthBar = document.getElementById('strengthBar');
        const strengthText = document.getElementById('strengthText');

        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
        const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';

        lengthSlider.addEventListener('input', () => {
            lengthValue.textContent = lengthSlider.value;
        });

        generateBtn.addEventListener('click', generatePassword);
        copyBtn.addEventListener('click', copyPassword);

        function generatePassword() {
            const length = parseInt(lengthSlider.value);
            let charset = '';
            let password = '';

            // Build charset based on checkboxes
            if (lowercaseCheck.checked) charset += lowercase;
            if (uppercaseCheck.checked) charset += uppercase;
            if (numbersCheck.checked) charset += numbers;
            if (specialCheck.checked) charset += special;

            // Validation
            if (charset === '') {
                showError('Please select at least one character type!');
                return;
            }

            hideError();

            // Ensure at least one of each selected type
            if (lowercaseCheck.checked) {
                password += lowercase[Math.floor(Math.random() * lowercase.length)];
            }
            if (uppercaseCheck.checked) {
                password += uppercase[Math.floor(Math.random() * uppercase.length)];
            }
            if (numbersCheck.checked) {
                password += numbers[Math.floor(Math.random() * numbers.length)];
            }
            if (specialCheck.checked) {
                password += special[Math.floor(Math.random() * special.length)];
            }

            // Fill remaining length with random characters from charset
            for (let i = password.length; i < length; i++) {
                password += charset[Math.floor(Math.random() * charset.length)];
            }

            // Shuffle the password to avoid predictable patterns
            password = password.split('').sort(() => Math.random() - 0.5).join('');

            // Display password
            passwordDisplay.textContent = password;
            passwordDisplay.classList.remove('empty');
            copyBtn.style.display = 'block';

            // Calculate and show strength
            calculateStrength(password);
        }

        function calculateStrength(password) {
            let strength = 0;
            
            if (password.length >= 8) strength++;
            if (password.length >= 12) strength++;
            if (/[a-z]/.test(password)) strength++;
            if (/[A-Z]/.test(password)) strength++;
            if (/[0-9]/.test(password)) strength++;
            if (/[^a-zA-Z0-9]/.test(password)) strength++;

            strengthMeter.style.display = 'block';
            strengthBar.className = 'strength-bar';

            if (strength <= 2) {
                strengthBar.classList.add('weak');
                strengthText.textContent = 'Weak';
            } else if (strength <= 4) {
                strengthBar.classList.add('medium');
                strengthText.textContent = 'Medium';
            } else {
                strengthBar.classList.add('strong');
                strengthText.textContent = 'Strong';
            }
        }

        function copyPassword() {
            const password = passwordDisplay.textContent;
            
            navigator.clipboard.writeText(password).then(() => {
                copyBtn.textContent = 'Copied!';
                copyBtn.classList.add('copied');
                
                setTimeout(() => {
                    copyBtn.textContent = 'Copy';
                    copyBtn.classList.remove('copied');
                }, 2000);
            }).catch(err => {
                alert('Failed to copy password');
            });
        }

        function showError(message) {
            errorMessage.textContent = message;
            errorMessage.classList.add('show');
        }

        function hideError() {
            errorMessage.classList.remove('show');
        }