function getPokemonImage(id) { return "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/" + id + ".png"; }
// =======================================================================
// БОЕВЫЕ ФУНКЦИИ (часть 1)
// =======================================================================
function generateWildPokemon() {
    const ids = Object.keys(allPokemonData);
    if (ids.length === 0) return new Poke(25, 5);
    const id = parseInt(ids[rand(0, ids.length-1)]);
    const level = rand(2, 10);
    const p = new Poke(id, level);
    p.isWild = true;
    return p;
}

function startBattle(wildPoke) {
    enemyPokemon = wildPoke;
    inBattle = true;
    moveSelectionMode = false;
    document.getElementById('move-list').style.display = 'none';
    document.getElementById('btn-fight').disabled = false;
    document.getElementById('btn-bag').disabled = false;
    document.getElementById('btn-switch').disabled = false;
    document.getElementById('btn-run').disabled = false;
    addMessage(`⚔️ Дикий ${enemyPokemon.name} (ур. ${enemyPokemon.level}) появился!`);
    updateHpBars();
    showActions();
}

function showActions() {
    document.getElementById('move-list').style.display = 'none';
    document.getElementById('actions').style.display = 'grid';
    document.getElementById('btn-fight').disabled = false;
    document.getElementById('btn-bag').disabled = false;
    document.getElementById('btn-switch').disabled = false;
    document.getElementById('btn-run').disabled = false;
}

// =======================================================================
// БОЕВЫЕ ФУНКЦИИ (часть 2)
// =======================================================================
function onFight() {
    if (!inBattle) return;
    moveSelectionMode = true;
    document.getElementById('actions').style.display = 'none';
    const moveList = document.getElementById('move-list');
    moveList.style.display = 'grid';
    moveList.innerHTML = '';
    const p = getCurrentPokemon();
    if (!p) return;
    p.moves.forEach((move, idx) => {
        const btn = document.createElement('button');
        btn.textContent = `${move.name} (PP: ${move.pp}/${move.max_pp})`;
        if (move.pp <= 0) btn.disabled = true;
        btn.addEventListener('click', () => performMove(idx));
        moveList.appendChild(btn);
    });
    const cancel = document.createElement('button');
    cancel.textContent = '↩️ Назад';
    cancel.addEventListener('click', () => { moveSelectionMode = false; showActions(); });
    moveList.appendChild(cancel);
}

function performMove(index) {
    const p = getCurrentPokemon();
    if (!p || !enemyPokemon) return;
    const move = p.moves[index];
    if (!move || move.pp <= 0) { addMessage('❌ Нет PP!'); return; }
    move.pp--;
    if (p.status === 'paralysis' && Math.random() < 0.25) {
        addMessage(`⚡ ${p.name} парализован и не может двигаться!`);
        enemyTurn();
        return;
    }
    if (p.status === 'sleep' && Math.random() < 0.5) {
        addMessage(`💤 ${p.name} спит!`);
        enemyTurn();
        return;
    }
    const attackStat = move.category === 'physical' ? p.getEffectiveStat('attack') : p.getEffectiveStat('spAttack');
    const defenseStat = move.category === 'physical' ? enemyPokemon.getEffectiveStat('defense') : enemyPokemon.getEffectiveStat('spDefense');
    const stab = p.types.includes(move.type) ? 1.5 : 1;
    const effectiveness = getEffectiveness(move.type, enemyPokemon.types);
    const critical = Math.random() < 0.0625 ? 1.5 : 1;
    const randomFactor = rand(85, 100) / 100;
    let baseDamage = 0;
    if (move.power > 0) {
        baseDamage = Math.floor(( (2 * p.level / 5 + 2) * move.power * (attackStat / defenseStat) / 50 + 2 ) * randomFactor * stab * effectiveness * critical);
    } else {
        addMessage(`⚠️ Статусный приём ${move.name} пока не реализован.`);
        enemyTurn();
        return;
    }
    if (baseDamage < 1) baseDamage = 1;
    enemyPokemon.currentHp -= baseDamage;
    if (enemyPokemon.currentHp < 0) enemyPokemon.currentHp = 0;
    let msg = `${p.name} использует ${move.name}!`;
    if (critical > 1) msg += ' 🔥 Критический удар!';
    if (effectiveness > 1) msg += ' 💥 Очень эффективно!';
    else if (effectiveness < 1 && effectiveness > 0) msg += ' ⚠️ Не очень эффективно...';
    else if (effectiveness === 0) msg += ' ❌ Не действует!';
    msg += ` (урон ${baseDamage})`;
    addMessage(msg);
    updateHpBars();
    if (enemyPokemon.currentHp <= 0) {
        addMessage(`🎉 ${enemyPokemon.name} повержен!`);
        const expGain = enemyPokemon.level * 10;
        p.gainExp(expGain);
        gameState.money += enemyPokemon.level * 5;
        saveGame(); // <--- СОХРАНЕНИЕ
        addMessage(`💰 +${enemyPokemon.level*5} монет. Опыт +${expGain}`);
        endBattle();
        return;
    }
    enemyTurn();
}

// =======================================================================
// БОЕВЫЕ ФУНКЦИИ (часть 3)
// =======================================================================
function enemyTurn() {
    if (!enemyPokemon || enemyPokemon.currentHp <= 0) return;
    const moves = enemyPokemon.moves.filter(m => m.pp > 0);
    if (moves.length === 0) {
        addMessage(`😵 ${enemyPokemon.name} не может атаковать!`);
        updateHpBars();
        showActions();
        return;
    }
    const move = moves[rand(0, moves.length-1)];
    move.pp--;
    const p = getCurrentPokemon();
    if (!p) return;
    const attackStat = move.category === 'physical' ? enemyPokemon.getEffectiveStat('attack') : enemyPokemon.getEffectiveStat('spAttack');
    const defenseStat = move.category === 'physical' ? p.getEffectiveStat('defense') : p.getEffectiveStat('spDefense');
    const stab = enemyPokemon.types.includes(move.type) ? 1.5 : 1;
    const effectiveness = getEffectiveness(move.type, p.types);
    const critical = Math.random() < 0.0625 ? 1.5 : 1;
    const randomFactor = rand(85, 100) / 100;
    let baseDamage = 0;
    if (move.power > 0) {
        baseDamage = Math.floor(( (2 * enemyPokemon.level / 5 + 2) * move.power * (attackStat / defenseStat) / 50 + 2 ) * randomFactor * stab * effectiveness * critical);
    } else {
        addMessage(`⚠️ Враг использовал статусный ${move.name} (не реализовано)`);
        showActions();
        return;
    }
    if (baseDamage < 1) baseDamage = 1;
    p.currentHp -= baseDamage;
    if (p.currentHp < 0) p.currentHp = 0;
    let msg = `${enemyPokemon.name} использует ${move.name}!`;
    if (critical > 1) msg += ' 🔥 Критический удар!';
    if (effectiveness > 1) msg += ' 💥 Очень эффективно!';
    else if (effectiveness < 1 && effectiveness > 0) msg += ' ⚠️ Не очень эффективно...';
    else if (effectiveness === 0) msg += ' ❌ Не действует!';
    msg += ` (урон ${baseDamage})`;
    addMessage(msg);
    updateHpBars();
    if (p.currentHp <= 0) {
        addMessage(`💔 ${p.name} потерял сознание!`);
        let next = false;
        for (let i = 0; i < myParty.length; i++) {
            if (myParty[i].currentHp > 0) {
                currentPokemonIndex = i;
                next = true;
                break;
            }
        }
        if (!next) {
            addMessage(`😵 Все ваши покемоны потеряли сознание! Вы проиграли.`);
            gameState.money = Math.max(0, gameState.money - 100);
            saveGame(); // <--- СОХРАНЕНИЕ
            healParty();
            enemyPokemon = null;
            inBattle = false;
            document.getElementById('move-list').style.display = 'none';
            document.getElementById('actions').style.display = 'none';
            addMessage(`🏥 Вы вернулись в центр покемонов. Деньги: ${gameState.money}`);
            updateHpBars();
            updateInfoPanel();
            showActions();
            return;
        } else {
            addMessage(`🔄 Вы достаёте ${getCurrentPokemon().name}!`);
        }
    }
    updateHpBars();
    showActions();
}

function endBattle() {
    enemyPokemon = null;
    inBattle = false;
    document.getElementById('move-list').style.display = 'none';
    document.getElementById('actions').style.display = 'grid';
    document.getElementById('btn-fight').disabled = true;
    document.getElementById('btn-bag').disabled = true;
    document.getElementById('btn-switch').disabled = true;
    document.getElementById('btn-run').disabled = true;
    const p = getCurrentPokemon();
    if (p) {
        p.currentHp = Math.min(p.currentHp + Math.floor(p.maxHp * 0.3), p.maxHp);
        addMessage(`🌿 Ваш покемон восстановил часть HP.`);
    }
    updateHpBars();
    document.getElementById('btn-fight').textContent = '🌲 Исследовать';
    document.getElementById('btn-fight').disabled = false;
    document.getElementById('btn-fight').onclick = () => {
        if (inBattle) return;
        const wild = generateWildPokemon();
        startBattle(wild);
        document.getElementById('btn-fight').textContent = '⚔️ Бой';
    };
    document.getElementById('btn-bag').disabled = false;
    document.getElementById('btn-switch').disabled = false;
    document.getElementById('btn-run').disabled = false;
    document.getElementById('btn-bag').onclick = () => useBag();
    document.getElementById('btn-switch').onclick = () => switchPokemon();
    document.getElementById('btn-run').onclick = () => {
        if (inBattle) {
            if (Math.random() < 0.5) {
                addMessage(`🏃 Вы сбежали!`);
                enemyPokemon = null;
                inBattle = false;
                showActions();
                document.getElementById('btn-fight').textContent = '🌲 Исследовать';
            } else {
                addMessage(`⚠️ Не удалось сбежать!`);
                enemyTurn();
            }
        }
    };
}

function healParty() {
    myParty.forEach(p => p.currentHp = p.maxHp);
}

function switchPokemon() {
    if (!inBattle) return;
    for (let i = 0; i < myParty.length; i++) {
        if (i !== currentPokemonIndex && myParty[i].currentHp > 0) {
            currentPokemonIndex = i;
            addMessage(`🔄 Вы вывели ${getCurrentPokemon().name}!`);
            updateHpBars();
            enemyTurn();
            return;
        }
    }
    addMessage('❌ Нет доступных покемонов для смены!');
}

function useBag() {
    if (!inBattle) return;
    const p = getCurrentPokemon();
    if (!p) return;
    if (gameState.items.potion > 0) {
        const heal = 20;
        p.currentHp = Math.min(p.currentHp + heal, p.maxHp);
        gameState.items.potion--;
        addMessage(`🧪 Вы использовали Зелье, восстановили ${heal} HP. (Осталось ${gameState.items.potion})`);
        updateHpBars();
        updateInfoPanel();
        saveGame(); // <--- СОХРАНЕНИЕ
        enemyTurn();
    } else {
        addMessage('❌ У вас нет зелий!');
    }
}

// =======================================================================
// ОБНОВЛЕНИЕ ПОЛОСОК HP И ИМЁН С ИЗОБРАЖЕНИЯМИ
// =======================================================================
function updateHpBars() {
    if (!myParty.length) return;
    const p = getCurrentPokemon();
    if (p) {
        const pNameEl = document.getElementById("p-name");
        pNameEl.innerHTML = `<img class="pokemon-img" src="${getPokemonImage(p.speciesId)}" alt="${p.name}"> ${p.name}`;
        document.getElementById("p-level").textContent = p.level;
        const hpPercent = Math.max(0, (p.currentHp / p.maxHp) * 100);
        document.getElementById("p-hp-bar").style.width = hpPercent + "%";
        document.getElementById("p-hp-bar").className = "hp" + (hpPercent < 25 ? " low" : "");
        document.getElementById("p-hp-text").textContent = p.currentHp + "/" + p.maxHp;
    }
    if (enemyPokemon) {
        const eNameEl = document.getElementById("e-name");
        eNameEl.innerHTML = `<img class="pokemon-img" src="${getPokemonImage(enemyPokemon.speciesId)}" alt="${enemyPokemon.name}"> ${enemyPokemon.name}`;
        document.getElementById("e-level").textContent = enemyPokemon.level;
        const hpPercent = Math.max(0, (enemyPokemon.currentHp / enemyPokemon.maxHp) * 100);
        document.getElementById("e-hp-bar").style.width = hpPercent + "%";
        document.getElementById("e-hp-bar").className = "hp" + (hpPercent < 25 ? " low" : "");
        document.getElementById("e-hp-text").textContent = enemyPokemon.currentHp + "/" + enemyPokemon.maxHp;
    } else {
        document.getElementById("e-name").innerHTML = "—";
        document.getElementById("e-hp-bar").style.width = "0%";
        document.getElementById("e-hp-text").textContent = "0/0";
    }
    document.getElementById("party-count").textContent = myParty.length;
    document.getElementById("money").textContent = money;
}
