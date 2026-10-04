import {dateOnly, nextDay, validateDates} from './booking.mjs';
import {addMonths, monthCells, pickDate, nights} from './calendar.mjs';
import {composeMessage} from './contact.mjs';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const L=document.documentElement.lang;
const words=(es,english,french)=>L==='en'?english:L==='fr'?french:es;
const rooms=JSON.parse($('#room-data').textContent);
let selectedRoom='suite', gallery=[], galleryIndex=0;
const hotelGallery=['pool-editorial','hotel','owner-garden','owner-loungers','restaurant-editorial','room','owner-lounge','sunset'];
const captions={'pool-editorial':words('Piscina de Varadero','Varadero pool','Piscine de Varadero'),hotel:'Playa de Atlanterra','owner-garden':words('El jardín de Varadero','The Varadero garden','Le jardin de Varadero'),'owner-loungers':words('Una pausa junto al agua','A pause by the water','Une pause au bord de l’eau'),'restaurant-editorial':'Restaurante Vambú',room:words('Vambú frente al mar','Vambú by the sea','Vambú face à la mer'),'owner-lounge':'Beach Club Vambú',sunset:words('El último sol del día','The last light of the day','Les dernières lueurs du jour')};
function selectRoom(id){
 selectedRoom=id;const r=rooms[id];
 $$('.room-tabs button').forEach(b=>{const selected=b.dataset.room===id;b.setAttribute('aria-selected',selected);b.tabIndex=selected?0:-1});
 $('#room-panel').setAttribute('aria-labelledby',`tab-${id}`);
 $('#room-title').textContent=r.name;$('#room-tag').textContent=r.tag;
 $('#room-description').textContent=r.description;
 $('#room-number').textContent=`0${['suite','deluxe','sea','junior','villa'].indexOf(id)+1} / 05`;
 $('#room-image').src=`/varadero-preview/assets/${r.photos[0]}.jpg`;$('#room-image').alt=r.name;
 $('#room-gallery').setAttribute('aria-label',`${words('Ver fotos de','View photos of','Voir les photos de')} ${r.name}`);
 $('#room-specs').replaceChildren(...r.specs.slice(0,3).map(t=>{const s=document.createElement('span');s.textContent=t;return s}));
 $('#room-details').href=r.url;
}
$$('[data-room]').forEach(b=>b.addEventListener('click',()=>selectRoom(b.dataset.room)));
$('.room-tabs')?.addEventListener('keydown',e=>{if(!['ArrowRight','ArrowLeft','Home','End'].includes(e.key))return;e.preventDefault();const tabs=$$('.room-tabs button');let i=tabs.indexOf(document.activeElement);i=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;selectRoom(tabs[i].dataset.room);tabs[i].focus()});
function openDialog(d){$$('dialog[open]').forEach(x=>x.close());d.showModal()}
$$('[data-close]').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
$$('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target!==d)return;const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()}));
$('.menu-toggle').addEventListener('click',()=>{openDialog($('#menu-dialog'));$('.menu-toggle').setAttribute('aria-expanded','true')});
$('#menu-dialog').addEventListener('close',()=>$('.menu-toggle').setAttribute('aria-expanded','false'));
function renderGallery(){const n=gallery[galleryIndex], room=Object.values(rooms).find(r=>r.photos.includes(n));const title=captions[n]||room?.name||'Varadero';$('#gallery-image').src=`/varadero-preview/assets/${n}.jpg`;$('#gallery-image').alt=title;$('#gallery-caption').textContent=title;$('#gallery-count').textContent=`${String(galleryIndex+1).padStart(2,'0')} / ${String(gallery.length).padStart(2,'0')}`}
function openGallery(photos,start=0){gallery=photos;galleryIndex=start;renderGallery();openDialog($('#gallery-dialog'))}
function moveGallery(delta){galleryIndex=(galleryIndex+delta+gallery.length)%gallery.length;renderGallery()}
$('#room-gallery')?.addEventListener('click',()=>openGallery(rooms[selectedRoom].photos));
$$('[data-gallery]').forEach(b=>b.addEventListener('click',()=>openGallery(hotelGallery)));
$$('[data-photos]').forEach(b=>b.addEventListener('click',()=>openGallery(b.dataset.photos.split(','),Number(b.dataset.start)||0)));
$('#gallery-prev').addEventListener('click',()=>moveGallery(-1));$('#gallery-next').addEventListener('click',()=>moveGallery(1));
$('#gallery-dialog').addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();moveGallery(e.key==='ArrowLeft'?-1:1)}});
const arrival=$('#arrival'),departure=$('#departure'),calendar=$('#calendar'),fields={arrival:$('[data-field=arrival]'),departure:$('[data-field=departure]')};
const locale={en:'en-GB',fr:'fr-FR'}[L]||'es-ES', today=dateOnly(), noon=d=>new Date(`${d}T12:00:00`);
const fieldFormat=new Intl.DateTimeFormat(locale,{weekday:'short',day:'numeric',month:'short',year:'numeric'}), previewFormat=new Intl.DateTimeFormat(locale,{day:'numeric',month:'short'}), monthFormat=new Intl.DateTimeFormat(locale,{month:'long',year:'numeric'});
const weekdays=[...Array(7)].map((_,i)=>new Intl.DateTimeFormat(locale,{weekday:'narrow'}).format(new Date(Date.UTC(2024,0,1+i))));
const title=s=>s[0].toUpperCase()+s.slice(1), pretty=d=>fieldFormat.formatToParts(noon(d)).filter(x=>x.type!=='literal').map(x=>x.value).join(' ');
const cal={open:false,mode:'arrival',view:[Number(today.slice(0,4)),Number(today.slice(5,7))-1]};
function renderFields(){
 const n=nights(arrival.value,departure.value);
 fields.arrival.querySelector('strong').textContent=arrival.value?pretty(arrival.value):words('Elegir fecha','Choose a date','Choisir une date');
 fields.departure.querySelector('strong').textContent=departure.value?pretty(departure.value):words('Elegir fecha','Choose a date','Choisir une date');
 $('#nights').textContent=n?`${n} ${n===1?words('noche','night','nuit'):words('noches','nights','nuits')}`:'';
 for(const [input,id]of [[arrival,'#arrival-preview'],[departure,'#departure-preview']])if($(id))$(id).textContent=input.value?previewFormat.format(noon(input.value)):words('Elegir fecha','Choose a date','Choisir une date');
}
function setMode(mode){cal.mode=mode;for(const k in fields){fields[k].classList.toggle('active',cal.open&&k===mode);fields[k].setAttribute('aria-expanded',String(cal.open&&k===mode))}}
function paintRange(hover=''){
 const a=arrival.value,end=departure.value||(cal.mode==='departure'&&hover>a?hover:'');
 for(const b of calendar.querySelectorAll('.cal-day')){const c=b.dataset.date;b.classList.toggle('start',c===a);b.classList.toggle('ranged',c===a&&!!end);b.classList.toggle('end',!!end&&c===end);b.classList.toggle('mid',!!a&&!!end&&c>a&&c<end);b.setAttribute('aria-pressed',String(c===a||c===departure.value))}
}
function renderCalendar(){
 const [y0,m0]=cal.view, count=calendar.clientWidth>=500?2:1, atStart=y0*12+m0<=Number(today.slice(0,4))*12+Number(today.slice(5,7))-1;
 let html=`<button type="button" class="cal-nav" data-cal="-1" aria-label="${words('Mes anterior','Previous month','Mois précédent')}"${atStart?' disabled':''}>←</button><button type="button" class="cal-nav" data-cal="1" aria-label="${words('Mes siguiente','Next month','Mois suivant')}">→</button><div class="cal-months" style="--months:${count}">`;
 for(let i=0;i<count;i++){
  const [y,m]=addMonths(y0,m0,i);
  html+=`<section class="cal-month"><h3>${title(monthFormat.format(new Date(Date.UTC(y,m,1))))}</h3><div class="cal-grid">${weekdays.map(w=>`<span class="cal-dow">${w}</span>`).join('')}`;
  for(const c of monthCells(y,m))html+=c?`<button type="button" class="cal-day${c===today?' today':''}" data-date="${c}"${c<today?' disabled':''}><span>${Number(c.slice(8))}</span></button>`:'<span></span>';
  html+='</div></section>';
 }
 html+=`</div><p class="cal-hint">${cal.mode==='departure'?words('Ahora elige la fecha de salida.','Now choose your departure date.','Choisissez maintenant votre date de départ.'):words('Elige la fecha de llegada.','Choose your arrival date.','Choisissez votre date d’arrivée.')}</p>`;
 calendar.innerHTML=html;paintRange();revealCalendar();
}
function revealCalendar(){const s=calendar.closest('dialog');if(!s){calendar.scrollIntoView({block:'nearest'});return}const need=calendar.getBoundingClientRect().bottom-s.getBoundingClientRect().bottom+20;if(need>0)s.scrollTop+=need}
function openCalendar(mode){
 cal.open=true;setMode(mode==='departure'&&arrival.value?'departure':'arrival');
 const anchor=arrival.value||today;cal.view=[Number(anchor.slice(0,4)),Number(anchor.slice(5,7))-1];
 calendar.hidden=false;renderCalendar();$("#booking-error").textContent="";
}
function closeCalendar(){cal.open=false;calendar.hidden=true;setMode('arrival')}
for(const k in fields)fields[k].addEventListener('click',()=>{if(cal.open&&cal.mode===k)closeCalendar();else openCalendar(k)});
calendar.addEventListener('click',e=>{
 const nav=e.target.closest('[data-cal]');if(nav){cal.view=addMonths(...cal.view,Number(nav.dataset.cal));renderCalendar();return}
 const day=e.target.closest('.cal-day');if(!day||day.disabled)return;
 const next=pickDate({arrival:arrival.value,departure:departure.value,mode:cal.mode},day.dataset.date);
 arrival.value=next.arrival;departure.value=next.departure;renderFields();
 if(next.mode==='done'){closeCalendar();fields.departure.focus();return}
 setMode('departure');renderCalendar();calendar.querySelector(`[data-date="${next.arrival}"]`)?.focus();
});
calendar.addEventListener('mouseover',e=>{const day=e.target.closest('.cal-day');if(day&&!day.disabled)paintRange(day.dataset.date)});
calendar.addEventListener('mouseleave',()=>paintRange());
$('#booking-form').addEventListener('keydown',e=>{if(e.key==='Escape'&&cal.open){e.preventDefault();e.stopPropagation();closeCalendar()}});
addEventListener('resize',()=>{if(cal.open)renderCalendar()});
$('#booking-dialog')?.addEventListener('close',closeCalendar);
function prepareDates(){if(!arrival.value||arrival.value<today)arrival.value=today;if(!departure.value||departure.value<=arrival.value)departure.value=nextDay(arrival.value,2);$('#booking-error').textContent='';renderFields()}
$$('[data-book]').forEach(b=>b.addEventListener('click',()=>{prepareDates();if($('#booking-dialog'))openDialog($('#booking-dialog'));else $('#booking-form').scrollIntoView({block:'center',behavior:'smooth'});if(b.dataset.book)openCalendar(b.dataset.book);else closeCalendar()}));
$('#booking-form').addEventListener('submit',e=>{const error=validateDates(arrival.value,departure.value);if(error){e.preventDefault();$('#booking-error').textContent=words({missing:'Elige las fechas de llegada y salida.',past:'La llegada no puede ser anterior a hoy.',order:'La salida debe ser posterior a la llegada.'}[error],{missing:'Please choose arrival and departure dates.',past:'Arrival cannot be in the past.',order:'Departure must be after arrival.'}[error],{missing:'Choisissez vos dates d’arrivée et de départ.',past:'L’arrivée ne peut pas être dans le passé.',order:'Le départ doit être après l’arrivée.'}[error]);return}$('#booking-error').textContent='';renderFields()});
prepareDates();
const heroImages=['pool-editorial','hotel','sunset'];
$$('[data-slide]').forEach(b=>b.addEventListener('click',()=>{const i=Number(b.dataset.slide);$('#hero-image').src=`/varadero-preview/assets/${heroImages[i]}.jpg`;$('#hero-image').alt=captions[heroImages[i]];$$('[data-slide]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',x===b)})}));
const contact=$('#contact-form');
if(contact){
 const query=new URLSearchParams(location.search);
 if(contact.elements.package&&['1','2'].includes(query.get('paquete')))contact.elements.package.value=query.get('paquete');
 if(query.get('tema')==='eventos')contact.elements.message.value=words('Me gustaría recibir información sobre los próximos eventos en Varadero.','I would like to receive information about upcoming events at Varadero.','Je souhaiterais recevoir des informations sur les prochains événements à Varadero.');
 contact.addEventListener('submit',e=>{e.preventDefault();const result=composeMessage({name:contact.elements.name.value,email:contact.elements.email.value,phone:contact.elements.phone.value,package:contact.elements.package?.value||'',message:contact.elements.message.value,topic:contact.dataset.topic},L);$('#message-body').textContent=result.body;$('#send-email').href=result.url;$('#message-preview').hidden=false;$('#message-preview').scrollIntoView({block:'center',behavior:'smooth'});$('#send-email').focus({preventScroll:true})});
 contact.addEventListener('input',()=>{$('#message-preview').hidden=true});
 $('#edit-message').addEventListener('click',()=>{$('#message-preview').hidden=true;contact.elements.message.focus()});
}
$$('[data-embed]').forEach(b=>b.addEventListener('click',()=>{const wrap=$('#reservation-embed');if(!wrap.firstChild){const frame=document.createElement('iframe');frame.src=b.dataset.embed;frame.title=words('Consultar reserva en Bookerclub','View reservation in Bookerclub','Consulter la réservation sur Bookerclub');frame.referrerPolicy='strict-origin-when-cross-origin';wrap.append(frame)}wrap.hidden=false;wrap.scrollIntoView({block:'start',behavior:'smooth'});b.textContent=words('Sistema de reservas abierto ↓','Reservation system opened ↓','Système de réservation ouvert ↓')}));
new IntersectionObserver(([entry])=>$('#header').classList.toggle('is-sticky',!entry.isIntersecting),{rootMargin:'-100px 0px 0px 0px'}).observe($('.hero'));
const reveals=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('revealed');reveals.unobserve(e.target)}}),{threshold:.12});$$('.reveal').forEach(e=>reveals.observe(e));
$('#year').textContent=new Date().getFullYear();
addEventListener('click',e=>$$('.lang-menu[open]').forEach(d=>{if(!d.contains(e.target))d.open=false}));
// Cookie consent: Google Analytics (the hotel's GA4 property) loads only after consent and only on the real domain, never on the preview.
const GA='G-V5VHR1GWCJ', CONSENT='varadero-consent', YEAR=365*864e5;
const readConsent=()=>{try{const c=JSON.parse(localStorage.getItem(CONSENT));return c&&Date.now()-c.ts<YEAR?c:null}catch{return null}};
function loadAnalytics(){
 if(window.gtag||!/(^|\.)el-varadero\.com$/.test(location.hostname))return;
 window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments)};gtag('js',new Date());gtag('config',GA);
 const s=document.createElement('script');s.async=true;s.src=`https://www.googletagmanager.com/gtag/js?id=${GA}`;document.head.append(s);
}
function saveConsent(analytics){
 try{localStorage.setItem(CONSENT,JSON.stringify({analytics,ts:Date.now()}))}catch{}
 if(analytics)loadAnalytics();else document.cookie.split(';').map(c=>c.split('=')[0].trim()).filter(n=>n.startsWith('_ga')).forEach(n=>{document.cookie=`${n}=; Max-Age=0; path=/; domain=.${location.hostname.replace(/^www\./,'')}`;document.cookie=`${n}=; Max-Age=0; path=/`});
 $('#cookie-banner').hidden=true;if($('#cookie-dialog').open)$('#cookie-dialog').close();
}
$$('[data-consent]').forEach(b=>b.addEventListener('click',()=>{const a=b.dataset.consent;
 if(a==='open'){$('#consent-analytics').checked=!!readConsent()?.analytics;openDialog($('#cookie-dialog'));return}
 saveConsent(a==='accept'?true:a==='reject'?false:$('#consent-analytics').checked)}));
const consent=readConsent();if(consent){if(consent.analytics)loadAnalytics()}else $('#cookie-banner').hidden=false;
// Conversions for GA: booking search sent to the booking engine, phone and email clicks
$('#booking-form').addEventListener('submit',e=>{if(!e.defaultPrevented)window.gtag?.('event','begin_checkout',{arrival:arrival.value,departure:departure.value})});
addEventListener('click',e=>{const a=e.target.closest('a[href^="tel:"],a[href^="mailto:"]');if(a)window.gtag?.('event',a.href.startsWith('tel:')?'click_phone':'click_email')});
if($('#room-panel'))selectRoom(selectedRoom);
