// =======================================================================
// МОДУЛЬ ТРЕНИРОВКИ (по системе Pokemon Champions 2026)
// - Очки характеристик (SP): 66 всего, макс 32 на стат
// - Приёмы: все доступные видны всегда, игрок выбирает 4 активных
// =======================================================================

const MAX_SP_PER_STAT = 32;
const MAX_TOTAL_SP = 66;

const TYPE_COLORS = {
 normal:'#A8A878',fire:'#F08030',water:'#6890F0',grass:'#78C850',
 electric:'#F8D030',ice:'#98D8D8',fighting:'#C03028',poison:'#A040A0',
 ground:'#E0C068',flying:'#A890F0',psychic:'#F85888',bug:'#A8B820',
 rock:'#B8A038',ghost:'#705898',dragon:'#7038F8',dark:'#705848',
 steel:'#B8B8D0',fairy:'#EE99AC'
};

const STAT_LABELS = {
 hp:'HP', attack:'Атака', defense:'Защита',
 spAttack:'СЗА', spDefense:'СЗЗ', speed:'Скорость'
};

const STAT_KEYS = ['hp','attack','defense','spAttack','spDefense','speed'];

let trainState = {
 selectedIndex: -1,
 tempSP: null,
 tempMoves: [],
 msg: ''
};

function openTraining() {
 document.getElementById('training-modal').style.display = 'flex';
 trainState = { selectedIndex: -1, tempSP: null, tempMoves: [], msg: '' };
 renderTrainTeam();
 renderTrainContent();
}

function closeTraining() {
 document.getElementById('training-modal').style.display = 'none';
 trainState = { selectedIndex: -1, tempSP: null, tempMoves: [], msg: '' };
}

function renderTrainTeam() {
 const c = document.getElementById('train-team');
 if (!myParty || myParty.length === 0) {
  c.innerHTML = '<div style="color:#aaa;text-align:center;padding:10px;">Нет покемонов</div>';
  return;
 }
 c.innerHTML = '';
 myParty.forEach((p, i) => {
  const btn = document.createElement('button');
  const sprite = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/" + p.speciesId + ".png";
  btn.innerHTML = '<img src="' + sprite + '" style="width:36px;height:36px;image-rendering:pixelated;"><br><small style="color:#ddd;">' + p.name + '</small>';
  btn.style.cssText = 'background:#1a0f2e;border:2px solid #7b4a9e;border-radius:8px;padding:4px 6px;cursor:pointer;color:#fff;min-width:55px;';
  if (i === trainState.selectedIndex) btn.style.borderColor = '#f1c40f';
  btn.onclick = function() { selectTrainPokemon(i); };
  c.appendChild(btn);
 });
}

function selectTrainPokemon(index) {
 if (index < 0 || index >= myParty.length) return;
 const p = myParty[index];
 trainState.selectedIndex = index;
 trainState.tempSP = Object.assign({}, p.statPoints);
 trainState.tempMoves = p.moves.map(function(m) { return m.id || m.name; });
 trainState.msg = '';
 renderTrainTeam();
 renderTrainContent();
}

function computeStat(pokemon, statKey, spVal) {
 var b = pokemon.baseStats;
 var lv = pokemon.level;
 var sp = (spVal !== undefined) ? spVal : (pokemon.statPoints ? pokemon.statPoints[statKey] : 0) || 0;
 if (statKey === 'hp') {
  return Math.floor((2 * b.hp + 31) * lv / 100) + lv + 10 + sp;
 }
 var map = {attack:'attack',defense:'defense',spAttack:'spAttack',spDefense:'spDefense',speed:'speed'};
 return Math.floor((2 * b[map[statKey]] + 31) * lv / 100) + 5 + sp;
}

function getAvailableMoves(speciesId, level) {
 if (typeof LEARNSETS === 'undefined' || !LEARNSETS[speciesId]) return [];
 return LEARNSETS[speciesId].moves.filter(function(m) { return m.learnLevel <= level; });
}

function catLabel(c) {
 if (c === 'physical') return 'Физ';
 if (c === 'special') return 'Спец';
 return 'Стат';
}

function renderTrainContent() {
 var c = document.getElementById('train-content');
 if (trainState.selectedIndex < 0) {
  c.innerHTML = '<div style="text-align:center;color:#888;padding:40px 10px;">Выберите покемона из команды выше</div>';
  return;
 }
 var p = myParty[trainState.selectedIndex];
 var sp = trainState.tempSP;
 var totalSP = STAT_KEYS.reduce(function(s,k) { return s + sp[k]; }, 0);
 var remaining = MAX_TOTAL_SP - totalSP;
 var artSprite = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/" + p.speciesId + ".png";
 var h = '';

 h += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;padding:10px;background:#1a0f2e;border-radius:12px;border:1px solid #7b4a9e;">';
 h += '<img src="' + artSprite + '" style="width:72px;height:72px;">';
 h += '<div><div style="font-size:18px;font-weight:bold;color:#f1c40f;">' + p.name + '</div>';
 h += '<div style="color:#aaa;">Уровень ' + p.level + ' | ' + p.types.join(' / ') + '</div></div></div>';

 h += '<div style="background:#1a0f2e;border-radius:12px;padding:12px;margin-bottom:12px;border:1px solid #7b4a9e;">';
 h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">';
 h += '<span style="font-weight:bold;color:#f1c40f;">📊 Очки характеристик</span>';
 h += '<span style="color:' + (remaining > 0 ? '#4CAF50' : '#f44336') + ';">Остаток: ' + remaining + '</span></div>';

 for (var ki = 0; ki < STAT_KEYS.length; ki++) {
  var key = STAT_KEYS[ki];
  var val = sp[key];
  var computed = computeStat(p, key, val);
  var origComputed = computeStat(p, key, p.statPoints[key]);
  var diff = computed - origComputed;
  var diffStr = diff !== 0 ? '<span style="color:' + (diff > 0 ? '#4CAF50' : '#f44336') + ';">(' + (diff > 0 ? '+' : '') + diff + ')</span>' : '';
  h += '<div style="display:flex;align-items:center;gap:4px;margin:4px 0;font-size:14px;">';
  h += '<span style="width:50px;color:#ccc;">' + STAT_LABELS[key] + '</span>';
  h += '<button class="sp-btn" data-stat="' + key + '" data-delta="-1" style="width:30px;height:28px;background:#c0392b;border:none;color:#fff;border-radius:6px;cursor:pointer;font-size:16px;">−</button>';
  h += '<span style="width:28px;text-align:center;font-weight:bold;color:#fff;">' + val + '</span>';
  h += '<button class="sp-btn" data-stat="' + key + '" data-delta="1" style="width:30px;height:28px;background:#27ae60;border:none;color:#fff;border-radius:6px;cursor:pointer;font-size:16px;">+</button>';
  h += '<span style="color:#888;font-size:12px;">/32</span>';
  h += '<span style="margin-left:auto;font-weight:bold;color:#fff;">' + computed + '</span>';
  h += '<span style="font-size:12px;">' + diffStr + '</span></div>';
 }
 h += '</div>';

 h += '<div style="background:#1a0f2e;border-radius:12px;padding:12px;margin-bottom:12px;border:1px solid #7b4a9e;">';
 h += '<div style="font-weight:bold;color:#f1c40f;margin-bottom:8px;">⚔️ Активные приёмы</div>';
 for (var i = 0; i < 4; i++) {
  var moveKey = trainState.tempMoves[i];
  if (moveKey) {
   var md = getMoveData(moveKey);
   var tc = TYPE_COLORS[md.type] || '#A8A878';
   h += '<div style="display:flex;align-items:center;gap:6px;margin:4px 0;padding:6px 8px;background:#2a1a3d;border-radius:8px;border-left:4px solid ' + tc + ';">';
   h += '<span style="flex:1;color:#fff;">' + md.name + '</span>';
   h += '<span style="font-size:11px;color:' + tc + ';">' + md.type + '</span>';
   h += '<span style="font-size:11px;color:#aaa;">' + catLabel(md.category) + '</span>';
   h += '<span style="font-size:11px;color:#aaa;">Сила:' + (md.power || '—') + '</span>';
   h += '<button class="move-remove-btn" data-slot="' + i + '" style="background:#c0392b;border:none;color:#fff;border-radius:6px;cursor:pointer;padding:2px 8px;font-size:14px;">✕</button></div>';
  } else {
   h += '<div style="display:flex;align-items:center;gap:6px;margin:4px 0;padding:6px 8px;background:#2a1a3d;border-radius:8px;border-left:4px solid #555;">';
   h += '<span style="flex:1;color:#666;">— Пустой слот —</span></div>';
  }
 }
 h += '</div>';

 var available = getAvailableMoves(p.speciesId, p.level);
 h += '<div style="background:#1a0f2e;border-radius:12px;padding:12px;margin-bottom:12px;border:1px solid #7b4a9e;">';
 h += '<div style="font-weight:bold;color:#f1c40f;margin-bottom:8px;">📚 Доступные приёмы <span style="color:#aaa;font-weight:normal;">(' + available.length + ')</span></div>';
 h += '<div style="max-height:220px;overflow-y:auto;">';
 for (var mi = 0; mi < available.length; mi++) {
  var m = available[mi];
  var md2 = getMoveData(m.move);
  var tc2 = TYPE_COLORS[md2.type] || '#A8A878';
  var isActive = trainState.tempMoves.indexOf(m.move) >= 0;
  var bg = isActive ? '#2d4a2d' : '#2a1a3d';
  h += '<div style="display:flex;align-items:center;gap:4px;margin:3px 0;padding:5px 8px;background:' + bg + ';border-radius:8px;border-left:4px solid ' + tc2 + ';' + (isActive ? 'opacity:0.7;' : '') + '">';
  h += '<span style="flex:1;color:#fff;font-size:13px;">' + md2.name + '</span>';
  h += '<span style="font-size:10px;color:' + tc2 + ';">' + md2.type + '</span>';
  h += '<span style="font-size:10px;color:#aaa;">' + catLabel(md2.category) + '</span>';
  h += '<span style="font-size:10px;color:#aaa;">' + (md2.power || '—') + '</span>';
  h += '<span style="font-size:10px;color:#888;">Ур.' + m.learnLevel + '</span>';
  h += '<button class="move-add-btn" data-move="' + m.move + '" style="background:' + (isActive ? '#555' : '#27ae60') + ';border:none;color:#fff;border-radius:6px;cursor:pointer;padding:2px 8px;font-size:14px;" ' + (isActive ? 'disabled' : '') + '>' + (isActive ? '✓' : '+') + '</button></div>';
 }
 h += '</div></div>';

 if (trainState.msg) {
  h += '<div style="text-align:center;padding:6px;color:#f1c40f;font-size:14px;">' + trainState.msg + '</div>';
 }

 c.innerHTML = h;
 attachTrainHandlers();

 var confirmBtn = document.getElementById('train-confirm-btn');
 if (confirmBtn) confirmBtn.style.display = trainState.selectedIndex >= 0 ? 'block' : 'none';
}

function adjustSP(stat, delta) {
 if (!trainState.tempSP) return;
 var cur = trainState.tempSP[stat];
 var total = STAT_KEYS.reduce(function(s,k) { return s + trainState.tempSP[k]; }, 0);
 var nv = cur + delta;
 if (nv < 0 || nv > MAX_SP_PER_STAT) return;
 if (delta > 0 && total >= MAX_TOTAL_SP) return;
 trainState.tempSP[stat] = nv;
 renderTrainContent();
}

function removeMoveFromSlot(slot) {
 if (slot < 0 || slot >= trainState.tempMoves.length) return;
 trainState.tempMoves.splice(slot, 1);
 trainState.msg = 'Приём убран. Выберите новый из списка ниже.';
 renderTrainContent();
}

function addMoveToTeam(moveKey) {
 if (trainState.tempMoves.indexOf(moveKey) >= 0) {
  trainState.msg = 'Этот приём уже изучен.';
  renderTrainContent();
  return;
 }
 if (trainState.tempMoves.length >= 4) {
  trainState.msg = '⚠️ У покемона 4 приёма! Сначала уберите один (✕).';
  renderTrainContent();
  return;
 }
 trainState.tempMoves.push(moveKey);
 trainState.msg = '';
 renderTrainContent();
}

function confirmTraining() {
 if (trainState.selectedIndex < 0) return;
 var p = myParty[trainState.selectedIndex];
 p.statPoints = Object.assign({}, trainState.tempSP);
 p.moves = trainState.tempMoves.map(function(key) { return buildMoveFromEntry({ move: key, learnLevel: 1 }); });
 if (p.currentHp > p.maxHp) p.currentHp = p.maxHp;
 addMessage('✅ ' + p.name + ' тренирован!');
 closeTraining();
 if (typeof updateBattleUI === 'function') updateBattleUI();
}

function attachTrainHandlers() {
 document.querySelectorAll('.sp-btn').forEach(function(btn) {
  btn.onclick = function() { adjustSP(btn.dataset.stat, parseInt(btn.dataset.delta)); };
 });
 document.querySelectorAll('.move-remove-btn').forEach(function(btn) {
  btn.onclick = function(e) { e.stopPropagation(); removeMoveFromSlot(parseInt(btn.dataset.slot)); };
 });
 document.querySelectorAll('.move-add-btn').forEach(function(btn) {
  btn.onclick = function(e) { e.stopPropagation(); addMoveToTeam(btn.dataset.move); };
 });
}
