const fs = require('fs');
const path = require('path');
const root = path.resolve('working_copy');
const allowed = [
  'Большой Сочи', 'Центральный район Сочи', 'Адлер', 'Красная Поляна',
  'Эсто-Садок', 'Дагомыс', 'Лоо', 'Вардане', 'Хоста', 'Кудепста', 'Мацеста',
  'Абхазия', 'Гагры', 'Пицунда', 'Гудаута'
];
const replacement = '"areaServed": ' + JSON.stringify(allowed, null, 2);
const changed = [];
function replaceAreaServed(block) {
  let result = '';
  let cursor = 0;
  let count = 0;
  const re = /"areaServed"\s*:\s*\[/g;
  let m;
  while ((m = re.exec(block))) {
    let i = re.lastIndex;
    let depth = 1;
    let inString = false;
    let escape = false;
    for (; i < block.length; i++) {
      const c = block[i];
      if (inString) {
        if (escape) escape = false;
        else if (c === '\\') escape = true;
        else if (c === '"') inString = false;
      } else if (c === '"') inString = true;
      else if (c === '[') depth++;
      else if (c === ']' && --depth === 0) break;
    }
    if (depth !== 0) throw new Error('Unclosed areaServed array');
    result += block.slice(cursor, m.index) + replacement;
    cursor = i + 1;
    count++;
    re.lastIndex = cursor;
  }
  return { text: result + block.slice(cursor), count };
}
for (const name of fs.readdirSync(root).filter(x => x.toLowerCase().endsWith('.html'))) {
  const file = path.join(root, name);
  const before = fs.readFileSync(file, 'utf8');
  let hits = 0;
  const after = before.replace(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, block => {
    const updated = replaceAreaServed(block);
    hits += updated.count;
    return updated.text;
  });
  if (after !== before) {
    fs.writeFileSync(file, after, 'utf8');
    changed.push({ file: name, areaServedArrays: hits });
  }
}
const contacts = path.join(root, 'contacts.html');
let s = fs.readFileSync(contacts, 'utf8');
const old = s;
s = s.replace(/\{"@type":"ContactPoint","telephone":"\+7 909 826-19-26","contactType":"customer service","contactOption":"TollFree","availableLanguage":"Russian"\}/,
  '{"@type":"ContactPoint","telephone":"+7 909 826-19-26","contactType":"Звонки и SMS по заказам","availableLanguage":"Russian"}');
s = s.replace(/\{"@type":"ContactPoint","telephone":"\+7 965 474-52-62","contactType":"customer service","contactOption":"WhatsApp","availableLanguage":"Russian"\}/,
  '{"@type":"ContactPoint","telephone":"+7 965 474-52-62","contactType":"WhatsApp, MAX и Telegram","availableLanguage":"Russian"}');
if (s !== old) fs.writeFileSync(contacts, s, 'utf8');
console.log(JSON.stringify({ changed, contactsContactPointsUpdated: s !== old }, null, 2));
