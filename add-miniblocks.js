const fs = require('fs');

// === МИНИБЛОКИ ДЛЯ КАРТОЧЕК ===
// Добавляет service-card-info-pill в карточки на animators.html, quests.html, masters.html

function addMiniBlocksToPage(filePath, defaultAge, defaultTime, defaultCount, pricePrefix) {
    let html = fs.readFileSync(filePath, 'utf8');
    
    // Находим все карточки с data-price и добавляем миниблок
    // Паттерн: <p class="fade-in">...</p>\n\n                <div class="service-card-buttons">
    
    const pillBlock = (price) => `
                <div class="service-card-info-pill">
                    <div class="service-card-info-pill-item"><img src="logotip/time-icon.webp" alt="Время" class="service-card-info-pill-icon" width="28" height="28"><div class="service-card-info-pill-text"><span class="service-card-info-pill-label">Длительность</span><span class="service-card-info-pill-value">${defaultTime}</span></div></div>
                    <div class="service-card-info-pill-item"><img src="logotip/age-icon.webp" alt="Возраст" class="service-card-info-pill-icon" width="28" height="28"><div class="service-card-info-pill-text"><span class="service-card-info-pill-label">Возраст</span><span class="service-card-info-pill-value">${defaultAge}</span></div></div>
                    <div class="service-card-info-pill-item"><img src="logotip/count-icon.webp" alt="Количество" class="service-card-info-pill-icon" width="28" height="28"><div class="service-card-info-pill-text"><span class="service-card-info-pill-label">Участники</span><span class="service-card-info-pill-value">${defaultCount}</span></div></div>
                    <div class="service-card-info-pill-item"><img src="logotip/price-icon.webp" alt="Стоимость" class="service-card-info-pill-icon" width="28" height="28"><div class="service-card-info-pill-text"><span class="service-card-info-pill-label">Цена</span><span class="service-card-info-pill-value">${price}</span></div></div>
                </div>`;

    // Заменяем каждую карточку: после <p class="fade-in">...</p> добавляем миниблок
    // Ищем: data-price="..." ... <p class="fade-in">...</p>\n\n                <div class="service-card-buttons">
    
    // Для каждой карточки извлекаем data-price и добавляем миниблок с этим ценником
    
    let result = html;
    let lastIndex = 0;
    
    // Находим все вхождения service-card clickable-card
    const cardRegex = /<div class="card service-card clickable-card[^>]*data-price="([^"]*)"[^>]*>/g;
    let match;
    
    while ((match = cardRegex.exec(html)) !== null) {
        const price = match[1];
        const cardStart = match.index;
        
        // Находим конец этой карточки (закрывающий </div> перед service-card-buttons)
        // Ищем <p class="fade-in">...</p> внутри этой карточки
        const afterCard = html.substring(cardStart);
        const pMatch = afterCard.match(/<p class="fade-in">([^<]*)<\/p>\s*\n\s*<div class="service-card-buttons">/);
        
        if (pMatch) {
            const pEnd = cardStart + pMatch.index + pMatch[0].indexOf('<div class="service-card-buttons">');
            const buttonsBlock = html.substring(pEnd, pEnd + '<div class="service-card-buttons">'.length);
            
            // Создаём миниблок с ценой из data-price
            const pill = pillBlock(price);
            
            // Вставляем миниблок перед service-card-buttons
            result = result.substring(0, pEnd) + pill + '\n                ' + buttonsBlock + result.substring(pEnd + buttonsBlock.length);
            
            // Сбрасываем regex для нового поиска
            cardRegex.lastIndex = pEnd + pill.length + buttonsBlock.length;
        }
    }
    
    fs.writeFileSync(filePath, result, 'utf8');
    console.log(`Updated: ${filePath}`);
}

// Аниматоры: возраст 3+, время 1 час, участники "до 10 детей"
addMiniBlocksToPage('C:\\Users\\Asus\\Desktop\\нафмини\\repo-check\\animators.html', '3+', '1 час', 'до 10 детей');

// Квесты: возраст 7+, время 1 час, участники "до 15 детей"
addMiniBlocksToPage('C:\\Users\\Asus\\Desktop\\нафмини\\repo-check\\quests.html', '7+', '1 час', 'до 15 детей');

// Мастер-классы: возраст 5+, время 1 час, участники "до 10 детей"
addMiniBlocksToPage('C:\\Users\\Asus\\Desktop\\нафмини\\repo-check\\masters.html', '5+', '1 час', 'до 10 детей');

console.log('Done!');
