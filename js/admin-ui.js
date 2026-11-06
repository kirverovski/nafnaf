/* ============================================================================
   admin-ui.js — панель управления сайтом NAF NAFIKI
   Пароль и токен GitHub хранятся только в localStorage этого устройства.
   Запись идёт через GitHub Contents API, изменения появляются на сайте после
   сборки GitHub Pages (обычно 1–3 минуты).
   ==========================================================================*/
(function () {
  'use strict';

  var CORE = window.NNAdminCore;
  var boot = document.getElementById('boot-error');
  if (!CORE) {
    if (boot) { boot.hidden = false; boot.textContent = 'Не загружен файл js/admin-core.js — панель не работает.'; }
    return;
  }

  var REPO = { owner: 'kirverovski', repo: 'nafnaf', branch: 'main' };
  var API = 'https://api.github.com';

  var SECTIONS = [
    { file: 'animators.html', name: 'Аниматоры' },
    { file: 'shows.html', name: 'Шоу-программы' },
    { file: 'masters.html', name: 'Мастер-классы' },
    { file: 'quests.html', name: 'Квесты' },
    { file: 'decor.html', name: 'Шары и фотозоны' },
    { file: 'services.html', name: 'Доп. услуги' },
    { file: 'kids1-6.html', name: 'Дети 1–6' },
    { file: 'kids6-10.html', name: 'Дети 6–10' },
    { file: 'kids10-15.html', name: 'Дети 10–15' },
    { file: 'adults.html', name: 'Взрослые' }
  ];

  // SHA-256 пароля; самого пароля в коде нет
  var PASS_HASH = '27075845807c001b885d67d42403dc5befa2b45cc2d5e0b55c8613976ad15322';

  var LS = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) {} }
  };

  var state = {
    files: {},
    current: SECTIONS[0].file,
    card: null,
    originals: {},
    changes: {},
    pendingJobs: {},
    lastSyncedPrice: null,
    log: []
  };
  try { state.log = JSON.parse(LS.get('nn_log') || '[]'); } catch (e) { state.log = []; }

  /* ---------------- SHA-256 ---------------- */

  var K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  function rotr(v, c) { return (v >>> c) | (v << (32 - c)); }

  function sha256Hex(str) {
    var bytes = new TextEncoder().encode(str);
    var H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    var l = bytes.length;
    var total = (((l + 8) >> 6) + 1) << 6;
    var buf = new Uint8Array(total);
    buf.set(bytes);
    buf[l] = 0x80;
    var view = new DataView(buf.buffer);
    view.setUint32(total - 8, Math.floor(l / 0x20000000));
    view.setUint32(total - 4, (l << 3) >>> 0);
    var w = new Uint32Array(64);
    for (var off = 0; off < total; off += 64) {
      for (var t = 0; t < 16; t++) w[t] = view.getUint32(off + t * 4);
      for (t = 16; t < 64; t++) {
        var s0 = rotr(w[t - 15], 7) ^ rotr(w[t - 15], 18) ^ (w[t - 15] >>> 3);
        var s1 = rotr(w[t - 2], 17) ^ rotr(w[t - 2], 19) ^ (w[t - 2] >>> 10);
        w[t] = (w[t - 16] + s0 + w[t - 7] + s1) >>> 0;
      }
      var a = H[0], b = H[1], c2 = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
      for (t = 0; t < 64; t++) {
        var S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
        var ch = (e & f) ^ (~e & g);
        var t1 = (h + S1 + ch + K[t] + w[t]) >>> 0;
        var S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
        var mj = (a & b) ^ (a & c2) ^ (b & c2);
        var t2 = (S0 + mj) >>> 0;
        h = g; g = f; f = e; e = (d + t1) >>> 0; d = c2; c2 = b; b = a; a = (t1 + t2) >>> 0;
      }
      H[0] = (H[0] + a) >>> 0; H[1] = (H[1] + b) >>> 0; H[2] = (H[2] + c2) >>> 0; H[3] = (H[3] + d) >>> 0;
      H[4] = (H[4] + e) >>> 0; H[5] = (H[5] + f) >>> 0; H[6] = (H[6] + g) >>> 0; H[7] = (H[7] + h) >>> 0;
    }
    return H.map(function (x) { return ('00000000' + x.toString(16)).slice(-8); }).join('');
  }

  /* ---------------- base64 в UTF-8 ---------------- */

  function b64encode(str) {
    var bytes = new TextEncoder().encode(str), bin = '';
    for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  }

  function b64decode(b64) {
    var bin = atob(String(b64).replace(/\s/g, '')), bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder('utf-8').decode(bytes);
  }

  /* ---------------- служебное ---------------- */

  function $(sel) { return document.querySelector(sel); }
  function $all(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  var toastTimer;
  function toast(msg, bad) {
    var t = $('#toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.toggle('bad', !!bad);
    t.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('on'); }, 4000);
  }

  function busy(on, text) {
    var b = $('#busy');
    if (!b) return;
    b.classList.toggle('on', !!on);
    if (text) $('#busy-text').textContent = text;
  }

  function showScreen(name) {
    $all('.screen').forEach(function (s) { s.classList.toggle('on', s.id === name); });
  }

  function fail(msg) { var el = $('#login-err'); if (el) el.textContent = msg || ''; }

  /* ---------------- GitHub ---------------- */

  function token() { return LS.get('nn_token') || ''; }

  function gh(path, opts) {
    opts = opts || {};
    var headers = { 'Accept': 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };
    if (token()) headers['Authorization'] = 'Bearer ' + token();
    if (opts.body) headers['Content-Type'] = 'application/json';
    return fetch(API + path, {
      method: opts.method || 'GET',
      headers: headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined
    }).then(function (r) {
      if (r.status === 401) throw new Error('Токен не принят (401). Нужен новый с правом Contents: Read and write.');
      if (r.status === 403) throw new Error('Отказано (403): не хватает прав у токена или исчерпан лимит запросов.');
      if (r.status === 404) throw new Error('Не найдено (404): ' + path);
      if (r.status === 409) { var e = new Error('conflict'); e.conflict = true; throw e; }
      if (!r.ok) throw new Error('GitHub ответил ' + r.status);
      return r.json();
    });
  }

  function apiPath(file) {
    return '/repos/' + REPO.owner + '/' + REPO.repo + '/contents/' + file.split('/').map(encodeURIComponent).join('/');
  }

  function readFile(file) {
    return gh(apiPath(file) + '?ref=' + REPO.branch).then(function (d) {
      return { sha: d.sha, text: b64decode(d.content || '') };
    });
  }

  function writeFile(file, message, text, sha) {
    return gh(apiPath(file), {
      method: 'PUT',
      body: { message: message, content: b64encode(text), sha: sha, branch: REPO.branch }
    });
  }

  function loadSection(file, force) {
    var cur = state.files[file];
    if (cur && cur.ready && !force) return Promise.resolve(cur);
    state.files[file] = { ready: false, loading: true };
    renderTabs();
    return readFile(file).then(function (d) {
      var entry = { ready: true, loading: false, sha: d.sha, html: d.text, cards: CORE.readCards(d.text) };
      state.files[file] = entry;
      renderTabs();
      return entry;
    }).catch(function (e) {
      state.files[file] = { ready: false, error: e.message };
      renderTabs();
      throw e;
    });
  }

  /* ---------------- доступ ---------------- */

  function isAuthed() { return LS.get('nn_auth') === PASS_HASH; }

  function askToken(msg) {
    showScreen('login');
    $('#pass-row').hidden = true;
    $('#token-box').hidden = false;
    fail(msg || '');
    $('#token-input').focus();
  }

  function enterApp() {
    showScreen('app');
    document.title = 'Управление — NAF NAFIKI';
    renderTabs();
    renderLog();
    var first = state.current;
    loadSection(first).then(function () {
      selectSection(first);
      loadRest();
    }).catch(function (e) { askToken(e.message); });
  }

  function loadRest() {
    var queue = SECTIONS.map(function (s) { return s.file; }).filter(function (f) {
      var st = state.files[f];
      return !st || !st.ready;
    });
    (function step() {
      var f = queue.shift();
      if (!f) return;
      loadSection(f).catch(function () {}).then(function () { setTimeout(step, 250); });
    })();
  }

  /* ---------------- вкладки ---------------- */

  function sectionName(file) {
    for (var i = 0; i < SECTIONS.length; i++) if (SECTIONS[i].file === file) return SECTIONS[i].name;
    return file;
  }

  function renderTabs() {
    var tabs = $('#tabs');
    if (!tabs) return;
    tabs.innerHTML = SECTIONS.map(function (s) {
      var st = state.files[s.file];
      var n = st && st.ready ? st.cards.length : (st && st.loading ? '…' : (st && st.error ? '!' : '—'));
      return '<button class="tab' + (s.file === state.current ? ' on' : '') + '" data-file="' + s.file + '">' +
        esc(s.name) + '<em>' + n + '</em></button>';
    }).join('');
    var ready = SECTIONS.filter(function (s) { return state.files[s.file] && state.files[s.file].ready; }).length;
    $('#status').textContent = 'Загружено разделов: ' + ready + ' из ' + SECTIONS.length +
      '. Правки видны на сайте после сборки GitHub Pages (1–3 минуты).';
  }

  function selectSection(file) {
    state.current = file;
    $('#bar-title').textContent = sectionName(file);
    renderTabs();
    renderList();
  }

  /* ---------------- список ---------------- */

  function renderList() {
    var st = state.files[state.current];
    var list = $('#list');
    if (!st || !st.ready) {
      list.innerHTML = '<div class="hint-empty">' + (st && st.error ? 'Ошибка: ' + esc(st.error) : 'Загрузка раздела…') + '</div>';
      return;
    }
    var q = ($('#find').value || '').trim().toLowerCase();
    var cards = st.cards.filter(function (c) {
      if (!q) return true;
      var hay = [c.title, (c.fields['text:h3'] || {}).value, (c.fields['attr:data-price'] || {}).value]
        .join(' ').toLowerCase();
      return hay.indexOf(q) >= 0;
    });
    if (!cards.length) { list.innerHTML = '<div class="hint-empty">Ничего не найдено</div>'; return; }

    list.innerHTML = cards.map(function (c) {
      var img = (c.fields['img:src'] || {}).value || '';
      var h3 = (c.fields['text:h3'] || {}).value || '';
      var price = (c.fields['attr:data-price'] || {}).value || (c.fields['pill:Цена'] || {}).value || '';
      return '<button class="row" data-pos="' + c.position + '">' +
        (img ? '<img src="' + esc(img) + '" alt="">' : '<img alt="">') +
        '<span class="t"><b>' + esc(h3 || c.title) + '</b>' +
        '<i>' + esc(price || '—') + '</i>' +
        (h3 && c.title && h3 !== c.title ? '<small>' + esc(c.title) + '</small>' : '') +
        '</span></button>';
    }).join('');
  }

  /* ---------------- редактор ---------------- */

  var ORDER = [
    'attr:data-title', 'text:h3', 'text:p', 'attr:data-description', 'attr:data-price',
    'pill:Цена', 'pill:Длительность', 'pill:Возраст', 'pill:Участники',
    'img:src', 'img:alt', 'attr:data-images', 'attr:data-full'
  ];

  var HINTS = {
    'attr:data-title': 'По этому названию панель находит услугу в других разделах.',
    'attr:data-price': 'Если та же цифра есть в подробном описании — панель обновит её сама.',
    'img:src': 'Файл сначала нужно загрузить в папку images/ через GitHub.',
    'attr:data-images': 'Пути через запятую, первый — главный.',
    'attr:data-full': 'Допустимы теги: h3, p, b, ul, li, br.'
  };

  function fieldControl(id, f) {
    if (id === 'attr:data-full') {
      return '<textarea data-field="' + esc(id) + '" rows="12">' + esc(f.value) + '</textarea>' +
        '<div class="tools">' +
        '<button class="btn sm plain" type="button" data-wrap="h3">Заголовок</button>' +
        '<button class="btn sm plain" type="button" data-wrap="p">Абзац</button>' +
        '<button class="btn sm plain" type="button" data-wrap="b">Жирный</button>' +
        '<button class="btn sm plain" type="button" data-wrap="li">Список</button>' +
        '<button class="btn sm plain" type="button" data-act="preview">Проверка</button>' +
        '</div><div class="preview" hidden></div>';
    }
    if (id === 'attr:data-images') {
      return '<textarea data-field="' + esc(id) + '" rows="2">' + esc(f.value) + '</textarea>' +
        '<div class="thumbs" data-thumbs></div>';
    }
    if (id === 'img:src') {
      return '<input data-field="' + esc(id) + '" type="text" autocapitalize="off" spellcheck="false" value="' + esc(f.value) + '">';
    }
    if (id === 'attr:data-price') {
      return '<input data-field="' + esc(id) + '" type="text" inputmode="text" value="' + esc(f.value) + '">' +
        '<small class="tag" data-syncnote hidden></small>';
    }
    return '<input data-field="' + esc(id) + '" type="text" value="' + esc(f.value) + '">';
  }

  function openEditor(pos) {
    var st = state.files[state.current];
    var card = st && st.cards[pos];
    if (!card) return;

    state.card = { file: state.current, position: pos };
    state.originals = {};
    state.changes = {};
    state.pendingJobs = {};
    state.lastSyncedPrice = null;

    var ids = ORDER.filter(function (id) { return card.fields[id] && card.fields[id].kind !== 'meta'; });
    Object.keys(card.fields).forEach(function (id) {
      if (card.fields[id].kind !== 'meta' && ids.indexOf(id) < 0) ids.push(id);
    });

    $('#efields').innerHTML = ids.map(function (id) {
      var f = card.fields[id];
      state.originals[id] = f.value;
      var hint = HINTS[id] ? '<p class="note">' + esc(HINTS[id]) + '</p>' : '';
      return '<label class="f"><span>' + esc(CORE.fieldLabel(id, f)) + '</span>' + fieldControl(id, f) + hint + '</label>';
    }).join('');

    $('#e-title').textContent = card.fields['text:h3'] ? card.fields['text:h3'].value : card.title;
    $('#e-sub').textContent = sectionName(state.current) + ' · карточка №' + (pos + 1) + ' из ' + st.cards.length;
    $('#edupes').hidden = true;
    $('#editor').classList.add('on');
    $('#ebody').scrollTop = 0;

    renderThumbs(card.fields['attr:data-images'] ? card.fields['attr:data-images'].value : '');
    bindFields();
    updateSave();
    findDuplicates(card);
  }

  function bindFields() {
    $all('#efields [data-field]').forEach(function (el) {
      el.addEventListener('input', function () { onField(el); });
    });
    $all('#efields [data-wrap]').forEach(function (b) {
      b.addEventListener('click', function (e) { e.preventDefault(); wrapTag(b.getAttribute('data-wrap')); });
    });
    $all('#efields [data-act="preview"]').forEach(function (b) {
      b.addEventListener('click', function (e) { e.preventDefault(); previewFull(b); });
    });
  }

  function onField(el) {
    var id = el.getAttribute('data-field');
    var val = el.value;
    if (val === state.originals[id]) delete state.changes[id];
    else state.changes[id] = val;
    el.classList.toggle('changed', val !== state.originals[id]);

    if (id === 'attr:data-price') syncPrice(val);
    if (id === 'attr:data-images') renderThumbs(val);
    updateSave();
  }

  function renderThumbs(val) {
    var box = $('#efields [data-thumbs]');
    if (!box) return;
    var list = String(val || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    box.innerHTML = list.map(function (src) {
      return '<img src="' + esc(src) + '" alt="" onerror="this.classList.add(\'broken\')">';
    }).join('');
  }

  function wrapTag(tag) {
    var ta = $('#efields [data-field="attr:data-full"]');
    if (!ta) return;
    var s = ta.selectionStart, e = ta.selectionEnd;
    var sel = ta.value.slice(s, e) || 'текст';
    var open = tag === 'li' ? '<ul><li>' : '<' + tag + '>';
    var close = tag === 'li' ? '</li></ul>' : '</' + tag + '>';
    ta.value = ta.value.slice(0, s) + open + sel + close + ta.value.slice(e);
    onField(ta);
    ta.focus();
  }

  function previewFull(btn) {
    var box = btn.closest('.f').querySelector('.preview');
    var ta = btn.closest('.f').querySelector('[data-field="attr:data-full"]');
    box.innerHTML = ta.value;
    box.hidden = false;
  }

  /* Цена в карточке пишется «от 4500₽», а в описании — «4 500 ₽»,
     поэтому замена идёт по цифрам с границами числа */
  function syncPrice(newPrice) {
    var card = currentCard();
    var ta = card && card.fields['attr:data-full'] ? $('#efields [data-field="attr:data-full"]') : null;
    var priceEl = $('#efields [data-field="attr:data-price"]');
    var note = priceEl ? priceEl.closest('.f').querySelector('[data-syncnote]') : null;
    if (!ta) { if (note) note.hidden = true; return; }

    var old = state.originals['attr:data-price'];
    var base = state.changes['attr:data-full'] != null ? state.changes['attr:data-full'] : state.originals['attr:data-full'];

    if (state.lastSyncedPrice && state.lastSyncedPrice !== newPrice) {
      var undo = CORE.replacePrice(base, state.lastSyncedPrice, old);
      if (undo.count) base = undo.value;
    }
    var res = CORE.replacePrice(base, old, newPrice);
    if (res.count) {
      ta.value = res.value;
      state.changes['attr:data-full'] = res.value;
      ta.classList.add('changed');
      state.lastSyncedPrice = newPrice;
      if (note) { note.hidden = false; note.textContent = 'Обновлено в подробном описании: ' + res.count; }
    } else {
      state.lastSyncedPrice = null;
      if (note) note.hidden = true;
    }
    updateSave();
  }

  function updateSave() {
    var n = Object.keys(state.changes).length;
    var btn = $('#btn-save');
    btn.disabled = !n;
    btn.textContent = n ? 'Сохранить (' + n + ')' : 'Сохранить';
  }

  function currentCard() {
    if (!state.card) return null;
    var st = state.files[state.card.file];
    return st && st.cards ? st.cards[state.card.position] : null;
  }

  function closeEditor(force) {
    if (!force && Object.keys(state.changes).length && !confirm('Есть несохранённые правки. Выйти из карточки?')) return;
    $('#editor').classList.remove('on');
    state.card = null;
    state.changes = {};
    state.originals = {};
    state.pendingJobs = {};
    state.lastSyncedPrice = null;
    renderList();
  }

  /* ---------------- та же услуга в других разделах ---------------- */

  function findDuplicates(card) {
    var title = (card.fields['attr:data-title'] || {}).value;
    var box = $('#edupes');
    if (!title) { box.hidden = true; return; }
    var hits = [];
    SECTIONS.forEach(function (s) {
      var st = state.files[s.file];
      if (!st || !st.ready) return;
      st.cards.forEach(function (c) {
        if (s.file === state.card.file && c.position === card.position) return;
        if ((c.fields['attr:data-title'] || {}).value === title) {
          hits.push({ file: s.file, pos: c.position, price: (c.fields['attr:data-price'] || {}).value });
        }
      });
    });
    box.hidden = false;
    if (!hits.length) { box.innerHTML = '<h3>В других разделах этой услуги нет</h3>'; return; }
    box.innerHTML = '<h3>Та же услуга ещё в ' + hits.length + ' разделах</h3>' +
      hits.map(function (h, i) {
        return '<label class="chk"><input type="checkbox" data-i="' + i + '" checked>' +
          '<span>' + esc(sectionName(h.file)) + '</span><i>' + esc(h.price || '') + '</i></label>';
      }).join('') +
      '<button class="btn sm plain" type="button" data-act="wide" style="margin-top:8px">Применить правки к отмеченным</button>';
    window._dupes = hits;
    box.querySelector('[data-act="wide"]').addEventListener('click', applyWide);
  }

  function applyWide() {
    var changes = buildChanges();
    if (!Object.keys(changes).length) { toast('Сначала что-нибудь измените', true); return; }
    var hits = window._dupes || [];
    var chosen = $all('#edupes input:checked')
      .map(function (cb) { return hits[Number(cb.getAttribute('data-i'))]; })
      .filter(Boolean);
    if (!chosen.length) { toast('Отметьте разделы', true); return; }
    chosen.forEach(function (h) { state.pendingJobs[h.file] = { position: h.pos, changes: changes }; });
    save();
  }

  function buildChanges() {
    var out = {};
    Object.keys(state.changes).forEach(function (id) { out[id] = state.changes[id]; });
    return out;
  }

  /* ---------------- сохранение ---------------- */

  function today() { return new Date().toISOString().slice(0, 10); }

  function save() {
    if (!token()) { askToken('Для записи нужен токен GitHub.'); return; }
    var jobs = {};
    if (state.card && Object.keys(state.changes).length) {
      jobs[state.card.file] = { position: state.card.position, changes: buildChanges() };
    }
    Object.keys(state.pendingJobs).forEach(function (f) { jobs[f] = state.pendingJobs[f]; });

    var files = Object.keys(jobs);
    if (!files.length) { toast('Нет изменений', true); return; }

    var saved = [];
    busy(true, 'Сохраняю 1 из ' + files.length);
    var chain = Promise.resolve();

    files.forEach(function (file, i) {
      chain = chain.then(function () {
        return writeOne(file, jobs[file]).then(function (url) {
          if (url) saved.push({ file: file, url: url });
          busy(true, 'Сохраняю ' + Math.min(i + 2, files.length) + ' из ' + files.length);
        });
      });
    });

    chain.then(function () {
      if (!saved.length) return null;
      return touchSitemap(saved.map(function (s) { return CORE.urlForFile(s.file); }));
    }).then(function (sm) {
      busy(false);
      state.pendingJobs = {};
      var price = files.some(function (f) {
        var j = jobs[f];
        return j && (j.changes['attr:data-price'] != null || j.changes['pill:Цена'] != null);
      });
      pushLog(saved, sm, price);
      if (price) $('#feedwarn').classList.add('on');
      toast(saved.length ? 'Записано разделов: ' + saved.length + (sm ? ' + sitemap' : '') : 'Значения совпадают с текущими', false);
      return Promise.all(saved.map(function (s) { return loadSection(s.file, true).catch(function () {}); }));
    }).then(function () {
      if (state.card) openEditor(state.card.position); else renderList();
    }).catch(function (e) {
      busy(false);
      toast(e.message === 'conflict' ? 'Файл изменили параллельно — нажмите «Обновить»' : (e.message || 'Ошибка записи'), true);
      if (/401|403/.test(e.message || '')) askToken(e.message);
    });
  }

  function writeOne(file, job) {
    return loadSection(file, true).then(function (st) {
      var card = st.cards[job.position];
      if (!card) throw new Error('Карточка №' + (job.position + 1) + ' в разделе «' + sectionName(file) + '» не найдена. Нажмите «Обновить».');
      var res = CORE.applyChanges(st.html, card, job.changes);
      if (!res.applied.length) return null;
      var labels = res.applied.map(function (id) { return CORE.fieldLabel(id, card.fields[id]); });
      var msg = 'admin: ' + file + ' — ' + (card.title || '') + ' — ' + labels.join(', ');
      return writeFile(file, msg, res.html, st.sha).then(function (out) {
        return out.commit && out.commit.html_url;
      }).catch(function (e) {
        if (!e.conflict) throw e;
        return loadSection(file, true).then(function (fresh) {
          var same = fresh.cards.filter(function (c) { return c.title === card.title; });
          var target = same.length ? same[Math.min(job.position, same.length - 1)] : null;
          if (!target) throw new Error('После конфликта карточка не найдена — обновите панель.');
          var again = CORE.applyChanges(fresh.html, target, job.changes);
          return writeFile(file, 'admin: ' + file + ' — ' + card.title, again.html, fresh.sha)
            .then(function (o) { return o.commit && o.commit.html_url; });
        });
      });
    });
  }

  function touchSitemap(urls) {
    return readFile('sitemap.xml').then(function (d) {
      var next = CORE.updateSitemapLastmod(d.text, urls, today());
      if (next === d.text) return null;
      return writeFile('sitemap.xml', 'admin: sitemap lastmod ' + today(), next, d.sha)
        .then(function (o) { return o.commit && o.commit.html_url; });
    }).catch(function () { return null; });
  }

  function pushLog(saved, sm, price) {
    state.log.unshift({
      t: new Date().toISOString(),
      files: saved.map(function (s) { return s.file; }),
      url: (saved[0] && saved[0].url) || null,
      sm: !!sm,
      feed: !!price
    });
    state.log = state.log.slice(0, 30);
    LS.set('nn_log', JSON.stringify(state.log));
    renderLog();
  }

  function renderLog() {
    var box = $('#log');
    if (!box) return;
    if (!state.log.length) { box.innerHTML = '<div class="hint-empty">Пока пусто</div>'; return; }
    box.innerHTML = state.log.map(function (e) {
      var d = new Date(e.t);
      return '<div class="item"><time>' + d.toLocaleString('ru-RU') + '</time>' +
        esc(e.files.map(sectionName).join(', ')) +
        (e.sm ? ' · sitemap' : '') + (e.feed ? ' · нужен фид' : '') +
        (e.url ? ' · <a href="' + esc(e.url) + '" target="_blank" rel="noopener">коммит</a>' : '') +
        '</div>';
    }).join('');
  }

  /* ---------------- копия и удаление ---------------- */

  function duplicate() {
    var card = currentCard();
    if (!card) return;
    if (Object.keys(state.changes).length) { toast('Сначала сохраните правки', true); return; }
    if (!confirm('Создать копию карточки «' + card.title + '» в этом разделе? Копия встанет сразу под оригиналом.')) return;
    var file = state.card.file;
    busy(true, 'Создаю копию…');
    loadSection(file, true).then(function (st) {
      var target = st.cards[card.position];
      var h3 = (target.fields['text:h3'] || {}).value || target.title;
      var next = CORE.duplicateCard(st.html, target, {
        'attr:data-title': target.title + ' (копия)',
        'text:h3': h3 + ' (копия)'
      });
      if (!next) throw new Error('Не удалось скопировать карточку');
      return writeFile(file, 'admin: копия «' + target.title + '» — ' + file, next, st.sha);
    }).then(function (out) {
      pushLog([{ file: file, url: (out.commit && out.commit.html_url) || null }], null, false);
      toast('Копия создана', false);
      closeEditor(true);
      return loadSection(file, true);
    }).then(renderList).catch(function (e) { toast(e.message, true); }).then(function () { busy(false); });
  }

  function removeCard() {
    var card = currentCard();
    if (!card) return;
    if (!confirm('Убрать карточку «' + card.title + '» из раздела «' + sectionName(state.card.file) + '»? Блок удалится из HTML; отменить можно через историю GitHub.')) return;
    var file = state.card.file;
    busy(true, 'Удаляю…');
    loadSection(file, true).then(function (st) {
      var target = st.cards[card.position];
      var html = CORE.removeCard(st.html, target);
      if (html === st.html) throw new Error('Нечего удалять');
      return writeFile(file, 'admin: удалить «' + target.title + '» — ' + file, html, st.sha);
    }).then(function (out) {
      pushLog([{ file: file, url: (out.commit && out.commit.html_url) || null }], null, false);
      toast('Карточка убрана', false);
      closeEditor(true);
      return loadSection(file, true);
    }).then(renderList).catch(function (e) { toast(e.message, true); }).then(function () { busy(false); });
  }

  /* ---------------- новая услуга ---------------- */

  function openCreate() {
    var st = state.files[state.current];
    if (!st || !st.ready || !st.cards.length) { toast('Сначала дождитесь загрузки раздела', true); return; }
    var last = st.cards[st.cards.length - 1];
    $('#c-sec').textContent = 'Раздел: ' + sectionName(state.current) + '. Карточка добавится в конец раздела.' +
      (last.className && /pop/.test(last.className) ? '' : '');
    $('#create').classList.add('on');
    $('#c-img').value = '';
    $('#c-preview').hidden = true;
    $('#btn-create-go').disabled = true;
    updateCreateBtn();
  }

  function updateCreateBtn() {
    var ok = $('#c-title').value.trim() && $('#c-h3').value.trim() && $('#c-price').value.trim();
    $('#btn-create-go').disabled = !ok;
  }

  var _imgDims = { width: 0, height: 0 };
  function onImgPath() {
    var path = $('#c-img').value.trim();
    if (!path) { $('#c-preview').hidden = true; _imgDims = { width: 0, height: 0 }; return; }
    var probe = new Image();
    probe.onload = function () {
      _imgDims = { width: probe.naturalWidth, height: probe.naturalHeight };
      var prev = $('#c-preview');
      prev.src = path;
      prev.hidden = false;
      prev.alt = '';
    };
    probe.onerror = function () {
      _imgDims = { width: 0, height: 0 };
      $('#c-preview').hidden = true;
      toast('Файл не найден: ' + path, true);
    };
    probe.src = path;
  }

  function createCard() {
    if (!token()) { askToken('Для создания нужен токен GitHub.'); return; }
    var st = state.files[state.current];
    if (!st || !st.ready || !st.cards.length) { toast('Раздел не загружен', true); return; }
    var last = st.cards[st.cards.length - 1];

    var d = {
      title: $('#c-title').value.trim(),
      h3: $('#c-h3').value.trim(),
      p: $('#c-p').value.trim(),
      desc: $('#c-desc').value.trim(),
      price: $('#c-price').value.trim(),
      img: {
        src: $('#c-img').value.trim(),
        alt: $('#c-h3').value.trim(),
        width: _imgDims.width || undefined,
        height: _imgDims.height || undefined
      },
      images: $('#c-images').value.trim() ? $('#c-images').value.trim().split(',').map(function (s) { return s.trim(); }).filter(Boolean) : [],
      pills: {
        duration: $('#c-dur').value.trim(),
        age: $('#c-age').value.trim(),
        count: $('#c-cnt').value.trim(),
        price: $('#c-price').value.trim()
      },
      full: $('#c-full').value.trim()
    };

    var block = CORE.buildCardHtml(d, { className: last.className });
    var html = CORE.insertCardAfter(st.html, last, block);

    busy(true, 'Создаю услугу…');
    writeFile(st.file, 'admin: новая услуга «' + d.title + '» — ' + st.file, html, st.sha)
      .then(function (out) {
        pushLog([{ file: st.file, url: (out.commit && out.commit.html_url) || null }], null, false);
        toast('Услуга создана в разделе «' + sectionName(st.file) + '»', false);
        $('#create').classList.remove('on');
        return loadSection(st.file, true);
      }).then(renderList).catch(function (e) { toast(e.message, true); })
      .then(function () { busy(false); });
  }

  /* ---------------- массовая замена цены ---------------- */

  var bulkRows = [];

  function openBulk() {
    $('#bulk').classList.add('on');
    $('#bulk-from').value = '';
    $('#bulk-to').value = '';
    $('#bresult').innerHTML = '';
  }

  function scanBulk() {
    var from = $('#bulk-from').value.trim();
    var to = $('#bulk-to').value.trim();
    if (!from || !to) { toast('Заполните обе цены', true); return; }

    bulkRows = [];
    var pending = [];
    SECTIONS.forEach(function (s) {
      var st = state.files[s.file];
      if (!st || !st.ready) { pending.push(s.name); return; }
      st.cards.forEach(function (c) {
        var price = (c.fields['attr:data-price'] || {}).value;
        if (!price) return;
        var np = CORE.replacePrice(price, from, to);
        if (!np.count) return;
        var changes = { 'attr:data-price': np.value };
        var full = c.fields['attr:data-full'];
        if (full) { var rf = CORE.replacePrice(full.value, from, to); if (rf.count) changes['attr:data-full'] = rf.value; }
        var pill = c.fields['pill:Цена'];
        if (pill) { var rp = CORE.replacePrice(pill.value, from, to); if (rp.count) changes['pill:Цена'] = rp.value; }
        bulkRows.push({ file: s.file, pos: c.position, title: c.title, from: price, changes: changes });
      });
    });

    var box = $('#bresult');
    if (!bulkRows.length) {
      box.innerHTML = '<div class="hint-empty">Такую цену нигде не нашли' +
        (pending.length ? '. Не загружены разделы: ' + esc(pending.join(', ')) : '') + '</div>';
      return;
    }
    var uniq = {};
    bulkRows.forEach(function (r) { uniq[r.file] = 1; });
    box.innerHTML = '<div class="sum">Найдено ' + bulkRows.length + ' карточек в ' +
      Object.keys(uniq).length + ' разделах. Отметьте, что менять.</div>' +
      bulkRows.map(function (r, i) {
        return '<label class="row"><input type="checkbox" data-i="' + i + '" checked>' +
          '<span class="t"><b>' + esc(r.title) + '</b>' +
          '<small>' + esc(sectionName(r.file)) + '</small>' +
          '<i>' + esc(r.from) + ' → ' + esc(r.changes['attr:data-price']) + '</i></span></label>';
      }).join('') +
      '<button class="btn" data-act="bulk-go" style="margin-top:10px">Записать в GitHub</button>';
    box.querySelector('[data-act="bulk-go"]').addEventListener('click', commitBulk);
  }

  function commitBulk() {
    if (!token()) { askToken('Для записи нужен токен GitHub.'); return; }
    var chosen = $all('#bresult input:checked')
      .map(function (cb) { return bulkRows[Number(cb.getAttribute('data-i'))]; })
      .filter(Boolean);
    if (!chosen.length) { toast('Нечего записывать', true); return; }
    if (!confirm('Заменить цену в ' + chosen.length + ' карточках?')) return;

    var byFile = {};
    chosen.forEach(function (r) { (byFile[r.file] = byFile[r.file] || []).push(r); });
    var files = Object.keys(byFile);
    var saved = [];
    busy(true, 'Меняю цену…');
    var chain = Promise.resolve();

    files.forEach(function (file, i) {
      chain = chain.then(function () {
        return loadSection(file, true).then(function (st) {
          var html = st.html;
          var cards = st.cards;
          byFile[file].forEach(function (r) {
            var card = null;
            for (var k = 0; k < cards.length; k++) if (cards[k].position === r.pos) { card = cards[k]; break; }
            if (!card) return;
            var res = CORE.applyChanges(html, card, r.changes);
            html = res.html;
            cards = CORE.readCards(html);
          });
          if (html === st.html) return null;
          return writeFile(file, 'admin: цена ' + $('#bulk-from').value.trim() + ' → ' + $('#bulk-to').value.trim() + ' — ' + file, html, st.sha);
        }).then(function (out) {
          if (out) saved.push({ file: file, url: (out.commit && out.commit.html_url) || null });
          busy(true, 'Меняю цену: ' + Math.min(i + 2, files.length) + ' из ' + files.length);
        });
      });
    });

    chain.then(function () {
      return saved.length ? touchSitemap(saved.map(function (s) { return CORE.urlForFile(s.file); })) : null;
    }).then(function (sm) {
      busy(false);
      pushLog(saved, sm, true);
      $('#feedwarn').classList.add('on');
      $('#bulk').classList.remove('on');
      toast('Цену обновил в ' + saved.length + ' разделах', false);
      return Promise.all(files.map(function (f) { return loadSection(f, true).catch(function () {}); }));
    }).then(function () { renderTabs(); renderList(); })
      .catch(function (e) { busy(false); toast(e.message, true); });
  }

  /* ---------------- инициализация ---------------- */

  function tryLogin() {
    var v = $('#login-pass').value;
    if (!v) { fail('Введите пароль'); return; }
    fail('');
    if (sha256Hex(v) !== PASS_HASH) { fail('Пароль не подошёл'); return; }
    LS.set('nn_auth', PASS_HASH);
    if (!token()) {
      $('#pass-row').hidden = true;
      $('#token-box').hidden = false;
      $('#token-input').focus();
      return;
    }
    enterApp();
  }

  function tryToken() {
    var t = $('#token-input').value.trim();
    if (!t) { fail('Вставьте токен'); return; }
    if (!isAuthed()) { fail('Сначала введите пароль'); return; }
    fail('');
    LS.set('nn_token', t);
    busy(true, 'Проверяю доступ…');
    gh('/repos/' + REPO.owner + '/' + REPO.repo).then(function (r) {
      busy(false);
      $('#token-box').hidden = true;
      toast('Доступ к ' + r.full_name + ' есть', false);
      enterApp();
    }).catch(function (e) {
      busy(false);
      LS.del('nn_token');
      fail(e.message);
    });
  }

  function init() {
    $('#btn-login').addEventListener('click', tryLogin);
    $('#login-pass').addEventListener('keydown', function (e) { if (e.key === 'Enter') tryLogin(); });
    $('#btn-token').addEventListener('click', tryToken);
    $('#token-input').addEventListener('keydown', function (e) { if (e.key === 'Enter') tryToken(); });

    $('#btn-logout').addEventListener('click', function () {
      if (!confirm('Выйти и забыть это устройство?')) return;
      LS.del('nn_auth');
      LS.del('nn_token');
      location.reload();
    });

    $('#tabs').addEventListener('click', function (e) {
      var b = e.target.closest('.tab');
      if (!b) return;
      var f = b.getAttribute('data-file');
      var st = state.files[f];
      if (st && st.ready) { selectSection(f); return; }
      loadSection(f).then(function () { selectSection(f); }).catch(function (e2) { toast(e2.message, true); });
    });

    $('#find').addEventListener('input', renderList);
    $('#list').addEventListener('click', function (e) {
      var b = e.target.closest('.row');
      if (!b) return;
      openEditor(Number(b.getAttribute('data-pos')));
    });

    $('#btn-back').addEventListener('click', function () { closeEditor(false); });
    $('#btn-save').addEventListener('click', save);
    $('#btn-dup').addEventListener('click', duplicate);
    $('#btn-del').addEventListener('click', removeCard);
    $('#btn-sync').addEventListener('click', function () {
      busy(true, 'Обновляю…');
      Promise.all(SECTIONS.map(function (s) { return loadSection(s.file, true).catch(function () {}); }))
        .then(function () { renderTabs(); renderList(); toast('Данные свежие', false); })
        .catch(function (e) { toast(e.message, true); })
        .then(function () { busy(false); });
    });
    $('#btn-log').addEventListener('click', function () { $('#log').classList.toggle('on'); });
    $('#btn-bulk').addEventListener('click', openBulk);
    $('#btn-add').addEventListener('click', openCreate);
    $('#btn-create-back').addEventListener('click', function () { $('#create').classList.remove('on'); });
    ['c-title','c-h3','c-price'].forEach(function (id) {
      document.getElementById(id).addEventListener('input', updateCreateBtn);
    });
    $('#c-img').addEventListener('input', onImgPath);
    $('#btn-create-go').addEventListener('click', createCard);
    $('#btn-bulk-close').addEventListener('click', function () { $('#bulk').classList.remove('on'); });
    $('#btn-bulk-find').addEventListener('click', scanBulk);
    $('#bulk-from').addEventListener('keydown', function (e) { if (e.key === 'Enter') scanBulk(); });
    $('#bulk-to').addEventListener('keydown', function (e) { if (e.key === 'Enter') scanBulk(); });

    if (isAuthed() && token()) enterApp();
    else if (isAuthed()) { showScreen('login'); $('#pass-row').hidden = true; $('#token-box').hidden = false; }
    else { showScreen('login'); $('#token-box').hidden = true; }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.NNAdmin = { sha256Hex: sha256Hex, state: state };
})();
