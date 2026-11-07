const fs=require('fs'),path=require('path');
const root='working_copy';let files=0;
const re=/<!--\s*Модальное окно связи\s*-->[\s\S]*?<div\s+class=["']contact-modal-overlay["']>[\s\S]*?<\/div>\s*<\/div>/i;
for(const file of fs.readdirSync(root).filter(f=>f.endsWith('.html')&&f!=='contacts.html')){
 const full=path.join(root,file);let html=fs.readFileSync(full,'utf8');
 if(!re.test(html)) continue;
 html=html.replace(re,'');
 fs.writeFileSync(full,html,'utf8');files++;
}
console.log(JSON.stringify({files_changed:files}));
