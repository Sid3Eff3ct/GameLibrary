        const numberModeBtn = document.getElementById('numberMode');
        const itemModeBtn = document.getElementById('itemMode');
        const numberSection = document.getElementById('numberSection');
        const itemSection = document.getElementById('itemSection');
        const minNumInput = document.getElementById('minNum');
        const maxNumInput = document.getElementById('maxNum');
        const itemInput = document.getElementById('itemInput');
        const addItemsBtn = document.getElementById('addItemsBtn');
        const itemsList = document.getElementById('itemsList');
        const wheel = document.getElementById('wheel');
        const spinBtn = document.getElementById('spinBtn');
        const resultDiv = document.getElementById('result');

        let currentMode = 'number';
        let items = [];
        let isSpinning = false;

        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];

        // Mode switching
        numberModeBtn.addEventListener('click', () => {
            currentMode = 'number';
            numberModeBtn.classList.add('active');
            itemModeBtn.classList.remove('active');
            numberSection.classList.remove('hidden');
            itemSection.classList.add('hidden');
            updateWheel();
        });

        itemModeBtn.addEventListener('click', () => {
            currentMode = 'item';
            itemModeBtn.classList.add('active');
            numberModeBtn.classList.remove('active');
            numberSection.classList.add('hidden');
            itemSection.classList.remove('hidden');
            updateWheel();
        });

        // Add items
        addItemsBtn.addEventListener('click', () => {
            const input = itemInput.value.trim();
            if (input) {
                const newItems = input.split(',').map(item => item.trim()).filter(item => item);
                items = [...items, ...newItems];
                itemInput.value = '';
                renderItems();
                updateWheel();
            }
        });

        function renderItems() {
            itemsList.innerHTML = '';
            items.forEach((item, index) => {
                const tag = document.createElement('div');
                tag.className = 'item-tag';
                tag.innerHTML = `
                    ${item}
                    <span class="remove" data-index="${index}">×</span>
                `;
                itemsList.appendChild(tag);
            });

            // Add remove listeners
            document.querySelectorAll('.item-tag .remove').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const index = parseInt(e.target.dataset.index);
                    items.splice(index, 1);
                    renderItems();
                    updateWheel();
                });
            });
        }

        function updateWheel() {
            wheel.innerHTML = '';
            wheel.style.transform = 'rotate(0deg)';
            
            let wheelItems = [];
            
            if (currentMode === 'number') {
                const min = parseInt(minNumInput.value) || 1;
                const max = parseInt(maxNumInput.value) || 10;
                
                if (min >= max) {
                    maxNumInput.value = min + 1;
                    return;
                }
                
                for (let i = min; i <= max; i++) {
                    wheelItems.push(i.toString());
                }
            } else {
                wheelItems = items.length > 0 ? items : ['Add items!'];
            }

            const angleStep = 360 / wheelItems.length;
            
            wheelItems.forEach((item, index) => {
                const segment = document.createElement('div');
                segment.className = 'wheel-item';
                segment.textContent = item;
                segment.style.background = colors[index % colors.length];
                segment.style.transform = `rotate(${angleStep * index}deg)`;
                segment.style.clipPath = `polygon(0 0, 100% 0, 100% 100%)`;
                wheel.appendChild(segment);
            });
        }

        function spinWheel() {
            if (isSpinning) return;
            
            let wheelItems = [];
            
            if (currentMode === 'number') {
                const min = parseInt(minNumInput.value) || 1;
                const max = parseInt(maxNumInput.value) || 10;
                for (let i = min; i <= max; i++) {
                    wheelItems.push(i.toString());
                }
            } else {
                if (items.length === 0) {
                    alert('Please add some items first!');
                    return;
                }
                wheelItems = items;
            }

            isSpinning = true;
            spinBtn.disabled = true;
            resultDiv.classList.remove('show');
            resultDiv.textContent = '';

            const spins = 5 + Math.random() * 3; // 5-8 full rotations
            const randomDegree = Math.random() * 360;
            const totalRotation = spins * 360 + randomDegree;
            
            wheel.style.transform = `rotate(${totalRotation}deg)`;

            setTimeout(() => {
                const angleStep = 360 / wheelItems.length;
                const normalizedRotation = (totalRotation % 360);
                const selectedIndex = Math.floor(((360 - normalizedRotation + (angleStep / 2)) % 360) / angleStep);
                const result = wheelItems[selectedIndex];

                resultDiv.textContent = `🎉 ${result}`;
                resultDiv.classList.add('show');
                
                isSpinning = false;
                spinBtn.disabled = false;
            }, 4000);
        }

        spinBtn.addEventListener('click', spinWheel);
        minNumInput.addEventListener('change', updateWheel);
        maxNumInput.addEventListener('change', updateWheel);

        // Initial wheel setup
        updateWheel();