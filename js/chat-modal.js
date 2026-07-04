// =====================
// КОНФИГУРАЦИЯ ЧАТА
// =====================
const API_KEY = "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";
const MODEL = "openai/gpt-oss-20b:free";
const SYSTEM_PROMPT = `
Ты менеджер праздничного агентства NafNafiki.
ПРАВИЛА:
1. Никогда не придумывай программы и услуги.
2. Используй ТОЛЬКО информацию из базы знаний.
3. Если пользователь спрашивает услугу которой нет:
- честно скажи что сейчас её нет
- предложи похожие варианты
4. Если пользователь спрашивает подбор:
НЕ предлагай только один вариант.
Подбирай:
- минимум 3 варианта
Подбирай варианты по:
- возрасту
- интересам
- бюджету
- количеству гостей
Для каждого варианта выводи:
Название:
Краткое описание:
Цена:
Почему подходит:
Пример:
1. Гарри Поттер и Гермиона
Описание:
магия, квесты и атмосфера Хогвартса
Цена:
от 4500 ₽
Почему подходит:
детям 8–12 лет нравится формат приключений
2. Если пользователь хочет подробнее о программе:
НЕ отвечай коротко.
Показывай:
Название:
Описание:
Активности:
Стоимость:
Для какого возраста подходит:
3. Если пользователь пишет:
"что есть?"
"какие варианты?"
"что можете предложить?"
Показывай список вариантов, а не одну программу.
4. Если информации не хватает:
спрашивай постепенно:
- возраст ребёнка
- количество гостей
- бюджет
- дату
Не задавай все вопросы сразу.
5. Общайся как живой менеджер:
дружелюбно и короткими сообщениями.
6.Если подходит несколько программ — обязательно показывай 3 варианта, а не один, если подходящих вариантов больше, то сообщи об этом пользователю и предложи показать другие.
7.Используй ссылки из базы знаний.
Если рекомендуешь программу:
вместо:
Пираты
пиши:
<a href="#pirates">Пираты</a>
Если подходит несколько программ — показывай 3–5 вариантов.
`;

// =====================
// СОЗДАНИЕ CSS СТИЛЕЙ
// =====================
const chatStyle = document.createElement("style");
chatStyle.innerHTML = `
#naf-chat-btn{
position:fixed;
bottom:20px;
right:20px;
width:60px;
height:60px;
border-radius:50%;
border:none;
font-size:28px;
cursor:pointer;
z-index:999999;
background:linear-gradient(135deg, #d4af37 0%, #b8962e 100%);
color:#0a0a0a;
box-shadow:0 4px 20px rgba(212, 175, 55, 0.4), 0 0 15px rgba(212, 175, 55, 0.2);
transition:all 0.3s ease;
}
#naf-chat-btn:hover{
transform:scale(1.05);
box-shadow:0 6px 25px rgba(212, 175, 55, 0.5), 0 0 20px rgba(212, 175, 55, 0.3);
}
#naf-chat-btn:active{
transform:scale(0.95);
}
#naf-chat-modal{
position:fixed;
bottom:90px;
right:20px;
width:350px;
height:500px;
background:#0a0a0a;
border-radius:25px !important;
overflow:visible;
display:none;
flex-direction:column;
z-index:999999;
box-shadow:0 5px 30px rgba(0,0,0,0.5), 0 0 20px rgba(212, 175, 55, 0.15);
border:1px solid #d4af37;
}

#chatHeader{
background:linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
color:#d4af37;
padding:12px 15px;
border-bottom:2px solid #d4af37;
display:flex;
justify-content:space-between;
align-items:center;
position:relative;
overflow:visible;
border-top-left-radius:25px;
border-top-right-radius:25px;
}

#chatHeader::after{
content:"";
position:absolute;
bottom:-2px;
left:0;
width:100%;
height:2px;
background:linear-gradient(90deg, transparent, #d4af37, transparent);
}

#chatTitle{
flex:1;
text-align:center;
margin:0;
padding:0 15px;
font-weight:bold;
font-size:14px;
white-space:nowrap;
overflow:hidden;
text-overflow:ellipsis;
}

#newChatBtn{
border:1px solid #d4af37;
padding:6px 12px;
border-radius:8px;
cursor:pointer;
font-size:12px;
font-weight:600;
background:transparent;
color:#d4af37;
transition:all 0.3s ease;
white-space:nowrap;
}
#newChatBtn:hover{
background:linear-gradient(135deg, #d4af37 0%, #b8962e 100%);
color:#0a0a0a;
box-shadow:0 3px 10px rgba(212, 175, 55, 0.3);
}

/* Крестик закрытия чата */
.close-chat-btn{
position:relative;
width:40px;
height:40px;
background:rgba(212, 175, 55, 0.15);
border:2px solid #d4af37;
border-radius:8px;
font-size:32px;
line-height:36px;
text-align:center;
cursor:pointer;
padding:0 0 0 15px;
margin-left:auto;
box-shadow:none;
transition:all 0.3s ease;
font-weight:bold;
color:#d4af37;
}

.close-chat-btn:hover{
background:rgba(212, 175, 55, 0.25);
color:#ffd700;
transform:none;
box-shadow:0 0 10px rgba(212, 175, 55, 0.3);
}

.close-chat-btn:active{
transform:none;
}

/* Убираем золотистую кнопку с эмодзи */
#naf-chat-btn{
display:none !important;
}

/* Для мобильной версии */
@media(max-width:600px){
#naf-chat-btn{
display:none !important;
}
}

#naf-messages{
flex:1;
overflow-y:auto;
padding:15px;
background:linear-gradient(180deg, #0a0a0a 0%, #121212 100%);
}

.naf-msg{
margin-bottom:12px;
padding:12px 15px;
border-radius:14px;
max-width:80%;
word-wrap:break-word;
line-height:1.5;
font-size:14px;
}
.naf-msg a {
background:linear-gradient(135deg, #d4af37 0%, #b8962e 100%);
color:#0a0a0a;
padding:5px 10px;
border-radius:8px;
text-decoration:none;
font-weight:600;
display:inline-block;
margin-top:5px;
transition:all 0.3s ease;
}
.naf-msg a:hover {
box-shadow:0 0 10px rgba(212, 175, 55, 0.4);
transform:translateY(-2px);
}

.card.clickable-card:hover {
  box-shadow: 0 0 0 4px rgba(212, 175, 55, 0.25);
  transition: box-shadow 0.3s;
}
.card.clickable-card:active {
  transform: scale(0.99);
}

.user{
margin-left:auto;
background:linear-gradient(135deg, #d4af37 0%, #b8962e 100%);
color:#0a0a0a;
border:1px solid #c5a028;
box-shadow:0 3px 10px rgba(212, 175, 55, 0.3);
}

.bot{
background:linear-gradient(135deg, #1a1a1a 0%, #252525 100%);
color:#e0e0e0;
border:1px solid #d4af37;
box-shadow:0 3px 10px rgba(0,0,0,0.3);
}

#naf-bottom{
display:flex;
padding:15px;
gap:10px;
background:#0a0a0a;
border-top:1px solid #d4af37;
border-bottom-left-radius:25px;
border-bottom-right-radius:25px;
}
#naf-input{
flex:1;
padding:12px 15px;
border-radius:12px;
border:1px solid #d4af37;
background:#1a1a1a;
color:#e0e0e0;
font-size:14px;
transition:all 0.3s ease;
}
#naf-input:focus{
outline:none;
box-shadow:0 0 10px rgba(212, 175, 55, 0.3);
border-color:#c5a028;
}

#naf-send{
padding:12px 20px;
border:none;
background:linear-gradient(135deg, #d4af37 0%, #b8962e 100%);
color:#0a0a0a;
border-radius:12px;
cursor:pointer;
font-weight:bold;
transition:all 0.3s ease;
box-shadow:0 3px 10px rgba(212, 175, 55, 0.3);
}
#naf-send:hover{
box-shadow:0 5px 15px rgba(212, 175, 55, 0.4);
transform:translateY(-2px);
}
#naf-send:active{
transform:translateY(0);
}

.typing-indicator {
  display: inline-flex;
  align-items: center;
  font-style: italic;
  color: #d4af37;
  font-size: 13px;
}

.typing-dot {
  width: 5px;
  height: 5px;
  background-color: #d4af37;
  border-radius: 50%;
  margin: 0 2px;
  opacity: 0.3;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-dot:nth-child(1) { animation-delay: -0.32s; }
.typing-dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes typing {
  0%, 80%, 100% { transform: scale(0); opacity: 0.3; }
  40% { transform: scale(1); opacity: 1; }
}

/* Адаптация для мобильных устройств */
@media(max-width:600px){
#naf-chat-modal{
right:0;
bottom:0;
width:100%;
height:100%;
border-radius:0;
border:none;
}

/* Перемещаем крестик в один ряд с заголовком и кнопкой нового чата */
#chatHeader{
justify-content:space-between;
align-items:center;
}

.close-chat-btn{
position:static;
width:auto;
height:auto;
background:transparent;
border:none;
font-size:28px;
line-height:1;
text-align:left;
cursor:pointer;
padding:0 10px 0 0;
margin:0;
box-shadow:none;
}

.close-chat-btn:hover{
background:transparent;
color:#d4af37;
transform:none;
box-shadow:none;
}

#chatTitle{
flex:none;
text-align:left;
font-size:16px;
white-space:nowrap;
overflow:hidden;
text-overflow:ellipsis;
}

#newChatBtn{
flex:none;
padding:6px 10px;
font-size:13px;
white-space:nowrap;
}
}
`;

document.head.appendChild(chatStyle);

// =====================
// ПЕРЕМЕННЫЕ
// =====================
let chat = null;
let history = [];

// =====================
// ЗАГРУЗКА HTML ЧАТА
// =====================
async function loadChatHTML() {
  try {
    const response = await fetch('js/chat-modal.html');
    if (!response.ok) throw new Error('Failed to load chat HTML');
    const html = await response.text();
    
    // Вставляем HTML в конец body
    document.body.insertAdjacentHTML('beforeend', html);
    chat = document.getElementById('naf-chat-modal');
    
    // Инициализируем элементы после загрузки HTML
    initChatElements();
  } catch (error) {
    console.error('Ошибка загрузки чата:', error);
    // Если не удалось загрузить HTML, используем встроенную разметку
    initChatWithoutExternalHTML();
  }
}

// =====================
// ИНИЦИАЛИЗАЦИЯ ЭЛЕМЕНТОВ
// =====================
function initChatElements() {
  if (!chat) return;

  // Кнопка открытия чата (десктоп)
  const chatBtn = document.getElementById('naf-chat-btn');
  if (chatBtn) {
    chatBtn.onclick = () => {
      chat.style.display = chat.style.display === 'flex' ? 'none' : 'flex';
      if (chat.style.display === 'flex') {
        scrollToBottom();
      }
    };
  }

  // Кнопка открытия чата (мобильная)
  const chatBtnMobile = document.getElementById('naf-chat-btn-mobile');
  if (chatBtnMobile) {
    chatBtnMobile.onclick = () => {
      chat.style.display = chat.style.display === 'flex' ? 'none' : 'flex';
      if (chat.style.display === 'flex') {
        chat.scrollIntoView({ behavior: 'smooth', block: 'end' });
        scrollToBottom();
      }
    };
  }

  // Кнопка закрытия
  const closeBtn = document.querySelector('.close-chat-btn');
  if (closeBtn) {
    closeBtn.onclick = () => {
      chat.style.display = 'none';
    };
  }

  // Кнопка нового чата
  const newChatBtn = document.getElementById('newChatBtn');
  if (newChatBtn) {
    newChatBtn.addEventListener('click', resetChat);
  }

  // Отправка сообщения
  const sendBtn = document.getElementById('naf-send');
  if (sendBtn) {
    sendBtn.onclick = sendMessage;
  }

  // Отправка по Enter
  const input = document.getElementById('naf-input');
  if (input) {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
  }

  // Загружаем историю
  history = loadHistory();
  
  // Приветствие
  if (history.length === 0) {
    const hello = 'Здравствуйте 🎉 Я помогу подобрать праздник для вас.';
    addMessage(hello, 'bot');
    history.push({ role: 'assistant', content: hello });
    saveHistory();
  }
}

// =====================
// ИНИЦИАЛИЗАЦИЯ БЕЗ ВНЕШНЕГО HTML
// =====================
function initChatWithoutExternalHTML() {
  // Вставляем HTML напрямую
  document.body.insertAdjacentHTML(
    'beforeend',
    `
    <button id="naf-chat-btn">✨</button>
    
    <div id="naf-chat-modal">
      <div id="chatHeader">
        <span id="chatTitle">Ваш ИИ-Ассистент</span>
        <span class="close-chat-btn">&times;</span>
        <button id="newChatBtn">
          🗑 Новый чат
        </button>
      </div>
      
      <div id="naf-messages"></div>
      
      <div id="naf-bottom">
        <input id="naf-input" placeholder="Напишите сообщение...">
        <button id="naf-send">➤</button>
      </div>
    </div>
    `
  );
  
  chat = document.getElementById('naf-chat-modal');
  initChatElements();
}

// =====================
// ГЛОБАЛЬНАЯ ФУНКЦИЯ ДЛЯ КНОПКИ В МОБИЛЬНОМ МЕНЮ
// =====================
window.toggleChat = function() {
  if (!chat) {
    loadChatHTML().then(() => {
      if (chat) {
        chat.style.display = 'flex';
        scrollToBottom();
      }
    });
  } else {
    chat.style.display = chat.style.display === 'flex' ? 'none' : 'flex';
    if (chat.style.display === 'flex') {
      scrollToBottom();
    }
  }
};

function scrollToBottom() {
  const messagesContainer = document.getElementById('naf-messages');
  if (messagesContainer) {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
}

// =====================
// ОТПРАВКА СООБЩЕНИЙ
// =====================
async function sendMessage() {
  const input = document.getElementById('naf-input');
  const text = input.value.trim();
  
  if (!text) return;
  
  input.value = '';
  
  addMessage(text, 'user');
  history.push({ role: 'user', content: text });
  saveHistory();
  
  // Анимация "печатает"
  const typingDiv = document.createElement('div');
  typingDiv.className = 'naf-msg bot typing-wrapper';
  typingDiv.innerHTML = '<div class="typing-indicator">печатает<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></div>';
  document.getElementById('naf-messages').appendChild(typingDiv);
  scrollToBottom();
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://nafnafiki.ru',
        'X-Title': 'NafNafiki'
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...history.slice(-25)
        ]
      })
    });
    
    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content || data?.error?.message || JSON.stringify(data) || 'Ошибка ответа';
    
    // Удаляем анимацию
    const lastMsg = document.getElementById('naf-messages').lastElementChild;
    if (lastMsg && lastMsg.classList.contains('typing-wrapper')) {
      lastMsg.remove();
    }
    
    addMessage(reply, 'bot');
    history.push({ role: 'assistant', content: reply });
    saveHistory();
    
  } catch (e) {
    // Удаляем анимацию при ошибке
    const lastMsg = document.getElementById('naf-messages').lastElementChild;
    if (lastMsg && lastMsg.classList.contains('typing-wrapper')) {
      lastMsg.remove();
    }
    
    addMessage('Ошибка соединения', 'bot');
    console.log(e);
  }
}

function addMessage(text, sender) {
  const messagesContainer = document.getElementById('naf-messages');
  if (!messagesContainer) return;
  
  const msgDiv = document.createElement('div');
  msgDiv.className = `naf-msg ${sender}`;
  msgDiv.innerHTML = text;
  messagesContainer.appendChild(msgDiv);
  scrollToBottom();
}

// =====================
// ИСТОРИЯ
// =====================
function saveHistory() {
  localStorage.setItem('nafChatHistory', JSON.stringify(history));
}

function loadHistory() {
  const saved = localStorage.getItem('nafChatHistory');
  return saved ? JSON.parse(saved) : [];
}

function resetChat() {
  history = [];
  saveHistory();
  
  const messagesContainer = document.getElementById('naf-messages');
  if (messagesContainer) {
    messagesContainer.innerHTML = '';
  }
  
  const helloMsg = 'Здравствуйте! Я ваш персональный помощник NafNafiki. Подберу программу для праздника.';
  addMessage(helloMsg, 'bot');
  history.push({ role: 'assistant', content: helloMsg });
  saveHistory();
}
