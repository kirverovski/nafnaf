// === МОБИЛЬНОЕ НИЖНЕЕ МЕНЮ ===

document.addEventListener('DOMContentLoaded', () => {
    // Инициализация кнопки меню (гамбургера)
    const menuBtn = document.querySelector('.mbn-btn.menu-btn');
    
    if (menuBtn) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Переключить класс активности кнопки
            menuBtn.classList.toggle('active');
            
            // Открыть/закрыть меню
            const nav = document.querySelector('.header .nav');
            if (nav) {
                nav.classList.toggle('mobile-menu-open');
            }
        });
        
        // Закрыть меню при клике на ссылку
        const nav = document.querySelector('.header .nav');
        if (nav) {
            nav.querySelectorAll('a').forEach(link => {
                // Кнопка «Наши услуги» на мобильных только раскрывает подменю — меню не закрываем
                if (link.classList.contains('nav-dropdown-toggle')) return;
                link.addEventListener('click', () => {
                    menuBtn.classList.remove('active');
                    nav.classList.remove('mobile-menu-open');
                });
            });
        }
        
        // Закрыть меню при клике вне области
        document.addEventListener('click', (e) => {
            const nav = document.querySelector('.header .nav');
            const menuBtnRef = document.querySelector('.mbn-btn.menu-btn');
            if (nav && menuBtnRef && !nav.contains(e.target) && !menuBtnRef.contains(e.target)) {
                menuBtn.classList.remove('active');
                nav.classList.remove('mobile-menu-open');
            }
        });
    }
    
    // Инициализация кнопки контактов
    const contactsBtn = document.querySelector('.mbn-btn.contacts-btn');
    const contactModal = document.querySelector('.contact-modal-overlay');
    
    if (contactsBtn && contactModal) {
        contactsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            contactModal.style.display = 'flex';
        });
    }
});

    // Декстопное меню: Контакты и Скидки
    document.querySelectorAll('.nav-contacts-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const cm = document.querySelector('.contact-modal-overlay');
            if (cm) cm.style.display = 'flex';
        });
    });
