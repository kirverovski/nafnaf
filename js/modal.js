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
    // successModal объявлен в script.js, используем его без повторного объявления
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
    const modal = document.querySelector('.discount-modal-overlay');
    if (modal) {
        modal.style.display = 'flex';
    }
}

// Закрыть модальное окно скидки и модальное окно связи
function closeDiscountModal() {
    const discountModal = document.querySelector('.discount-modal-overlay');
    const contactModal = document.querySelector('.contact-modal-overlay');
    if (discountModal) discountModal.style.display = 'none';
    if (contactModal) contactModal.style.display = 'none';
}

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

// === СКРИПТ ДЛЯ МОДАЛКИ (НАТИВНЫЕ ДАТА И ВРЕМЯ) ===

document.addEventListener("DOMContentLoaded", () => {
    const openBtn = document.getElementById('openModal');
    const mainModal = document.getElementById('modal');
    const closeBtn = document.getElementById('closeModal');
    // successModal уже объявлен выше, используем его без повторного объявления
    const closeSuccessBtn = document.getElementById('closeSuccess');
    
    // Проверка на наличие элементов
    if (!openBtn || !mainModal || !closeBtn) return;
    
    // === НАТИВНЫЕ ПОЛЯ ВВОДА ДАТЫ И ВРЕМЕНИ ===
    const dateInput = document.querySelector('#contactForm input[name="date"]');
    const timeInput = document.querySelector('#contactForm input[name="time"]');

    // На мобильных и ПК — используем нативные input type="date" и type="time"
    if (dateInput) {
        dateInput.type = "date"; // убедимся, что type="date"
        dateInput.valueAsDate = new Date(); // предвыбор текущей даты (опционально)
        
        // ДОБАВЛЕНО: клик на поле открывает календарь (имитация клика по иконке)
        dateInput.addEventListener('click', () => {
            dateInput.focus();
        });
    }

    if (timeInput) {
        timeInput.type = "time"; // убедимся, что type="time"
        // ДОБАВЛЕНО: клик на поле открывает выбор времени
        timeInput.addEventListener('click', () => {
            timeInput.focus();
        });
    }
    
    // Открыть окно по кнопке
    openBtn.addEventListener('click', () => {
        mainModal.style.display = 'flex';
    });
    
    // Закрыть по крестику
    closeBtn.addEventListener('click', () => {
        mainModal.style.display = 'none';
    });
    
    // Закрыть при клике на фон
    mainModal.addEventListener('click', (e) => {
        if (e.target === mainModal) {
            mainModal.style.display = 'none';
        }
    });
    
    // Закрыть по ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mainModal.style.display === 'flex') {
            mainModal.style.display = 'none';
        }
    });
    
    // Обработка отправки формы
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(contactForm);
            
            try {
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: { "Accept": "application/json" }
                });
                
                if (response.ok) {
                    mainModal.style.display = 'none';
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
    
    // Закрытие модалки "Спасибо" по кнопке
    if (closeSuccessBtn) {
        closeSuccessBtn.addEventListener('click', () => {
            successModal.style.display = 'none';
        });
    }
    
    successModal.addEventListener('click', (e) => {
        if (e.target === successModal) {
            successModal.style.display = 'none';
        }
    });
});

// === МОДАЛЬНОЕ ОКНО С ВИДЕО (ДЛЯ УСЛУГ) ===

const videoModal = document.getElementById('videoModal');
const videoFrame = document.getElementById('videoFrame');

// Если модалка видео ещё не создана — создадим её динамически
if (!videoModal) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = `
        <div class="video-modal-overlay" id="videoModal">
            <div class="video-modal-content">
                <button class="video-close-btn" onclick="closeVideoModal()">&times;</button>
                <div class="video-container">
                    <iframe id="videoFrame" 
                            src="" 
                            title="YouTube video player" 
                            frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen>
                    </iframe>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(tempDiv.firstElementChild);
}

// Открыть модальное окно с видео (поддержка YouTube и Rutube)
function openVideoModal(videoUrl) {
    const modal = document.getElementById('videoModal');
    const iframe = document.getElementById('videoFrame');
    
    if (!modal || !iframe) return;
    
    // Преобразование Rutube URL для embed (если передан обычный URL)
    let embedUrl = videoUrl;
    
    // Если это Rutube URL вида https://rutube.ru/shorts/VIDEO_ID/
    if (videoUrl.includes('rutube.ru/shorts/')) {
        const videoId = videoUrl.split('/shorts/')[1].split('/')[0];
        embedUrl = `https://rutube.ru/video/embed/${videoId}/`;
    }
    // Если это Rutube URL вида https://rutube.ru/video/VIDEO_ID/
    else if (videoUrl.includes('rutube.ru/video/')) {
        const videoId = videoUrl.split('/video/')[1].split('/')[0];
        embedUrl = `https://rutube.ru/video/embed/${videoId}/`;
    }
    // Если это Rutube URL вида https://rutube.ru/play/embed/VIDEO_ID/
    else if (videoUrl.includes('rutube.ru/play/embed/')) {
        embedUrl = videoUrl; // уже правильный формат
    }
    // Если это YouTube URL, оставляем как есть
    else if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
        embedUrl = videoUrl;
    }
    
    // Установить URL видео в iframe
    iframe.src = embedUrl;
    
    // Показать модалку
    modal.style.display = 'flex';
    
    // Остановить прокрутку страницы
    document.body.style.overflow = 'hidden';
}

// Закрыть модальное окно с видео
function closeVideoModal() {
    const modal = document.getElementById('videoModal');
    const iframe = document.getElementById('videoFrame');
    
    if (!modal || !iframe) return;
    
    // Остановить видео (очистить src)
    iframe.src = '';
    
    // Скрыть модалку
    modal.style.display = 'none';
    
    // Восстановить прокрутку страницы
    document.body.style.overflow = '';
}

// Закрыть по клику на фон
document.addEventListener('click', (e) => {
    const modal = document.getElementById('videoModal');
    if (modal && e.target === modal) {
        closeVideoModal();
    }
});

// Закрыть по нажатию ESC
document.addEventListener('keydown', (e) => {
    const modal = document.getElementById('videoModal');
    if (e.key === 'Escape' && modal && modal.style.display === 'flex') {
        closeVideoModal();
    }
});

// Добавляем поддержку свайпа для кнопок "Смотреть видео"
document.addEventListener("DOMContentLoaded",()=>{
    document.querySelectorAll(".watch-video-btn")
    .forEach(btn=>{
        const circle=btn.querySelector(".play-circle");
        const videoUrl=btn.dataset.video;
        let startX=0;
        let currentX=0;
        let dragging=false;
        const maxMove=btn.offsetWidth-circle.offsetWidth-0;
        function resetCircle(){
            circle.classList.remove("dragging","success");
            circle.style.transform="translateX(0)";
        }
        function openVideo(){
            circle.classList.add("success");
            openVideoModal(videoUrl);
            setTimeout(resetCircle, 500);
        }
        // обычный клик по кнопке
        btn.addEventListener("click",function(e){
            if(dragging) return;
            openVideo();
        });
        function start(clientX){
            dragging=true;
            startX=clientX;
            circle.classList.add("dragging");
        }
        function move(clientX){
            if(!dragging) return;
            currentX=clientX-startX;
            currentX=Math.max(0,Math.min(currentX,maxMove));
            circle.style.transform = `translateX(${currentX}px)`;
            // достигли конца
            if(currentX>maxMove*0.99){
                dragging=false;
                openVideo();
            }
        }
        function end(){
            if(!dragging) return;
            dragging=false;
            resetCircle();
        }
        // TOUCH
        circle.addEventListener("touchstart",e=>start(e.touches[0].clientX));
        document.addEventListener("touchmove",e=>move(e.touches[0].clientX));
        document.addEventListener("touchend",end);
        // MOUSE
        circle.addEventListener("mousedown",e=>{
            e.preventDefault();
            start(e.clientX);
        });
        document.addEventListener("mousemove",e=>move(e.clientX));
        document.addEventListener("mouseup",end);
    });
});
