function mulberry32(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}}

const Q=new URLSearchParams(location.search);
const SHOT=Q.get('shot')||'start';
const SEED=parseInt(Q.get('seed')||'1',10);

const CARD_POOL=[
  {n:'Ember Slash',t:'strike',c:1,v:5,e:'▲'},
  {n:'Cinder Lash',t:'strike',c:0,v:3,e:'●'},
  {n:'Ashfall Cleave',t:'strike',c:2,v:6,e:'◆'},
  {n:'Scorched Fang',t:'strike',c:1,v:4,e:'✦'},
  {n:'Magma Jab',t:'strike',c:0,v:4,e:'▲'},
  {n:'Pyre Strike',t:'strike',c:3,v:7,e:'●'},
  {n:'Blazing Arc',t:'strike',c:2,v:5,e:'◆'},
  {n:'Flamefang',t:'strike',c:1,v:6,e:'✦'},
  {n:'Cinder Wall',t:'guard',c:1,v:5,e:'▲'},
  {n:'Ember Bulwark',t:'guard',c:2,v:7,e:'●'},
  {n:'Ash Veil',t:'guard',c:0,v:4,e:'◆'},
  {n:'Molten Rampart',t:'guard',c:3,v:8,e:'✦'},
  {n:'Slag Shield',t:'guard',c:1,v:6,e:'▲'},
  {n:'Bastion of Coals',t:'guard',c:2,v:6,e:'●'},
  {n:'Warm Hearth',t:'mend',c:1,v:5,e:'▲'},
  {n:'Soot Salve',t:'mend',c:0,v:4,e:'●'},
  {n:'Kindled Veins',t:'mend',c:2,v:6,e:'◆'},
  {n:'Rekindle',t:'mend',c:1,v:5,e:'✦'},
  {n:'Spark Surge',t:'surge',c:0,v:2,e:'▲'},
  {n:'Ember Draught',t:'surge',c:1,v:2,e:'●'},
  {n:'Kindle Well',t:'surge',c:2,v:2,e:'◆'},
  {n:'Stoked Heart',t:'surge',c:1,v:2,e:'✦'},
  {n:'Phoenix Rise',t:'phoenix',c:4,v:5,e:'✦'},
  {n:'Phoenix Reborn',t:'phoenix',c:4,v:5,e:'▲'}
];

const S={turn:1, over:false, muted:false, player:{hp:30,max:30,block:0,ember:3,hand:[],deck:[],disc:[]}, foe:{hp:30,max:30,block:0,ember:3,hand:[],deck:[],disc:[]}, log:[]};

function rng(){return mulberry32(SEED+S.turn*7);}
function buildDeck(){const d=[...CARD_POOL];const r=mulberry32(SEED*31+S.turn);for(let i=d.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[d[i],d[j]]=[d[j],d[i]];}return d;}
function drawHand(w){while(w.hand.length<5){if(!w.deck.length){w.deck=w.disc.splice(0);for(let i=w.deck.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[w.deck[i],w.deck[j]]=[w.deck[j],w.deck[i]];}}if(!w.deck.length)break;w.hand.push(w.deck.pop());}}
function log(m){S.log.push(m);if(S.log.length>3)S.log.shift();const el=document.getElementById('log-line');if(el)el.textContent=S.log[S.log.length-1];}

function beep(f){if(S.muted)return;try{const a=new (window.AudioContext||window.webkitAudioContext)();const o=a.createOscillator();o.frequency.value=f;o.connect(a.destination);o.start();o.stop(a.currentTime+0.08);}catch(e){}}

// === PART2 ===
