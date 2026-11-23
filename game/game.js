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

function render(){
  const setHp=(who,fillId,textId)=>{const f=document.getElementById(fillId);const t=document.getElementById(textId);if(f)f.style.width=Math.max(0,who.hp/who.max*100)+'%';if(t)t.textContent=Math.max(0,who.hp)+' / '+who.max;};
  setHp(S.player,'player-hp-fill','player-hp-text');setHp(S.foe,'opponent-hp-fill','opponent-hp-text');
  const pips=document.getElementById('ember-pips');
  if(pips){pips.innerHTML='';for(let i=0;i<10;i++){const s=document.createElement('span');s.className='pip'+(i<S.player.ember?' on':'');pips.appendChild(s);}}
  const tl=document.getElementById('turn-line');if(tl)tl.textContent=S.over?'Duel over.':('Turn '+S.turn+' — play a card ('+S.player.ember+' ember)');
  const oh=document.getElementById('opponent-hand');
  if(oh){oh.innerHTML='';for(let i=0;i<S.foe.hand.length;i++){const d=document.createElement('div');d.className='card back';oh.appendChild(d);}}
  const ph=document.getElementById('player-hand');
  if(ph){ph.innerHTML='';S.player.hand.forEach((c,i)=>{const d=document.createElement('div');d.className='card'+(c.c>S.player.ember||S.over?' disabled':'');d.innerHTML='<div class="cost">'+c.c+'</div><div class="cname">'+c.n+'</div><div class="cval">'+cardText(c)+'</div><div class="celem">'+c.e+'</div>';d.onclick=()=>playCard(i);ph.appendChild(d);});}
}
function cardText(c){if(c.t==='strike')return c.v+' damage';if(c.t==='guard')return '+'+c.v+' block';if(c.t==='mend')return 'Heal '+c.v;if(c.t==='surge')return '+'+c.v+' ember';return '5 dmg + heal 3';}
function checkEnd(){
  if(S.foe.hp<=0&&!S.over){S.over=true;beep(880);document.getElementById('win-text').textContent='Cinder falls to 0 HP. The table is yours!';document.getElementById('win-screen').classList.remove('hidden');}
  else if(S.player.hp<=0&&!S.over){S.over=true;beep(220);document.getElementById('lose-text').textContent='Your HP reached 0. Cinder takes the table.';document.getElementById('lose-screen').classList.remove('hidden');}
  render();
}
function startGame(){
  ['title-screen','win-screen','lose-screen'].forEach(id=>{const e=document.getElementById(id);if(e)e.classList.add('hidden');});
  S.turn=1;S.over=false;S.log=[];
  S.player={hp:30,max:30,block:0,ember:3,hand:[],deck:buildDeck(),disc:[]};
  S.foe={hp:30,max:30,block:0,ember:3,hand:[],deck:buildDeck(),disc:[]};
  drawHand(S.player);drawHand(S.foe);
  log('The duel begins. Play a card!');render();
}


function applyCard(who,foe,c){
  if(c.t==='strike'){let d=c.v;if(foe.block>0){const b=Math.min(foe.block,d);foe.block-=b;d-=b;}foe.hp-=d;return 'dealt '+c.v+' damage';}
  if(c.t==='guard'){who.block+=c.v;return 'gained '+c.v+' block';}
  if(c.t==='mend'){who.hp=Math.min(who.max,who.hp+c.v);return 'healed '+c.v;}
  if(c.t==='surge'){who.ember+=c.v;return 'gained '+c.v+' ember';}
  let d=5;if(foe.block>0){const b=Math.min(foe.block,d);foe.block-=b;d-=b;}foe.hp-=d;who.hp=Math.min(who.max,who.hp+3);return 'dealt 5 damage and healed 3';
}
function playCard(i){
  if(S.over)return;const c=S.player.hand[i];if(!c||c.c>S.player.ember)return;
  S.player.ember-=c.c;S.player.hand.splice(i,1);S.player.disc.push(c);beep(520);
  log('You played '+c.n+' — '+applyCard(S.player,S.foe,c)+'.');
  S.player.block=0;render();checkEnd();if(S.over)return;
  setTimeout(aiTurn,450);
}
function aiTurn(){
  if(S.over)return;
  const affordable=S.foe.hand.filter(c=>c.c<=S.foe.ember);
  let pick=null;
  if(affordable.length){
    const lethal=affordable.find(c=>c.t==='strike'&&c.v>=S.player.hp);
    const hurt=affordable.filter(c=>c.t==='strike').sort((a,b)=>b.v-a.v)[0];
    const guard=affordable.filter(c=>c.t==='guard').sort((a,b)=>b.v-a.v)[0];
    pick=lethal||(S.foe.hp<=10&&guard&&!hurt?guard:(hurt||guard||affordable[0]));
  }
  if(pick){S.foe.ember-=pick.c;S.foe.hand.splice(S.foe.hand.indexOf(pick),1);S.foe.disc.push(pick);log('Cinder played '+pick.n+' — '+applyCard(S.foe,S.player,pick)+'.');}
  else log('Cinder passes.');
  S.foe.block=0;S.turn++;S.player.ember=Math.min(10,S.player.ember+1);S.foe.ember=Math.min(10,S.foe.ember+1);
  drawHand(S.player);drawHand(S.foe);render();checkEnd();
}
function endTurn(){if(!S.over)aiTurn();}
document.getElementById('play-button').addEventListener('click',startGame);
document.querySelectorAll('.play-again').forEach(b=>b.addEventListener('click',startGame));
document.getElementById('end-turn').addEventListener('click',endTurn);
document.addEventListener('keydown',e=>{
  if(e.key>='1'&&e.key<='5')playCard(parseInt(e.key,10)-1);
  else if(e.key==='m'||e.key==='M'){S.muted=!S.muted;}
  else if(e.key==='Enter'||e.key===' '){if(!document.getElementById('title-screen').classList.contains('hidden')||S.over)startGame();}
});
(function init(){
  if(SHOT==='play'){startGame();S.turn=5;S.player.hp=18;S.foe.hp=14;S.player.ember=5;S.log=[];log('You struck Cinder for 6.');log('Cinder raised a guard.');log('Ember surges through the table.');render();}
  else if(SHOT==='end'){document.getElementById('win-text').textContent='Cinder falls to 0 HP. The table is yours!';document.getElementById('win-screen').classList.remove('hidden');}
  else if(SHOT==='lose'){document.getElementById('lose-text').textContent='Your HP reached 0. Cinder takes the table.';document.getElementById('lose-screen').classList.remove('hidden');}
  else{startGame();document.getElementById('title-screen').classList.remove('hidden');}
})();
