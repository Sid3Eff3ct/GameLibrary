        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('overlay');

        function toggleMenu() {
            menuToggle.classList.toggle('active');
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
        }

        menuToggle.addEventListener('click', toggleMenu);
        overlay.addEventListener('click', toggleMenu);

        // Close menu when clicking on a non-disabled link
        const gameLinks = document.querySelectorAll('.game-list a:not(.disabled)');
        gameLinks.forEach(link => {
            link.addEventListener('click', () => {
                toggleMenu();
            });
        });

        // Add touch support for mobile
        let touchStartX = 0;
        let touchEndX = 0;

        document.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        });

        document.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });

        function handleSwipe() {
            // Swipe right to open menu
            if (touchEndX - touchStartX > 100 && touchStartX < 50) {
                if (!sidebar.classList.contains('active')) {
                    toggleMenu();
                }
            }
            // Swipe left to close menu
            if (touchStartX - touchEndX > 100 && sidebar.classList.contains('active')) {
                toggleMenu();
            }
        }

        // Prevent body scroll when menu is open on mobile
        sidebar.addEventListener('touchmove', e => {
            if (sidebar.classList.contains('active')) {
                e.stopPropagation();
            }
        }, { passive: false });