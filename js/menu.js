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
    
    // Инициализация кнопки чата
    const chatBtnMobile = document.getElementById('naf-chat-btn-mobile');
    
    if (chatBtnMobile) {
        chatBtnMobile.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const chat = document.getElementById('naf-chat');
            if (chat) {
                if (chat.style.display === 'flex') {
                    chat.style.display = 'none';
                } else {
                    chat.style.display = 'flex';
                    setTimeout(() => {
                        chat.scrollIntoView({ behavior: 'smooth', block: 'end' });
                    }, 100);
                }
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

// Инициализация кнопок ПК-меню
const chatBtnPC = document.getElementById('naf-chat-btn-pc');

if (chatBtnPC) {
    chatBtnPC.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const chat = document.getElementById('naf-chat');
        if (chat) {
            if (chat.style.display === 'flex') {
                chat.style.display = 'none';
            } else {
                chat.style.display = 'flex';
                setTimeout(() => {
                    chat.scrollIntoView({ behavior: 'smooth', block: 'end' });
                }, 100);
            }
        }
    });
}

const contactsBtnPC = document.querySelector('.drn-btn.contacts-btn');
const contactModal = document.querySelector('.contact-modal-overlay');

if (contactsBtnPC && contactModal) {
    contactsBtnPC.addEventListener('click', (e) => {
        e.stopPropagation();
        contactModal.style.display = 'flex';
    });
}