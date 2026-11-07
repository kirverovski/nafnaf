const fs=require('fs'),path=require('path');
const root='working_copy'; let files=0,links=0;
for(const file of fs.readdirSync(root).filter(f=>f.endsWith('.html'))){const full=path.join(root,file);let html=fs.readFileSync(full,'utf8');const old='sms:+79654745262';const n=html.split(old).length-1;if(n){html=html.replaceAll(old,'sms:+79098261926');fs.writeFileSync(full,html,'utf8');files++;links+=n;}}
console.log(JSON.stringify({files_changed:files,sms_links_updated:links}));
