/* Alef-Beta Israel - the app. Content lives in data/*.js, recordings in audio/. */
(function(){
"use strict";
var A = window.ALEF || {};                         // content, from data/*.js
var LETTERS_ONLY = window.ALEF_PAGE === "letters";  // letters.html: the letters tab on its own
/* ---------- the fidel ---------- */
var V_LAT = ["ä","u","i","a","e","ï","o"];
// [mark that sits on the consonant, letters that follow it]
var V_HEB = [["\u05B6",""],["","\u05D5\u05BC"],["\u05B4","\u05D9"],["\u05B8",""],["\u05B5","\u05D9"],["\u05B0",""],["","\u05D5\u05B9"]];
var DAG = "\u05BC", SHIN = "\u05C1", GER = "'";

// cp = code point of the first order; the six others follow it in Unicode
var LETTERS = [
  {cp:0x1200, lat:"h",  ch:"ה", lar:1, regular1:1},
  {cp:0x1208, lat:"l",  ch:"ל"},
  {cp:0x1210, lat:"h",  ch:"ה", lar:1, regular1:1},
  {cp:0x1218, lat:"m",  ch:"מ"},
  {cp:0x1220, lat:"s",  ch:"ס"},
  {cp:0x1228, lat:"r",  ch:"ר"},
  {cp:0x1230, lat:"s",  ch:"ס"},
  {cp:0x1238, lat:"sh", tb:"š", ch:"ש", dot:SHIN},
  {cp:0x1240, lat:"q", tb:"k'",  ch:"ק"},
  {cp:0x1260, lat:"b",  ch:"ב", dot:DAG},
  {cp:0x1268, lat:"v",  ch:"ב"},
  {cp:0x1270, lat:"t",  ch:"ת"},
  {cp:0x1278, lat:"ch", tb:"č", ch:"צ", suf:GER},
  {cp:0x1280, lat:"h",  ch:"ה", lar:1},
  {cp:0x1290, lat:"n",  ch:"נ"},
  {cp:0x1298, lat:"gn", tb:"ň", ch:"י", pre:"נ\u05B0"},
  {cp:0x12A0, lat:"",   ch:"א", lar:1},
  {cp:0x12A8, lat:"k",  ch:"כ", dot:DAG},
  {cp:0x12B8, lat:"h",  ch:"ה"},
  {cp:0x12C8, lat:"w",  ch:"ו"},
  {cp:0x12D0, lat:"",   ch:"ע", lar:1},
  {cp:0x12D8, lat:"z",  ch:"ז"},
  {cp:0x12E0, lat:"zh", tb:"ž", ch:"ז", suf:GER},
  {cp:0x12E8, lat:"y",  ch:"י"},
  {cp:0x12F0, lat:"d",  ch:"ד"},
  {cp:0x1300, lat:"j",  ch:"ג", suf:GER},
  {cp:0x1308, lat:"g",  ch:"ג"},
  {cp:0x1320, lat:"t'", ch:"ט"},
  {cp:0x1328, lat:"ch'", tb:"č'",ch:"צ", suf:GER},
  {cp:0x1330, lat:"p'", ch:"פ", dot:DAG},
  {cp:0x1338, lat:"ts", tb:"s'", ch:"צ"},
  {cp:0x1340, lat:"ts", tb:"s'", ch:"צ"},
  {cp:0x1348, lat:"f",  ch:"פ"},
  {cp:0x1350, lat:"p",  ch:"פ", dot:DAG}
];
LETTERS.forEach(function(L){
  L.id = String.fromCodePoint(L.cp);
  L.forms = [];
  for (var o=0;o<7;o++){
    var a = (L.lar && o===0 && !L.regular1);            // the throat letters read "a" in the first order
    var v = a ? V_HEB[3] : V_HEB[o];
    var lat = (L.tb||L.lat) + (a ? "a" : V_LAT[o]);   // tb = the consonant as written in the fidel table
    L.forms.push({
      g: String.fromCodePoint(L.cp+o), o:o, L:L, lat:lat, key:lat,
      heb: (L.pre||"") + L.ch + (L.dot||"") + v[0] + (L.suf||"") + v[1]
    });
  }
});
var BY_ID = {}; LETTERS.forEach(function(L){ BY_ID[L.id]=L; });
var START_SET = ["ለ","ሰ","ሸ","በ","ቨ","አ","ከ","ኸ","ዘ","ዠ","ደ","ጀ","ጰ","ጸ"];

/* ---------- lesson decks (from the teacher's slides and the lesson summaries) ---------- */
// [the teacher's Latin spelling, fidel where the slides give it, Hebrew]
var DECKS = (A.DECKS||[]).slice();

// words from amharicteacher.com: [fidel, Hebrew]; the Latin spelling is derived from the fidel
var SITE = A.SITE||[];
// fidel -> Latin in the notation of the teacher's fidel tables: ä for the first order, e for the fifth,
// š č ň ž k' s' for the consonants; the sixth order is written (ï) only on the vowel carriers
var TR_BASE = {}; LETTERS.forEach(function(L){ TR_BASE[L.cp]=L; });
var TR_LAB = {0x1248:"k'", 0x1288:"h", 0x12B0:"k", 0x1310:"g"};
function tr(s){
  var out="";
  Array.from(s).forEach(function(ch){
    var cp=ch.codePointAt(0), b=cp-(cp%8), o=cp-b;
    if (cp===0x12CD && (!out || /[\s(\/-]$/.test(out))){ out+="wu"; return; }   // ው opening a word is read wu
    if (TR_LAB[b]){ out += TR_LAB[b]+["uä","","ui","ua","ue","u","",""][o]; return; }
    var L=TR_BASE[b];
    if (!L){ out+=ch; return; }
    var v = o===0 ? (L.lar && !L.regular1 ? "a":"ä") : o===5 ? (L.lat===""?"ï":"") : ["","u","i","a","e","","o","ua"][o];
    out += (L.tb||L.lat)+v;
  });
  return out;
}
// The spelling the cards had before the switch to the table notation. Progress is saved under these
// keys, so they must never change: a card whose spelling is corrected keeps its old key here.
var TRK_LAB = {0x1248:"q", 0x1288:"h", 0x12B0:"k", 0x1310:"g"};
function trKey(s){
  var out="";
  Array.from(s).forEach(function(ch){
    var cp=ch.codePointAt(0), b=cp-(cp%8), o=cp-b;
    if (TRK_LAB[b]){ out += TRK_LAB[b]+["ue","","ui","ua","ue","u","",""][o]; return; }
    var L=TR_BASE[b];
    if (!L){ out+=ch; return; }
    var v = o===0 ? (L.lar?"a":"e") : o===5 ? (L.lat===""?"e":"") : ["","u","i","a","e","","o","ua"][o];
    out += L.lat+v;
  });
  return out;
}
var KEY_OF = A.KEY_OF||{};
SITE.forEach(function(d){
  d.src="site";
  d.cards=d.cards.map(function(c){ return [c[3]||tr(c[0]), c[0], c[1], 0, trKey(c[2]||c[0])]; });   // c[3]: the reading the learner was taught, when the fidel alone would give another   // c[2]: an earlier spelling, kept as the progress key
  DECKS.push(d);
});
var ALL = [];
var FID_FILL = A.FID_FILL||{};
DECKS.forEach(function(d){
  d.items = d.cards.map(function(c){ return {lat:c[0], fid:c[1]||FID_FILL[c[0]]||"", he:c[2], g:"w:"+(c[4]||KEY_OF[c[0]]||c[0]), deck:d, mine:!!c[3]||(!c[1]&&!!FID_FILL[c[0]])}; });
  ALL = ALL.concat(d.items);
});
// pronunciation of single fidel words, taken from the cards' own Latin spelling where the words line up
var WORD_LAT = {};
ALL.forEach(function(c){
  if (!c.fid) return;
  var f=c.fid.split(" "), l=c.lat.split(" ");
  if (f.length!==l.length) return;
  f.forEach(function(w,i){ if(!WORD_LAT[w]) WORD_LAT[w]=l[i].toLowerCase(); });
});

/* ---------- state + saving ---------- */
var LS_KEY = "fidel-trainer-v1", GOAL = 30;
function fresh(){ return {v:2, letters:START_SET.slice(), str:{}, due:{}, words:[], xp:0, streak:0, lastDay:"", dayKey:"", dayXp:0, mute:false}; }
function uid(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,6); }
function norm(d){
  var s = fresh();
  if (!d || typeof d!=="object") return s;
  if (Array.isArray(d.letters)) s.letters = d.letters.filter(function(x){return BY_ID[x];});
  if (d.str && typeof d.str==="object") s.str = Object.assign({}, d.str);
  if (Array.isArray(d.words)) s.words = d.words.filter(function(w){return w && typeof w.a==="string" && typeof w.h==="string";})
    .map(function(w){ return {id:String(w.id||uid()), a:w.a, h:w.h}; });
  if (d.due && typeof d.due==="object") s.due = Object.assign({}, d.due);
  s.xp=+d.xp||0; s.streak=+d.streak||0; s.lastDay=String(d.lastDay||""); s.dayKey=String(d.dayKey||""); s.dayXp=+d.dayXp||0; s.mute=!!d.mute;
  return s;
}
var state = fresh();
try { var raw = localStorage.getItem(LS_KEY); if (raw) state = norm(JSON.parse(raw)); } catch(e){}

var ref = null, chain = Promise.resolve(), timer = null, touched = {}, syncText = "טוען את ההתקדמות שלך...";
var SYNC_OK = "ההתקדמות שלך נשמרת.", SYNC_LOCAL = "ההתקדמות נשמרת בדפדפן הזה בלבד.";
function setSync(t){ syncText=t; var el=document.getElementById("sync"); if(el) el.textContent=t; }
function save(){
  try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch(e){}
  if (!ref) return;
  clearTimeout(timer); timer = setTimeout(flush, 1200);
}
function flush(){
  if (!ref) return;
  var body = JSON.parse(JSON.stringify(state));
  chain = chain.then(function(){ return ref.set(body); }).then(function(){ setSync(SYNC_OK); }).catch(function(){ setSync(SYNC_LOCAL); });
}
function connect(){
  if (!window.claude || typeof window.claude.use!=="function"){ setSync(SYNC_LOCAL); return; }
  Promise.all([window.claude.use("db"), window.claude.use("user")]).then(function(r){
    var db=r[0], user=r[1];
    if (!db || !user) { setSync(SYNC_LOCAL); return; }
    return user.id().then(function(id){
      if (!id) { setSync(SYNC_LOCAL); return; }
      var d = db.doc("data/users/"+id+"/state");
      return d.get().then(function(snap){
        ref = d;
        if (snap.exists){
          var remote = norm(snap.data());
          Object.keys(touched).forEach(function(k){ remote.str[k]=state.str[k]; if(k in state.due) remote.due[k]=state.due[k]; });
          state = remote;
          try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch(e){}
          if (!L) render();
        } else if (Object.keys(state.str).length || state.words.length || state.xp){
          flush();
        }
        setSync(SYNC_OK);
      });
    });
  }).catch(function(){ setSync(SYNC_LOCAL); });
}

/* ---------- helpers ---------- */
function esc(s){ return String(s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }
function shuffle(a){ for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;} return a; }
function strength(g){ return state.str[g]||0; }
/* spaced repetition: a level 0-5 per item, and the day it is next due.
   A correct answer on a new or due item moves it up a level and schedules it
   IV[level] days ahead; a mistake drops the level and makes it due today. */
var IV=[0,1,3,7,14,30];
function dayNum(){ var d=new Date(); return Math.floor((d.getTime()-d.getTimezoneOffset()*60000)/86400000); }
function isNew(g){ return !(g in state.str); }
function isDue(g){ return !isNew(g) && (state.due[g]===undefined || state.due[g]<=dayNum()); }
function drawer(items){            // due items first, then new ones, then the rest; never a repeat
  var seen={}, due=[], fresh=[], later=[];
  items.forEach(function(x){ if(seen[x.g]) return; seen[x.g]=1; (isNew(x.g)?fresh:isDue(x.g)?due:later).push(x); });
  shuffle(due).sort(function(a,b){ return (state.due[a.g]||0)-(state.due[b.g]||0) || strength(a.g)-strength(b.g); });
  shuffle(fresh);
  shuffle(later).sort(function(a,b){ return state.due[a.g]-state.due[b.g]; });
  var rest=due.concat(fresh, later);
  return { left:function(){return rest.length;}, draw:function(){ return rest.shift(); } };
}
function pad(n){ return (n<10?"0":"")+n; }
function dayStr(d){ return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate()); }
function today(){ return dayStr(new Date()); }
function yesterday(){ var d=new Date(); d.setDate(d.getDate()-1); return dayStr(d); }
function liveStreak(){ return (state.lastDay===today()||state.lastDay===yesterday()) ? state.streak : 0; }
function todayXp(){ return state.dayKey===today() ? state.dayXp : 0; }
function pool(){ var out=[]; LETTERS.forEach(function(Lt){ if(state.letters.indexOf(Lt.id)>=0) out=out.concat(Lt.forms); }); return out; }
function mastery(items){
  var seen={}, m={n:0, ok:0, seen:0, due:0};
  items.forEach(function(x){ if(seen[x.g])return; seen[x.g]=1; m.n++; if(strength(x.g)>=3) m.ok++; if(strength(x.g)>=1) m.seen++; if(isDue(x.g)) m.due++; });
  return m;
}
function dueWords(){
  var seen={}, out=[];
  ALL.concat(ownDeck().items).forEach(function(x){ if(!seen[x.g] && isDue(x.g)){ seen[x.g]=1; out.push(x); } });
  return out;
}
function ownDeck(){
  var d={id:"own", title:"המילים שלי", src:"own"};
  d.items=state.words.map(function(w){ return {lat:w.a, fid:"", he:w.h, g:"u:"+w.id, deck:d}; });
  return d;
}
function getDeck(kind,id){
  if (kind==="own") return ownDeck();
  if (kind==="review") return {id:"review", title:"חזרה יומית", items:dueWords()};
  if (kind==="mix"){ chapters(); return {id:id, title:"תרגול מעורב", items:ALL.filter(function(x){ return id==="s" ? x.deck.part===2 : x.deck.part!==2; })}; }
  for (var i=0;i<DECKS.length;i++) if (DECKS[i].id===id) return DECKS[i];
  return null;
}
function amHTML(c, cls){
  if (!c.fid) return '<span class="am '+(cls||"")+'"><span class="solo">'+esc(c.lat)+'</span></span>';
  return '<span class="am '+(cls||"")+'"><span class="eth" lang="am">'+esc(c.fid)+'</span><span class="lat">'+esc(c.lat)+'</span></span>';
}
function sndHTML(f){ return '<span class="hs">'+f.heb+'</span><span class="ls lat">'+esc(f.lat)+'</span>'; }

/* ---------- sound ---------- */
var actx=null;
function tone(f,t0,d,type,vol){
  var o=actx.createOscillator(), g=actx.createGain();
  o.type=type||"sine"; o.frequency.value=f;
  g.gain.setValueAtTime(0.0001,t0); g.gain.exponentialRampToValueAtTime(vol||0.14,t0+0.015); g.gain.exponentialRampToValueAtTime(0.0001,t0+d);
  o.connect(g); g.connect(actx.destination); o.start(t0); o.stop(t0+d+0.03);
}
function sound(k){
  if (state.mute) return;
  try {
    var AC=window.AudioContext||window.webkitAudioContext; if(!AC) return;
    actx=actx||new AC(); if(actx.state==="suspended") actx.resume();
    var t=actx.currentTime;
    if (k==="ok"){ tone(660,t,.13); tone(990,t+.11,.2); }
    else if (k==="no"){ tone(220,t,.2,"triangle",.2); tone(160,t+.15,.28,"triangle",.2); }
    else if (k==="win"){ [523,659,784,1047].forEach(function(f,i){ tone(f,t+i*.12,.24); }); }
    else if (k==="pair"){ tone(784,t,.1,"sine",.1); }
  } catch(e){}
}

/* ---------- mascot: a jebena (coffee pot) ---------- */
function mascot(mood,size,cls){
  var sad = mood==="sad", ey = sad?83:81;
  return '<svg class="mascot '+(cls||"")+'" width="'+size+'" height="'+Math.round(size*1.2)+'" viewBox="0 0 100 120" aria-hidden="true">'+
    '<defs><clipPath id="mring"><ellipse cx="50" cy="108" rx="31" ry="9.5"/></clipPath></defs>'+
    (sad?'':'<path d="M93 40 q-4 -5 0 -9 M98 43 q4 -5 1 -10" fill="none" stroke="var(--muted)" stroke-width="2.2" stroke-linecap="round"/>')+
    /* straw ring */
    '<ellipse cx="50" cy="108" rx="31" ry="9.5" fill="#EAD7AE"/>'+
    '<g clip-path="url(#mring)"><rect x="42" y="96" width="7" height="24" fill="#E8368F"/><rect x="50" y="96" width="7" height="24" fill="#7B3FA0"/>'+
    '<rect x="21" y="96" width="5" height="24" fill="#E8368F"/><rect x="74" y="96" width="5" height="24" fill="#7B3FA0"/>'+
    '<circle cx="33" cy="110" r="2.2" fill="#7B3FA0"/><circle cx="66" cy="110" r="2.2" fill="#E8368F"/></g>'+
    /* handle, spout */
    '<path d="M46 31 C22 25 9 43 15 58 C18 66 24 70 31 70" fill="none" stroke="var(--clay)" stroke-width="7.5" stroke-linecap="round"/>'+
    '<path d="M68 72 L86 49 Q91 44 96 48 L80 84 Z" fill="var(--clay)"/>'+
    '<ellipse cx="91.5" cy="47.5" rx="4.6" ry="2" transform="rotate(22 91.5 47.5)" fill="var(--clay-l)"/>'+
    /* neck, stopper, body */
    '<ellipse cx="50" cy="6.5" rx="2.4" ry="4.5" fill="none" stroke="#D9BC8A" stroke-width="2"/>'+
    '<path d="M44 14 q6 -6 12 0 z" fill="#C9A66B"/>'+
    '<path d="M38 62 Q46 46 45 31 Q44.5 21 41 14 L59 14 Q55.5 21 55 31 Q54 46 62 62 Z" fill="var(--clay)"/>'+
    '<ellipse cx="50" cy="79" rx="28" ry="25.5" fill="var(--clay)"/>'+
    '<ellipse cx="33" cy="86" rx="5" ry="8" fill="var(--clay-l)" opacity=".45"/>'+
    /* painted decoration */
    '<path d="M50 19 V50" stroke="#fff" stroke-width="5" stroke-dasharray="1.4 2.8"/>'+
    '<path d="M36 61 l4.6 -5 l4.7 5 l4.7 -6 l4.7 6 l4.7 -5 l4.6 5" fill="none" stroke="#FFC800" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/>'+
    '<path d="M33 66 l5 -4 l5 4 l5 -4.5 l4 4.5 l5 -4.5 l5 4.5 l5 -4" fill="none" stroke="#3DB54A" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/>'+
    '<path d="M27 70.5 Q50 64.5 73 70.5" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>'+
    /* face */
    '<circle cx="41" cy="81" r="6.2" fill="#fff"/><circle cx="59" cy="81" r="6.2" fill="#fff"/>'+
    '<circle cx="'+(sad?41:42)+'" cy="'+ey+'" r="3" fill="#1B1210"/><circle cx="'+(sad?59:60)+'" cy="'+ey+'" r="3" fill="#1B1210"/>'+
    (sad ? '<path d="M43 95 q7 -6 14 0" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>'
         : '<path d="M41 90 q9 9 18 0 z" fill="#fff"/>')+
    '</svg>';
}

/* ---------- lesson builders ---------- */
function mcOptions(target){
  var cand = shuffle(target.deck.items.slice());
  if (target.deck.src!=="own") cand = cand.concat(shuffle(ALL.slice()));
  var opts=[target], sh={}, sl={}; sh[target.he]=1; sl[target.lat]=1;
  for (var i=0;i<cand.length && opts.length<4;i++){
    var c=cand[i]; if (sh[c.he]||sl[c.lat]) continue;
    sh[c.he]=1; sl[c.lat]=1; opts.push(c);
  }
  return shuffle(opts);
}
function wordMC(target){
  var opts=mcOptions(target), toHe=Math.random()<0.5;
  return {t:"mc", g:target.g, answer:opts.indexOf(target),
    ask: toHe ? "מה הפירוש?" : "איך אומרים באמהרית?",
    prompt: toHe ? amHTML(target,"pm") : '<span class="big">'+esc(target.he)+'</span>',
    opts: opts.map(function(o){ return toHe ? esc(o.he) : amHTML(o); }),
    answerHTML: amHTML(target)+' = '+esc(target.he)+exHTML(target)};
}
function toks(c){ return (c.fid||c.lat).split(" "); }
function buildable(c){ var w=toks(c), t=c.fid||c.lat; return w.length>=2 && w.length<=6 && t.indexOf("...")<0 && t.indexOf("/")<0; }
function wordBuild(target){
  var words=toks(target), have={}, extra=[], fidel=!!target.fid;
  words.forEach(function(w){ have[w.toLowerCase()]=1; });
  shuffle(target.deck.items.slice()).forEach(function(c){
    if (!!c.fid!==fidel) return;
    toks(c).forEach(function(w){ if(extra.length<3 && w!=="..." && w!=="/" && !have[w.toLowerCase()]){ have[w.toLowerCase()]=1; extra.push(w); } });
  });
  return {t:"build", g:target.g, fidel:fidel, ask:"הרכיבו את המשפט באמהרית", prompt:'<span class="big">'+esc(target.he)+'</span>',
    tiles:shuffle(words.concat(extra)), solution:words.join(" "), picked:[], answerHTML: amHTML(target)+' = '+esc(target.he)+exHTML(target)};
}
function spellable(c){
  if (!c.fid || c.fid.indexOf(" ")>=0) return false;
  var ch=Array.from(c.fid);
  return ch.length>=2 && ch.length<=6 && ch.every(function(x){ return !!formOf(x); });
}
function wordSpell(target){
  var chars=Array.from(target.fid), have={}, extra=[];
  chars.forEach(function(x){ have[x]=1; });
  shuffle(chars.slice()).forEach(function(x){
    shuffle(formOf(x).L.forms.slice()).forEach(function(f){ if(extra.length<3 && !have[f.g]){ have[f.g]=1; extra.push(f.g); } });
  });
  return {t:"build", spell:true, sep:"", g:target.g, ask:"אייתו את המילה בפידל",
    prompt:'<span class="big">'+esc(target.he)+'</span><span class="sndl lat" style="display:block">'+esc(target.lat)+'</span>',
    tiles:shuffle(chars.concat(extra)), solution:target.fid, picked:[], answerHTML: amHTML(target)+' = '+esc(target.he)+exHTML(target)};
}
/* example sentences: a single word is linked to a sentence card that uses it */
var EX_LINK = A.EX_LINK||{};
var EX_BY_LAT=null, EX_SENT=null, EX_CACHE={};
var EX_NOFUZZ=/^(past|pres|conj|obj|neg|was|had|feel|rel|after|whenif|verbsI|be|have|poss)/;   // conjugation topics: a near-match there is a different person
var EX_PRE=["","ለ","በ","ከ","የ","ወደ"], EX_SUF=["","ን","ም","ህ","ሽ","ው","ዋ","ችን","ችሁ","ቸው","ዬ","ዬን","ህን","ሽን","ውን","ች","ዎች"];
function exFuzzy(W, token){
  for (var p=0;p<EX_PRE.length;p++){
    if (token.indexOf(EX_PRE[p])!==0) continue;
    var R=Array.from(token.slice(EX_PRE[p].length)), n=W.length;
    if (R.length<n) continue;
    var same=true; for (var i=0;i<n-1;i++) if (R[i]!==W[i]){ same=false; break; }
    if (!same) continue;
    var a=W[n-1].codePointAt(0), b=R[n-1].codePointAt(0);
    if (a-(a%8)!==b-(b%8)) continue;                       // last letter: same consonant, the vowel may change
    var tail=R.slice(n).join(""), changed=a!==b;
    if (EX_SUF.indexOf(tail)<0) continue;
    if (!changed && !tail && !EX_PRE[p]) continue;         // that is the exact match, handled above
    if (changed && !tail && [1,4].indexOf(b%8)<0) continue; // bare vowel change only for -u (his/the) and -e (my)
    return true;
  }
  return false;
}
function exampleFor(c){
  if (!c.fid || c.lat.indexOf(" ")>=0 || c.fid.indexOf(" ")>=0 || c.deck.src==="own") return null;
  if (c.g in EX_CACHE) return EX_CACHE[c.g];
  if (!EX_SENT){
    EX_BY_LAT={}; EX_SENT=[];
    ALL.forEach(function(x){
      EX_BY_LAT[x.lat]=x;
      var t=x.fid.split(" ");
      if (x.deck.src!=="site" && t.length>=2 && x.fid.indexOf("...")<0 && x.fid.indexOf("/")<0) EX_SENT.push({c:x, t:t.map(function(w){ return w.replace(/[?!,.፣።]/g,""); })});
    });
    EX_SENT.sort(function(a,b){ return a.t.length-b.t.length; });
  }
  var hit=null, key=c.lat.toLowerCase();
  if (EX_LINK[key] && EX_BY_LAT[EX_LINK[key]]) hit=EX_BY_LAT[EX_LINK[key]];
  else for (var i=0;i<EX_SENT.length;i++){ if (EX_SENT[i].c!==c && EX_SENT[i].t.indexOf(c.fid)>=0){ hit=EX_SENT[i].c; break; } }
  // second pass: the word with a prefix (le-, be-, ke-, ye-) or a suffix (-e my, -u his, -n object, -sh, -h ...)
  if (!hit && !EX_NOFUZZ.test(c.deck.id) && c.fid!=="ጥር"){   // ጥር (a month) would wrongly match ጥሩ (good)
    var W=Array.from(c.fid);
    if (W.length>=2) for (var j=0;j<EX_SENT.length && !hit;j++){
      if (EX_SENT[j].c===c) continue;
      for (var k=0;k<EX_SENT[j].t.length;k++){ if (exFuzzy(W, EX_SENT[j].t[k])){ hit=EX_SENT[j].c; break; } }
    }
  }
  return (EX_CACHE[c.g]=hit);
}
function exHTML(c){
  var x=exampleFor(c); if(!x) return "";
  return '<span class="fb-ex"><b>לדוגמה:</b> <span class="eth" lang="am">'+esc(x.fid)+'</span> <span class="lat">'+esc(x.lat)+'</span><br>'+esc(x.he)+'</span>';
}
function wordMatch(items){
  return {t:"match", ask:"התאימו את הזוגות",
    left: shuffle(items.map(function(c,i){ return {id:i, html:amHTML(c)}; })),
    right: shuffle(items.map(function(c,i){ return {id:i, html:esc(c.he)}; })),
    gs: items.map(function(c){return c.g;}), done:{}, errs:{}, selL:null, selR:null, flash:null};
}
function interleave(mcs, matches){
  var steps=[], mi=0;
  mcs.forEach(function(s,i){ steps.push(s); if ((i===1 || i===3) && mi<matches.length) steps.push(matches[mi++]); });
  while (mi<matches.length) steps.push(matches[mi++]);
  return steps;
}
function buildWordLesson(deck){
  var dr=drawer(deck.items), mcs=[], matches=[];
  var total=dr.left(); if (total<4) return [];
  var nMC=Math.min(6,total);
  for (var i=0;i<nMC;i++){ var t=dr.draw(); mcs.push(spellable(t) && Math.random()<0.3 ? wordSpell(t) : buildable(t) && Math.random()<0.5 ? wordBuild(t) : wordMC(t)); }
  for (var m=0;m<2;m++){
    var set=[], sh={}, sl={};
    var add=function(c){ if(set.length<4 && !sh[c.he] && !sl[c.lat]){ sh[c.he]=1; sl[c.lat]=1; set.push(c); } };
    var guard=0; while (set.length<4 && dr.left() && guard++<40) add(dr.draw());
    if (set.length<4) shuffle(deck.items.slice()).forEach(add);
    if (set.length===4) matches.push(wordMatch(set));
  }
  return interleave(mcs, matches);
}
/* teaching screens: shown before the questions, never graded */
function meetWords(items){
  return {t:"learn", ask: items.length>1 ? "מילים חדשות" : "מילה חדשה",
    html:'<p class="lead">קראו בקול, ואז נתרגל.</p><div class="meet">'+items.map(function(c){
      return '<div class="mrow">'+(c.fid?'<span class="eth" lang="am">'+esc(c.fid)+'</span>':'')+'<span class="lat">'+esc(c.lat)+'</span><span class="he">'+esc(c.he)+'</span></div>'; }).join("")+'</div>'};
}
function meetLetter(Lt){
  var G=groupOf(Lt.id), rules=G && (G.k==="g2"||G.k==="g3"), w=EXWORD[Lt.id];
  return {t:"learn", ask:'האות <span class="eth" lang="am">'+Lt.id+'</span> בשבע הצורות שלה', aud:G?G.k:null,
    html:'<p class="lead">באמהרית כל אות היא הברה: עיצור ותנועה יחד. לכל עיצור יש שבע צורות, אחת לכל תנועה.</p>'+
      '<div class="lforms">'+Lt.forms.map(function(f){
        return '<div class="frow"><span class="eth" lang="am">'+f.g+'</span><span class="hs">'+f.heb+'</span><span class="lat">'+esc(f.lat)+'</span><span class="rule">'+(rules?RULES[f.o]:"")+'</span></div>'; }).join("")+'</div>'+
      (w?'<p class="lead" style="margin-top:1rem">מילה לדוגמה: <b class="eth" lang="am">'+w[0]+'</b> <span class="lat">'+w[1]+'</span> - '+w[2]+'</p>':'')};
}
/* a letter lesson inside a unit: one new letter at a time, taught first, then practised with the letters before it */
function buildLetterSetLesson(u){
  var Ls=u.letters.map(function(id){ return BY_ID[id]; }).filter(Boolean), k=-1;
  for (var i=0;i<Ls.length && k<0;i++) if (Ls[i].forms.some(function(f){ return strength(f.g)<1; })) k=i;
  if (k<0) return buildLetterLesson(u.forms);
  var Lt=Ls[k], P=[], old=[]; Ls.slice(0,k+1).forEach(function(x){ P=P.concat(x.forms); }); Ls.slice(0,k).forEach(function(x){ old=old.concat(x.forms); });
  var dr=drawer(Lt.forms), qs=[], canRead=P.length>=14;
  while (dr.left() && qs.length<6) qs.push(letterMC(dr.draw(), P, canRead));
  var rv=drawer(old); for (var r=0;r<2 && rv.left();r++) qs.splice(2+r*3,0,letterMC(rv.draw(), P, canRead));
  var four=function(src){ var set=[], sk={}; shuffle(src.slice()).forEach(function(f){ if(set.length<4 && !sk[f.key]){ sk[f.key]=1; set.push(f); } }); return set.length===4 ? set : null; };
  var m1=four(Lt.forms), m2=old.length ? four(P) : null, steps=[meetLetter(Lt)];
  qs.forEach(function(q,i2){ steps.push(q); if (i2===2 && m1) steps.push(letterMatch(m1)); });
  if (m2) steps.push(letterMatch(m2));
  return steps;
}
function letterLine(u){
  var Ls=u.letters.map(function(id){ return BY_ID[id]; }).filter(Boolean);
  for (var i=0;i<Ls.length;i++) if (Ls[i].forms.some(function(f){ return strength(f.g)<1; })) return "האות הבאה: "+Ls[i].id+" ("+(i+1)+" מתוך "+Ls.length+")";
  return "כל האותיות נלמדו";
}
/* a lesson on the path: the current step of the topic, plus words met earlier in the path */
function buildPathLesson(deck){
  var k=curStep(deck), S = k<0 ? deck.items : stepsOf(deck)[k];
  var dr=drawer(S); if (dr.left()<4) return buildWordLesson(deck);
  var used={};
  var ask=function(t){ used[t.g]=1; return spellable(t) && Math.random()<0.3 ? wordSpell(t) : buildable(t) && Math.random()<0.5 ? wordBuild(t) : wordMC(t); };
  var nMC=Math.min(6,dr.left()), T=[];
  for (var i=0;i<nMC;i++) T.push(dr.draw());
  T.forEach(function(t){ used[t.g]=1; });
  var old=earlierSeen(deck,k), due=old.filter(function(x){ return isDue(x.g); }).sort(function(a,b){ return (state.due[a.g]||0)-(state.due[b.g]||0); });
  var rv=due.concat(shuffle(old.filter(function(x){ return !isDue(x.g); }))).filter(function(x){ return !used[x.g]; });
  var four=function(sources){
    var set=[], sh={}, sl={};
    sources.forEach(function(src){ src.forEach(function(c){ if(set.length<4 && !sh[c.he] && !sl[c.lat]){ sh[c.he]=1; sl[c.lat]=1; set.push(c); } }); });
    return set.length===4 ? set : null;
  };
  var left=[]; while (dr.left()) left.push(dr.draw());
  var m1=four([left, shuffle(S.slice())]);
  var r1=rv.length?rv.shift():null, r2=rv.length?rv.shift():null, m2=four([rv]) || four([shuffle(S.slice())]);
  // order: teach, ask, teach, ask - a word is never asked before it was shown
  var steps=[], met={}, half=Math.ceil(T.length/2);
  var teach=function(items){ var nw=items.filter(function(c){ return isNew(c.g) && !met[c.g]; }); nw.forEach(function(c){ met[c.g]=1; }); if (nw.length) steps.push(meetWords(nw)); };
  var A=T.slice(0,half), B=T.slice(half);
  teach(A); A.forEach(function(t){ steps.push(ask(t)); }); if (r1) steps.push(ask(r1));
  teach(B); B.forEach(function(t){ steps.push(ask(t)); });
  if (m1){ teach(m1); steps.push(wordMatch(m1)); }
  if (r2) steps.push(ask(r2));
  if (m2){ teach(m2); steps.push(wordMatch(m2)); }
  return steps;
}
function distract(ans, P){
  var cand = P.filter(function(x){return x.key!==ans.key;});
  var out=[], seen={}; seen[ans.key]=1;
  function take(arr){ arr=shuffle(arr.slice()); for(var i=0;i<arr.length;i++){ if(!seen[arr[i].key]){ seen[arr[i].key]=1; out.push(arr[i]); return true; } } return false; }
  take(cand.filter(function(x){return x.L===ans.L;}));
  take(cand.filter(function(x){return x.o===ans.o && x.L!==ans.L;}));
  take(cand.filter(function(x){return x.L===ans.L;}));
  while(out.length<3 && take(cand)){}
  return out.slice(0,3);
}
function letterMC(target, P, canRead){
  var r=Math.random(), type=(canRead && r<0.2) ? "read" : (r<0.6 ? "toSound" : "toGlyph");
  if (type==="read"){
    var n=Math.random()<0.5?2:3, seq=[target];
    while(seq.length<n) seq.push(P[Math.floor(Math.random()*P.length)]);
    shuffle(seq);
    var label=function(s){ return {heb:s.map(function(x){return x.heb;}).join("\u05BE"), lat:s.map(function(x){return x.lat;}).join("-")}; };
    var correct=label(seq), opts=[correct], seen={}; seen[correct.lat]=1;
    for (var t=0;t<40 && opts.length<4;t++){
      var pos=Math.floor(Math.random()*seq.length), d=distract(seq[pos],P)[0];
      if(!d) continue;
      var alt=seq.slice(); alt[pos]=d; var lb=label(alt);
      if(!seen[lb.lat]){ seen[lb.lat]=1; opts.push(lb); }
    }
    shuffle(opts);
    var g=seq.map(function(x){return x.g;}).join("");
    return {t:"mc", g:target.g, answer:opts.indexOf(correct), ask:"איך קוראים את זה?",
      prompt:'<div class="glyph seq eth" lang="am">'+g+'</div>',
      opts:opts.map(function(o){ return '<span class="hs" style="font-size:1.4rem">'+o.heb+'</span><span class="ls lat">'+esc(o.lat)+'</span>'; }),
      answerHTML:'<span class="eth" lang="am">'+g+'</span> = '+correct.heb+' <span class="lat">('+esc(correct.lat)+')</span>'};
  }
  var o2=shuffle([target].concat(distract(target,P)));
  var ans='<span class="eth" lang="am">'+target.g+'</span> = '+target.heb+' <span class="lat">('+esc(target.lat)+')</span>';
  if (type==="toSound") return {t:"mc", g:target.g, cols:2, answer:o2.indexOf(target), ask:"איך קוראים את זה?",
    prompt:'<div class="glyph eth" lang="am">'+target.g+'</div>', opts:o2.map(sndHTML), answerHTML:ans};
  return {t:"mc", g:target.g, cols:2, answer:o2.indexOf(target), ask:"איזו אות נשמעת כך?",
    prompt:'<span class="snd">'+target.heb+'</span><span class="sndl lat">'+esc(target.lat)+'</span>',
    opts:o2.map(function(o){ return '<span class="g eth" lang="am">'+o.g+'</span>'; }), answerHTML:ans};
}
function letterMatch(items){
  return {t:"match", ask:"התאימו אות לצליל",
    left: shuffle(items.map(function(f,i){ return {id:i, html:'<span class="g eth" lang="am" style="font-size:2rem">'+f.g+'</span>'}; })),
    right: shuffle(items.map(function(f,i){ return {id:i, html:sndHTML(f)}; })),
    gs: items.map(function(f){return f.g;}), done:{}, errs:{}, selL:null, selR:null, flash:null};
}
function buildLetterLesson(only){
  var P=only||pool(); if (!P.length) return [];
  var keys={}; P.forEach(function(x){keys[x.key]=1;});
  var distinct=Object.keys(keys).length, dr=drawer(P), mcs=[], matches=[];
  var nMC=Math.min(8, P.length);
  for (var i=0;i<nMC;i++) mcs.push(letterMC(dr.draw(), P, distinct>=8));
  for (var m=0;m<2 && distinct>=4;m++){
    var set=[], sk={};
    var add=function(f){ if(set.length<4 && !sk[f.key]){ sk[f.key]=1; set.push(f); } };
    var guard=0; while (set.length<4 && dr.left() && guard++<40) add(dr.draw());
    if (set.length<4) shuffle(P.slice()).forEach(add);
    if (set.length===4) matches.push(letterMatch(set));
  }
  return interleave(mcs, matches);
}

/* ---------- lesson engine ---------- */
var L=null, HEARTS=5;
var GOBEZ='<span class="eth" lang="am">ጎበዝ</span> <small class="lat">gobäz</small>';     // "gobez": the praise word the author grew up with
var PRAISE=["נכון",GOBEZ,"בדיוק כך","יפה","זהו","מדויק"];
function startLesson(kind,id){
  var steps, title;
  if (kind==="letters"){ steps=buildLetterLesson(); title="אותיות"; }
  else if (kind==="lset"){ var u=chapters()[+id]; if(!u || !u.forms.length) return; steps=buildLetterSetLesson(u); title="אותיות"; }
  else { var d=getDeck(kind,id); if(!d) return; steps = kind==="deck" ? buildPathLesson(d) : buildWordLesson(d); title=d.title; }
  if (!steps.length) return;
  touched={};
  var ui=5; if (kind==="lset") ui=+id; else if (kind==="deck") chapters().forEach(function(c){ if (c.decks.indexOf(d)>=0) ui=c.i; });
  L={kind:kind, id:id, title:title, look:unitLook(ui), steps:steps, i:0, hearts:HEARTS, right:0, wrong:0, combo:0, phase:"ask", sel:null, ok:null};
  render(); window.scrollTo(0,0);
}
function cur(){ return L.steps[L.i]; }
function bump(g,up){
  var t=dayNum(), lvl=strength(g);
  if (up>0){ if (isNew(g) || isDue(g)){ lvl=Math.min(5,lvl+1); state.due[g]=t+IV[lvl]; } }
  else { lvl=Math.max(0,lvl+up); state.due[g]=t; }
  state.str[g]=lvl; touched[g]=1;
}
function selectOpt(i){ if(!L||L.phase!=="ask"||cur().t!=="mc") return; L.sel=i; render(); }
function tileTap(i){ var st=cur(); if(!L||L.phase!=="ask"||st.t!=="build"||st.picked.indexOf(i)>=0) return; st.picked.push(i); render(); }
function untile(pos){ var st=cur(); if(!L||L.phase!=="ask"||st.t!=="build") return; st.picked.splice(pos,1); render(); }
function check(){
  if (!L || L.phase!=="ask") return;
  var st=cur(), ok;
  if (st.t==="mc"){ if (L.sel===null) return; ok = L.sel===st.answer; }
  else if (st.t==="build"){ if (!st.picked.length) return; ok = st.picked.map(function(i){return st.tiles[i];}).join(st.sep===undefined?" ":st.sep)===st.solution; }
  else return;
  L.phase="fb"; L.ok=ok;
  if (ok){ L.right++; L.combo++; bump(st.g,1); sound("ok"); }
  else { L.wrong++; L.combo=0; L.hearts--; bump(st.g,-2); sound("no"); }
  save(); render();
}
function matchTap(side,id){
  var st=cur(); if(!L||L.phase!=="ask"||st.t!=="match"||st.done[id]) return;
  if (side==="l") st.selL = st.selL===id ? null : id; else st.selR = st.selR===id ? null : id;
  st.flash=null;
  if (st.selL!==null && st.selR!==null){
    if (st.selL===st.selR){
      st.done[st.selL]=1; sound("pair");
      if (Object.keys(st.done).length===st.left.length){
        var clean=!Object.keys(st.errs).length;
        st.gs.forEach(function(g,i){ bump(g, st.errs[i]?-1:1); });
        L.phase="fb"; L.ok=true; L.right++; L.combo = clean ? L.combo+1 : 0; sound("ok"); save();
      }
    } else {
      st.errs[st.selL]=1; st.errs[st.selR]=1; st.flash=[st.selL,st.selR]; L.wrong++; L.combo=0; sound("no");
    }
    st.selL=null; st.selR=null;
  }
  render();
}
function learned(){
  if (!L || L.done || L.failed || cur().t!=="learn") return;
  stopAudio(); L.i++;
  if (L.i>=L.steps.length) return finish();
  L.phase="ask"; L.sel=null; L.ok=null; render(); window.scrollTo(0,0);
}
function cont(){
  if (!L || L.phase!=="fb") return;
  if (L.hearts<=0){ L.failed=true; render(); window.scrollTo(0,0); return; }
  L.i++;
  if (L.i>=L.steps.length) return finish();
  L.phase="ask"; L.sel=null; L.ok=null; render(); window.scrollTo(0,0);
}
function finish(){
  var gain=10+(L.wrong===0?5:0), t=today();
  if (state.dayKey!==t){ state.dayKey=t; state.dayXp=0; }
  state.xp+=gain; state.dayXp+=gain;
  if (state.lastDay!==t){ state.streak = state.lastDay===yesterday() ? state.streak+1 : 1; state.lastDay=t; }
  L.done=true; L.gain=gain; save(); sound("win"); render(); window.scrollTo(0,0);
}
function quit(){ L=null; render(); }

/* ---------- writing studio: trace a letter with a finger ---------- */
var TR=null;                       // {g, msg, cls}
function formOf(g){ var cp=g.codePointAt(0), Lt=BY_ID[String.fromCodePoint(cp-(cp%8))]; return Lt ? Lt.forms[cp%8] : null; }
function openTracer(g){ if(!formOf(g)) return; TR={g:g, msg:"", cls:""}; render(); window.scrollTo(0,0); }
function viewTracer(){
  var f=formOf(TR.g);
  return '<div class="lesson studio"><div class="l-top"><button class="icon-btn" data-act="trclose" aria-label="סגירה">✕</button><b style="flex:1">תרגול כתיבה</b></div>'+
    '<div class="tr-snd"><span class="hs">'+f.heb+'</span> <span class="lat">'+esc(f.lat)+'</span></div>'+
    tracerHint(f)+
    '<div class="pad"><canvas id="trbg"></canvas><canvas id="trfg" aria-label="משטח כתיבה לאות '+f.g+'"></canvas></div>'+
    '<p class="tr-msg '+TR.cls+'" id="trmsg" aria-live="polite">'+(TR.msg||"עברו באצבע על האות האפורה")+'</p>'+
    '<div class="tr-forms" dir="ltr">'+f.L.forms.map(function(x){ return '<button class="tile'+(x.g===TR.g?' cur':'')+'" data-act="trace:'+x.g+'"><span class="eth" lang="am">'+x.g+'</span><span class="lat">'+esc(x.lat)+'</span></button>'; }).join("")+'</div>'+
    '</div><div class="l-foot"><div class="row"><button class="btn" data-act="trclear" style="flex:1">ניקוי</button><button class="btn primary" data-act="trcheck" style="flex:2">בדיקה</button></div></div>';
}
function tracerHint(f){
  var G=groupOf(f.L.id), w=EXWORD[f.L.id], h="";
  if (G && (G.k==="g2"||G.k==="g3")) h+='<span>צורה '+(f.o+1)+': '+RULES[f.o]+'</span>';
  if (w) h+='<span>מילה לדוגמה: <b class="eth" lang="am">'+w[0]+'</b> <span class="lat">'+w[1]+'</span> - '+w[2]+'</span>';
  return h ? '<p class="tr-hint">'+h+'</p>' : '';
}
var trCtx=null, trN=0, trDrawn=false;
function cssVar(n){ return getComputedStyle(document.documentElement).getPropertyValue(n).trim() || "#888"; }
function drawGlyph(ctx, n, g, color, outline){
  ctx.clearRect(0,0,n,n);
  ctx.font='500 '+Math.round(n*0.6)+'px "Noto Sans Ethiopic","Kefa","Nyala","Abyssinica SIL",sans-serif';
  ctx.textAlign="center"; ctx.textBaseline="alphabetic";
  var m=ctx.measureText(g), up=m.actualBoundingBoxAscent||n*0.45, dn=m.actualBoundingBoxDescent||0, y=n/2+(up-dn)/2;
  ctx.fillStyle=color; ctx.fillText(g, n/2, y);
  if (outline){ ctx.strokeStyle=color; ctx.lineWidth=outline; ctx.lineJoin="round"; ctx.strokeText(g, n/2, y); }
}
function initTracer(){
  var bg=document.getElementById("trbg"), fg=document.getElementById("trfg"); if(!bg||!fg) return;
  var size=bg.parentNode.clientWidth||300, dpr=Math.min(2, window.devicePixelRatio||1), n=Math.round(size*dpr);
  bg.width=bg.height=fg.width=fg.height=n; trN=n; trDrawn=false;
  var paint=function(){ if(TR && document.getElementById("trbg")===bg) { var c=bg.getContext("2d"); c.globalAlpha=0.38; drawGlyph(c, n, TR.g, cssVar("--muted")); } };
  paint();
  if (document.fonts && document.fonts.load) document.fonts.load('500 40px "Noto Sans Ethiopic"', TR.g).then(paint, function(){});
  var ctx=fg.getContext("2d"); trCtx=ctx;
  ctx.lineCap="round"; ctx.lineJoin="round"; ctx.lineWidth=n*0.055; ctx.strokeStyle=cssVar("--blue");
  var down=false, last=null;
  var pos=function(e){ var r=fg.getBoundingClientRect(); return {x:(e.clientX-r.left)*n/r.width, y:(e.clientY-r.top)*n/r.height}; };
  fg.addEventListener("pointerdown", function(e){ e.preventDefault(); down=true; last=pos(e); try{ fg.setPointerCapture(e.pointerId); }catch(x){}
    ctx.beginPath(); ctx.moveTo(last.x,last.y); ctx.lineTo(last.x+0.1,last.y+0.1); ctx.stroke(); trDrawn=true; });
  fg.addEventListener("pointermove", function(e){ if(!down) return; e.preventDefault(); var p=pos(e); ctx.beginPath(); ctx.moveTo(last.x,last.y); ctx.lineTo(p.x,p.y); ctx.stroke(); last=p; });
  var up=function(){ down=false; };
  fg.addEventListener("pointerup", up); fg.addEventListener("pointercancel", up); fg.addEventListener("pointerleave", up);
}
function trSay(msg, cls){ TR.msg=msg; TR.cls=cls||""; var el=document.getElementById("trmsg"); if(el){ el.textContent=msg; el.className="tr-msg "+TR.cls; } }
function trClear(){ if(trCtx) trCtx.clearRect(0,0,trN,trN); trDrawn=false; trSay("עברו באצבע על האות האפורה"); }
function trCheck(){
  if (!trCtx || !trDrawn){ trSay("קודם מציירים את האות", ""); return; }
  var n=trN, a=document.createElement("canvas"), b=document.createElement("canvas"); a.width=a.height=b.width=b.height=n;
  var ca=a.getContext("2d"), cb=b.getContext("2d");
  drawGlyph(ca, n, TR.g, "#000"); drawGlyph(cb, n, TR.g, "#000", n*0.09);
  var A=ca.getImageData(0,0,n,n).data, B=cb.getImageData(0,0,n,n).data, S=trCtx.getImageData(0,0,n,n).data;
  var G=0, C=0, T=0, O=0, step=3;
  for (var y=0;y<n;y+=step) for (var x=0;x<n;x+=step){
    var i=(y*n+x)*4+3, g=A[i]>90, s=S[i]>60;
    if (g){ G++; if(s) C++; }
    if (s){ T++; if(B[i]<=90) O++; }
  }
  if (!G){ trSay("לא הצלחתי לבדוק את האות הזאת", ""); return; }
  var cover=Math.round(100*C/G), out=T?O/T:1;
  if (cover>=65 && out<=0.3){ trSay("יפה מאוד! כיסית "+cover+"% מהאות", "good"); sound("ok"); }
  else if (out>0.3 && cover>=40){ trSay("הקו יוצא הרבה מחוץ לאות. נסו שוב, לאט יותר", "bad"); }
  else { trSay("כמעט. נסו לעבור על כל חלקי האות ("+cover+"%)", "bad"); }
}

/* ---------- short grammar notes that lean on Hebrew ---------- */
function ex(f,l,h){ return '<p class="ex"><span class="eth" lang="am">'+f+'</span><span class="lat">'+l+'</span><span class="exh">'+h+'</span></p>'; }
var TIPS = A.TIPS ? A.TIPS(ex) : {};
if (A.TIPS){ TIPS.pres2=TIPS.pres1; TIPS.past2=TIPS.past1; TIPS.whq=TIPS.rel1; TIPS.rel2=TIPS.rel1; TIPS.past4=TIPS.past1; TIPS.obj2=TIPS.obj; TIPS.conj2=TIPS.pres1; TIPS.had=TIPS.was; TIPS.feel2=TIPS.feel1; TIPS.past3=TIPS.past1; }
var TIP=null;
function viewTip(){
  var t=TIPS[TIP];
  return '<div class="lesson tip"><div class="l-top"><button class="icon-btn" data-act="tipclose" aria-label="סגירה">✕</button><b style="flex:1">הסבר קצר</b></div>'+
    '<h2 class="ask">'+t.t+'</h2>'+t.h+'</div>'+
    '<div class="l-foot"><div><button class="btn primary wide" data-act="start:deck:'+TIP+'">הבנתי, לשיעור</button></div></div>';
}

/* ---------- tibeb bands ----------
   Each band is redrawn from a real piece: the family coffee set, and the woven and embroidered
   borders of dresses. Nothing here is a photograph. c = the colour the unit's nodes take. */
var TB=[
  { // the coffee set: red almond leaves and a fern with a tulip, gilt rim
    c:"#D43C28", w:28, d:'<rect width="28" height="20" fill="#FFFFFF"/><rect y="0.6" width="28" height="0.8" fill="#C9A24B"/><rect y="18.6" width="28" height="0.8" fill="#C9A24B"/>'+
      '<path d="M7 3.6Q11.2 10 7 16.4Q2.8 10 7 3.6z" fill="#E0452F"/>'+
      '<path d="M21 9.2V16.8M21 12.2 18.3 10.4M21 12.2 23.7 10.4M21 14.4 18.3 12.6M21 14.4 23.7 12.6M21 16.6 18.3 14.8M21 16.6 23.7 14.8" fill="none" stroke="#E0452F" stroke-width="1.15" stroke-linecap="round"/>'+
      '<path d="M18.5 4Q18.4 8.6 21 8.8Q23.6 8.6 23.5 4L22.3 5.7 21 3.8 19.7 5.7z" fill="none" stroke="#4F9BC4" stroke-width="1" stroke-linejoin="round"/>' },
  { // a dress neckline: stacked chevrons outlined in black
    c:"#1F5FBF", w:24, d:'<rect width="24" height="20" fill="#141414"/><rect y="0.7" width="24" height="1" fill="#FFFFFF"/><rect y="18.3" width="24" height="1" fill="#FFFFFF"/>'+
      '<path d="M0 4.4 12 9.4 24 4.4" fill="none" stroke="#1E9B4B" stroke-width="2.3"/><path d="M0 7.8 12 12.8 24 7.8" fill="none" stroke="#2F7DE1" stroke-width="2.3"/>'+
      '<path d="M0 11.2 12 16.2 24 11.2" fill="none" stroke="#F28A1E" stroke-width="2.3"/><path d="M0 14.4 12 19.4" fill="none" stroke="#F6C514" stroke-width="0"/>'+
      '<path d="M12 2.6 14.1 4.8 12 7 9.9 4.8z" fill="#F6C514"/><path d="M0 14.6 2.2 16.4 0 18.2zM24 14.6 21.8 16.4 24 18.2z" fill="#D8322A"/>' },
  { // green and yellow diamonds stepping in a zigzag on cotton
    c:"#1E7A45", w:24, d:'<rect width="24" height="20" fill="#FFFDF4"/><rect width="24" height="1.3" fill="#1E2A5A"/><rect y="18.7" width="24" height="1.3" fill="#1E2A5A"/>'+
      '<path d="M6 2.4 10.6 7 6 11.6 1.4 7zM18 8.4 22.6 13 18 17.6 13.4 13z" fill="#14532D"/><path d="M6 5 8 7 6 9 4 7zM18 11 20 13 18 15 16 13z" fill="#F2D21B"/>'+
      '<path d="M18 3 20 5 18 7 16 5zM6 13 8 15 6 17 4 15z" fill="#F2D21B" stroke="#14532D" stroke-width="0.8"/>' },
  { // a turquoise collar with red and blue diamonds
    c:"#17867B", w:24, d:'<rect width="24" height="20" fill="#7FD6CB"/><rect width="24" height="1.6" fill="#F6C514"/><rect y="18.4" width="24" height="1.6" fill="#F6C514"/>'+
      '<path d="M6 5 11 10 6 15 1 10z" fill="#D8322A"/><path d="M6 8 8 10 6 12 4 10z" fill="#F6C514"/><path d="M18 5 23 10 18 15 13 10z" fill="#2447B5"/><path d="M18 8 20 10 18 12 16 10z" fill="#FFFFFF"/>' },
  { // purple with a gold zigzag
    c:"#6A3FA0", w:24, d:'<rect width="24" height="20" fill="#6A3FA0"/><rect y="0.8" width="24" height="1.1" fill="#E3B02A"/><rect y="18.1" width="24" height="1.1" fill="#E3B02A"/>'+
      '<path d="M0 14.5 6 6.5 12 14.5 18 6.5 24 14.5" fill="none" stroke="#E3B02A" stroke-width="2.4"/>'+
      '<path d="M12 4.6 13.7 6.6 12 8.6 10.3 6.6zM0 4.6 1.7 6.6 0 8.6zM24 4.6 22.3 6.6 24 8.6zM6 12.4 7.7 14.4 6 16.4 4.3 14.4zM18 12.4 19.7 14.4 18 16.4 16.3 14.4z" fill="#E3B02A"/>' },
  { // green cloth dotted with gold, crossed by a dark band
    c:"#0F7A4A", w:12, d:'<rect width="12" height="20" fill="#0F7A4A"/><rect y="7" width="12" height="8" fill="#17140F"/>'+
      '<g fill="#E8B923"><circle cx="3" cy="2.2" r="0.9"/><circle cx="9" cy="2.2" r="0.9"/><circle cx="0" cy="4.8" r="0.9"/><circle cx="6" cy="4.8" r="0.9"/><circle cx="12" cy="4.8" r="0.9"/>'+
      '<circle cx="3" cy="9.4" r="1"/><circle cx="9" cy="9.4" r="1"/><circle cx="0" cy="12.6" r="1"/><circle cx="6" cy="12.6" r="1"/><circle cx="12" cy="12.6" r="1"/>'+
      '<circle cx="3" cy="17.6" r="0.9"/><circle cx="9" cy="17.6" r="0.9"/></g>' },
  { // a burgundy check
    c:"#8A2447", w:24, d:'<rect width="24" height="20" fill="#7A1F3D"/><rect x="5.5" width="1" height="20" fill="#F5E9EC"/><rect x="8" width="0.7" height="20" fill="#7FBF8F"/><rect x="17.5" width="1" height="20" fill="#F2A7B5"/>'+
      '<rect y="5.5" width="24" height="0.9" fill="#F2A7B5"/><rect y="13.6" width="24" height="1.1" fill="#2B2338"/><rect y="16" width="24" height="0.6" fill="#7FBF8F"/>' }
];
var TB_ORDER=[0,3,1,2,4,5,6];     // the band each unit gets, in path order
(function(){
  var h=TB.map(function(t,k){ return '<pattern id="tb'+k+'" patternUnits="userSpaceOnUse" width="'+t.w+'" height="20">'+t.d+'</pattern>'; }).join("");
  var box=document.createElement("div");
  box.innerHTML='<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>'+h+'</defs></svg>';
  document.body.insertBefore(box.firstChild, document.body.firstChild);
})();
// pct = how much of the band is woven (100 = a plain decorative band)
function weave(k, pct, h){
  h=h||14; pct=Math.max(0,Math.min(100,pct));
  var r='<rect width="4000" height="20" fill="url(#tb'+(k%TB.length)+')" transform="scale('+(h/20)+')"/>';
  return '<span class="weave" style="--h:'+h+'px">'+(pct<100?'<svg class="w0" aria-hidden="true">'+r+'</svg>':'')+
    (pct>0?'<svg class="w1" aria-hidden="true"'+(pct<100?' style="clip-path:inset(0 0 0 '+(100-pct)+'%)"':'')+'>'+r+'</svg>':'')+'</span>';
}
function unitLook(i){ var k=TB_ORDER[i%TB_ORDER.length]; return {mo:k, c:TB[k].c}; }
function glyphOf(d){
  var f=(d.items[0]||{}).fid||"", ch=Array.from(f).filter(function(x){ return !!formOf(x); })[0];
  return ch ? '<span class="eth" lang="am">'+ch+'</span>' : '<span>'+esc((d.title||"").charAt(0))+'</span>';
}
var IC_SOUND='<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M4 9h3l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.6 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
var IC_MUTE='<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M4 9h3l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 9.5l5 5M21 9.5l-5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
var IC_MIX='<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M12 2 17 7 12 12 7 7zM5.5 11 10 15.5 5.5 20 1 15.5zM18.5 11 23 15.5 18.5 20 14 15.5z" fill="currentColor"/></svg>';

/* ---------- views ---------- */
var tab=LETTERS_ONLY?"letters":"home", openNode=null, resetArmed=false;
var app=document.getElementById("app");
var XOFF=[0,46,72,46,0,-46,-72,-46];

function topbar(){
  var sk=liveStreak();
  return '<div class="top"><div class="brand"><span>אלף-ביתא ישראל</span><small>'+(LETTERS_ONLY?"האותיות באמהרית":"למידת אמהרית")+'</small></div><div class="grow"></div>'+
    '<div class="stat fire" title="ימים ברצף"><span>רצף</span><b>'+sk+'</b><span class="days">'+(sk===1?"יום":"ימים")+'</span></div>'+
    '<div class="stat xp"><b>'+state.xp+'</b><span>XP</span></div>'+
    '<button class="icon-btn" data-act="mute" aria-label="'+(state.mute?"הפעלת צליל":"השתקת צליל")+'">'+(state.mute?IC_MUTE:IC_SOUND)+'</button></div>'+
    '<div class="hem">'+weave(1,100,10)+'</div>';
}
function nav(){
  if (LETTERS_ONLY) return "";
  var it=[["home","","מסלול"],["letters","","אותיות"],["words","","המילים שלי"]];
  return '<nav class="nav"><div>'+it.map(function(x){
    return '<button data-act="tab:'+x[0]+'"'+(tab===x[0]?' aria-current="page"':'')+'>'+x[2]+'</button>'; }).join("")+'</div></nav>';
}
function greet(){
  var s=liveStreak(), tx=todayXp();
  if (tx>=GOAL) return "היעד היומי הושג. כל שיעור נוסף הוא בונוס!";
  if (state.lastDay===today()) return "יופי של התחלה. עוד שיעור אחד?";
  if (s>0) return s+" ימים ברצף. שיעור אחד היום ישמור על הרצף!";
  return "סלאם! מתחילים בשיעור קצר של חמש דקות?";
}
function nodeHTML(id, icon, label, m, idx, startAct, sub){
  var pct = m.n ? m.seen/m.n : 0, C=251.3, gold = m.n && m.ok===m.n;
  var h='<li><div class="nodebox" style="--x:'+XOFF[idx%XOFF.length]+'px"><button class="node'+(gold?' gold':'')+'" data-act="node:'+id+'" aria-expanded="'+(openNode===id)+'" aria-label="'+esc(label)+'">'+
    '<svg class="ring" viewBox="0 0 88 88" aria-hidden="true"><rect class="tr" x="16" y="16" width="56" height="56" rx="8" transform="rotate(45 44 44)"/>'+
    (pct>0?'<rect class="pr" x="16" y="16" width="56" height="56" rx="8" transform="rotate(45 44 44)" pathLength="100" stroke-dasharray="'+(pct*100).toFixed(1)+' 100"/>':'')+'</svg>'+
    '<span class="disc">'+icon+'</span></button><div class="nlabel">'+esc(label)+'</div></div>';
  if (openNode===id) h+='<div class="callout"><h3>'+esc(label)+'</h3><p>'+sub+'</p><button class="btn wide" data-act="'+startAct+'">התחלה</button>'+(TIPS[id]?'<button class="tipb" data-act="tip:'+id+'">הסבר קצר דרך העברית</button>':'')+'</div>';
  return h+'</li>';
}
/* The path: parts > units > topics > steps. A unit is folded into one row so the home screen stays short;
   nothing is locked. A topic is learned in small steps (see stepsOf), and every lesson also brings back
   words from earlier in the path. */
var UNITS=[
  {part:1, t:"להגיד שלום", ids:["greet","bye"], letters:["ለ","ሰ","ሸ","በ","ቨ"]},
  {part:1, t:"להציג את עצמי", ids:["s-pron","be","intro","s-num"], letters:["አ","ከ","ኸ","ዘ","ዠ"]},
  {part:1, t:"המשפחה שלי", ids:["have","poss","family","s-rel"], letters:["ደ","ጀ","ጰ","ጸ"]},
  {part:1, t:"זמן, עבודה ותיאור", ids:["time","s-time","jobs","s-jobs","desc","s-look"]},
  {part:1, t:"פעלים בהווה", ids:["verbs","verbsI","conj","pres1","pres2","demo"]},
  {part:1, t:"שגרה ועבר", ids:["daily","obj","past1","past2","past3","pastday"]},
  {part:1, t:"משפטים מורכבים", ids:["connect","after","whenif","was","had","neg"]},
  {part:1, t:"רגשות ותכונות", ids:["feel1","feel2","s-feel","traits","verbs2","obj2","conj2","past4"]},
  {part:1, t:"קטעים ושאלות", ids:["routine1","routine2","dialog","rel1","whq","rel2","small"]},
  {part:2, t:"גוף ולבוש", ids:["s-body","s-clothes","s-colors"]},
  {part:2, t:"אוכל ובית", ids:["s-food","s-fruit","s-kitchen","s-home","s-tools"]},
  {part:2, t:"בחוץ ובעולם", ids:["s-city","s-nature","s-animals","s-countries"]},
  {part:2, t:"פעלים נפוצים", ids:["s-verbs1","s-verbs2"]}
];
var CH_LIST=null, openCh=null;      // openCh: null = follow the learner, -1 = all closed, otherwise the unit's number
function chapters(){
  if (CH_LIST) return CH_LIST;
  var used={}, byId={}, list=[]; DECKS.forEach(function(d){ byId[d.id]=d; });
  [1,2].forEach(function(part){
    UNITS.forEach(function(c){
      if (c.part!==part) return;
      var ds=c.ids.map(function(id){ return byId[id]; }).filter(function(d){ return d && !used[d.id]; });
      if (!ds.length) return;
      ds.forEach(function(d){ used[d.id]=1; });
      var forms=[]; (c.letters||[]).forEach(function(id){ if (BY_ID[id]) forms=forms.concat(BY_ID[id].forms); });
      list.push({t:c.t, part:part, decks:ds, letters:c.letters||[], forms:forms});
    });
    var rest=DECKS.filter(function(d){ return !used[d.id] && (d.src==="site" ? 2 : 1)===part; });   // a topic added later and not filed yet
    if (rest.length){ rest.forEach(function(d){ used[d.id]=1; }); list.push({t:"נושאים חדשים", part:part, decks:rest, letters:[], forms:[]}); }
  });
  list.forEach(function(c,i){ c.i=i; c.items=[]; c.decks.forEach(function(d){ d.part=c.part; c.items=c.items.concat(d.items); }); });
  return (CH_LIST=list);
}
/* steps: a topic is cut into groups of at most STEP cards, in the order of the deck */
var STEP=8;
function stepsOf(d){
  if (d.steps) return d.steps;
  var n=d.items.length, k=Math.max(1,Math.ceil(n/STEP)), sz=Math.ceil(n/k), out=[];
  for (var i=0;i<n;i+=sz) out.push(d.items.slice(i,i+sz));
  if (out.length>1 && out[out.length-1].length<4){ var tail=out.pop(); out[out.length-1]=out[out.length-1].concat(tail); }
  return (d.steps=out);
}
function curStep(d){      // the first step with a card not yet answered right; -1 when the whole topic was learned
  var S=stepsOf(d);
  for (var i=0;i<S.length;i++) if (S[i].some(function(x){ return strength(x.g)<1; })) return i;
  return -1;
}
function earlierSeen(deck, stepIdx){     // cards already met before this point of the path
  var out=[], hit=false, seen={};
  chapters().forEach(function(c){ c.decks.forEach(function(d){
    if (hit) return;
    if (d===deck){ hit=true; stepsOf(d).slice(0,Math.max(0,stepIdx)).forEach(function(st){ out=out.concat(st); }); return; }
    out=out.concat(d.items);
  }); });
  return out.filter(function(x){ if (seen[x.g] || isNew(x.g)) return false; seen[x.g]=1; return true; });
}
function nextDeck(){
  var L2=chapters();
  for (var i=0;i<L2.length;i++) for (var j=0;j<L2[i].decks.length;j++){
    var d=L2[i].decks[j], m=mastery(d.items);
    if (m.seen<m.n) return {deck:d, ch:i};
  }
  return null;
}
function shownCh(){ if (openCh!==null) return openCh; var nx=nextDeck(); return nx ? nx.ch : -1; }
function stepLine(d){
  var S=stepsOf(d), k=curStep(d);
  return S.length<2 ? "" : k<0 ? ". כל "+S.length+" השלבים נלמדו" : ". שלב "+(k+1)+" מתוך "+S.length;
}
function chapterHTML(c, open){
  var m=mastery(c.items), pct=m.n?Math.round(100*m.seen/m.n):0, done=m.n && m.seen===m.n, lk=unitLook(c.i);
  var h='<button class="chap" data-act="chap:'+c.i+'" id="ch-'+c.i+'" aria-expanded="'+open+'" style="--c:'+lk.c+'"><span class="ci"><small><span>יחידה '+(c.i+1)+'</span><span>'+(done?'הושלמה':c.decks.length+' נושאים'+(c.letters.length?' ו-'+c.letters.length+' אותיות':''))+'</span></small><b>'+esc(c.t)+'</b>'+
    weave(lk.mo, pct, 22)+'</span><span class="chev" aria-hidden="true">'+(open?"\u25B2\uFE0E":"\u25BC\uFE0E")+'</span></button>';
  if (!open) return h;
  h+='<ol class="path" style="--c:'+lk.c+'">';
  var k=0;
  if (c.forms.length){
    var lm=mastery(c.forms);
    h+=nodeHTML("let-"+c.i, '<span class="eth" lang="am">'+c.letters[0]+'</span>', "אותיות: "+c.letters.join(" "), lm, k++, "start:lset:"+c.i, "כל אות נלמדת בנפרד, בשבע הצורות שלה. "+letterLine(c));
  }
  c.decks.forEach(function(d){
    var dm=mastery(d.items);
    h+=nodeHTML(d.id, glyphOf(d), d.title, dm, k++, "start:deck:"+d.id, dm.n+" מילים, "+dm.seen+" נלמדו"+stepLine(d)+(dm.due?". "+dm.due+" לחזרה היום":""));
  });
  return h+'</ol>';
}
function unit(n, title, sub, color, mixId){
  var cur=shownCh(), all=[];
  var h='<section class="unit"><div class="unit-h"><small>חלק '+n+'</small><h2>'+title+'</h2><p>'+sub+'</p></div>';
  chapters().forEach(function(c){ if (c.part!==n) return; all=all.concat(c.items); h+=chapterHTML(c, c.i===cur); });
  h+='<ol class="path" style="--c:#4C2A85">'+nodeHTML("mix-"+mixId, IC_MIX, "תרגול מעורב", mastery(all), 0, "start:mix:"+mixId, "שאלות מכל הנושאים בחלק הזה")+'</ol>';
  return h+'</section>';
}
function continueCard(){
  var nx=nextDeck(); if (!nx) return "";
  return '<button class="btn primary wide go" data-act="start:deck:'+nx.deck.id+'"><span>המשך</span><small>'+esc(nx.deck.title)+'</small></button>';
}
function reviewCard(){
  var n=dueWords().length;
  var txt = n>=4 ? n+" מילים מחכות לחזרה היום" : n ? n+" מילים לחזרה. הן יופיעו ראשונות בשיעור של הנושא שלהן" : "אין חזרות להיום. מילים שנלמדו יחזרו לכאן בדיוק כשצריך לרענן אותן";
  return '<div class="review"><div><b>חזרה יומית</b><span>'+txt+'</span></div>'+(n>=4?'<button class="btn blue" data-act="start:review">חזרה</button>':'')+'</div>';
}
function viewHome(){
  var tx=todayXp(), pct=Math.min(100,Math.round(100*tx/GOAL));
  return '<div class="hello">'+mascot("happy",78)+'<div class="bubble">'+greet()+'</div></div>'+
    '<div class="goal"><div class="goal-t"><span>היעד היומי</span><span>'+tx+' מתוך '+GOAL+' XP</span></div>'+weave(4,pct,10)+'</div>'+continueCard()+reviewCard()+
    unit(1,"יסודות השיחה","מהשלום הראשון ועד שיחה שלמה","green","t")+
    unit(2,"אוצר מילים","עוד מילים שימושיות, לפי נושאים","blue","s")+
    '<div class="foot"><span id="sync">'+esc(syncText)+'</span><button data-act="reset">'+(resetArmed?"לחיצה נוספת תאפס את ההתקדמות (המילים האישיות נשארות)":"איפוס התקדמות")+'</button></div>';
}
var GROUPS=[
  {k:"g2", t:"שתי רגליים", ids:["ለ","ሰ","ሸ","በ","ቨ","አ","ከ","ኸ","ዘ","ዠ","ደ","ጀ","ጰ","ጸ"]},
  {k:"g3", t:"שלוש רגליים", ids:["ሐ","ጠ","ጨ"]},
  {k:"g1", t:"רגל אחת", ids:["ቀ","ተ","ቸ","ኀ","ነ","ኘ","የ","ገ","ፐ"]},
  {k:"g0", t:"בלי רגליים", ids:["ሀ","ረ","መ","ሠ","ወ","ዐ","ፀ","ፈ"]}
];
var RULES=["צורת הבסיס, פשוט זוכרים אותה","קו קטן בצד ימין","הרגל הימנית פונה הצידה","הרגל השמאלית קצרה מהימנית","טבעת על הרגל הימנית","אין כלל, פשוט זוכרים אותה","הרגל הימנית קצרה מהשמאלית (חוץ מ-ሎ)"];
var EXWORD={"ለ":["ለስላሳ","läsïlasa","משקה קל"],"ሰ":["ሰላም","sälam","שלום"],"ሸ":["ሸሚዝ","šämiz","חולצה"],"በ":["በር","bär","דלת"],"አ":["አዲስ","addis","חדש"],
  "ከ":["ከበሮ","käbäro","תוף"],"ዘ":["ዘፋኝ","zäfaň","זמר/ת"],"ደ":["ደስታ","dästa","שמחה"],"ጀ":["ጀበና","jäbäna","ג'בנה"],"ጸ":["ጸጉር","s'ägur","שיער"]};
function groupOf(id){ for (var i=0;i<GROUPS.length;i++) if (GROUPS[i].ids.indexOf(id)>=0) return GROUPS[i]; return null; }

/* recordings: decoded with Web Audio so they play without any media element */
var playing=null;      // {key, src}
function stopAudio(){ if(playing){ try{ playing.src.onended=null; playing.src.stop(); }catch(e){} playing=null; } }
function playAudio(key){
  var was = playing && playing.key===key; stopAudio();
  if (was){ render(); return; }
  var b64=(window.FIDEL_AUDIO||{})[key]; if(!b64) return;
  if (/\.(mp3|m4a|ogg|wav)$/i.test(b64)){      // a file next to the page (the stand-alone site) instead of embedded data
    var el=new Audio(b64), me={key:key, src:{onended:null, stop:function(){ el.pause(); }}};
    var over=function(){ if(playing===me){ playing=null; if(!TR&&!TIP&&(!L||(!L.done&&!L.failed&&cur().t==="learn"))) render(); } };
    el.onended=over; el.onerror=over;
    playing=me; render();
    var pp=el.play(); if (pp && pp.catch) pp.catch(over);
    return;
  }
  try {
    var AC=window.AudioContext||window.webkitAudioContext; if(!AC) return;
    actx=actx||new AC(); if(actx.state==="suspended") actx.resume();
    var bin=atob(b64), buf=new Uint8Array(bin.length); for (var i=0;i<bin.length;i++) buf[i]=bin.charCodeAt(i);
    var mine={key:key, src:null}; playing=mine; render();
    var done=function(ab){
      if (playing!==mine) return;
      var src=actx.createBufferSource(); src.buffer=ab; src.connect(actx.destination);
      src.onended=function(){ if(playing===mine){ playing=null; if(!TR&&!TIP&&(!L||(!L.done&&!L.failed&&cur().t==="learn"))) render(); } };
      mine.src=src; src.start();
    };
    var fail=function(){ if(playing===mine){ playing=null; render(); } };
    var pr=actx.decodeAudioData(buf.buffer, done, fail); if (pr && pr.catch) pr.catch(fail);
  } catch(e){ playing=null; }
}
function audBtn(key,label){
  if (LETTERS_ONLY) return "";
  if (!(window.FIDEL_AUDIO||{})[key]) return "";
  var on = playing && playing.key===key;
  return '<button class="aud'+(on?' on':'')+'" data-act="aud:'+key+'">'+(on?"עצירה":"\u25B6\uFE0E "+label)+'</button>';
}
function viewLetters(){
  var P=pool(), m=mastery(P);
  var h='<h1 class="title">אותיות</h1><p class="sub">'+state.letters.length+' אותיות בתרגול, '+m.ok+' מתוך '+m.n+' צורות כבר יושבות טוב'+(m.due?', '+m.due+' מחכות לחזרה':'')+'.</p>'+
    '<button class="btn primary wide" data-act="start:letters"'+(P.length?'':' disabled')+'>תרגול אותיות</button>'+
    '<div class="note">האותיות מחולקות לארבע קבוצות לפי הצורה שלהן. סמנו ✓ ליד כל אות שכבר למדתם, ורק היא תיכנס לתרגול. לחיצה על צורה פותחת תרגול כתיבה.</div>'+
    '<details class="rules"><summary>איך מזהים את שבע הצורות?</summary><p>כל אות מופיעה בשבע צורות, אחת לכל תנועה: ä, u, i, a, e, ï, o. באותיות עם שתי רגליים ועם שלוש רגליים השינוי עקבי:</p><ol>'+
    RULES.map(function(r){ return '<li>'+r+'</li>'; }).join("")+'</ol>'+audBtn("vow","האזנה לשבע התנועות")+'</details>'+
    '<details class="rules"><summary>איך קוראים את הכתיב הלטיני?</summary><p>המילים והמשפטים כתובים באותו סימון של לוח האותיות:</p><ul class="key"><li><b class="lat">ä</b> התנועה של הצורה הראשונה, כמו סגול: <span class="lat">lä</span> = לֶ. באותיות א, ע ו-<span class="eth" lang="am">ኀ</span> הצורה הראשונה היא <span class="lat">a</span></li><li><b class="lat">e</b> התנועה של הצורה החמישית, כמו צירה: <span class="lat">le</span> = לֵי</li><li><b class="lat">ï</b> התנועה של הצורה השישית, כמו שווא נע. כשהיא לא נשמעת, לא כותבים אותה</li><li><b class="lat">š</b> = ש, <b class="lat">č</b> = צ\', <b class="lat">ž</b> = ז\', <b class="lat">ň</b> = ני</li><li><b class="lat">k\' t\' č\' p\' s\'</b> עיצורים מודגשים. הגרש מסמן את ההדגשה</li></ul></details>';
  var rowHTML=function(Lt){
    var on=state.letters.indexOf(Lt.id)>=0;
    return '<div class="crow'+(on?'':' off')+'"><button class="tog" data-act="toggle:'+Lt.id+'" aria-pressed="'+on+'" aria-label="'+(on?"הסרת":"הוספת")+' האות '+Lt.id+'">'+(on?"✓":"+")+'</button>'+
      Lt.forms.map(function(f){
        return '<button class="cell" data-act="trace:'+f.g+'" aria-label="תרגול כתיבה של '+f.g+'"><span class="eth" lang="am">'+f.g+'</span><span class="lat">'+esc(f.lat)+'</span><span class="m"><i style="width:'+(strength(f.g)*20)+'%"></i></span></button>';
      }).join("")+'</div>';
  };
  GROUPS.forEach(function(G){
    var onN=G.ids.filter(function(id){ return state.letters.indexOf(id)>=0; }).length, all=onN===G.ids.length;
    h+='<div class="ghead"><h2>'+G.t+'</h2><small>'+onN+' מתוך '+G.ids.length+' בתרגול</small></div>'+
      '<div class="gacts">'+audBtn(G.k,"האזנה לצורה הראשונה")+'<button class="aud" data-act="grp:'+G.k+'">'+(all?"הסרת הקבוצה מהתרגול":"הוספת כל הקבוצה")+'</button></div>'+
      '<div class="chart"><div class="crow head"><div></div><div>1</div><div>2</div><div>3</div><div>4</div><div>5</div><div>6</div><div>7</div></div>'+
      G.ids.map(function(id){ return rowHTML(BY_ID[id]); }).join("")+'</div>';
  });
  return h+'<div class="note">הצורה השישית (ï) נהגית לפעמים כתנועה קצרה מאוד ולפעמים כעיצור בלבד, בדומה לשווא נע ושווא נח. באותיות א, ע ו-ኀ הצורה הראשונה נקראת a.</div>';
}
function viewWords(){
  var n=state.words.length;
  var h='<h1 class="title">המילים שלי</h1><p class="sub">הוסיפו מילים ומשפטים שתרצו לזכור, בכל כתב: פידל, אותיות עבריות או לטיניות.</p>'+
    '<label class="field"><span>באמהרית</span><input id="wa" autocomplete="off" dir="auto"></label>'+
    '<label class="field"><span>בעברית</span><input id="wh" autocomplete="off"></label>'+
    '<div class="row"><button class="btn blue" data-act="addword">הוספת מילה</button>'+
    '<button class="btn primary" data-act="start:own"'+(n>=4?'':' disabled')+'>תרגול</button></div>';
  if (n<4) h+='<p class="sub" style="margin-top:1rem">'+(n?'יש כאן '+n+' מילים. ':'')+'צריך לפחות 4 מילים כדי להתחיל תרגול.</p>';
  if (n) h+='<ul class="words">'+state.words.slice().reverse().map(function(w){
      return '<li><div class="pair"><div class="am">'+esc(w.a)+'</div><div class="he">'+esc(w.h)+'</div></div><button data-act="del:'+esc(w.id)+'">מחיקה</button></li>'; }).join("")+'</ul>';
  return h;
}
function addWord(){
  var a=document.getElementById("wa"), h=document.getElementById("wh");
  var av=a.value.trim(), hv=h.value.trim();
  if (!av){ a.focus(); return; }
  if (!hv){ h.focus(); return; }
  state.words.push({id:uid(), a:av.slice(0,200), h:hv.slice(0,200)});
  save(); render();
  var na=document.getElementById("wa"); if(na) na.focus();
}

function tileHTML(st,w){
  if (st.spell){   // the sound is shown only under letters that are not in the learner's set yet
    var f=formOf(w), known=state.letters.indexOf(f.L.id)>=0;
    return '<span class="eth" lang="am" style="font-size:1.6rem">'+esc(w)+'</span>'+(known?'':'<span class="lat">'+esc(f.lat)+'</span>');
  }
  return st.fidel ? '<span class="eth" lang="am">'+esc(w)+'</span><span class="lat">'+esc(WORD_LAT[w]||tr(w))+'</span>' : '<span class="lat">'+esc(w)+'</span>';
}
function viewLesson(){
  if (L.done){
    var acc=Math.round(100*L.right/Math.max(1,L.right+L.wrong));
    return '<div class="end">'+mascot("happy",120)+'<h2>השיעור הושלם</h2><p>'+(L.wrong===0?"בלי אף טעות. בונוס של 5 XP.":esc(L.title))+'</p>'+weave(L.look.mo,100,40)+
      '<div class="cards"><div class="scard"><small>נקודות</small><b>'+L.gain+'</b></div>'+
      '<div class="scard"><small>דיוק</small><b>'+acc+'%</b></div>'+
      '<div class="scard"><small>רצף ימים</small><b>'+liveStreak()+'</b></div></div>'+
      '<button class="btn primary wide" data-act="quit">המשך</button></div>';
  }
  if (L.failed){
    return '<div class="end sad">'+mascot("sad",120)+'<h2>נגמרו הלבבות</h2><p>לא נורא, ככה לומדים. המילים שהיו בהן טעויות יחזרו ראשונות בפעם הבאה.</p>'+
      '<div class="row" style="justify-content:center"><button class="btn primary" data-act="retry">ניסיון נוסף</button><button class="btn" data-act="quit">חזרה</button></div></div>';
  }
  var st=cur(), fb=L.phase==="fb", pct=Math.round(100*(L.i+(fb?1:0))/L.steps.length);
  var h='<div class="lesson"><div class="l-top"><button class="icon-btn" data-act="quit" aria-label="יציאה מהשיעור">✕</button>'+
    '<div class="lbar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+pct+'">'+weave(L.look.mo,pct,14)+'</div>'+
    '<div class="hearts" role="img" aria-label="נשארו '+L.hearts+' מתוך '+HEARTS+' לבבות">'+[0,1,2,3,4].map(function(i){ return '<i'+(i<L.hearts?'':' class="off"')+'></i>'; }).join("")+'</div></div><h2 class="ask">'+st.ask+'</h2>';
  var ready=false;
  if (st.t==="learn"){
    return h+st.html+(st.aud?'<div class="gacts">'+audBtn(st.aud,"האזנה לצורה הראשונה של אותיות הקבוצה")+'</div>':'')+
      '</div><div class="l-foot"><div><button class="btn primary wide" data-act="learned">הבנתי, לתרגול</button></div></div>';
  }
  if (st.t==="mc"){
    h+='<div class="prompt">'+st.prompt+'</div><div class="choices'+(st.cols===2?' two':'')+'">'+st.opts.map(function(o,i){
      var cls="choice";
      if (fb) cls += i===st.answer ? " right" : (i===L.sel ? " wrong" : " gone"); else if (i===L.sel) cls+=" sel";
      return '<button class="'+cls+'" data-act="opt:'+i+'"'+(fb?' disabled':'')+'>'+o+'</button>'; }).join("")+'</div>';
    ready = L.sel!==null;
  } else if (st.t==="build"){
    h+='<div class="prompt">'+st.prompt+'</div><div class="answer-line" dir="ltr">'+st.picked.map(function(ti,pos){
        return '<button class="tile" data-act="untile:'+pos+'"'+(fb?' disabled':'')+'>'+tileHTML(st,st.tiles[ti])+'</button>'; }).join("")+'</div>'+
      '<div class="bank" dir="ltr">'+st.tiles.map(function(w,i){
        var used=st.picked.indexOf(i)>=0;
        return '<button class="tile'+(used?' used':'')+'" data-act="tile:'+i+'"'+(used||fb?' disabled':'')+'>'+tileHTML(st,w)+'</button>'; }).join("")+'</div>';
    ready = st.picked.length>0;
  } else {
    var col=function(arr,side,sel){ return '<div class="col">'+arr.map(function(x){
      var cls="choice";
      if (st.done[x.id]) cls+=" right gone"; else if (sel===x.id) cls+=" sel"; else if (st.flash && st.flash.indexOf(x.id)>=0 && ((side==="l"&&st.flash[0]===x.id)||(side==="r"&&st.flash[1]===x.id))) cls+=" wrong flash";
      return '<button class="'+cls+'" data-act="m'+side+':'+x.id+'"'+(st.done[x.id]||fb?' disabled':'')+'>'+x.html+'</button>'; }).join("")+'</div>'; };
    h+='<div class="match">'+col(st.left,"l",st.selL)+col(st.right,"r",st.selR)+'</div>';
  }
  h+='</div>';
  if (!fb){
    h+='<div class="l-foot"><div>'+(st.t==="match" ? '<p class="hint">בוחרים פריט מכל עמודה</p>' : '<button class="btn primary wide" data-act="check"'+(ready?'':' disabled')+'>בדיקה</button>')+'</div></div>';
  } else if (L.ok){
    var title = (L.combo===3||L.combo===5||L.combo===8) ? GOBEZ+'<small>'+L.combo+' ברצף</small>' : PRAISE[L.i%PRAISE.length];
    h+='<div class="l-foot ok"><div><div class="fb-t">'+title+'</div>'+(st.answerHTML?'<div class="fb-a">'+st.answerHTML+'</div>':'<div class="fb-a"></div>')+'<button class="btn primary wide" data-act="cont">המשך</button></div></div>';
  } else {
    h+='<div class="l-foot no"><div><div class="fb-t">התשובה הנכונה:</div><div class="fb-a">'+st.answerHTML+'</div><button class="btn bad wide" data-act="cont">המשך</button></div></div>';
  }
  return h;
}
function render(){
  if (TR){ app.innerHTML=viewTracer(); initTracer(); return; }
  if (TIP && !L){ app.innerHTML=viewTip(); return; }
  if (L){ app.innerHTML=viewLesson(); return; }
  app.innerHTML='<div class="wrap">'+topbar()+(tab==="home"?viewHome():tab==="letters"?viewLetters():viewWords())+'</div>'+nav();
}

/* ---------- events ---------- */
app.addEventListener("click", function(e){
  var b=e.target.closest("[data-act]"); if(!b || b.disabled) return;
  var p=b.getAttribute("data-act").split(":"), a=p[0], v=p.slice(1).join(":");
  if (a!=="reset" && resetArmed) resetArmed=false;
  switch(a){
    case "tab": stopAudio(); tab=v; openNode=null; render(); window.scrollTo(0,0); break;
    case "node": openNode = openNode===v ? null : v; render(); break;
    case "chap":
      openCh = shownCh()===+v ? -1 : +v; openNode=null; render();
      var chEl=document.getElementById("ch-"+v); if (chEl && chEl.scrollIntoView) chEl.scrollIntoView({block:"start"});
      break;
    case "start": stopAudio(); TIP=null; startLesson(p[1], p[2]); break;
    case "tip": if(TIPS[v]){ TIP=v; render(); window.scrollTo(0,0); } break;
    case "tipclose": TIP=null; render(); break;
    case "opt": selectOpt(+v); break;
    case "tile": tileTap(+v); break;
    case "untile": untile(+v); break;
    case "ml": matchTap("l",+v); break;
    case "mr": matchTap("r",+v); break;
    case "check": check(); break;
    case "learned": learned(); break;
    case "cont": cont(); break;
    case "quit": stopAudio(); quit(); break;
    case "retry": startLesson(L.kind, L.id); break;
    case "trace": stopAudio(); openTracer(v); break;
    case "aud": playAudio(v); break;
    case "grp":
      var G=null; GROUPS.forEach(function(x){ if(x.k===v) G=x; });
      if (G){
        var allOn=G.ids.every(function(id){ return state.letters.indexOf(id)>=0; });
        G.ids.forEach(function(id){ var k2=state.letters.indexOf(id); if(allOn){ if(k2>=0) state.letters.splice(k2,1); } else if(k2<0) state.letters.push(id); });
        save(); render();
      }
      break;
    case "trclose": TR=null; render(); break;
    case "trclear": trClear(); break;
    case "trcheck": trCheck(); break;
    case "mute": state.mute=!state.mute; save(); render(); if(!state.mute) sound("pair"); break;
    case "toggle": var k=state.letters.indexOf(v); if(k>=0) state.letters.splice(k,1); else state.letters.push(v); save(); render(); break;
    case "addword": addWord(); break;
    case "del": state.words=state.words.filter(function(w){return w.id!==v;}); save(); render(); break;
    case "reset":
      if (!resetArmed){ resetArmed=true; render(); break; }
      resetArmed=false; state.str={}; state.due={}; state.xp=0; state.streak=0; state.lastDay=""; state.dayKey=""; state.dayXp=0; save(); render(); break;
  }
});
app.addEventListener("keydown", function(e){
  if (e.key==="Enter" && (e.target.id==="wa" || e.target.id==="wh")){ e.preventDefault(); addWord(); }
});
document.addEventListener("keydown", function(e){
  if (!L || L.done || L.failed) return;
  if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
  if (e.key==="Enter"){ e.preventDefault(); if (cur().t==="learn") learned(); else if (L.phase==="fb") cont(); else check(); return; }
  if (L.phase==="ask" && cur().t==="mc" && /^[1-4]$/.test(e.key)){ var n=+e.key-1; if(n<cur().opts.length) selectOpt(n); }
});

// read-only hooks for tests/run.mjs
window.ALEF_TEST={ all:function(){ return ALL; }, units:function(){ return chapters(); }, letters:function(){ return LETTERS; } };
render();
connect();
})();
