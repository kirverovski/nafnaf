from pathlib import Path
from html.parser import HTMLParser
import json, re

ROOT = Path(r'C:\Users\Asus\Desktop\нафomini_из_репозитория\working_copy')
OUT = Path(r'C:\Users\Asus\Desktop\нафomini_из_репозитория\.work\local_audit.json')

class Parser(HTMLParser):
    def __init__(self):
        super().__init__(); self.title=''; self.in_title=False; self.tags=[]; self.links=[]; self.images=[]; self.h=[]; self.scripts=[]; self.text=[]
    def handle_starttag(self, tag, attrs):
        a=dict(attrs); self.tags.append((tag,a))
        if tag=='title': self.in_title=True
        if tag in {'h1','h2','h3','h4','h5','h6'}: self.h.append({'tag':tag,'text':''})
        if tag=='a': self.links.append(a.get('href',''))
        if tag=='img': self.images.append(a)
        if tag=='script': self.scripts.append(a)
    def handle_endtag(self, tag):
        if tag=='title': self.in_title=False
    def handle_data(self, data):
        s=' '.join(data.split())
        if not s: return
        if self.in_title: self.title += s
        if self.h and self.h[-1]['text']=='' and self.get_starttag_text() is None: pass
        self.text.append(s)
        # best-effort heading text; HTMLParser callbacks do not expose current heading, use later regex instead

def attr(p, name, key):
    for tag,a in p.tags:
        if tag==name and key in a: return a[key]
    return ''

def metas(p):
    out={}
    for tag,a in p.tags:
        if tag=='meta':
            k=a.get('name') or a.get('property')
            if k: out[k.lower()]=a.get('content','')
    return out

def headings(raw):
    return {f'h{i}': [re.sub(r'<[^>]+>',' ',x).strip() for x in re.findall(fr'<h{i}\\b[^>]*>(.*?)</h{i}>', raw, re.I|re.S)] for i in range(1,7)}

rows=[]
for path in sorted(ROOT.glob('*.html')):
    raw=path.read_text(encoding='utf-8-sig', errors='replace')
    p=Parser(); p.feed(raw); m=metas(p)
    canon=''
    for tag,a in p.tags:
        if tag=='link' and a.get('rel','').lower()=='canonical': canon=a.get('href','')
    internal=[]; external=[]
    for href in p.links:
        if not href or href.startswith(('#','mailto:','tel:','javascript:')): continue
        (external if re.match(r'^[a-z]+://',href,re.I) else internal).append(href)
    jsonld=sum(1 for tag,a in p.tags if tag=='script' and a.get('type','').lower()=='application/ld+json')
    rows.append({
      'file':path.name,'bytes':len(raw.encode('utf-8')),'title':p.title.strip(),'title_len':len(p.title.strip()),
      'description':m.get('description',''),'description_len':len(m.get('description','')),
      'robots':m.get('robots',''),'canonical':canon,'og_url':m.get('og:url',''),'og_image':m.get('og:image',''),
      'h':headings(raw),'images':len(p.images),'images_missing_alt':sum(1 for a in p.images if not a.get('alt','').strip()),
      'images_non_webp':sum(1 for a in p.images if a.get('src','') and not re.search(r'\\.webp(?:[?#]|$)',a.get('src',''),re.I)),
      'images_no_lazy':sum(1 for a in p.images if a.get('src','') and 'loading' not in a),
      'internal_links':internal,'external_links':external,'jsonld_blocks':jsonld,
      'metrika':bool(re.search(r'109547647',raw)),'kinescope':bool(re.search(r'kinescope',raw,re.I)),
      'phones':sorted(set(re.findall(r'(?:\\+7|8)[\\s\\-()\\d]{8,}',raw))),
      'forms':len(re.findall(r'<form\\b',raw,re.I)),'href_hash':len(re.findall(r'href\\s*=\\s*["\']#',raw,re.I)),
      'wordish_chars':len(re.findall(r'\\w+',re.sub(r'<[^>]+>',' ',raw),re.U))
    })
robots=(ROOT/'robots.txt').read_text(encoding='utf-8-sig',errors='replace') if (ROOT/'robots.txt').exists() else ''
sitemap=(ROOT/'sitemap.xml').read_text(encoding='utf-8-sig',errors='replace') if (ROOT/'sitemap.xml').exists() else ''
result={'root':str(ROOT),'pages':rows,'robots':robots,'sitemap':sitemap,'summary':{'pages':len(rows),'missing_title':[r['file'] for r in rows if not r['title']], 'duplicate_titles':[t for t in sorted({r['title'] for r in rows}) if sum(x['title']==t for x in rows)>1 and t], 'missing_description':[r['file'] for r in rows if not r['description']], 'missing_h1':[r['file'] for r in rows if not r['h']['h1']], 'multi_h1':{r['file']:len(r['h']['h1']) for r in rows if len(r['h']['h1'])!=1}, 'no_canonical':[r['file'] for r in rows if not r['canonical']], 'no_metrika':[r['file'] for r in rows if not r['metrika']]}}
OUT.parent.mkdir(parents=True,exist_ok=True); OUT.write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(result['summary'],ensure_ascii=False,indent=2))
