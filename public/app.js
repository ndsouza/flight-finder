const $ = id => document.getElementById(id);
const cities = {JFK:'New York',ORD:'Chicago',SFO:'San Francisco',LAX:'Los Angeles',LIS:'Lisbon',LHR:'London',CDG:'Paris',NRT:'Tokyo'};
const money = n => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let storageAvailable = true;
function read(key) { try {const value=JSON.parse(localStorage.getItem(key)||'[]'); return Array.isArray(value)?value:[];} catch {storageAvailable=false;return [];} }
let trackers = read('ff-trackers').filter(t=>cities[t.origin]&&cities[t.destination]&&Number.isFinite(t.price)&&Number.isFinite(t.target));
let alerts = read('ff-alerts').filter(a=>typeof a.text==='string'&&typeof a.time==='string');
function save(){try{localStorage.setItem('ff-trackers',JSON.stringify(trackers));localStorage.setItem('ff-alerts',JSON.stringify(alerts));}catch{storageAvailable=false;toast('Browser storage is unavailable. Changes will last for this session.');}}
let toastTimer;
function toast(message){$('toast').textContent=message;$('toast').style.display='block';clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').style.display='none',4000);}
const date = new Date();date.setDate(date.getDate()+30);
const iso = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
$('depart').min=iso(new Date());$('depart').value=iso(date);date.setDate(date.getDate()+7);$('return').value=iso(date);$('return').min=$('depart').value;
$('depart').addEventListener('change',()=>{$('return').min=$('depart').value;if($('return').value<$('depart').value){const d=new Date(`${$('depart').value}T12:00:00`);d.setDate(d.getDate()+7);$('return').value=iso(d);}});
let query, flights, selected;
function search(){
 const origin=$('origin').value,destination=$('destination').value;
 if(origin===destination){$('form-error').textContent='Choose a different destination from your origin.';return;}
 if(!$('depart').value||!$('return').value||$('depart').value<iso(new Date())||$('return').value<$('depart').value){$('form-error').textContent='Choose a future departure and a return on or after departure.';return;}
 $('form-error').textContent='';
 query={origin,destination,depart:$('depart').value,return:$('return').value,passengers:Number($('passengers').value)};
 const base=destination==='NRT'?720:destination==='LIS'?418:destination==='JFK'||destination==='ORD'||destination==='LAX'||destination==='SFO'?258:478;
 const variation=(origin.charCodeAt(0)+new Date(`${query.depart}T12:00:00`).getDate())%5*12;
 flights=[{id:1,airline:'TAP Air Portugal',icon:'→',time:'22:45',arrival:'10:35',duration:410,stops:0,price:base+variation,tag:'BEST PRICE'},{id:2,airline:'United Airlines',icon:'◈',time:'19:30',arrival:'07:50',duration:440,stops:0,price:base+variation+87,tag:'QUICKEST GETAWAY'},{id:3,airline:'Iberia',icon:'✦',time:'17:10',arrival:'11:25',duration:675,stops:1,price:base+variation+34,tag:''},{id:4,airline:'British Airways',icon:'➤',time:'20:15',arrival:'13:40',duration:620,stops:1,price:base+variation+129,tag:''}];
 flights[1].duration=390;
 $('results-heading').textContent=`${cities[origin]} to ${cities[destination]}`;renderFlights();
}
function renderFlights(){
 const visible=flights.filter(f=>(!$('nonstop').checked||f.stops===0)&&f.price<=Number($('budget').value)).sort((a,b)=>a[$('sort').value]-b[$('sort').value]);
 $('results-summary').textContent=`${visible.length} sample round-trip options · ${query.depart} – ${query.return} · ${query.passengers} ${query.passengers===1?'traveler':'travelers'}`;
 $('budget-value').textContent=money($('budget').value);
 $('results').innerHTML=visible.length?visible.map(f=>`<article class="flight-card">${f.tag?`<span class="card-tag">${f.tag}</span>`:''}<div class="flight-row"><div class="airline"><span class="airline-icon">${f.icon}</span><div>${f.airline}<small>Sample itinerary</small></div></div><div class="time">${f.time}<small>${query.origin}</small></div><div class="journey">${Math.floor(f.duration/60)}h ${f.duration%60}m<div class="flight-line"></div>${f.stops?'1 stop':'Nonstop'}</div><div class="time">${f.arrival}<small>${query.destination} · +1 day</small></div><div class="price"><strong>${money(f.price)}</strong><small>round trip / traveler</small></div></div><div class="card-bottom"><span>Economy · Sample fare${query.passengers>1?` · ${money(f.price*query.passengers)} total`:''}</span><button class="track-button" data-flight="${f.id}">♡ Track this price</button></div></article>`).join(''):'<div class="empty">No sample flights match these filters.<br>Try increasing your budget or including connections.</div>';
 $('results').querySelectorAll('[data-flight]').forEach(button=>button.addEventListener('click',()=>{selected=flights.find(f=>f.id===Number(button.dataset.flight));$('track-route').textContent=`${cities[query.origin]} → ${cities[query.destination]} · Currently ${money(selected.price)} per traveler`;$('target-price').value=Math.round(selected.price*.85);$('track-dialog').showModal();}));
}
function setTab(tab){document.querySelectorAll('.nav').forEach(n=>n.classList.toggle('active',n.dataset.tab===tab));$('search-panel').hidden=tab!=='search';$('trackers-panel').hidden=tab!=='trackers';if(tab==='trackers')renderTrackers();}
document.querySelectorAll('.nav').forEach(n=>n.addEventListener('click',()=>setTab(n.dataset.tab)));
$('search-form').addEventListener('submit',e=>{e.preventDefault();search();});
['sort','nonstop','budget'].forEach(id=>$(id).addEventListener('input',renderFlights));
$('swap').addEventListener('click',()=>{const previous=$('origin').value,next=$('destination').value;if(!$('origin').querySelector(`option[value="${next}"]`)){const option=document.createElement('option');option.value=next;option.textContent=`${cities[next]} (${next})`;$('origin').append(option);}$('origin').value=next;$('destination').value=previous;});
document.querySelector('.close').addEventListener('click',()=>$('track-dialog').close());
$('track-form').addEventListener('submit',e=>{e.preventDefault();const target=Number($('target-price').value);if(!Number.isFinite(target)||target<1||target>10000)return;const existing=trackers.find(t=>t.origin===query.origin&&t.destination===query.destination&&t.depart===query.depart&&t.return===query.return&&t.airline===selected.airline);if(existing){existing.target=target;toast('Target price updated.');}else{trackers.push({...query,id:crypto.randomUUID(),airline:selected.airline,price:selected.price,target});toast('Price tracker created. Find it in Price trackers.');}save();renderTrackers();$('track-dialog').close();});
function renderTrackers(){
 $('track-count').textContent=trackers.length;
 $('simulate').disabled=trackers.length===0;
 $('trackers').innerHTML=trackers.length?trackers.map(t=>`<article class="tracker-card"><div class="tracker-info"><h3>${cities[t.origin]} <span style="color:#91a18a">→</span> ${cities[t.destination]}</h3><p>${escape(t.depart)} – ${escape(t.return)} · ${escape(t.airline)}</p><p>${t.price<=t.target?'✓ Target reached · Demo fare':'Watching for a better sample fare'}</p></div><div class="fare-stat ${t.price<=t.target?'reached':''}"><small>CURRENT FARE</small>${money(t.price)}</div><div class="fare-stat"><small>YOUR TARGET</small>${money(t.target)}</div><button class="remove" data-remove="${escape(t.id)}" aria-label="Remove ${cities[t.destination]} tracker">Remove</button></article>`).join(''):'<div class="empty">Your next adventure starts with a search.<br>Choose “Track this price” on a flight to add your first tracker.</div>';
 $('trackers').querySelectorAll('[data-remove]').forEach(button=>button.addEventListener('click',()=>{trackers=trackers.filter(t=>t.id!==button.dataset.remove);save();renderTrackers();}));
 $('alerts').innerHTML=alerts.length?alerts.map(a=>`<div class="alert">${escape(a.text)}<small>${escape(a.time)} · Simulated fare alert</small></div>`).join(''):'<p class="sample-note">No alerts yet. Simulate a fare drop to try it out.</p>';
}
$('simulate').addEventListener('click',()=>{let triggered=0;trackers.forEach(t=>{const previous=t.price;t.price=Math.max(1,Math.round(t.price*.88));if(previous>t.target&&t.price<=t.target){triggered++;alerts.unshift({text:`${cities[t.origin]} → ${cities[t.destination]} dropped to ${money(t.price)} — below your ${money(t.target)} target!`,time:new Date().toLocaleString()});}});alerts=alerts.slice(0,30);save();renderTrackers();toast(triggered?`${triggered} target ${triggered===1?'alert':'alerts'} triggered!`:'Sample fares dropped 12%. Keep an eye on your targets.');});
search();renderTrackers();if(!storageAvailable)toast('Browser storage is unavailable. Trackers last for this session.');
