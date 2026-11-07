const fs=require('fs'),path=require('path');
const root='working_copy';
const altByIcon={
 'time-icon.webp':'Время',
 'age-icon.webp':'Возраст',
 'count-icon.webp':'Количество',
 'price-icon.webp':'Стоимость'
};
let altFixed=0,lazyAdded=0,filesChanged=0;
const imgRe=/<img\b[^>]*>/gi;
for(const file of fs.readdirSync(root).filter(f=>f.endsWith('.html'))){
 const full=path.join(root,file); let html=fs.readFileSync(full,'utf8'); let changed=false;
 html=html.replace(imgRe,tag=>{
  let next=tag;
  const src=(tag.match(/\bsrc\s*=\s*["']([^"']*)/i)||[])[1]||'';
  const icon=src.split('/').pop();
  if(!/\balt\s*=/i.test(next) && altByIcon[icon]){
   next=next.replace(/(<img\b[^>]*?)(\s*\/?\s*>$)/i,`$1 alt="${altByIcon[icon]}"$2`);
   altFixed++; changed=true;
  }
  if(!/\bloading\s*=/i.test(next) && src && !/^https:\/\/mc\.yandex\.ru\/watch\//i.test(src)){
   const cls=(next.match(/\bclass\s*=\s*["']([^"']*)/i)||[])[1]||'';
   const keepEager=/\b(logo-video|nav-uslugi-icon|icon-img|mbn-icon)\b/.test(cls) || /images\/logo-banner\.webp/i.test(src);
   if(!keepEager){
    next=next.replace(/(<img\b[^>]*?)(\s*\/?\s*>$)/i,'$1 loading="lazy"$2');
    lazyAdded++; changed=true;
   }
  }
  return next;
 });
 if(changed){fs.writeFileSync(full,html,'utf8');filesChanged++;}
}
console.log(JSON.stringify({files_changed:filesChanged,alt_fixed:altFixed,lazy_added:lazyAdded}));
