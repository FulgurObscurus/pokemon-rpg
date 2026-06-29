// =======================================================================
// КЛАСС ПОКЕМОНА (система SP — по Pokemon Champions)
// =======================================================================

function getLearnset(speciesId) {
 if (typeof LEARNSETS !== 'undefined' && LEARNSETS[speciesId]) {
  return LEARNSETS[speciesId].moves;
 }
 return [];
}

function buildMoveFromEntry(moveEntry) {
 const moveId = moveEntry.id || moveEntry.moveId || moveEntry.key || moveEntry.slug || moveEntry.en || moveEntry.move || moveEntry.name;
 const moveData = getMoveData(moveId);

 return {
  ...moveData,
  id: moveData.id || moveId,
  name: moveData.name || moveEntry.name || moveId,
  pp: moveData.max_pp,
  learnLevel: moveEntry.learnLevel || 1
 };
}

class Poke {
 constructor(speciesId, level = 5) {
 const base = allPokemonData[speciesId];
 if (!base) throw new Error("Покемон #" + speciesId + " не найден");

 this.speciesId = speciesId;
 this.name = base.name.ru;
 const TYPE_RU = {normal:'Обычный',fire:'Огненный',water:'Водный',grass:'Травяной',electric:'Электрический',ice:'Ледяной',fighting:'Боевой',poison:'Ядовитый',ground:'Земляной',flying:'Летающий',psychic:'Психический',bug:'Жуковый',rock:'Каменный',ghost:'Призрачный',dragon:'Драконий',dark:'Тёмный',steel:'Стальной',fairy:'Сказочный'};
 this.types = base.types.map(function(t) { return (typeof t === 'object' ? (t.ru || t.en || t) : (TYPE_RU[t] || t)); });
 this.baseStats = base.stats;
 this.abilities = base.abilities.map(a => a.ru || a);
 this.ability = this.abilities.length
 ? this.abilities[Math.floor(Math.random() * this.abilities.length)]
 : "Нет";

 this.level = level;
 this.exp = 0;

 // IV = 31 всегда (как в Pokemon Champions)
 this.ivs = { hp: 31, attack: 31, defense: 31, spAttack: 31, spDefense: 31, speed: 31 };

 // Очки характеристик (SP) — вместо EV
 this.statPoints = { hp: 0, attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 };

 // Берём приёмы из LEARNSETS, фильтруем по уровню
 const learnset = getLearnset(speciesId);
 const eligible = learnset.filter(m => m.learnLevel <= level);
 const selected = eligible.slice(-4);
 this.moves = selected.map(buildMoveFromEntry);

 this.currentHp = this.maxHp;
 this.status = null;
 this.shiny = Math.random() < 1 / 4096;
 this.gender = Math.random() < 0.5 ? "М" : "Ж";
 this.heldItem = null;
 this.friendship = 70;
 this.isWild = false;

 this.attackBoost = 0;
 this.defenseBoost = 0;
 this.spAttackBoost = 0;
 this.spDefenseBoost = 0;
 this.speedBoost = 0;
 this.accuracyBoost = 0;
 this.evasionBoost = 0;
 }

 get maxHp() {
 return Math.floor(
 (2 * this.baseStats.hp + 31) * this.level / 100
 ) + this.level + 10 + (this.statPoints?.hp || 0);
 }

 get statAttack() {
 return Math.floor(
 (2 * this.baseStats.attack + 31) * this.level / 100
 ) + 5 + (this.statPoints?.attack || 0);
 }

 get statDefense() {
 return Math.floor(
 (2 * this.baseStats.defense + 31) * this.level / 100
 ) + 5 + (this.statPoints?.defense || 0);
 }

 get statSpAttack() {
 return Math.floor(
 (2 * this.baseStats.spAttack + 31) * this.level / 100
 ) + 5 + (this.statPoints?.spAttack || 0);
 }

 get statSpDefense() {
 return Math.floor(
 (2 * this.baseStats.spDefense + 31) * this.level / 100
 ) + 5 + (this.statPoints?.spDefense || 0);
 }

 get statSpeed() {
 return Math.floor(
 (2 * this.baseStats.speed + 31) * this.level / 100
 ) + 5 + (this.statPoints?.speed || 0);
 }

 get expToNext() {
 return Math.floor(4 * Math.pow(this.level, 3) / 5);
 }

 gainExp(amount) {
 this.exp += amount;

 while (this.exp >= this.expToNext && this.level < 100) {
 this.exp -= this.expToNext;
 this.level++;
 this.currentHp = this.maxHp;

 addMessage("\ud83c\udf89 " + this.name + " повысился до " + this.level + " уровня!");
 this.checkEvolution();
 this.checkLearnMove();
 }
 }

 checkEvolution() {
 const evo = allPokemonData[this.speciesId]?.evolutions;
 if (!evo) return;

 for (let e of evo) {
 if (e.method === "level-up" && this.level >= e.minLevel) {
 const newId = e.targetId;
 if (newId && allPokemonData[newId]) {
 addMessage("\u2728 " + this.name + " эволюционирует в " + allPokemonData[newId].name.ru + "!");

 this.speciesId = newId;
 const base = allPokemonData[newId];

 this.name = base.name.ru;
 const TYPE_RU = {normal:'Обычный',fire:'Огненный',water:'Водный',grass:'Травяной',electric:'Электрический',ice:'Ледяной',fighting:'Боевой',poison:'Ядовитый',ground:'Земляной',flying:'Летающий',psychic:'Психический',bug:'Жуковый',rock:'Каменный',ghost:'Призрачный',dragon:'Драконий',dark:'Тёмный',steel:'Стальной',fairy:'Сказочный'};
 this.types = base.types.map(function(t) { return (typeof t === 'object' ? (t.ru || t.en || t) : (TYPE_RU[t] || t)); });
 this.baseStats = base.stats;
 this.abilities = base.abilities.map(a => a.ru || a);
 this.ability = this.abilities.length
 ? this.abilities[Math.floor(Math.random() * this.abilities.length)]
 : "Нет";

 // При эволюции НЕ меняем текущие приёмы автоматически
 // Новые приёмы новой формы станут доступны в меню Тренировки
 this.currentHp = this.maxHp;
 break;
 }
 }
 }
 }

 checkLearnMove() {
 // Не добавляем приёмы автоматически
 // Вместо этого сообщаем игроку о новых доступных приёмах
 const learnset = getLearnset(this.speciesId);
 if (!learnset || learnset.length === 0) return;

 const newMoves = learnset.filter(m => m.learnLevel === this.level);
 for (let m of newMoves) {
 const moveData = getMoveData(m.move);
 const name = moveData.name || m.move;
 if (!this.moves.some(mm => mm.id === m.move || mm.name === name)) {
 addMessage("\ud83d\udcd8 " + this.name + " может изучить " + name + "! Откройте Тренировку.");
 }
 }
 }

 getStatMultiplier(stat) {
 const stageMap = {
 0: 1,
 1: 1.5,
 2: 2,
 3: 2.5,
 4: 3,
 5: 3.5,
 6: 4,
 "-1": 2 / 3,
 "-2": 1 / 2,
 "-3": 2 / 5,
 "-4": 1 / 3,
 "-5": 2 / 7,
 "-6": 1 / 4
 };

 let stage = 0;

 if (stat === 'attack') stage = this.attackBoost;
 else if (stat === 'defense') stage = this.defenseBoost;
 else if (stat === 'spAttack') stage = this.spAttackBoost;
 else if (stat === 'spDefense') stage = this.spDefenseBoost;
 else if (stat === 'speed') stage = this.speedBoost;
 else if (stat === 'accuracy') stage = this.accuracyBoost;
 else if (stat === 'evasion') stage = this.evasionBoost;

 stage = Math.max(-6, Math.min(6, stage));
 return stageMap[stage] || 1;
 }

 getEffectiveStat(stat) {
 const baseStat = {
 attack: this.statAttack,
 defense: this.statDefense,
 spAttack: this.statSpAttack,
 spDefense: this.statSpDefense,
 speed: this.statSpeed
 }[stat];

 return Math.floor(baseStat * this.getStatMultiplier(stat));
 }
}
