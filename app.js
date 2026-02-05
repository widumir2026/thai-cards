const STORAGE={WORDS:"thai_cards_words_v1",PROGRESS:"thai_cards_progress_v1",SETTINGS:"thai_cards_settings_v1"};
const DEFAULT_WORDS=[
{th:"\u0e2a\u0e27\u0e31\u0e2a\u0e14\u0e35",roman:"sawatdee",en:"hello",de:"hallo"},
{th:"\u0e02\u0e2d\u0e1a\u0e04\u0e38\u0e13",roman:"khop khun",en:"thank you",de:"danke"},
{th:"\u0e43\u0e0a\u0e48",roman:"chai",en:"yes",de:"ja"},
{th:"\u0e44\u0e21\u0e48",roman:"mai",en:"no",de:"nein"},
{th:"\u0e19\u0e49\u0e33",roman:"nam",en:"water",de:"wasser"},
{th:"\u0e01\u0e34\u0e19",roman:"gin",en:"eat",de:"essen"},
{th:"\u0e44\u0e1b",roman:"bpai",en:"go",de:"gehen"},
{th:"\u0e1a\u0e49\u0e32\u0e19",roman:"baan",en:"house",de:"haus"},
{th:"\u0e42\u0e23\u0e07\u0e41\u0e23\u0e21",roman:"rongraem",en:"hotel",de:"hotel"},
{th:"\u0e2b\u0e49\u0e2d\u0e07\u0e19\u0e49\u0e33",roman:"hong nam",en:"toilet",de:"toilette"}
];
function nowMs(){return Date.now()}function clamp(n,a,b){return Math.max(a,Math.min(b,n))}function keyOf(w){return `${w.th}|${w.en}|${w.de}`}
function loadJson(key,fallback){try{const v=localStorage.getItem(key);return v?JSON.parse(v):fallback}catch{return fallback}}
function saveJson(key,value){localStorage.setItem(key,JSON.stringify(value))}
let words=loadJson(STORAGE.WORDS,null);if(!Array.isArray(words)||words.length===0){words=DEFAULT_WORDS;saveJson(STORAGE.WORDS,words)}
let progress=loadJson(STORAGE.PROGRESS,{});
let settings=loadJson(STORAGE.SETTINGS,{mode:"th->en"});
const el={
mode:document.getElementById("mode"),stats:document.getElementById("stats"),offline:document.getElementById("offline"),pwaStatus:document.getElementById("pwaStatus"),
card:document.getElementById("card"),frontLang:document.getElementById("frontLang"),frontWord:document.getElementById("frontWord"),backLang:document.getElementById("backLang"),backWord:document.getElementById("backWord"),backExtra:document.getElementById("backExtra"),tapHint:document.getElementById("tapHint"),
flip:document.getElementById("flip"),again:document.getElementById("again"),hard:document.getElementById("hard"),good:document.getElementById("good"),next:document.getElementById("next"),reset:document.getElementById("reset"),
speakFront:document.getElementById("speakFront"),speakBack:document.getElementById("speakBack"),
csvFile:document.getElementById("csvFile"),exportCsv:document.getElementById("exportCsv"),clearWords:document.getElementById("clearWords")
};
el.mode.value=settings.mode;
let current=null,flipped=false,lastPair=null;
function getOrInitProgress(w){const k=keyOf(w);if(!progress[k])progress[k]={ease:2.5,intervalDays:0,dueAtMs:0,reps:0};return progress[k]}
function dueWords(){const t=nowMs();return words.filter(w=>{const p=getOrInitProgress(w);return !p.dueAtMs||p.dueAtMs<=t})}
function nextDue(){const t=nowMs();let n=Infinity;for(const w of words){const p=getOrInitProgress(w);if(p.dueAtMs&&p.dueAtMs>t)n=Math.min(n,p.dueAtMs)}return n===Infinity?null:n}
function formatDue(ms){const d=Math.max(0,ms-nowMs());const min=Math.round(d/60000);if(min<=1)return"gleich";if(min<60)return`in ${min} min`;const h=Math.round(min/60);if(h<48)return`in ${h} h`;const days=Math.round(h/24);return`in ${days} d`}
function getPair(mode,w){if(mode==="th->en")return{front:{lang:"Thai",text:w.th},back:{lang:"Englisch",text:w.en,extra:w.roman?"Umschrift: "+w.roman:""}};
if(mode==="th->de")return{front:{lang:"Thai",text:w.th},back:{lang:"Deutsch",text:w.de,extra:w.roman?"Umschrift: "+w.roman:""}};
if(mode==="en->th")return{front:{lang:"Englisch",text:w.en},back:{lang:"Thai",text:w.th,extra:w.roman?"Umschrift: "+w.roman:""}};
if(mode==="de->th")return{front:{lang:"Deutsch",text:w.de},back:{lang:"Thai",text:w.th,extra:w.roman?"Umschrift: "+w.roman:""}};
const opts=["th->en","th->de","en->th","de->th"];return getPair(opts[Math.floor(Math.random()*opts.length)],w)}
function pickNextCard(){const due=dueWords();if(due.length===0){let best=null,bestMs=Infinity;const t=nowMs();for(const w of words){const p=getOrInitProgress(w);const ms=p.dueAtMs||0;if(ms>t&&ms<bestMs){best=w;bestMs=ms}}current=best||words[0]||null}else{current=due[Math.floor(Math.random()*due.length)]}flipped=false;render()}
function render(){if(!current){el.frontLang.textContent="-";el.frontWord.textContent="Keine Woerter";el.backLang.style.display="none";el.backWord.style.display="none";el.backExtra.style.display="none";el.tapHint.textContent="";updateStats();return}
const pair=getPair(el.mode.value,current);lastPair=pair;el.frontLang.textContent=pair.front.lang;el.frontWord.textContent=pair.front.text;el.backLang.textContent=pair.back.lang;el.backWord.textContent=pair.back.text;el.backExtra.textContent=pair.back.extra||"";
if(flipped){el.backLang.style.display="";el.backWord.style.display="";el.backExtra.style.display=pair.back.extra?"":"none";el.tapHint.textContent="Bewerte: Nochmal / Schwer / Gekonnt"}else{el.backLang.style.display="none";el.backWord.style.display="none";el.backExtra.style.display="none";el.tapHint.textContent="Tippen zum Umdrehen"}
updateStats()}
function flip(){if(!current)return;flipped=!flipped;render()}
function sm2Update(w,quality){const p=getOrInitProgress(w);if(quality<3){p.reps=0;p.intervalDays=0;p.dueAtMs=nowMs()+2*60*1000}else{p.reps+=1;if(p.reps===1)p.intervalDays=1;else if(p.reps===2)p.intervalDays=3;else p.intervalDays=Math.round(p.intervalDays*p.ease);p.ease=p.ease+(0.1-(5-quality)*(0.08+(5-quality)*0.02));p.ease=clamp(p.ease,1.3,3.0);p.dueAtMs=nowMs()+p.intervalDays*24*60*60*1000}
progress[keyOf(w)]=p;saveJson(STORAGE.PROGRESS,progress)}
function markAgain(){if(current){sm2Update(current,1);pickNextCard()}}function markHard(){if(current){sm2Update(current,3);pickNextCard()}}function markGood(){if(current){sm2Update(current,5);pickNextCard()}}
function resetLearning(){progress={};saveJson(STORAGE.PROGRESS,progress);pickNextCard()}
function updateStats(){const due=dueWords().length;const total=words.length;const nxt=nextDue();const txtNext=nxt?`naechste faellig: ${formatDue(nxt)}`:"alles faellig";el.stats.textContent=`faellig ${due}/${total} - ${txtNext}`}
function detectOffline(){el.offline.textContent=navigator.onLine?"online":"offline"}
window.addEventListener("online",detectOffline);window.addEventListener("offline",detectOffline);
function speak(text,langHint){if(!("speechSynthesis" in window)){alert("Audio nicht verfuegbar.");return}window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);if(langHint==="th")u.lang="th-TH";if(langHint==="en")u.lang="en-US";if(langHint==="de")u.lang="de-DE";window.speechSynthesis.speak(u)}
function langCodeFromLabel(label){if(label==="Thai")return"th";if(label==="Englisch")return"en";if(label==="Deutsch")return"de";return""}
function parseCsv(text){const rows=[];let i=0,field="",row=[],inQuotes=false;while(i<text.length){const c=text[i];if(inQuotes){if(c==='"'){if(text[i+1]==='"'){field+='"';i+=2;continue}inQuotes=false;i++;continue}field+=c;i++;continue}else{if(c==='"'){inQuotes=true;i++;continue}if(c===","){row.push(field);field="";i++;continue}if(c==="\n"){row.push(field);rows.push(row);field="";row=[];i++;continue}if(c==="\r"){i++;continue}field+=c;i++;continue}}row.push(field);rows.push(row);return rows.filter(r=>r.some(x=>(x||"").trim()!==""))}
function toCsv(rows){const esc=s=>{const v=(s??"").toString();return /[",\n\r]/.test(v)?`"${v.replace(/"/g,'""')}"`:v};return rows.map(r=>r.map(esc).join(",")).join("\n")}
function normalizeWord(obj){const th=(obj.th||"").trim(),en=(obj.en||"").trim(),de=(obj.de||"").trim(),roman=(obj.roman||"").trim();if(!th||(!en&&!de))return null;return{th,roman,en,de}}
async function importCsv(file){const text=await file.text();const rows=parseCsv(text);if(rows.length<2){alert("CSV leer oder ungueltig.");return}
const header=rows[0].map(h=>h.trim().toLowerCase());const idx={th:header.indexOf("th"),roman:header.indexOf("roman"),en:header.indexOf("en"),de:header.indexOf("de")};
if(idx.th===-1||idx.en===-1||idx.de===-1){alert("CSV braucht Header: th,roman,en,de");return}
const imported=[];for(let r=1;r<rows.length;r++){const row=rows[r];const w=normalizeWord({th:row[idx.th],roman:idx.roman>=0?row[idx.roman]:"",en:row[idx.en],de:row[idx.de]});if(w)imported.push(w)}
if(imported.length===0){alert("Keine gueltigen Zeilen gefunden.");return}
words=imported;saveJson(STORAGE.WORDS,words);progress={};saveJson(STORAGE.PROGRESS,progress);pickNextCard();alert(`Import ok: ${words.length} Woerter.`)}
function exportCsv(){const rows=[["th","roman","en","de"]];for(const w of words)rows.push([w.th,w.roman||"",w.en||"",w.de||""]);const csv=toCsv(rows);const blob=new Blob([csv],{type:"text/csv;charset=utf-8"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="thai_cards.csv";document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url)}
function clearWords(){if(!confirm("Wortliste wirklich loeschen?"))return;words=[];saveJson(STORAGE.WORDS,words);progress={};saveJson(STORAGE.PROGRESS,progress);pickNextCard()}
async function initServiceWorker(){if(!("serviceWorker" in navigator)){el.pwaStatus.textContent="ServiceWorker nicht verfuegbar";return}
try{const reg=await navigator.serviceWorker.register("./sw.js");el.pwaStatus.textContent="ServiceWorker aktiv";reg.update&&reg.update()}catch{el.pwaStatus.textContent="ServiceWorker Fehler"}}
function init(){detectOffline();updateStats();
el.card.addEventListener("click",flip);el.flip.addEventListener("click",flip);el.next.addEventListener("click",pickNextCard);
el.again.addEventListener("click",markAgain);el.hard.addEventListener("click",markHard);el.good.addEventListener("click",markGood);
el.reset.addEventListener("click",resetLearning);
el.mode.addEventListener("change",()=>{settings.mode=el.mode.value;saveJson(STORAGE.SETTINGS,settings);render()});
el.speakFront.addEventListener("click",()=>{if(!lastPair)return;speak(lastPair.front.text,langCodeFromLabel(lastPair.front.lang))});
el.speakBack.addEventListener("click",()=>{if(!lastPair)return;speak(lastPair.back.text,langCodeFromLabel(lastPair.back.lang))});
el.csvFile.addEventListener("change",ev=>{const f=ev.target.files&&ev.target.files[0];if(f)importCsv(f);ev.target.value=""});
el.exportCsv.addEventListener("click",exportCsv);el.clearWords.addEventListener("click",clearWords);
initServiceWorker();pickNextCard()}
init();
