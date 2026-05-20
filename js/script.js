const modal = document.getElementById("modal");
const open1 = document.getElementById("openModal");
const close = document.getElementById("closeModal");

if (open1) open1.onclick = () => modal.style.display = "flex";
if (close) close.onclick = () => modal.style.display = "none";

window.onclick = e => {
    if (e.target === modal) modal.style.display = "none";
};


/* ============================
   ОКНО "СПАСИБО"
============================ */

const successModal = document.getElementById("successModal");
const closeSuccess = document.getElementById("closeSuccess");

if (closeSuccess) {
    closeSuccess.onclick = () => successModal.style.display = "none";
}

window.onclick = (e) => {
    if (e.target === successModal) {
        successModal.style.display = "none";
    }
};


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

    // Открыть описание
    btnMore.onclick = (e) => {
        e.stopPropagation();

        serviceImage.src = card.dataset.image;
        serviceTitle.textContent = card.dataset.title;

        // ВАЖНО: показываем ПОЛНОЕ описание
        serviceDescription.innerHTML = card.dataset.full;

        servicePrice.textContent = card.dataset.price;

        serviceModal.style.display = "flex";
    };

    // Открыть заказ
    btnOrder.onclick = (e) => {
        e.stopPropagation();
        document.getElementById("orderProgram").value = card.dataset.title;
        orderModal.style.display = "flex";
    };

    // Клик по карточке = открыть описание
    card.onclick = (e) => {
        if (e.target.classList.contains("openService") ||
            e.target.classList.contains("openOrder")) return;

        serviceImage.src = card.dataset.image;
        serviceTitle.textContent = card.dataset.title;
        serviceDescription.innerHTML = card.dataset.full;
        servicePrice.textContent = card.dataset.price;

        serviceModal.style.display = "flex";
    };
});

// Закрытие модалки
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
};

// Открытие модалки по клику на любую кнопку с классом openModalBtn
document.querySelectorAll(".openModalBtn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.getElementById("modal").style.display = "flex";
    });
});

// Закрытие модалки
document.getElementById("closeModal").onclick = () => {
    document.getElementById("modal").style.display = "none";
};

// Закрытие модалки "Спасибо"
document.getElementById("closeSuccessBtn").onclick = () => {
    document.getElementById("successModal").style.display = "none";
};