const fs=require('fs'),path=require('path');
const root='working_copy';let files=0,links=0;
for(const file of fs.readdirSync(root).filter(f=>f.endsWith('.html'))){const full=path.join(root,file);let html=fs.readFileSync(full,'utf8');const patterns=['<a href="index.html#calcForm" class="nav-contacts-link">Контакты</a>','<a href="#calcForm" class="nav-contacts-link">Контакты</a>'];let count=0;for(const old of patterns){const n=html.split(old).length-1;if(n){html=html.replaceAll(old,'<a href="contacts.html" class="nav-contacts-link">Контакты</a>');count+=n;}}if(count){fs.writeFileSync(full,html,'utf8');files++;links+=count;}}
console.log(JSON.stringify({files_changed:files,nav_links_updated:links}));
