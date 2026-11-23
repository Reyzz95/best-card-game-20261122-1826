/* Ember Duel - Game Logic & AI */

const ALL_CARD_TEMPLATES = [
  // Strikes (8)
  { name: "Spark", type: "strike", cost: 0, val: 3, glyph: "✨", desc: "Deal 3 damage" },
  { name: "Ember Dart", type: "strike", cost: 1, val: 4, glyph: "🗡️", desc: "Deal 4 damage" },
  { name: "Flame Bolt", type: "strike", cost: 1, val: 5, glyph: "⚡", desc: "Deal 5 damage" },
  { name: "Scorch", type: "strike", cost: 2, val: 5, glyph: "🔥", desc: "Deal 5 damage" },
  { name: "Blazing Slash", type: "strike", cost: 2, val: 6, glyph: "⚔️", desc: "Deal 6 damage" },
  { name: "Fire Strike", type: "strike", cost: 3, val: 6, glyph: "☄️", desc: "Deal 6 damage" },
  { name: "Magma Burst", type: "strike", cost: 3, val: 7, glyph: "💥", desc: "Deal 7 damage" },
  { name: "Inferno Lash", type: "strike", cost: 4, val: 7, glyph: "🌋", desc: "Deal 7 damage" },
  // Guards (6)
  { name: "Ash Shield", type: "guard", cost: 0, val: 4, glyph: "🛡️", desc: "Gain 4 block" },
  { name: "Smoke Screen", type: "guard", cost: 1, val: 5, glyph: "💨", desc: "Gain 5 block" },
  { name: "Ember Wall", type: "guard", cost: 1, val: 6, glyph: "🧱", desc: "Gain 6 block" },
  { name: "Flame Barrier", type: "guard", cost: 2, val: 6, glyph: "♨️", desc: "Gain 6 block" },
  { name: "Cinder Armor", type: "guard", cost: 2, val: 7, glyph: "🛡️", desc: "Gain 7 block" },
  { name: "Magma Shell", type: "guard", cost: 3, val: 8, glyph: "🐢", desc: "Gain 8 block" },
  // Mends (4)
  { name: "Spark of Life", type: "mend", cost: 1, val: 4, glyph: "💖", desc: "Heal 4 HP" },
  { name: "Ember Touch", type: "mend", cost: 2, val: 5, glyph: "🌿", desc: "Heal 5 HP" },
  { name: "Flame Mend", type: "mend", cost: 2, val: 5, glyph: "✨", desc: "Heal 5 HP" },
  { name: "Renewal", type: "mend", cost: 3, val: 6, glyph: "☀️", desc: "Heal 6 HP" },
  // Surges (4)
  { name: "Kindling", type: "surge", cost: 0, val: 2, glyph: "🪵", desc: "Gain 2 ember" },
  { name: "Heat Burst", type: "surge", cost: 0, val: 2, glyph: "☀️", desc: "Gain 2 ember" },
  { name: "Mana Flare", type: "surge", cost: 1, val: 2, glyph: "🔮", desc: "Gain 2 ember" },
  { name: "Ember Surge", type: "surge", cost: 1, val: 2, glyph: "🌟", desc: "Gain 2 ember" },
  // Phoenix (2)
  { name: "Phoenix Feather", type: "phoenix", cost: 3, val: 5, healVal: 3, glyph: "🦅", desc: "Deal 5 dmg & Heal 3" },
  { name: "Rebirth Flame", type: "phoenix", cost: 4, val: 5, healVal: 3, glyph: "🔥", desc: "Deal 5 dmg & Heal 3" }
];

let gameState = {
  screen: 'title',
  turn: 1,
  playerHP: 30,
  maxHP: 30,
  playerBlock: 0,
  playerEmber: 3,
  maxEmber: 3,
  deck: [],
  hand: [],
  discard: [],
  cinderHP: 30,
  cinderBlock: 0,
  cinderHandCount: 5,
  cinderDeck: [],
  cinderDiscard: [],
  cinderHand: [],
  log: "The duel begins in the volcanic arena! Choose your first card.",
  muted: false,
  rngSeed: 12345
};

let rng = {
  next() {
    gameState.rngSeed = (gameState.rngSeed * 9301 + 49297) % 233280;
    return gameState.rngSeed / 233280;
  }
};

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function initGame(seedVal) {
  if (seedVal) {
    gameState.rngSeed = parseInt(seedVal, 10) || 12345;
  } else {
    gameState.rngSeed = Math.floor(Math.random() * 1000000);
  }

  gameState.turn = 1;
  gameState.playerHP = 30;
  gameState.playerBlock = 0;
  gameState.maxEmber = 3;
  gameState.playerEmber = 3;
  
  gameState.cinderHP = 30;
  gameState.cinderBlock = 0;
  gameState.cinderHandCount = 5;

  // Build deck
  let playerTemplates = JSON.parse(JSON.stringify(ALL_CARD_TEMPLATES));
  shuffle(playerTemplates);
  gameState.deck = playerTemplates;
  gameState.hand = [];
  gameState.discard = [];

  // Build Cinder deck
  let cinderTemplates = JSON.parse(JSON.stringify(ALL_CARD_TEMPLATES));
  shuffle(cinderTemplates);
  gameState.cinderDeck = cinderTemplates;
  gameState.cinderHand = [];
  gameState.cinderDiscard = [];

  drawPlayerCards(5);
  drawCinderCards(5);
  updateUI();
}

function drawPlayerCards(count) {
  for (let i = 0; i < count; i++) {
    if (gameState.deck.length === 0) {
      gameState.deck = shuffle(gameState.discard);
      gameState.discard = [];
    }
    if (gameState.deck.length > 0) {
      gameState.hand.push(gameState.deck.pop());
    }
  }
}

function drawCinderCards(count) {
  for (let i = 0; i < count; i++) {
    if (gameState.cinderDeck.length === 0) {
      gameState.cinderDeck = shuffle(gameState.cinderDiscard);
      gameState.cinderDiscard = [];
    }
    if (gameState.cinderDeck.length > 0) {
      gameState.cinderHand.push(gameState.cinderDeck.pop());
    }
  }
}

function playCard(index) {
  if (index < 0 || index >= gameState.hand.length) return;
  const card = gameState.hand[index];

  if (gameState.playerEmber < card.cost) {
    setLog("Not enough ember for " + card.name + "!");
    playTone(150, 'sawtooth', 0.1);
    return;
  }

  // Pay cost
  gameState.playerEmber -= card.cost;
  // Remove from hand
  gameState.hand.splice(index, 1);
  gameState.discard.push(card);

  playTone(440, 'sine', 0.15);

  // Resolve player card effect
  let logMsg = `You played ${card.name} (${card.glyph}). `;
  if (card.type === 'strike') {
    let dmg = card.val;
    let actualDmg = dealDamageToCinder(dmg);
    logMsg += `Dealt ${actualDmg} damage!`;
  } else if (card.type === 'guard') {
    gameState.playerBlock += card.val;
    logMsg += `Gained ${card.val} block.`;
  } else if (card.type === 'mend') {
    let heal = Math.min(card.val, gameState.maxHP - gameState.playerHP);
    gameState.playerHP += heal;
    logMsg += `Healed ${heal} HP.`;
  } else if (card.type === 'surge') {
    gameState.playerEmber = Math.min(10, gameState.playerEmber + card.val);
    logMsg += `Gained ${card.val} ember.`;
  } else if (card.type === 'phoenix') {
    let actualDmg = dealDamageToCinder(card.val);
    let heal = Math.min(card.healVal, gameState.maxHP - gameState.playerHP);
    gameState.playerHP += heal;
    logMsg += `Dealt ${actualDmg} dmg & healed ${heal} HP!`;
  }

  setLog(logMsg);

  // Check victory
  if (gameState.cinderHP <= 0) {
    gameState.cinderHP = 0;
    updateUI();
    showScreen('victory');
    playTone(587.33, 'triangle', 0.4);
    return;
  }

  // Cinder AI turn
  setTimeout(() => {
    executeCinderTurn();
  }, 350);
}

function dealDamageToCinder(amount) {
  let dmg = amount;
  if (gameState.cinderBlock > 0) {
    if (gameState.cinderBlock >= dmg) {
      gameState.cinderBlock -= dmg;
      dmg = 0;
    } else {
      dmg -= gameState.cinderBlock;
      gameState.cinderBlock = 0;
    }
  }
  gameState.cinderHP = Math.max(0, gameState.cinderHP - dmg);
  return amount; // or actual unblocked dmg, returning raw attack power for clarity
}

function dealDamageToPlayer(amount) {
  let dmg = amount;
  if (gameState.playerBlock > 0) {
    if (gameState.playerBlock >= dmg) {
      gameState.playerBlock -= dmg;
      dmg = 0;
    } else {
      dmg -= gameState.playerBlock;
      gameState.playerBlock = 0;
    }
  }
  gameState.playerHP = Math.max(0, gameState.playerHP - dmg);
  return amount;
}

function executeCinderTurn() {
  if (gameState.cinderHP <= 0 || gameState.playerHP <= 0) return;

  // Ensure Cinder has a hand
  if (gameState.cinderHand.length === 0) {
    drawCinderCards(5);
  }

  // Cinder AI logic:
  // 1. Prefer lethal strike
  let chosenCardIdx = -1;
  for (let i = 0; i < gameState.cinderHand.length; i++) {
    let c = gameState.cinderHand[i];
    if (c.type === 'strike' && c.val >= gameState.playerHP + gameState.playerBlock) {
      chosenCardIdx = i;
      break;
    }
    if (c.type === 'phoenix' && (c.val + 3) >= gameState.playerHP + gameState.playerBlock) {
      chosenCardIdx = i;
      break;
    }
  }

  // 2. If no lethal, prefer guard when low on HP (<= 15) or incoming high player threat, else big damage
  if (chosenCardIdx === -1) {
    if (gameState.cinderHP <= 15) {
      // Look for guard or mend
      for (let i = 0; i < gameState.cinderHand.length; i++) {
        if (gameState.cinderHand[i].type === 'guard' || gameState.cinderHand[i].type === 'mend') {
          chosenCardIdx = i;
          break;
        }
      }
    }
  }

  // 3. Otherwise pick highest value card (strike/phoenix/mend/surge/guard)
  if (chosenCardIdx === -1) {
    let bestVal = -1;
    for (let i = 0; i < gameState.cinderHand.length; i++) {
      let c = gameState.cinderHand[i];
      let score = c.val || 0;
      if (c.type === 'phoenix') score += 5;
      if (score > bestVal) {
        bestVal = score;
        chosenCardIdx = i;
      }
    }
  }

  if (chosenCardIdx === -1) chosenCardIdx = 0;

  const cinderCard = gameState.cinderHand.splice(chosenCardIdx, 1)[0];
  gameState.cinderDiscard.push(cinderCard);

  let cinderMsg = `Cinder played ${cinderCard.name} (${cinderCard.glyph}). `;
  if (cinderCard.type === 'strike') {
    dealDamageToPlayer(cinderCard.val);
    cinderMsg += `Dealt ${cinderCard.val} damage!`;
  } else if (cinderCard.type === 'guard') {
    gameState.cinderBlock += cinderCard.val;
    cinderMsg += `Gained ${cinderCard.val} block.`;
  } else if (cinderCard.type === 'mend') {
    gameState.cinderHP = Math.min(30, gameState.cinderHP + cinderCard.val);
    cinderMsg += `Healed ${cinderCard.val} HP.`;
  } else if (cinderCard.type === 'surge') {
    // Cinder surge bonus (e.g. next turn or log)
    cinderMsg += `Kindled her flames.`;
  } else if (cinderCard.type === 'phoenix') {
    dealDamageToPlayer(cinderCard.val);
    gameState.cinderHP = Math.min(30, gameState.cinderHP + cinderCard.healVal);
    cinderMsg += `Dealt ${cinderCard.val} dmg & healed ${cinderCard.healVal} HP!`;
  }

  appendToLog(" | " + cinderMsg);

  // Check defeat
  if (gameState.playerHP <= 0) {
    gameState.playerHP = 0;
    updateUI();
    showScreen('defeat');
    playTone(200, 'sawtooth', 0.5);
    return;
  }

  // Advance turn
  gameState.turn++;
  gameState.maxEmber = Math.min(10, 3 + gameState.turn - 1);
  gameState.playerEmber = gameState.maxEmber;
  gameState.playerBlock = 0; // Reset block at start of turn
  gameState.cinderBlock = 0;

  // Draw back up to 5
  gameState.hand = [];
  drawPlayerCards(5);

  gameState.cinderHandCount = gameState.cinderHand.length;
  if (gameState.cinderHandCount < 5) {
    drawCinderCards(5 - gameState.cinderHandCount);
    gameState.cinderHandCount = gameState.cinderHand.length;
  }

  updateUI();
}

function setLog(msg) {
  gameState.log = msg;
  const logEl = document.getElementById('battle-log');
  if (logEl) logEl.textContent = msg;
}

function appendToLog(msg) {
  gameState.log += msg;
  const logEl = document.getElementById('battle-log');
  if (logEl) logEl.textContent = gameState.log;
}

function updateUI() {
  // HP Bars & Texts
  const playerHPBar = document.getElementById('player-hp-bar');
  const playerHPText = document.getElementById('player-hp-text');
  if (playerHPBar) playerHPBar.style.width = Math.max(0, (gameState.playerHP / gameState.maxHP) * 100) + '%';
  if (playerHPText) playerHPText.textContent = `${gameState.playerHP} / ${gameState.maxHP}`;

  const cinderHPBar = document.getElementById('cinder-hp-bar');
  const cinderHPText = document.getElementById('cinder-hp-text');
  if (cinderHPBar) cinderHPBar.style.width = Math.max(0, (gameState.cinderHP / 30) * 100) + '%';
  if (cinderHPText) cinderHPText.textContent = `${gameState.cinderHP} / 30`;

  // Blocks
  const playerBlockEl = document.getElementById('player-block');
  const playerBlockVal = document.getElementById('player-block-val');
  if (gameState.playerBlock > 0) {
    playerBlockEl.style.display = 'inline-block';
    playerBlockVal.textContent = gameState.playerBlock;
  } else {
    playerBlockEl.style.display = 'none';
  }

  const cinderBlockEl = document.getElementById('cinder-block');
  const cinderBlockVal = document.getElementById('cinder-block-val');
  if (gameState.cinderBlock > 0) {
    cinderBlockEl.style.display = 'inline-block';
    cinderBlockVal.textContent = gameState.cinderBlock;
  } else {
    cinderBlockEl.style.display = 'none';
  }

  // Turn & Ember
  const turnCounter = document.getElementById('turn-counter');
  if (turnCounter) turnCounter.textContent = `Turn ${gameState.turn}`;

  const emberPipsEl = document.getElementById('player-ember-pips');
  const emberTextEl = document.getElementById('player-ember-text');
  if (emberTextEl) emberTextEl.textContent = `${gameState.playerEmber}/${gameState.maxEmber}`;
  if (emberPipsEl) {
    emberPipsEl.innerHTML = '';
    for (let i = 0; i < gameState.maxEmber; i++) {
      const pip = document.createElement('div');
      pip.className = 'ember-pip' + (i < gameState.playerEmber ? ' active' : '');
      emberPipsEl.appendChild(pip);
    }
  }

  // Cinder Hand count
  const cinderHandCountEl = document.getElementById('cinder-hand-count');
  if (cinderHandCountEl) cinderHandCountEl.textContent = gameState.cinderHand.length;

  // Player Hand render
  const handContainer = document.getElementById('player-hand');
  if (handContainer) {
    handContainer.innerHTML = '';
    gameState.hand.forEach((card, index) => {
      const cardEl = document.createElement('div');
      const canAfford = gameState.playerEmber >= card.cost;
      cardEl.className = `card type-${card.type}` + (canAfford ? '' : ' disabled');
      
      cardEl.innerHTML = `
        <div class="card-top">
          <span class="card-cost">${card.cost}</span>
          <span class="card-key">[${index + 1}]</span>
        </div>
        <div class="card-body">
          <span class="card-glyph">${card.glyph}</span>
          <span class="card-name">${card.name}</span>
          <span class="card-desc">${card.desc}</span>
        </div>
      `;

      if (canAfford) {
        cardEl.addEventListener('click', () => {
          playCard(index);
        });
      }
      handContainer.appendChild(cardEl);
    });
  }

  const logEl = document.getElementById('battle-log');
  if (logEl) logEl.textContent = gameState.log;
}

function showScreen(screenId) {
  gameState.screen = screenId;
  document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
  const target = document.getElementById('screen-' + screenId);
  if (target) target.classList.add('active');

  if (screenId === 'victory' || screenId === 'defeat') {
    const statsEl = document.getElementById(screenId === 'victory' ? 'victory-stats' : 'defeat-stats');
    if (statsEl) {
      statsEl.innerHTML = `
        <div>Turns Survived: <strong>${gameState.turn}</strong></div>
        <div>Final HP: <strong>${gameState.playerHP} / ${gameState.maxHP}</strong></div>
        <div>Cinder HP: <strong>${gameState.cinderHP} / 30</strong></div>
      `;
    }
  }
}

// Audio
function toggleMute() {
  gameState.muted = !gameState.muted;
  const muteBtn = document.getElementById('btn-mute');
  if (muteBtn) {
    muteBtn.textContent = gameState.muted ? '🔇 Unmute' : '🔊 Mute';
  }
}

function playTone(freq, type, duration) {
  if (gameState.muted) return;
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type || 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {}
}

let audioCtx = null;

// Event Listeners
window.addEventListener('DOMContentLoaded', () => {
  // Parse query string for screenshot hooks & seed
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  const seed = params.get('seed');

  // Setup Buttons
  document.getElementById('btn-play').addEventListener('click', () => {
    initGame(seed);
    showScreen('game');
  });

  document.getElementById('btn-restart-win').addEventListener('click', () => {
    initGame(seed);
    showScreen('game');
  });

  document.getElementById('btn-restart-lose').addEventListener('click', () => {
    initGame(seed);
    showScreen('game');
  });

  document.getElementById('btn-mute').addEventListener('click', toggleMute);

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (e.key >= '1' && e.key <= '5') {
      const idx = parseInt(e.key, 10) - 1;
      if (gameState.screen === 'game') {
        playCard(idx);
      }
    } else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (gameState.screen === 'title') {
        initGame(seed);
        showScreen('game');
      } else if (gameState.screen === 'victory' || gameState.screen === 'defeat') {
        initGame(seed);
        showScreen('game');
      }
    } else if (e.key === 'm' || e.key === 'M') {
      toggleMute();
    }
  });

  // Handle Screenshot Hooks
  if (shot === 'start') {
    showScreen('title');
  } else if (shot === 'play') {
    initGame(seed);
    gameState.turn = 4;
    gameState.playerHP = 22;
    gameState.cinderHP = 18;
    gameState.playerEmber = 4;
    gameState.maxEmber = 4;
    gameState.playerBlock = 5;
    gameState.cinderBlock = 4;
    setLog("You cast Flame Bolt! Cinder shielded with Ash Shield.");
    updateUI();
    showScreen('game');
  } else if (shot === 'end' || shot === 'win') {
    initGame(seed);
    gameState.cinderHP = 0;
    gameState.turn = 7;
    updateUI();
    showScreen('victory');
  } else if (shot === 'lose') {
    initGame(seed);
    gameState.playerHP = 0;
    gameState.turn = 6;
    updateUI();
    showScreen('defeat');
  } else {
    showScreen('title');
  }
});
