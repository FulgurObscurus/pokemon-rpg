// =======================================================================
// КЛАСС ПОКЕМОНА (часть 1)
// =======================================================================
class Poke {
    constructor(speciesId, level = 5) {
        const base = allPokemonData[speciesId];
        if (!base) throw new Error(`Покемон #${speciesId} не найден`);
        this.speciesId = speciesId;
        this.name = base.name.ru;
        this.types = base.types.map(t => t.ru);
        this.baseStats = base.stats;
        this.abilities = base.abilities.map(a => a.ru);
        this.ability = this.abilities.length ? this.abilities[Math.floor(Math.random() * this.abilities.length)] : "Нет";
        this.level = level;
        this.exp = 0;
        this.ivs = { hp: rand(0,31), attack: rand(0,31), defense: rand(0,31), spAttack: rand(0,31), spDefense: rand(0,31), speed: rand(0,31) };
        this.evs = { hp:0, attack:0, defense:0, spAttack:0, spDefense:0, speed:0 };
        this.moves = base.moves.slice(0,4).map(m => ({ ...m, pp: m.max_pp }));
        this.currentHp = this.maxHp;
        this.status = null;
        this.shiny = Math.random() < 1/4096;
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
        return Math.floor((2*this.baseStats.hp + this.ivs.hp + Math.floor(this.evs.hp/4)) * this.level / 100) + this.level + 10;
    }
    get statAttack() { return Math.floor((2*this.baseStats.attack + this.ivs.attack + Math.floor(this.evs.attack/4)) * this.level / 100) + 5; }
    get statDefense() { return Math.floor((2*this.baseStats.defense + this.ivs.defense + Math.floor(this.evs.defense/4)) * this.level / 100) + 5; }
    get statSpAttack() { return Math.floor((2*this.baseStats.spAttack + this.ivs.spAttack + Math.floor(this.evs.spAttack/4)) * this.level / 100) + 5; }
    get statSpDefense() { return Math.floor((2*this.baseStats.spDefense + this.ivs.spDefense + Math.floor(this.evs.spDefense/4)) * this.level / 100) + 5; }
    get statSpeed() { return Math.floor((2*this.baseStats.speed + this.ivs.speed + Math.floor(this.evs.speed/4)) * this.level / 100) + 5; }
    get expToNext() { return Math.floor(4 * Math.pow(this.level, 3) / 5); }
    // =======================================================================
// КЛАСС ПОКЕМОНА (часть 2 – методы)
// =======================================================================
    gainExp(amount) {
        this.exp += amount;
        while (this.exp >= this.expToNext && this.level < 100) {
            this.exp -= this.expToNext;
            this.level++;
            this.currentHp = this.maxHp;
            addMessage(`🎉 ${this.name} повысился до ${this.level} уровня!`);
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
                    addMessage(`✨ ${this.name} эволюционирует в ${allPokemonData[newId].name.ru}!`);
                    this.speciesId = newId;
                    const base = allPokemonData[newId];
                    this.name = base.name.ru;
                    this.types = base.types.map(t => t.ru);
                    this.baseStats = base.stats;
                    this.abilities = base.abilities.map(a => a.ru);
                    this.ability = this.abilities.length ? this.abilities[Math.floor(Math.random() * this.abilities.length)] : "Нет";
                    this.moves = base.moves.slice(0,4).map(m => ({ ...m, pp: m.max_pp }));
                    this.currentHp = this.maxHp;
                    break;
                }
            }
        }
    }

    checkLearnMove() {
        const base = allPokemonData[this.speciesId];
        if (!base) return;
        for (let m of base.moves) {
            if (m.learnLevel === this.level) {
                if (!this.moves.some(mm => mm.name === m.name)) {
                    if (this.moves.length < 4) {
                        this.moves.push({ ...m, pp: m.max_pp });
                        addMessage(`📘 ${this.name} изучил приём ${m.name}!`);
                    } else {
                        addMessage(`⚠️ У ${this.name} 4 приёма, замените вручную.`);
                    }
                }
            }
        }
    }

    getStatMultiplier(stat) {
        const stageMap = { 0:1, 1:1.5, 2:2, 3:2.5, 4:3, 5:3.5, 6:4, "-1":2/3, "-2":1/2, "-3":2/5, "-4":1/3, "-5":2/7, "-6":1/4 };
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
            attack: this.statAttack, defense: this.statDefense,
            spAttack: this.statSpAttack, spDefense: this.statSpDefense,
            speed: this.statSpeed
        }[stat];
        return Math.floor(baseStat * this.getStatMultiplier(stat));
    }
}