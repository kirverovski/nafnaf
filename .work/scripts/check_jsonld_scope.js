const fs = require('fs');
const path = require('path');
const root = path.resolve('working_copy');
const expected = ['Большой Сочи','Центральный район Сочи','Адлер','Красная Поляна','Эсто-Садок','Дагомыс','Лоо','Вардане','Хоста','Кудепста','Мацеста','Абхазия','Гагры','Пицунда','Гудаута'];
const failures = [];
let blocksChecked = 0;
let areaFieldsChecked = 0;
for (const name of fs.readdirSync(root).filter(x => x.toLowerCase().endsWith('.html'))) {
  const html = fs.readFileSync(path.join(root, name), 'utf8');
  for (const m of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    let json;
    try { json = JSON.parse(m[1]); blocksChecked++; }
    catch (e) { failures.push(`${name}: invalid JSON-LD: ${e.message}`); continue; }
    const visit = (obj, trail) => {
      if (!obj || typeof obj !== 'object') return;
      if (Array.isArray(obj)) return obj.forEach((x,i) => visit(x, `${trail}[${i}]`));
      if (Object.hasOwn(obj, 'areaServed')) {
        areaFieldsChecked++;
        if (!Array.isArray(obj.areaServed) || JSON.stringify(obj.areaServed) !== JSON.stringify(expected))
          failures.push(`${name} ${trail}.areaServed mismatch: ${JSON.stringify(obj.areaServed)}`);
      }
      for (const [k,v] of Object.entries(obj)) visit(v, `${trail}.${k}`);
    };
    visit(json, 'root');
  }
}
const contacts = fs.readFileSync(path.join(root,'contacts.html'),'utf8');
if (/"contactOption"\s*:\s*"(?:TollFree|WhatsApp)"/.test(contacts)) failures.push('contacts.html: obsolete TollFree/WhatsApp contactOption remains');
console.log(JSON.stringify({blocksChecked,areaFieldsChecked,expectedAreaServed:expected,failures},null,2));
if (failures.length) process.exitCode = 1;
