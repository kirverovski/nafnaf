const fs=require('fs');
const file='working_copy/reviews.html';
let html=fs.readFileSync(file,'utf8');
const textPhrase='<!-- ========== ПАНЕЛЬ: ТЕКСТОВЫЕ ОТЗЫВЫ';
const videoPhrase='<!-- ========== ПАНЕЛЬ: ВИДЕООТЗЫВЫ';
const textAt=html.indexOf(textPhrase);
const videoAt=html.indexOf(videoPhrase,textAt);
if(textAt<0||videoAt<0) throw new Error('review panel markers not found');
const textStart=html.lastIndexOf('\n',textAt)+1;
const videoStart=html.lastIndexOf('\n',videoAt)+1;
let panel=html.slice(textStart,videoStart);
const ninth='                    <article class="text-review-card"><h3>Людмила</h3><p class="text-review-meta">Авито · 20 сентября 2024 · Человек-паук и шоу мыльных пузырей</p><p>Клиентка пригласила Человека-паука и шоу мыльных пузырей на день рождения сына в детском саду. Она написала, что дети и воспитатели были в восторге, а команда учла все пожелания и подарила детям много ярких эмоций.</p></article>\r\n';
const gridEnd='                </div>\n            </div>\n        </div>\n';
let ninthAdded=false;
if(!panel.includes('>Людмила</h3>')){
 if(!panel.includes(gridEnd)) throw new Error('text review grid end not found');
 panel=panel.replace(gridEnd,ninth+gridEnd); ninthAdded=true;
}
html=html.slice(0,textStart)+html.slice(videoStart);
const endMarker='\r\n</div>\r\n\r\n</section>\r\n\r\n<!-- Лайтбокс';
const end=html.indexOf(endMarker);
if(end<0) throw new Error('reviews container end not found');
html=html.slice(0,end)+'\r\n'+panel+html.slice(end);
fs.writeFileSync(file,html,'utf8');
console.log(JSON.stringify({moved_to_bottom:true,ninth_added:ninthAdded,text_review_cards:(html.match(/class="text-review-card"/g)||[]).length}));
