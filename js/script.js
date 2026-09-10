/* ============================
   ОКНО "СПАСИБО"
============================ */

const successModal = document.getElementById("successModal");
const closeSuccess = document.getElementById("closeSuccess");
const closeSuccessBtn = document.getElementById("closeSuccessBtn");

if (closeSuccess) {
    closeSuccess.onclick = () => successModal.style.display = "none";
}
if (closeSuccessBtn) {
    closeSuccessBtn.onclick = () => successModal.style.display = "none";
}


/* ============================
   ОТПРАВКА ГЛАВНОЙ ФОРМЫ
============================ */

const form = document.getElementById("contactForm");
const mainModal = document.getElementById("modal");

if (form && !form.dataset.leadBound) {
    form.dataset.leadBound = "1"; // защита от повторной привязки обработчика
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const dataObj = Object.fromEntries(formData.entries());

        // 📨 Telegram — мгновенно, параллельно (не блокирует UI)
        sendLeadToTelegram("Форма на главной странице", dataObj);

        // 📨 Formspree — в фоне, как резервный канал (результат не ждём)
        fetch("https://formspree.io/f/mlgvggon", {
            method: "POST",
            body: formData,
            headers: { "Accept": "application/json" }
        }).then(r => console.log("Formspree:", r.ok ? "отправлено" : "ошибка " + r.status))
          .catch(err => console.error("Formspree недоступен:", err));

        // ✅ Показываем "Спасибо" сразу, не дожидаясь серверов
        form.reset();
        mainModal.style.display = "none";
        successModal.style.display = "flex";
    });
}


/* ============================
   ОТКРЫТИЕ ОПИСАНИЯ УСЛУГИ / МАСТЕР-КЛАССА
============================ */

const serviceCards = document.querySelectorAll(".service-card");
const serviceModal = document.getElementById("serviceModal");
const closeService = document.getElementById("closeService");

const serviceImage = document.getElementById("serviceImage");
const serviceTitle = document.getElementById("serviceTitle");
const serviceDescription = document.getElementById("serviceDescription");
const servicePrice = document.getElementById("servicePrice");

serviceCards.forEach(card => {
    const btnMore = card.querySelector(".openService");
    const btnOrder = card.querySelector(".openOrder");

    // Открыть описание по кнопке "Подробнее"
    if (btnMore) {
        btnMore.onclick = (e) => {
            e.stopPropagation();

            // === ГАЛЕРЕЯ (БЕЗОПАСНАЯ ВЕРСИЯ) ===
            const images = card.dataset.images
                ? card.dataset.images
                    .split(",")
                    .map(i => i.trim())
                    .filter(i => i.length > 0)
                : [card.querySelector("img").src];

            let currentIndex = 0;

            serviceImage.src = images[currentIndex];

            const thumbs = document.getElementById("thumbs");
            thumbs.innerHTML = "";

            images.forEach((img, index) => {
                const thumb = document.createElement("img");
                thumb.src = img;
                thumb.classList.add("thumb");

                if (index === 0) thumb.classList.add("active");

                thumb.onclick = () => {
                    currentIndex = index;
                    serviceImage.src = images[currentIndex];

                    document.querySelectorAll(".thumb").forEach(t => t.classList.remove("active"));
                    thumb.classList.add("active");
                };

                thumbs.appendChild(thumb);
            });

            // === ТЕКСТОВЫЕ ДАННЫЕ ===
            serviceTitle.textContent = card.dataset.title;
            serviceDescription.innerHTML = card.dataset.full;
            servicePrice.textContent = card.dataset.price;

            serviceModal.style.display = "flex";
        };
    }

    // Открыть заказ
    if (btnOrder) {
        btnOrder.onclick = (e) => {
            e.stopPropagation();
            document.getElementById("orderProgram").value = card.dataset.title;
            orderModal.style.display = "flex";
        };
    }

    // Клик по карточке = открыть описание
    card.onclick = (e) => {
        if (e.target.classList.contains("openService") ||
            e.target.classList.contains("openOrder") ||
            e.target.classList.contains("watch-video-btn") ||
            e.target.closest('.watch-video-btn')) return;

        // === ГАЛЕРЕЯ (БЕЗОПАСНАЯ ВЕРСИЯ) ===
        const images = card.dataset.images
            ? card.dataset.images.split(",").map(i => i.trim())
            : [card.querySelector("img").src];

        let currentIndex = 0;

        serviceImage.src = images[currentIndex];

        const thumbs = document.getElementById("thumbs");
        thumbs.innerHTML = "";

        images.forEach((img, index) => {
            const thumb = document.createElement("img");
            thumb.src = img;
            thumb.classList.add("thumb");

            if (index === 0) thumb.classList.add("active");

            thumb.onclick = () => {
                currentIndex = index;
                serviceImage.src = images[currentIndex];

                document.querySelectorAll(".thumb").forEach(t => t.classList.remove("active"));
                thumb.classList.add("active");
            };

            thumbs.appendChild(thumb);
        });

        // === ТЕКСТОВЫЕ ДАННЫЕ ===
        serviceTitle.textContent = card.dataset.title;
        serviceDescription.innerHTML = card.dataset.full;
        servicePrice.textContent = card.dataset.price;

        serviceModal.style.display = "flex";
    };
});

if (closeService) {
    closeService.onclick = () => serviceModal.style.display = "none";
}

window.addEventListener("click", (e) => {
    if (e.target === serviceModal) {
        serviceModal.style.display = "none";
    }
});


/* ============================
   ОТКРЫТИЕ ФОРМЫ ИЗ ОПИСАНИЯ
============================ */

const orderFromService = document.getElementById("orderFromService");
const orderModal = document.getElementById("orderModal");
const closeOrder = document.getElementById("closeOrder");

if (orderFromService) {
    orderFromService.onclick = () => {
        document.getElementById("orderProgram").value = serviceTitle.textContent;
        serviceModal.style.display = "none";
        orderModal.style.display = "flex";
    };
}

if (closeOrder) {
    closeOrder.onclick = () => orderModal.style.display = "none";
}


/* ============================
   ОТПРАВКА ФОРМЫ ЗАКАЗА ПРОГРАММЫ
============================ */

const orderForm = document.getElementById("orderForm");

if (orderForm && !orderForm.dataset.leadBound) {
    orderForm.dataset.leadBound = "1"; // защита от повторной привязки обработчика
    orderForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const formData = new FormData(orderForm);
        const dataObj = Object.fromEntries(formData.entries());

        // 📨 Telegram — мгновенно, параллельно (не блокирует UI)
        sendLeadToTelegram("Заказ программы", dataObj);

        // 📨 Formspree — в фоне, как резервный канал (результат не ждём)
        fetch("https://formspree.io/f/mlgvggon", {
            method: "POST",
            body: formData,
            headers: { "Accept": "application/json" }
        }).then(r => console.log("Formspree:", r.ok ? "отправлено" : "ошибка " + r.status))
          .catch(err => console.error("Formspree недоступен:", err));

        // ✅ Показываем "Спасибо" сразу, не дожидаясь серверов
        orderForm.reset();
        orderModal.style.display = "none";
        successModal.style.display = "flex";
    });
}


/* ============================
   ОТКРЫТИЕ МОДАЛКИ ПО КНОПКАМ .openModalBtn
============================ */

document.querySelectorAll(".openModalBtn").forEach(btn => {
    btn.addEventListener("click", () => {
        if (modal) modal.style.display = "flex";
    });
});

// === АНИМАЦИИ ПРИ ПРОКРУТКЕ ===

document.addEventListener("DOMContentLoaded", () => {
    const elements = document.querySelectorAll(".reveal, .fade-in, .scale-in");

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
            }
        });
    }, { 
        threshold: 0.05,        // ← сработает при 10% видимости (было 0.2)
        rootMargin: "50px 0px 50px 0px"  // ← анимация начнется за 50px до входа в экран
    });

    elements.forEach(el => observer.observe(el));
});

// === ПОХОЖАЯ КНОПКА ВВЕРХ ===
const scrollToTopBtn = document.createElement('button');
scrollToTopBtn.className = 'scroll-to-top';
document.body.appendChild(scrollToTopBtn);

let isScrolled = false;

window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        scrollToTopBtn.classList.add('visible');
        isScrolled = true;
    } else {
        scrollToTopBtn.classList.remove('visible');
        isScrolled = false;
    }
});

scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// === СКРЫТИЕ ШАПКИ ПРИ СКРОЛЛЕ ВНИЗ / КОМПАКТНАЯ ШАПКА ПРИ СКРОЛЛЕ ВВЕРХ ===
const siteHeader = document.querySelector('.header');
const desktopMQ = window.matchMedia('(min-width: 769px)');
let lastScrollY = window.scrollY || 0;
const headerHideThreshold = 60;

// Высота фиксированной шапки -> отступ для body, чтобы контент не прятался под ней
function syncHeaderOffset() {
    if (!siteHeader) return;
    // В компактном режиме высота другая — не трогаем отступ, чтобы контент не прыгал
    if (desktopMQ.matches && !siteHeader.classList.contains('header-compact')) {
        document.documentElement.style.setProperty('--header-h', siteHeader.offsetHeight + 'px');
    }
}

// Внедряем текстовый логотип (виден только в компактном режиме при скролле)
if (siteHeader) {
    const logoBox = siteHeader.querySelector('.logo');
    if (logoBox && !logoBox.querySelector('.logo-text')) {
        const logoText = document.createElement('span');
        logoText.className = 'logo-text';
        logoText.innerHTML = 'NAFNAFIKI <span>SOCHI</span>';
        logoBox.appendChild(logoText);
    }

    // Мобильная версия логотипа: на экранах <=768px показываем logo-bannermob.webp
    const logoImg = siteHeader.querySelector('.logo .logo-video');
    if (logoImg) {
        const desktopLogoSrc = logoImg.getAttribute('src'); // images/logo-banner.webp
        const mobileLogoSrc = 'images/logo-bannermob.webp';
        const syncLogoSrc = () => {
            const wanted = desktopMQ.matches ? desktopLogoSrc : mobileLogoSrc;
            if (logoImg.getAttribute('src') !== wanted) {
                logoImg.setAttribute('src', wanted);
            }
        };
        syncLogoSrc();
        if (desktopMQ.addEventListener) {
            desktopMQ.addEventListener('change', syncLogoSrc);
        } else {
            desktopMQ.addListener(syncLogoSrc); // старые браузеры
        }
    }

    window.addEventListener('scroll', function onScroll() {
        // Только на десктопе
        if (!desktopMQ.matches) {
            siteHeader.classList.remove('header-hidden');
            siteHeader.classList.remove('header-compact');
            return;
        }

        const currentY = window.scrollY || window.pageYOffset || 0;

        if (currentY > headerHideThreshold && currentY > lastScrollY + 5) {
            // Прокрутка вниз — прячем шапку
            siteHeader.classList.add('header-hidden');
        } else if (currentY <= headerHideThreshold || currentY < lastScrollY - 5) {
            // Вернулись к верху или прокрутка вверх — показываем шапку
            siteHeader.classList.remove('header-hidden');
        }

        // Компактный режим: текстовый логотип вместо видео + узкая полоса + полупрозрачный фон
        if (currentY > headerHideThreshold) {
            siteHeader.classList.add('header-compact');
        } else {
            siteHeader.classList.remove('header-compact');
        }

        lastScrollY = currentY;
    }, { passive: true });

    // Пересчёт высоты шапки
    window.addEventListener('load', syncHeaderOffset);
    window.addEventListener('resize', syncHeaderOffset);
    syncHeaderOffset();
}

// === Мега-меню «Наши услуги» (поведение как «Все услуги» на bananashow.ru, открывается по клику) ===
const navDropdowns = document.querySelectorAll('.nav-dropdown');
if (siteHeader && navDropdowns.length) {
    const closeAllDropdowns = () => {
        navDropdowns.forEach(dd => dd.classList.remove('nav-open'));
    };

    navDropdowns.forEach(dd => {
        const menu = dd.querySelector('.nav-dropdown-menu');
        const toggle = dd.querySelector('.nav-dropdown-toggle');
        if (!menu) return;

        const openDropdown = () => {
            // Панель фиксирована на всю ширину экрана и всегда начинается ровно под шапкой
            // (учитывает и обычный, и компактный режим шапки)
            if (desktopMQ.matches) {
                menu.style.top = siteHeader.offsetHeight + 'px';
                document.body.classList.remove('mega-closed');
                closeAllDropdowns();
                dd.classList.add('nav-open');
            }
        };

        // Открытие по клику на кнопку «Наши услуги»
        if (toggle) {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (desktopMQ.matches) {
                    if (dd.classList.contains('nav-open')) {
                        closeAllDropdowns();
                    } else {
                        openDropdown();
                    }
                } else {
                    // Мобильная версия: «Наши услуги» — свёрнутый аккордеон
                    const wasOpen = dd.classList.contains('mobile-open');
                    navDropdowns.forEach(other => other.classList.remove('mobile-open'));
                    if (!wasOpen) dd.classList.add('mobile-open');
                }
            });
        }

        // На всякий случай: если меню открыто, держим панель под актуальной шапкой
        dd.addEventListener('mouseenter', () => {
            if (desktopMQ.matches && dd.classList.contains('nav-open')) {
                menu.style.top = siteHeader.offsetHeight + 'px';
            }
        });
    });

    // Закрытие по клику вне меню
    document.addEventListener('click', (e) => {
        if (!desktopMQ.matches) return;
        if (!e.target.closest('.nav-dropdown')) closeAllDropdowns();
    });

    // Закрытие по ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && desktopMQ.matches) closeAllDropdowns();
    });

    // При прокрутке страницы мега-меню закрывается
    window.addEventListener('scroll', () => {
        if (desktopMQ.matches) {
            closeAllDropdowns();
            document.body.classList.add('mega-closed');
        }
    }, { passive: true });
}

// ✅ ОТСЛЕЖИВАНИЕ КЛИКОВ ПО КНОПКАМ КОНТАКТОВ (УЛУЧШЕННОЕ)
const contactIcons = document.querySelectorAll("a.contact-icon");
contactIcons.forEach(link => {
    link.addEventListener("click", function () {
        const href = this.getAttribute("href") || "";
        const classList = this.classList;

        // 🔍 Более надёжное определение типа (приоритет по href, затем по классам)
        let contactType;
        if (href.startsWith("tel:")) contactType = "tel";
        else if (href.startsWith("sms:")) contactType = "sms";
        else if (classList.contains("tg")) contactType = "tg";
        else if (classList.contains("wa")) contactType = "wa";
        else if (classList.contains("insta")) contactType = "insta";
        else if (classList.contains("max")) contactType = "max";
        else contactType = "unknown";

        const contactLabel = this.querySelector("img")?.getAttribute("alt") || "Unknown";
        const timestamp = new Date().toISOString();
        const timestampUnix = Date.now();

        if (window.ym) {
            // 📌 1. Общая цель — все клики
            ym(109547647, "reachGoal", "CONTACT_CLICK", {
                contactType,
                contactHref: href,
                contactLabel,
                clickTimeISO: timestamp,
                clickTimeUnix: timestampUnix
            });

            // 🎯 2. Отдельные цели по типу (для детального отчёта)
            const goalMap = {
                tel: "CONTACT_TEL",
                sms: "CONTACT_SMS",
                tg: "CONTACT_TELEGRAM",
                wa: "CONTACT_WHATSAPP",
                insta: "CONTACT_INSTAGRAM",
                max: "CONTACT_MAX"
            };

            const specificGoal = goalMap[contactType] || "CONTACT_UNKNOWN";
            ym(109547647, "reachGoal", specificGoal, {
                clickTimeISO: timestamp,
                clickTimeUnix: timestampUnix
            });
        }

        // 📨 3. ОТПРАВКА УВЕДОМЛЕНИЙ В TELEGRAM ПРИ КЛИКЕ
        const message = `📱 Новый клик по контакту!\n\n` +
                       `Тип: ${contactType === "tg" ? "Telegram" : contactType === "wa" ? "WhatsApp" : contactType === "tel" ? "Телефон" : contactType === "insta" ? "Instagram" : contactType === "max" ? "Max" : contactType === "sms" ? "SMS" : "Неизвестно"}\n` +
                       `Кнопка: ${contactLabel}\n` +
                       `Время: ${new Date(timestamp).toLocaleString("ru-RU", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}`;

        fetch(`https://api.telegram.org/bot8874031205:AAHDnit6ADRfOkTuLjJuO6Qx-iRFQ66Bk04/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: "6532150168",
                text: message
            })
        }).then(response => {
            if (response.ok) {
                console.log("✅ Уведомление о клике отправлено в Telegram");
            } else {
                response.text().then(body => console.error("❌ Ошибка клика:", response.status, body));
            }
        }).catch(error => {
            console.error("❌ Ошибка отправки клика:", error);
        });
    });
});

// 📨 ФУНКЦИЯ ОТПРАВКИ УВЕДОМЛЕНИЙ О ЦЕЛЯХ
function sendGoalNotification(goalName, goalData = {}) {
    const message = `🎯 Цель достигнута: ${goalName}!\n\n` +
                   `Время: ${new Date().toLocaleString("ru-RU", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}`;

    fetch(`https://api.telegram.org/bot8874031205:AAHDnit6ADRfOkTuLjJuO6Qx-iRFQ66Bk04/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            chat_id: "6532150168",
            text: message
        })
    }).then(response => {
        if (response.ok) {
            console.log("✅ Уведомление о цели отправлено в Telegram");
        } else {
            response.text().then(body => console.error("❌ Ошибка отправки:", response.status, body));
        }
    }).catch(error => {
        console.error("❌ Ошибка отправки:", error);
    });
}

// 📨 ОТПРАВКА ЗАЯВКИ В TELEGRAM (полные данные заявки)
// Тот же бот, что и для уведомлений. Отправляется параллельно с Formspree.
const TG_BOT_TOKEN = "8874031205:AAHDnit6ADRfOkTuLjJuO6Qx-iRFQ66Bk04";
const TG_CHAT_ID = "6532150168";

const TG_FIELD_LABELS = {
    name: "Имя",
    phone: "Телефон",
    program: "Программа",
    program_other: "Свой вариант программы",
    event_type: "Тип события",
    date: "Дата",
    time: "Время",
    address: "Адрес",
    parking: "Парковка",
    place_type: "Место проведения",
    birthday_child: "Именинник",
    guests: "Гости",
    photo: "Фотограф",
    decor: "Декор",
    budget: "Бюджет",
    extra: "Пожелания",
    message: "Сообщение",
    comment: "Комментарий"
};

function sendLeadToTelegram(source, data = {}) {
    const fields = Object.entries(data)
        .filter(([, v]) => v !== null && v !== undefined && String(v).trim() !== "" && v !== "_")
        .map(([k, v]) => `• ${TG_FIELD_LABELS[k] || k}: ${v}`)
        .join("\n");

    // ВАЖНО: без parse_mode Markdown — символы _ * ( ) в данных пользователя
    // ломали разметку, и Telegram возвращал ошибку 400 (уведомление не приходило).
    const message = `🎉 Новая заявка с сайта!\n` +
                    `📍 Источник: ${source}\n\n` +
                    (fields ? fields + "\n\n" : "") +
                    `🕓 Время: ${new Date().toLocaleString("ru-RU", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}`;

    fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            chat_id: TG_CHAT_ID,
            text: message
        })
    }).then(response => {
        if (response.ok) {
            console.log("✅ Заявка отправлена в Telegram");
        } else {
            // Показываем тело ошибки Telegram, чтобы причина была видна в консоли
            response.text().then(body => {
                console.error("❌ Telegram вернул ошибку:", response.status, body);
            }).catch(() => {
                console.error("❌ Telegram вернул ошибку:", response.status);
            });
        }
    }).catch(error => {
        console.error("❌ Ошибка отправки заявки в Telegram:", error);
    });
}

/* ===========================
   МОДАЛКА ЗАКАЗА ПАКЕТА
=========================== */

document.addEventListener("DOMContentLoaded", () => {
    const packageModal = document.getElementById("packageModal");
    const closePackageModal = document.getElementById("closePackageModal");
    const packageSelect = document.getElementById("packageSelect");
    const showProgramField = document.getElementById("showProgramField");
    const showProgramSelect = document.getElementById("showProgramSelect");
    const packageForm = document.getElementById("packageForm");
    const packageBtns = document.querySelectorAll(".package-btn");

    // Открыть модалку при клике на кнопку "Заказать" в пакетах
    packageBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const card = btn.closest(".package-card");
            const packageName = card.querySelector(".package-title").textContent.trim();
            
            // Установить выбранный пакет в селект
            if (packageSelect) {
                for (let i = 0; i < packageSelect.options.length; i++) {
                    if (packageSelect.options[i].value === packageName) {
                        packageSelect.selectedIndex = i;
                        break;
                    }
                }
                // Показать/скрыть поле шоу-программы
                updateShowProgramField();
            }
            
            packageModal.style.display = "flex";
        });
    });

    // Показать/скрыть поле шоу-программы в зависимости от выбранного пакета
    function updateShowProgramField() {
        const selected = packageSelect.value;
        if (selected === "Супер" || selected === "Мега Пати") {
            showProgramField.style.display = "block";
        } else {
            showProgramField.style.display = "none";
            showProgramSelect.value = "";
        }
    }

    if (packageSelect) {
        packageSelect.addEventListener("change", updateShowProgramField);
    }

    // Закрыть модалку по крестику
    if (closePackageModal) {
        closePackageModal.addEventListener("click", () => {
            packageModal.style.display = "none";
        });
    }

    // Закрыть при клике на фон
    if (packageModal) {
        packageModal.addEventListener("click", (e) => {
            if (e.target === packageModal) {
                packageModal.style.display = "none";
            }
        });
    }

    // Закрыть по ESC
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && packageModal && packageModal.style.display === "flex") {
            packageModal.style.display = "none";
        }
    });

    // Обработка отправки формы пакета
    if (packageForm && !packageForm.dataset.leadBound) {
        packageForm.dataset.leadBound = "1";
        packageForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const formData = new FormData(packageForm);
            const dataObj = Object.fromEntries(formData.entries());

            // 📨 Отправка в Telegram
            if (typeof sendLeadToTelegram === "function") {
                sendLeadToTelegram("Заказ пакетного предложения", dataObj);
            }

            // 📨 Formspree — резервный канал
            fetch("https://formspree.io/f/mlgvggon", {
                method: "POST",
                body: formData,
                headers: { "Accept": "application/json" }
            }).then(r => console.log("Formspree:", r.ok ? "отправлено" : "ошибка " + r.status))
              .catch(err => console.error("Formspree недоступен:", err));

            // ✅ Показываем "Спасибо"
            packageForm.reset();
            showProgramField.style.display = "none";
            packageModal.style.display = "none";
            const successModal = document.getElementById("successModal");
            if (successModal) successModal.style.display = "flex";
        });
    }
});
