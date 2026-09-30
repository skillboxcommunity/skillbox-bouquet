const $=s=>document.querySelector(s);
const BASES=[
 {name:'Цветочный',icon:'peony',items:['peony','daisy','tulip','eucalyptus','cosmos'],palette:0,wrap:0},
 {name:'Кофе и уют',icon:'coffee',items:['coffee','chocolate','tea','cookie','olive'],palette:1,wrap:1},
 {name:'Вдохновение',icon:'brush',items:['notebook','brush','pencil','star','fern'],palette:4,wrap:3},
 {name:'Свой микс',icon:'heart',items:['tulip','coffee','heart','eucalyptus'],palette:4,wrap:2}
];
const TITLES=['Большое спасибо!','С Днём учителя!','Этот букет — вам','Спасибо, что вы рядом!','Вы помогаете расти','Вы вдохновляете!','Лучший куратор','С теплом и благодарностью'];
const WRAPS=['Лиловая','Крафт','Молочная','Графит','Синяя','Коралловая','Лаймовая','Голубая'];
const RIBBONS=['Фиолетовая','Персиковая','Розовая','Лаймовая','Голубая','Коралловая','Чёрная'];
const PHRASES=[
'С Днём учителя! Спасибо за поддержку, внимание и вдохновение. Пусть каждый день приносит что-то хорошее!',
'Спасибо, что вы рядом. За ответы на вопросы, добрые слова и желание помочь. Очень ценю это!',
'Спасибо, что создаёте ламповую атмосферу в нашем чате. Ваша поддержка на каждом шагу помогает не опускать руки на сложных модулях!',
'Спасибо за терпение, заботу и спокойное «давайте разберёмся». С вами сложное становится понятным.',
'Вы тот человек, после разговора с которым снова хочется открыть урок и попробовать ещё раз. Спасибо!',
'Спасибо, что верите в нас даже тогда, когда мы сами немного сомневаемся.',
'С Днём учителя! Пусть вопросов без ответов будет меньше, а поводов гордиться своими студентами — больше.',
'Спасибо за поддержку без лишнего пафоса, полезные советы и ощущение, что мы правда команда.',
'Спасибо, что помогаете не потеряться в дедлайнах, модулях и собственных идеях.',
'Ваши комментарии всегда по делу и с заботой. Спасибо, что помогаете становиться лучше.',
'Спасибо, что умеете объяснить ещё раз, ещё проще и без капли раздражения.',
'С вами не страшно ошибаться, спрашивать и начинать заново. Это очень ценно.',
'Спасибо за честную обратную связь, добрые слова и маленькие победы, которые вы замечаете.',
'Вы помогли мне вырасти — в знаниях, уверенности и умении не сдаваться. Спасибо!',
'Спасибо за вдохновение и тот самый нужный пинок, после которого всё наконец получается.',
'Пусть энергии хватает на все чаты, проверки и наши бесконечные «а можно ещё вопрос?». Спасибо вам!',
'Спасибо, что превращаете обучение из марафона в путь, который хочется пройти до конца.',
'Ваше «всё получится» работает лучше кофе. Спасибо, что всегда находите нужные слова.',
'Спасибо за мемы, поддержку и знания — идеальный набор для хорошей учёбы.',
'Спасибо, что держите руку на пульсе, а нас — в фокусе. С вами гораздо спокойнее.',
'Вы делаете больше, чем просто отвечаете на вопросы. Вы помогаете поверить в себя.',
'Спасибо за тёплую атмосферу, в которой хочется делиться идеями и не бояться быть новичком.',
'За каждое понятное объяснение, быстрый ответ и бережную обратную связь — большое спасибо!',
'Пусть работа радует, студенты удивляют, а свободного времени становится больше.',
'Этот букет — маленькое спасибо за ваш большой вклад. С Днём учителя!'
];
const CATEGORIES=['Цветы','Зелень','Вкусное','Для дела','Украшения','Увлечения','Топперы'];
const MAX_ITEMS=24;
let nextUid=0;
const makeItem=id=>({id,uid:++nextUid,variant:Math.floor(Math.random()*4),x:null,y:null,rotation:0,scale:.9,z:nextUid});
const initialState=()=>({step:0,base:0,category:'Цветы',items:[],palette:0,wrap:0,ribbon:0,shape:0,seed:Date.now(),message:PHRASES[0],title:0,selectedUid:null,customLayout:false,phrasesOpen:false,lastPhrase:0});
let state=initialState();
let previous=null,exporting=false,drag=null;
const itemName=id=>CATALOG.find(x=>x.id===id)?.name||id;
const snapshot=()=>JSON.parse(JSON.stringify(state));
function remember(){previous=snapshot()}
function notice(t){$('#toast').textContent=t;$('#toast').classList.add('show');clearTimeout(notice.timer);notice.timer=setTimeout(()=>$('#toast').classList.remove('show'),2600)}
function optionGroup(label,items,key){return `<fieldset><legend>${label}</legend><div class="options">${items.map((v,i)=>`<button class="option" data-${key}="${i}" aria-pressed="${state[key]===i}">${v}</button>`).join('')}</div></fieldset>`}
function draw(animate=false){
  $('.stage').classList.toggle('card-mode',state.step===2);
  $('#drag-hint').classList.toggle('hidden',state.step===2||!state.items.length);
  $('#art').innerHTML=state.step===2?postcard(state):bouquet(state,animate,true);
  $('#composition-name').textContent=state.step===2?'Ваша открытка':`${state.customLayout?'Своя композиция':BASES[state.base].name} · ${state.items.length} из ${MAX_ITEMS}`;
  $('#undo').disabled=!previous||exporting;
}
function controls(){
 document.querySelectorAll('[data-step]').forEach((b,i)=>{b.setAttribute('aria-current',i===state.step?'step':'false');b.disabled=exporting||(i>0&&!state.items.length)});
 $('#next').disabled=exporting||!state.items.length;$('#restart').disabled=exporting;
 $('#help').textContent=state.step===0?`До ${MAX_ITEMS} предметов. Любой можно передвинуть и повернуть.`:state.step===1?'Палитра, упаковка и лента':'Текст остаётся только на вашем устройстве';
 $('#next').innerHTML=exporting?'Сохраняем…':state.step===0?'Завернуть букет <span>→</span>':state.step===1?'Написать поздравление <span>→</span>':'Скачать открытку <span>↓</span>';
}
function card(v){
 const count=state.items.filter(i=>i.id===v.id).length;
 return `<article class="item-card">${thumb(v.id,state.palette)}<span class="item-name">${v.name}</span><div class="stepper"><button data-minus-id="${v.id}" aria-label="Убрать ${v.name}" ${count?'':'disabled'}>−</button><span>${count}</span><button data-add="${v.id}" aria-label="Добавить ${v.name}" ${state.items.length>=MAX_ITEMS?'disabled':''}>+</button></div></article>`;
}
function render(animate=false){
 draw(animate);controls();const filtered=CATALOG.filter(v=>v.category===state.category);let html='';
 if(state.step===0)html=`<h2>Соберите букет<br>с характером</h2><p class="description">Выберите основу, а затем добавьте цветы, вкусное, полезное и топперы. Каждый предмет можно передвинуть прямо в букете.</p>
 <div class="bases">${BASES.map((b,i)=>`<button class="base" data-base="${i}" aria-pressed="${state.base===i}">${thumb(b.icon,b.palette)}<span>${b.name}</span></button>`).join('')}</div>
 <div class="section-label">Полка с приятностями <button class="inline-link" id="view-selected">В букете: ${state.items.length} / ${MAX_ITEMS}</button></div>
 <div class="categories">${CATEGORIES.map(c=>`<button data-category="${c}" aria-pressed="${state.category===c}">${c}</button>`).join('')}</div>
 <div class="shelf">${filtered.map(card).join('')}</div>
 <button class="surprise" id="surprise">Собрать случайный букет</button>
 <div class="section-label">Уже в букете <small>${state.items.length} / ${MAX_ITEMS}</small></div>
 <div class="selected-items" id="selected-list">${state.items.map(i=>`<div class="selected-row">${thumb(i.id,state.palette)}<span>${itemName(i.id)}</span><button class="mini" data-remove="${i.uid}">Убрать</button></div>`).join('')||'<p class="tip">Пока пусто. Добавьте первый предмет.</p>'}</div>`;
 else if(state.step===1)html=`<h2>Последний штрих</h2><p class="description">Выберите палитру цветов, бумагу и ленту. Положение и наклон каждого предмета можно настроить прямо в букете.</p>
 <fieldset><legend>Палитра цветов</legend><div class="options">${PALETTES.map((p,i)=>`<button class="color" data-palette="${i}" aria-pressed="${state.palette===i}" aria-label="${p.name}">${p.colors.slice(0,3).map(c=>`<span style="background:${c}"></span>`).join('')}</button>`).join('')}</div><div class="color-name">${PALETTES[state.palette].name} · меняет цветы и зелень</div></fieldset>
 ${optionGroup('Упаковка',WRAPS,'wrap')}${optionGroup('Лента',RIBBONS,'ribbon')}
 <p class="tip">Хотите добавить ещё что-нибудь? <button class="inline-link" id="back-shelf">Вернуться к полке</button></p>`;
 else html=`<h2>Добавьте<br>тёплые слова</h2><p class="description">Для куратора чата, куратора на платформе, спикера или всей команды.</p>
 ${optionGroup('Заголовок',TITLES,'title')}
 <label class="field-label" for="message">Ваше поздравление</label><textarea id="message" maxlength="450" rows="5" placeholder="Напишите свои слова благодарности…">${esc(state.message)}</textarea>
 <div class="text-meta"><span>Никуда не отправляется</span><span id="count">${state.message.length} / 450</span></div>
 <div class="section-label">Если сложно подобрать слова</div><div class="phrase-tools"><button class="phrase-action" id="random-phrase">Предложить поздравление</button><button class="phrase-action" id="show-phrases">${state.phrasesOpen?'Скрыть варианты':'Посмотреть все 25'}</button></div>
 <div class="phrase-list ${state.phrasesOpen?'':'hidden'}">${PHRASES.map((p,i)=>`<button data-phrase="${i}">${p}</button>`).join('')}</div><p class="tip">Любой готовый вариант можно отредактировать или полностью заменить своим текстом.</p>`;
 $('#panel').innerHTML=html;
}
function go(step){if(exporting||step>0&&!state.items.length)return;state.step=step;state.selectedUid=null;render(step===1);$('#panel').scrollTop=0}
$('#panel').addEventListener('click',e=>{const b=e.target.closest('button');if(!b||exporting)return;
 if(b.dataset.base!==undefined){remember();state.base=+b.dataset.base;const base=BASES[state.base];state.items=base.items.map(makeItem);state.palette=base.palette;state.wrap=base.wrap;state.category=state.base===1?'Вкусное':state.base===2?'Для дела':'Цветы';state.customLayout=false;ensurePositions(state,true);render(true);return}
 if(b.dataset.category){state.category=b.dataset.category;render();return}
 if(b.dataset.add){if(state.items.length>=MAX_ITEMS){notice(`В букете уже ${MAX_ITEMS} предмета`);return}remember();state.items.push(makeItem(b.dataset.add));ensurePositions(state);render(true);return}
 if(b.dataset.minusId){const found=[...state.items].reverse().find(i=>i.id===b.dataset.minusId);if(found){remember();state.items=state.items.filter(i=>i.uid!==found.uid);render()}return}
 if(b.dataset.remove){remember();state.items=state.items.filter(i=>i.uid!==+b.dataset.remove);render();return}
 if(b.id==='view-selected'){document.querySelector('#selected-list')?.scrollIntoView({behavior:'smooth'});return}
 for(const k of ['palette','wrap','ribbon','title'])if(b.dataset[k]!==undefined){remember();state[k]=+b.dataset[k];render(k==='wrap');return}
 if(b.dataset.phrase!==undefined){state.message=PHRASES[+b.dataset.phrase];state.lastPhrase=+b.dataset.phrase;render();return}
 if(b.id==='random-phrase'){let i;do{i=Math.floor(Math.random()*PHRASES.length)}while(i===state.lastPhrase);state.lastPhrase=i;state.message=PHRASES[i];render();return}
 if(b.id==='show-phrases'){state.phrasesOpen=!state.phrasesOpen;render();return}
 if(b.id==='surprise'){remember();const pool=CATALOG.filter(x=>x.category!=='Топперы');const topper=CATALOG.filter(x=>x.category==='Топперы');state.items=Array.from({length:12+Math.floor(Math.random()*7)},()=>makeItem(pool[Math.floor(Math.random()*pool.length)].id));if(Math.random()>.25)state.items.push(makeItem(topper[Math.floor(Math.random()*topper.length)].id));state.items=state.items.slice(0,MAX_ITEMS);state.customLayout=false;ensurePositions(state,true);render(true);notice('Готово! Всё можно поменять и передвинуть.');return}
 if(b.id==='back-shelf')go(0);
});
$('#panel').addEventListener('input',e=>{if(e.target.id==='message'){state.message=e.target.value;$('#count').textContent=`${state.message.length} / 450`;draw()}});
document.querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>go(+b.dataset.step));
$('#next').onclick=()=>state.step<2?go(state.step+1):download();
$('#undo').onclick=()=>{if(!previous)return;const current=snapshot();state=previous;previous=current;render(true)};
$('#restart').onclick=()=>{if(!confirm('Начать новый букет?'))return;state=initialState();previous=null;ensurePositions(state,true);render()};
function point(e,svg){const r=svg.getBoundingClientRect();return{x:(e.clientX-r.left)*500/r.width,y:(e.clientY-r.top)*590/r.height}}
function itemTransform(item){return `translate(${item.x} ${item.y}) rotate(${item.rotation||0}) scale(${item.scale||.9})`}
$('#art').addEventListener('pointerdown',e=>{if(state.step===2)return;const rotate=e.target.closest('[data-rotate]');if(rotate){e.preventDefault();e.stopPropagation();rotateSelected(+rotate.dataset.rotate);return}const g=e.target.closest('[data-bouquet-item]');if(!g)return;e.preventDefault();const uid=+g.dataset.bouquetItem,item=state.items.find(i=>i.uid===uid),svg=g.ownerSVGElement,p=point(e,svg);remember();item.z=Math.max(0,...state.items.map(i=>i.z||0))+1;state.selectedUid=uid;draw();drag={uid,dx:p.x-item.x,dy:p.y-item.y,svg:$('#art svg'),el:document.querySelector(`[data-bouquet-item="${uid}"]`),moved:false,pointerId:e.pointerId};e.currentTarget.setPointerCapture?.(e.pointerId)});
$('#art').addEventListener('pointermove',e=>{if(!drag)return;e.preventDefault();const item=state.items.find(i=>i.uid===drag.uid),p=point(e,drag.svg);item.x=Math.max(70,Math.min(430,p.x-drag.dx));item.y=Math.max(100,Math.min(430,p.y-drag.dy));state.customLayout=true;drag.moved=true;drag.el.setAttribute('transform',itemTransform(item))});
function endDrag(e){if(!drag)return;try{$('#art').releasePointerCapture?.(drag.pointerId)}catch{}if(drag.moved){draw();notice('Своя композиция сохранена')}drag=null}
$('#art').addEventListener('pointerup',endDrag);$('#art').addEventListener('pointercancel',endDrag);
function rotateSelected(delta){const item=state.items.find(i=>i.uid===state.selectedUid);if(!item||exporting)return;remember();item.rotation=((item.rotation+delta+180)%360)-180;item.z=Math.max(0,...state.items.map(i=>i.z||0))+1;state.customLayout=true;draw();notice(delta<0?'Повернули влево':'Повернули вправо')}
$('#art').addEventListener('keydown',e=>{const rotate=e.target.closest('[data-rotate]');if(!rotate||!['Enter',' '].includes(e.key))return;e.preventDefault();rotateSelected(+rotate.dataset.rotate)});
function openPreview(){const d=$('#large-preview');$('#large-art').innerHTML=postcard(state);d.showModal()}
$('#zoom').onclick=openPreview;$('#close-preview').onclick=()=>$('#large-preview').close();$('#large-preview').addEventListener('click',e=>{if(e.target===$('#large-preview'))e.currentTarget.close()});
function textLines(text,size,width){const c=document.createElement('canvas').getContext('2d');c.font=`${size}px Graphik,Arial`;const out=[];for(const para of text.trim().split('\n')){let line='';for(const word of para.split(/\s+/)){const t=line?`${line} ${word}`:word;if(c.measureText(t).width<=width)line=t;else{if(line)out.push(line);line=word}}if(line)out.push(line)}return out}
function postcard(s){const title=TITLES[s.title]||TITLES[0];let size=29,lines=textLines(s.message,size,880);while(lines.length*(size+10)>245&&size>16){size--;lines=textLines(s.message,size,880)}const inner=bouquet(s,false,false).replace(/<svg[^>]*>/,'').replace('</svg>','');return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350"><rect width="1080" height="1350" fill="#fff"/><rect width="1080" height="165" fill="#3D3BFF"/><text x="540" y="106" text-anchor="middle" font-family="Graphik,Arial" font-size="55" font-weight="600" fill="#fff">${esc(title)}</text><g transform="translate(230 175) scale(1.24)">${inner}</g>${lines.map((l,i)=>`<text x="540" y="${980+i*(size+10)}" text-anchor="middle" font-family="Graphik,Arial" font-size="${size}" fill="#000">${esc(l)}</text>`).join('')}<path d="M70 1260H1010" stroke="#d7d7d7"/><text x="70" y="1305" font-family="Graphik,Arial" font-size="29" font-weight="600">Skillbox</text><text x="1010" y="1305" text-anchor="end" font-family="Graphik,Arial" font-size="20">Букет с характером</text></svg>`}
async function download(){if(exporting)return;exporting=true;controls();let url;try{const svg=postcard(snapshot());url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));const img=new Image();await new Promise((ok,no)=>{img.onload=ok;img.onerror=no;img.src=url});const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1350;canvas.getContext('2d').drawImage(img,0,0);const blob=await new Promise(ok=>canvas.toBlob(ok,'image/png'));const png=URL.createObjectURL(blob),a=document.createElement('a');a.href=png;a.download='Букет-с-характером.png';a.click();$('#large-art').innerHTML=`<img src="${canvas.toDataURL('image/png')}" alt="Готовая открытка">`;$('#large-preview').showModal();setTimeout(()=>URL.revokeObjectURL(png),60000);notice('Открытка готова!')}catch(e){console.error(e);notice('Не удалось сохранить. Попробуйте ещё раз.')}finally{if(url)URL.revokeObjectURL(url);exporting=false;controls()}}
ensurePositions(state,true);render();
