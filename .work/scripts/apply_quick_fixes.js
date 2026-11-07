const fs = require('fs');
const path = require('path');
const root = 'working_copy';
let navReplacements = 0;
let ogFixed = 0;
const navRe = /<a href="#" class="nav-contacts-link">Контакты<\/a>/g;
for (const file of fs.readdirSync(root).filter(name => name.endsWith('.html'))) {
  const full = path.join(root, file);
  let html = fs.readFileSync(full, 'utf8');
  const href = file === 'index.html' ? '#calcForm' : 'index.html#calcForm';
  const count = (html.match(navRe) || []).length;
  if (count) {
    html = html.replace(navRe, `<a href="${href}" class="nav-contacts-link">Контакты</a>`);
    fs.writeFileSync(full, html, 'utf8');
    navReplacements += count;
  }
}
const decor = path.join(root, 'decor.html');
let decorHtml = fs.readFileSync(decor, 'utf8');
const oldOg = '<meta property="og:url" content="https://nafnafiki.ru/photoballoons.html">';
const newOg = '<meta property="og:url" content="https://nafnafiki.ru/decor.html">';
if (decorHtml.includes(oldOg)) {
  decorHtml = decorHtml.replace(oldOg, newOg);
  fs.writeFileSync(decor, decorHtml, 'utf8');
  ogFixed = 1;
}
console.log(JSON.stringify({nav_replacements: navReplacements, decor_og_url_fixed: ogFixed}));
