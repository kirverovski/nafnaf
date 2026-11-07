const fs=require('fs'),path=require('path');
const root='working_copy', rows=[];
for(const file of fs.readdirSync(root).filter(f=>f.endsWith('.html'))){
 const html=fs.readFileSync(path.join(root,file),'utf8');
 for(const m of html.matchAll(/<img\b[^>]*>/gi)){
  const tag=m[0];
  const src=(tag.match(/\bsrc\s*=\s*["']([^"']*)/i)||[])[1]||'';
  const altMatch=tag.match(/\balt\s*=\s*["']([^"']*)["']/i);
  rows.push({file,src,alt:altMatch?altMatch[1]:null,loading:(tag.match(/\bloading\s*=\s*["']([^"']*)/i)||[])[1]||null,width:(tag.match(/\bwidth\s*=\s*["']([^"']*)/i)||[])[1]||null,height:(tag.match(/\bheight\s*=\s*["']([^"']*)/i)||[])[1]||null,tag:tag.replace(/\s+/g,' ').trim()});
 }
}
fs.writeFileSync('.work/image_tags.json',JSON.stringify(rows,null,2),'utf8');
const summary={total:rows.length,missingAlt:rows.filter(x=>x.alt===null).length,emptyAlt:rows.filter(x=>x.alt==='').length,missingLoading:rows.filter(x=>x.loading===null).length,missingWidth:rows.filter(x=>x.width===null).length,missingHeight:rows.filter(x=>x.height===null).length};
console.log(JSON.stringify(summary,null,2));
for(const x of rows.filter(x=>x.alt===null||x.loading===null||x.width===null||x.height===null)) console.log(JSON.stringify(x));
