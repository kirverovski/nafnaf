const fs=require('fs'),path=require('path');
const root='working_copy', out=[];
for(const f of fs.readdirSync(root).filter(x=>x.endsWith('.html')).sort()){
 const s=fs.readFileSync(path.join(root,f),'utf8');
 const blocks=[...s.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map(m=>m[1].trim());
 let types=[],errs=[]; for(const b of blocks){try{const j=JSON.parse(b);types.push(j['@type']||'')}catch(e){errs.push(e.message)}}
 const phones=[...new Set([...s.matchAll(/(?:\+7|8)[\s\-()\d]{8,}/g)].map(m=>m[0].replace(/\s/g,'')))]; out.push({file:f,jsonld:blocks.length,types,errs,phones});
}
fs.writeFileSync('.work/jsonld_validation.json',JSON.stringify(out,null,2),'utf8'); console.log(JSON.stringify(out,null,2));
