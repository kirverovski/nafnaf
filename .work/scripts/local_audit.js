const fs = require('fs'), path = require('path');
const ROOT = 'C:\\Users\\Asus\\Desktop\\нафomini_из_репозитория\\working_copy';
const OUT = 'C:\\Users\\Asus\\Desktop\\нафomini_из_репозитория\\.work\\local_audit.json';
function all(re,s){return [...s.matchAll(re)].map(m=>m[1]||'')}
function first(re,s){const m=s.match(re);return m?m[1].trim():''}
function metas(s){const o={}; for(const m of s.matchAll(/<meta\b([^>]*?)>/gis)){const a=m[1], n=first(/(?:name|property)\s*=\s*["']([^"']+)["']/i,a); const c=first(/content\s*=\s*["']([^"']*)["']/i,a); if(n)o[n.toLowerCase()]=c} return o}
function attrs(tag){const o={}; for(const m of tag.matchAll(/([\w:-]+)\s*=\s*["']([^"']*)["']/g))o[m[1].toLowerCase()]=m[2]; return o}
function clean(x){return x.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim()}
const rows=[];
for(const name of fs.readdirSync(ROOT).filter(x=>x.toLowerCase().endsWith('.html')).sort()){
 const file=path.join(ROOT,name), raw=fs.readFileSync(file,'utf8'), m=metas(raw), title=clean(first(/<title\b[^>]*>([\s\S]*?)<\/title>/i,raw));
 const canon=first(/<link\b[^>]*rel\s*=\s*["']canonical["'][^>]*href\s*=\s*["']([^"']*)/i,raw)||first(/<link\b[^>]*href\s*=\s*["']([^"']*)["'][^>]*rel\s*=\s*["']canonical["']/i,raw);
 const hs={}; for(let i=1;i<=6;i++)hs['h'+i]=all(new RegExp('<h'+i+'\\b[^>]*>([\\s\\S]*?)<\\/h'+i+'>','gi'),raw).map(clean);
 const imgs=[...raw.matchAll(/<img\b([^>]*?)>/gi)].map(x=>attrs(x[1])); const links=all(/<a\b[^>]*href\s*=\s*["']([^"']*)/gi,raw).filter(Boolean);
 const internal=[],external=[]; for(const h of links){if(/^#|^(mailto|tel|javascript):/i.test(h))continue; (/^[a-z]+:\/\//i.test(h)?external:internal).push(h)}
 rows.push({file:name,bytes:Buffer.byteLength(raw),title,title_len:title.length,description:m.description||'',description_len:(m.description||'').length,robots:m.robots||'',canonical:canon,og_url:m['og:url']||'',og_image:m['og:image']||'',h:hs,images:imgs.length,images_missing_alt:imgs.filter(a=>!String(a.alt||'').trim()).length,images_non_webp:imgs.filter(a=>a.src&&!/\.webp(?:[?#]|$)/i.test(a.src)).length,images_no_lazy:imgs.filter(a=>a.src&&!('loading' in a)).length,internal_links:internal,external_links:external,jsonld_blocks:(raw.match(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["']/gi)||[]).length,metrika:/109547647/.test(raw),kinescope:/kinescope/i.test(raw),phones:[...new Set(all(/(?:\+7|8)[\s\-()\d]{8,}/g,raw))],forms:(raw.match(/<form\b/gi)||[]).length,href_hash:(raw.match(/href\s*=\s*["']#/gi)||[]).length,wordish_chars:(clean(raw).match(/[\p{L}\p{N}_]+/gu)||[]).length});
}
const read=(n)=>fs.existsSync(path.join(ROOT,n))?fs.readFileSync(path.join(ROOT,n),'utf8'):''; const summary={pages:rows.length,missing_title:rows.filter(r=>!r.title).map(r=>r.file),duplicate_titles:[...new Set(rows.map(r=>r.title).filter(t=>t&&rows.filter(x=>x.title===t).length>1))],missing_description:rows.filter(r=>!r.description).map(r=>r.file),missing_h1:rows.filter(r=>!r.h.h1.length).map(r=>r.file),multi_h1:Object.fromEntries(rows.filter(r=>r.h.h1.length!==1).map(r=>[r.file,r.h.h1.length])),no_canonical:rows.filter(r=>!r.canonical).map(r=>r.file),no_metrika:rows.filter(r=>!r.metrika).map(r=>r.file)};
const result={root:ROOT,pages:rows,robots:read('robots.txt'),sitemap:read('sitemap.xml'),summary}; fs.mkdirSync(path.dirname(OUT),{recursive:true}); fs.writeFileSync(OUT,JSON.stringify(result,null,2),'utf8'); console.log(JSON.stringify(summary,null,2));
