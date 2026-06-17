// js/modal.js

// Переменная для отслеживания загрузки модального окна
let discountModalLoaded = false;

// Функция загрузки модального окна из отдельного файла
function loadDiscountModal() {
    if (discountModalLoaded) return; // Загружаем только один раз

    fetch('discount-modal.html')
        .then(response => {
            if (!response.ok) throw new Error('Ошибка загрузки модального окна');
            return response.text();
        })
        .then(html => {
            // Вставляем HTML в конец body
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            document.body.appendChild(tempDiv.firstElementChild);

            discountModalLoaded = true;
            openDiscountModal(); // Автоматически открываем после загрузки
        })
        .catch(error => {
            console.error('Ошибка загрузки discount-modal.html:', error);
        });
}

document.addEventListener("DOMContentLoaded", () => {
    const calcBtn = document.getElementById('openCalcModal');
    const calcModal = document.getElementById('calcModal');
    const closeCalcBtn = document.getElementById('closeCalcModal');
    const calcForm = document.getElementById('calcForm');
    const successModal = document.getElementById('successModal');
    // Фильтрация: только буквы и пробелы/дефисы
    const nameInput = document.getElementById("name");
    if (nameInput) {
        nameInput.addEventListener("input", function(e) {
            e.target.value = e.target.value.replace(/[^А-Яа-яA-Za-z\s\-]/g, "");
        });
    }
    // Фильтрация: только цифры, +, -, (, ), пробелы
    const phoneInput = document.getElementById("phone");
    if (phoneInput) {
        phoneInput.addEventListener("input", function(e) {
            e.target.value = e.target.value.replace(/[^\d\s\-\(\)\+]/g, "");
        });
    }

    // Проверка на наличие элементов (защита от ошибок)
    if (!calcBtn || !calcModal || !closeCalcBtn) return;

    // Открыть окно
    calcBtn.addEventListener('click', () => {
        calcModal.style.display = 'flex';
    });

    // Закрыть по крестику
    closeCalcBtn.addEventListener('click', () => {
        calcModal.style.display = 'none';
    });

    // Закрыть при клике на фон (вне модального окна)
    calcModal.addEventListener('click', (e) => {
        if (e.target === calcModal) {
            calcModal.style.display = 'none';
        }
    });

    // Закрыть по ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && calcModal.style.display === 'flex') {
            calcModal.style.display = 'none';
        }
    });

    // Обработка отправки формы — БЕЗ АЛЕРТА И ЗАКРЫТИЯ МОДАЛКИ
    if (calcForm) {
        calcForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Предотвращаем стандартную отправку

            const formData = new FormData(calcForm);

            try {
                const response = await fetch(calcForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: { "Accept": "application/json" } // ← Обязательно для Formspree!
                });

                if (response.ok) {
                    calcModal.style.display = 'none';
                    if (successModal) {
                        successModal.style.display = 'flex';
                    }
                } else {
                    throw new Error('Ошибка сервера: ' + response.status);
                }
            } catch (error) {
                console.error('Ошибка отправки формы:', error);
            }
        });
    }
});

// Открыть модальное окно скидки
function openDiscountModal() {
    if (!discountModalLoaded) {
        loadDiscountModal();
    } else {
        const modal = document.querySelector('.discount-modal-overlay');
        if (modal) modal.style.display = 'flex';
    }
}

// Закрыть модальное окно скидки
function closeDiscountModal() {
    const modal = document.querySelector('.discount-modal-overlay');
    if (modal) modal.style.display = 'none';
}

// Функция переключения видимости кнопки (свернуть/развернуть)
function toggleDiscountButton() {
    const wrapper = document.querySelector('.discount-toggle-wrapper');
    const fullBtn = document.getElementById('discountFullBtn');
    if (fullBtn && wrapper) {
        if (wrapper.classList.contains('collapsed')) {
            // Разворачиваем кнопку
            fullBtn.classList.remove('collapsed');
            wrapper.classList.remove('collapsed');
        } else {
            // Сворачиваем кнопку
            fullBtn.classList.add('collapsed');
            wrapper.classList.add('collapsed');
        }
    }
}

// Обработчик клика на кнопку "Скидка 5%"
document.addEventListener('click', function(e) {
    const discountBtn = document.getElementById('discountFullBtn');
    
    // Если клик по кнопке "Скидка 5%" в р��звернутом состоянии
    if (discountBtn && (e.target.id === 'discountFullBtn' || e.target.closest('#discountFullBtn'))) {
        e.preventDefault();
        
        const wrapper = document.querySelector('.discount-toggle-wrapper');
        if (wrapper && !wrapper.classList.contains('collapsed')) {
            // Если кнопка развернута - открываем модальное окно
            openDiscountModal();
        } else if (wrapper && wrapper.classList.contains('collapsed')) {
            // Если кнопка свернута - разворачиваем и открываем модальное окно
            discountBtn.classList.remove('collapsed');
            wrapper.classList.remove('collapsed');
            openDiscountModal();
        }
    }
});

// Обработчик клика на стрелочку
document.addEventListener('click', function(e) {
    const arrowBtn = document.getElementById('discountArrowBtn');
    
    if (arrowBtn && (e.target.id === 'discountArrowBtn' || e.target.closest('#discountArrowBtn'))) {
        e.preventDefault();
        
        const wrapper = document.querySelector('.discount-toggle-wrapper');
        const fullBtn = document.getElementById('discountFullBtn');
        
        if (wrapper && fullBtn) {
            // Сворачиваем кнопку (стрелочка исчезнет автоматически через CSS)
            fullBtn.classList.add('collapsed');
            wrapper.classList.add('collapsed');
        }
    }
});

// Обработчик клика на свернутую кнопку "5%" (открываем модальное окно)
document.addEventListener('click', function(e) {
    const collapsedBtn = document.querySelector('.discount-btn.collapsed');
    
    if (collapsedBtn && (e.target.classList.contains('discount-btn') && e.target.classList.contains('collapsed'))) {
        e.preventDefault();
        openDiscountModal();
        
        // Разворачиваем кнопку
        const wrapper = document.querySelector('.discount-toggle-wrapper');
        if (wrapper) {
            wrapper.classList.remove('collapsed');
        }
    }
});

// Закрытие по клику вне модального окна
document.addEventListener('click', function(e) {
    const modalOverlay = document.querySelector('.discount-modal-overlay');
    if (modalOverlay && e.target === modalOverlay) {
        closeDiscountModal();
    }
});

// Закрытие по нажатию ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeDiscountModal();
    }
});

// Закрытие по клику на крестик
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('close-discount-btn')) {
        closeDiscountModal();
    }
});
