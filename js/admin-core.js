/* ============================================================================
   admin-core.js — ядро админ-панели NAF NAFIKI
   Точечная правка HTML-файлов сайта без полной пересборки: панель меняет только
   те значения, которые реально отредактированы, остальной файл остаётся
   байт-в-байт прежним. Работает и в браузере, и в Node.js — тесты в _tools/.
   ==========================================================================*/
(function (global, factory) {
  if (typeof module === 'object' && module.exports) { module.exports = factory(); }
  else { global.NNAdminCore = factory(); }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var VOID = { area: 1, base: 1, br: 1, col: 1, embed: 1, hr: 1, img: 1, input: 1, link: 1, meta: 1, param: 1, source: 1, track: 1, wbr: 1 };
  var RAWTEXT = { script: 1, style: 1, textarea: 1, title: 1 };

  var ENTITIES = {
    amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\u00a0',
    laquo: '\u00ab', raquo: '\u00bb', ndash: '\u2013', mdash: '\u2014', hellip: '\u2026',
    times: '\u00d7', divide: '\u00f7', copy: '\u00a9', reg: '\u00ae', trade: '\u2122',
    larr: '\u2190', rarr: '\u2192', middot: '\u00b7', euro: '\u20ac', num: '#', deg: '\u00b0',
    sect: '\u00a7', bull: '\u2022', shy: ''
  };

  function decodeEntities(s) {
    if (s == null) return '';
    return String(s).replace(/&(#\d+|#x[0-9a-fA-F]+|[a-zA-Z]+);/g, function (all, body) {
      if (body.charAt(0) === '#') {
        var code = body.charAt(1) === 'x' || body.charAt(1) === 'X'
          ? parseInt(body.slice(2), 16)
          : parseInt(body.slice(1), 10);
        if (isNaN(code)) return all;
        if (code > 0xFFFF) {
          code -= 0x10000;
          return String.fromCharCode(0xD800 + (code >> 10), 0xDC00 + (code & 0x3FF));
        }
        try { return String.fromCharCode(code); } catch (e) { return all; }
      }
      var named = ENTITIES[body];
      return named === undefined ? all : named;
    });
  }

  function escapeAmp(s) {
    return String(s).replace(/&(?!(?:#\d+|#x[0-9a-fA-F]+|[a-zA-Z]+);)/g, '&amp;');
  }

  function escapeText(s) {
    return escapeAmp(s).replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function escapePlainAttr(s) {
    return escapeAmp(s).replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function escapeHtmlAttr(s) {
    return escapeAmp(s).replace(/"/g, '&quot;');
  }

  function escapeRegExpStr(s) {
    return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /* ---------- токенизатор тегов ---------- */

  function parseTag(html, start) {
    var i = start + 1;
    var isClose = html.charAt(i) === '/';
    if (isClose) i++;
    var nameStart = i;
    while (i < html.length && /[^\s/>]/.test(html.charAt(i))) i++;
    if (i === nameStart) return null;
    var name = html.slice(nameStart, i).toLowerCase();
    var attrs = [];
    var selfClosing = false;

    for (;;) {
      while (i < html.length && /\s/.test(html.charAt(i))) i++;
      if (i >= html.length) return null;
      var ch = html.charAt(i);
      if (ch === '>') { i++; break; }
      if (ch === '/' && html.charAt(i + 1) === '>') { selfClosing = true; i += 2; break; }
      if (isClose) { i++; continue; }

      var anStart = i;
      while (i < html.length && /[^\s=/>]/.test(html.charAt(i))) i++;
      if (i === anStart) { i++; continue; }
      var attrName = html.slice(anStart, i).toLowerCase();

      var j = i;
      while (j < html.length && /\s/.test(html.charAt(j))) j++;
      if (html.charAt(j) !== '=') {
        attrs.push({ name: attrName, raw: null, start: anStart, end: i });
        i = j;
        continue;
      }
      i = j + 1;
      while (i < html.length && /\s/.test(html.charAt(i))) i++;
      var q = html.charAt(i);
      if (q === '"' || q === "'") {
        var vStart = i + 1;
        var vEnd = html.indexOf(q, vStart);
        if (vEnd < 0) return null;
        attrs.push({ name: attrName, raw: html.slice(vStart, vEnd), valueStart: vStart, valueEnd: vEnd, quote: q, start: anStart, end: vEnd + 1 });
        i = vEnd + 1;
      } else {
        var uvStart = i;
        while (i < html.length && /[^\s>]/.test(html.charAt(i))) i++;
        attrs.push({ name: attrName, raw: html.slice(uvStart, i), valueStart: uvStart, valueEnd: i, quote: null, start: anStart, end: i });
      }
    }
    return { type: isClose ? 'close' : 'open', name: name, start: start, end: i, attrs: attrs, selfClosing: selfClosing };
  }

  function scanTokens(html) {
    var tokens = [];
    var i = 0, n = html.length;
    while (i < n) {
      var lt = html.indexOf('<', i);
      if (lt < 0) break;
      if (html.substr(lt, 4) === '<!--') {
        var ce = html.indexOf('-->', lt + 4);
        if (ce < 0) ce = n - 3;
        tokens.push({ type: 'comment', start: lt, end: ce + 3 });
        i = ce + 3; continue;
      }
      var next = html.charAt(lt + 1);
      if (next === '/' || /[a-zA-Z]/.test(next)) {
        var parsed = parseTag(html, lt);
        if (parsed) {
          tokens.push(parsed); i = parsed.end;
          if (parsed.type === 'open' && RAWTEXT[parsed.name] && !parsed.selfClosing) {
            var re = new RegExp('</\\s*' + parsed.name + '\\s*>', 'i');
            var m = re.exec(html.slice(i));
            var rawEnd = m ? i + m.index : n;
            tokens.push({ type: 'raw', name: parsed.name, start: i, end: rawEnd });
            i = rawEnd;
          } continue;
        }
      }
      i = lt + 1;
    }
    return tokens;
  }

  function attrOf(token, name) {
    if (!token || !token.attrs) return null;
    for (var i = 0; i < token.attrs.length; i++) if (token.attrs[i].name === name) return token.attrs[i];
    return null;
  }

  function attrValueOf(token, name) {
    var a = attrOf(token, name);
    return a && a.raw != null ? a.raw : '';
  }

  function hasClass(token, cls) {
    return (' ' + attrValueOf(token, 'class') + ' ').indexOf(' ' + cls + ' ') >= 0;
  }

  var CARD_ATTRS = ['data-title', 'data-description', 'data-price', 'data-images', 'data-full'];

  function findCards(html) {
    var tokens = scanTokens(html), stack = [], cards = [];
    for (var k = 0; k < tokens.length; k++) {
      var t = tokens[k];
      if (t.type === 'open') {
        if (VOID[t.name] || t.selfClosing) continue;
        var isCard = t.name === 'div' && hasClass(t, 'card') && hasClass(t, 'service-card');
        stack.push({ token: t, isCard: isCard });
        if (RAWTEXT[t.name]) {
          var raw = null;
          for (var r = k + 1; r < tokens.length; r++) {
            if (tokens[r].type === 'raw' && tokens[r].name === t.name) { raw = tokens[r]; break; }
            if (tokens[r].type === 'close' && tokens[r].name === t.name) break;
          }
          if (raw) { while (k + 1 < tokens.length && tokens[k + 1].start < raw.end) k++; }
        }
      } else if (t.type === 'close') {
        for (var s = stack.length - 1; s >= 0; s--) {
          if (stack[s].token.name === t.name) {
            var popped = stack.splice(s, 1)[0];
            if (popped.isCard) cards.push({ open: popped.token, close: t, innerStart: popped.token.end, innerEnd: t.start });
            break;
          }
        }
      }
    }
    return cards;
  }

  function simpleTextInner(tokens, idx) {
    var open = tokens[idx];
    for (var i = idx + 1; i < tokens.length; i++) {
      var t = tokens[i];
      if (t.type === 'close' && t.name === open.name) return { start: open.end, end: t.start };
      if (t.type === 'open' && t.name === open.name && !VOID[t.name] && !t.selfClosing) {
        var depth = 1;
        for (var j = i + 1; j < tokens.length; j++) {
          var u = tokens[j];
          if (u.type === 'open' && u.name === open.name && !VOID[u.name] && !u.selfClosing) depth++;
          else if (u.type === 'close' && u.name === open.name) { depth--; if (!depth) return { start: open.end, end: u.start }; }
        }
        return null;
      }
      if (t.type === 'open' && (VOID[t.name] || t.selfClosing)) continue;
      if (t.type === 'open') return null;
    }
    return null;
  }

  function readCard(html, card, position) {
    var fields = {}, open = card.open;
    CARD_ATTRS.forEach(function (name) {
      var a = attrOf(open, name);
      if (!a || a.raw == null) return;
      var decoded = name === 'data-full' ? a.raw : decodeEntities(a.raw);
      fields['attr:' + name] = { kind: 'attr', name: name, value: decoded, raw: a.raw, start: a.valueStart, end: a.valueEnd, quote: a.quote };
    });
    var idAttr = attrOf(open, 'id');
    var innerHtml = html.slice(card.innerStart, card.innerEnd);
    var inner = scanTokens(innerHtml), off = card.innerStart;

    function addTextField(fieldId, tokenIdx) {
      var range = simpleTextInner(inner, tokenIdx);
      if (!range) return;
      fields[fieldId] = { kind: 'text', value: decodeEntities(innerHtml.slice(range.start, range.end)), raw: innerHtml.slice(range.start, range.end), start: off + range.start, end: off + range.end };
    }

    for (var i = 0; i < inner.length; i++) {
      var t = inner[i];
      if (t.type !== 'open') continue;
      if (t.name === 'h3' && !fields['text:h3']) addTextField('text:h3', i);
      if (t.name === 'p' && !fields['text:p']) addTextField('text:p', i);
      if (t.name === 'img' && hasClass(t, 'card-img')) {
        ['src', 'alt'].forEach(function (name) {
          var a = attrOf(t, name);
          if (!a || a.raw == null) return;
          fields['img:' + name] = { kind: 'attr', name: name, value: decodeEntities(a.raw), raw: a.raw, start: off + a.valueStart, end: off + a.valueEnd, quote: a.quote };
        });
      }
      if (t.name === 'span' && (hasClass(t, 'service-card-info-pill-label') || hasClass(t, 'service-card-info-pill-value'))) {
        var range = simpleTextInner(inner, i);
        if (!range) continue;
        var label = hasClass(t, 'service-card-info-pill-label');
        var text = decodeEntities(innerHtml.slice(range.start, range.end));
        if (label) { fields['__lastPillLabel'] = { kind: 'meta', value: text }; }
        else {
          var key = fields['__lastPillLabel'] ? 'pill:' + fields['__lastPillLabel'].value : 'pill:' + text;
          fields[key] = { kind: 'text', value: text, raw: innerHtml.slice(range.start, range.end), start: off + range.start, end: off + range.end, label: fields['__lastPillLabel'] ? fields['__lastPillLabel'].value : '' };
        }
      }
    }
    delete fields['__lastPillLabel'];
    return { position: position, start: card.open.start, end: card.close.end, id: idAttr && idAttr.raw != null ? idAttr.raw : null, title: fields['attr:data-title'] ? fields['attr:data-title'].value : '', fields: fields };
  }

  function readCards(html) { return findCards(html).map(function (c, idx) { return readCard(html, c, idx); }); }

  function encodeFieldValue(field, value) {
    if (field.kind === 'attr') {
      if (field.name === 'data-full') return escapeHtmlAttr(value);
      return escapePlainAttr(value);
    }
    return escapeText(value);
  }

  function applyChanges(html, model, changes) {
    var edits = [], applied = [], skipped = [];
    Object.keys(changes || {}).forEach(function (fieldId) {
      var field = model.fields[fieldId], value = changes[fieldId];
      if (!field || field.kind === 'meta') { skipped.push(fieldId); return; }
      if (value === field.value) return;
      if (field.value === undefined || field.value === null) { skipped.push(fieldId); return; }
      var encoded = encodeFieldValue(field, value == null ? '' : String(value));
      if (encoded === field.raw) return;
      edits.push({ start: field.start, end: field.end, text: encoded });
      applied.push(fieldId);
    });
    return { html: applyEdits(html, edits), applied: applied, skipped: skipped };
  }

  function applyEdits(html, edits) {
    var sorted = edits.slice().sort(function (a, b) { return b.start - a.start; });
    var out = html;
    for (var i = 0; i < sorted.length; i++) { out = out.slice(0, sorted[i].start) + sorted[i].text + out.slice(sorted[i].end); }
    return out;
  }

  function expandLine(html, start, end) {
    var lineStart = start;
    while (lineStart > 0 && /[ \t]/.test(html.charAt(lineStart - 1))) lineStart--;
    var prev = lineStart > 0 ? html.charAt(lineStart - 1) : '';
    if (prev === '\n') {
      var probe = lineStart - 1, before = '';
      while (probe > 0) { var ch = html.charAt(probe - 1); if (/[\s]/.test(ch) && ch !== '\n') { probe--; continue; } before = ch; break; }
      if (before === '\n' || before === '' || before === '>') lineStart = probe;
    }
    var lineEnd = end;
    while (lineEnd < html.length && /[ \t]/.test(html.charAt(lineEnd))) lineEnd++;
    if (html.charAt(lineEnd) === '\r') lineEnd++;
    if (html.charAt(lineEnd) === '\n') lineEnd++;
    return { start: lineStart, end: lineEnd };
  }

  function removeCard(html, model) { var r = expandLine(html, model.start, model.end); return html.slice(0, r.start) + html.slice(r.end); }

  function localField(html, card, fieldId) {
    var tmp = readCard(html, card, 0), f = tmp.fields[fieldId];
    if (!f) return null;
    return { start: f.start, end: f.end, encoded: function (v) { return encodeFieldValue(f, v == null ? '' : String(v)); } };
  }

  function duplicateCard(html, model, overrides) {
    var src = html.slice(model.start, model.end), fresh = src, cards = findCards(fresh);
    if (!cards.length) return null;
    var inner = cards[0], edits = [];
    Object.keys(overrides || {}).forEach(function (fieldId) {
      var value = overrides[fieldId], local = localField(fresh, inner, fieldId);
      if (!local) return;
      edits.push({ start: local.start, end: local.end, text: local.encoded(value) });
    });
    var idAttr = attrOf(inner.open, 'id');
    if (idAttr && idAttr.raw != null) edits.push({ start: idAttr.valueStart, end: idAttr.valueEnd, text: (idAttr.raw || '') + '-new' });
    fresh = applyEdits(fresh, edits);
    var nl = html.slice(model.start, model.end).match(/^(\s*)/);
    var indent = (nl && nl[1].indexOf('\n') >= 0) ? nl[1].split('\n').pop() : '\n' + (nl && nl[1] || '');
    var sep = html.charAt(model.end) === '\n' ? '\n' + indent : '\n' + indent;
    return html.slice(0, model.end) + sep + fresh + html.slice(model.end);
  }

  function updateSitemapLastmod(xml, urls, date) {
    var out = xml;
    urls.forEach(function (url) {
      var locTag = '<loc>' + url + '</loc>';
      var at = out.indexOf(locTag); if (at < 0) return;
      var blockEnd = out.indexOf('</url>', at);
      if (blockEnd < 0) blockEnd = out.length;
      var block = out.slice(at, blockEnd);
      var updated = block.replace(/<lastmod>[^<]*<\/lastmod>/, '<lastmod>' + date + '</lastmod>');
      if (updated === block) updated = block + '\n    <lastmod>' + date + '</lastmod>';
      out = out.slice(0, at) + updated + out.slice(blockEnd);
    });
    return out;
  }

  function urlForFile(file) { return file === 'index.html' ? 'https://nafnafiki.ru/' : 'https://nafnafiki.ru/' + file; }

  function fieldLabel(id, field) {
    if (id === 'attr:data-title') return 'Название (заказ по программе)';
    if (id === 'attr:data-price') return 'Цена (в карточке и модалке)';
    if (id === 'attr:data-description') return 'Краткое описание';
    if (id === 'attr:data-full') return 'Подробное описание (HTML)';
    if (id === 'attr:data-images') return 'Галерея фото (через ,)';
    if (id === 'text:h3') return 'Заголовок под фото';
    if (id === 'text:p') return 'Текст под заголовком';
    if (id === 'img:src') return 'Фото карточки';
    if (id === 'img:alt') return 'Подпись фото (alt)';
    if (id.indexOf('pill:') === 0) return 'Плашка: ' + id.slice(5);
    return id;
  }

  function formatNumber(digits, style) {
    if (style === 'plain') return String(digits);
    return String(digits).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  function pricePattern(digits) {
    var parts = String(digits).split('').map(function (d) { return escapeRegExpStr(d); });
    return '(?<![\\d])' + parts.join('[\\s\\u00a0]?') + '(?![\\d])';
  }

  function replacePrice(value, oldPrice, newPrice, options) {
    options = options || {};
    var source = value == null ? '' : String(value);
    var oldDigits = String(oldPrice == null ? '' : oldPrice).replace(/[^\d]/g, '');
    var newDigits = String(newPrice == null ? '' : newPrice).replace(/[^\d]/g, '');
    if (!oldDigits || !newDigits || oldDigits === newDigits) return { value: source, count: 0 };

    var style = options.grouping || 'smart';
    var replacement = formatNumber(newDigits, style === 'smart' ? (/\s/.test(String(oldPrice)) ? 'grouped' : 'plain') : style);
    var out = source, count = 0;

    var loose;
    try { loose = new RegExp(pricePattern(oldDigits), 'g'); }
    catch (e) {
      // старые Safari без lookbehind: откат без границ числа
      loose = new RegExp(String(oldDigits).split('').join('[\\s\\u00a0]?'), 'g');
    }
    out = out.replace(loose, function (m) {
      count++;
      return /[\s\u00a0]/.test(m) ? formatNumber(newDigits, 'grouped') : formatNumber(newDigits, 'plain');
    });
    return { value: out, count: count };
  }

  function priceOccurrences(card) {
    var res = [], digits = null;
    var priceField = card.fields['attr:data-price'];
    if (priceField) digits = String(priceField.value).replace(/[^\d]/g, '');
    if (!digits || digits.length < 3) return res;
    try {
      var re = new RegExp(pricePattern(digits), 'g');
      Object.keys(card.fields).forEach(function (id) {
        var f = card.fields[id]; if (f.kind === 'meta') return;
        var hits = (String(f.value).match(re) || []).length;
        if (hits) res.push({ id: id, hits: hits, label: fieldLabel(id, f) });
      });
    } catch (e) {
      var fb = new RegExp(digits.split('').join('[\s\u00a0]?'), 'g');
      Object.keys(card.fields).forEach(function (id) {
        var f = card.fields[id]; if (f.kind === 'meta') return;
        var hits = (String(f.value).match(fb) || []).length;
        if (hits) res.push({ id: id, hits: hits, label: fieldLabel(id, f) });
      });
    }
    return res;
  }

  return {
    scanTokens: scanTokens, findCards: findCards, readCards: readCards,
    applyChanges: applyChanges, applyEdits: applyEdits,
    removeCard: removeCard, duplicateCard: duplicateCard,
    updateSitemapLastmod: updateSitemapLastmod,
    decodeEntities: decodeEntities, escapeText: escapeText,
    escapePlainAttr: escapePlainAttr, escapeHtmlAttr: escapeHtmlAttr,
    escapeRegExp: escapeRegExpStr, urlForFile: urlForFile,
    replacePrice: replacePrice, priceOccurrences: priceOccurrences,
    fieldLabel: fieldLabel, formatNumber: formatNumber,
    attrOf: attrOf, attrValueOf: attrValueOf
  };
});