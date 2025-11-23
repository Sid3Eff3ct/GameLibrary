        const holidays = [
            {
                name: "New Year's Day",
                icon: "🎊",
                month: 0,  // January (0-indexed)
                day: 1
            },
            {
                name: "Valentine's Day",
                icon: "💝",
                month: 1,  // February
                day: 14
            },
            {
                name: "Easter",
                icon: "🐰",
                month: 3,  // April (approximate, changes each year)
                day: 20
            },
            {
                name: "Christmas",
                icon: "🎄",
                month: 11, // December
                day: 25
            },
            {
                name: "New Year's Eve",
                icon: "🎆",
                month: 11, // December
                day: 31
            }
        ];

        function getNextOccurrence(month, day) {
            const now = new Date();
            const currentYear = now.getFullYear();
            let targetDate = new Date(currentYear, month, day);
            
            // If the date has passed this year, get next year's date
            if (targetDate < now) {
                targetDate = new Date(currentYear + 1, month, day);
            }
            
            return targetDate;
        }

        function calculateCountdown(targetDate) {
            const now = new Date();
            const diff = targetDate - now;
            
            if (diff <= 0) {
                return null;
            }
            
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            
            return { days, hours, minutes, seconds };
        }

        function formatDate(date) {
            const options = { month: 'long', day: 'numeric', year: 'numeric' };
            return date.toLocaleDateString('en-US', options);
        }

        function createCountdownCard(holiday) {
            const targetDate = getNextOccurrence(holiday.month, holiday.day);
            const countdown = calculateCountdown(targetDate);
            
            const card = document.createElement('div');
            card.className = 'countdown-card';
            card.id = `countdown-${holiday.name.replace(/\s+/g, '-').toLowerCase()}`;
            
            if (countdown) {
                card.innerHTML = `
                    <div class="countdown-icon">${holiday.icon}</div>
                    <h2 class="countdown-title">${holiday.name}</h2>
                    <p class="countdown-date">${formatDate(targetDate)}</p>
                    <div class="countdown-display">
                        <div class="time-unit">
                            <div class="time-value" data-days>${countdown.days}</div>
                            <div class="time-label">Days</div>
                        </div>
                        <div class="time-unit">
                            <div class="time-value" data-hours>${countdown.hours}</div>
                            <div class="time-label">Hours</div>
                        </div>
                        <div class="time-unit">
                            <div class="time-value" data-minutes>${countdown.minutes}</div>
                            <div class="time-label">Minutes</div>
                        </div>
                        <div class="time-unit">
                            <div class="time-value" data-seconds>${countdown.seconds}</div>
                            <div class="time-label">Seconds</div>
                        </div>
                    </div>
                `;
            } else {
                card.innerHTML = `
                    <div class="countdown-icon">${holiday.icon}</div>
                    <h2 class="countdown-title">${holiday.name}</h2>
                    <p class="countdown-date">${formatDate(targetDate)}</p>
                    <div class="countdown-message">🎉 Today is ${holiday.name}! 🎉</div>
                `;
            }
            
            return card;
        }

        function updateCountdowns() {
            holidays.forEach(holiday => {
                const targetDate = getNextOccurrence(holiday.month, holiday.day);
                const countdown = calculateCountdown(targetDate);
                const cardId = `countdown-${holiday.name.replace(/\s+/g, '-').toLowerCase()}`;
                const card = document.getElementById(cardId);
                
                if (card && countdown) {
                    const daysEl = card.querySelector('[data-days]');
                    const hoursEl = card.querySelector('[data-hours]');
                    const minutesEl = card.querySelector('[data-minutes]');
                    const secondsEl = card.querySelector('[data-seconds]');
                    
                    if (daysEl) daysEl.textContent = countdown.days;
                    if (hoursEl) hoursEl.textContent = countdown.hours;
                    if (minutesEl) minutesEl.textContent = countdown.minutes;
                    if (secondsEl) secondsEl.textContent = countdown.seconds;
                }
            });
        }

        // Initialize
        const grid = document.getElementById('countdownGrid');
        holidays.forEach(holiday => {
            grid.appendChild(createCountdownCard(holiday));
        });

        // Update every second
        setInterval(updateCountdowns, 1000);