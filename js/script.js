/* ============================
   ГЛАВНАЯ МОДАЛКА
============================ */

const modal = document.getElementById("modal");
const open1 = document.getElementById("openModal");
const close = document.getElementById("closeModal");

if (open1) open1.onclick = () => modal.style.display = "flex";
if (close) close.onclick = () => modal.style.display = "none";

window.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
});


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

if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData(form);

        const response = await fetch("https://formspree.io/f/mlgvggon", {
            method: "POST",
            body: formData,
            headers: { "Accept": "application/json" }
        });

        if (response.ok) {
            form.reset();
            mainModal.style.display = "none";
            successModal.style.display = "flex";
        }
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
            e.target.classList.contains("openOrder")) return;

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

if (orderForm) {
    orderForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData(orderForm);

        const response = await fetch("https://formspree.io/f/mlgvggon", {
            method: "POST",
            body: formData,
            headers: { "Accept": "application/json" }
        });

        if (response.ok) {
            orderForm.reset();
            orderModal.style.display = "none";
            successModal.style.display = "flex";
        }
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
    }, { threshold: 0.2 });

    elements.forEach(el => observer.observe(el));
});