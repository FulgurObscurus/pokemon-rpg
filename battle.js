function getPokemonImage(id) { return "https://img.pokemondb.net/sprites/sword-shield/icon/" + id + ".png"; }
// =======================================================================
// МИНИМАЛЬНАЯ ВЕРСИЯ БОЯ (ДЛЯ ТЕСТА)
// =======================================================================
function generateWildPokemon() {
    const ids = Object.keys(allPokemonData);
    if (ids.length === 0) return new Poke(25, 5);
    const id = parseInt(ids[rand(0, ids.length - 1)]);
    const level = rand(2, 10);
    const p = new Poke(id, level);
    p.isWild = true;
    return p;
}

function startBattle(wildPoke) {
    enemyPokemon = wildPoke;
    inBattle = true;
    document.getElementById('move-list').style.display = 'none';
    document.getElementById('btn-fight').disabled = false;
    document.getElementById('btn-bag').disabled = false;
    document.getElementById('btn-switch').disabled = false;
    document.getElementById('btn-run').disabled = false;
    addMessage('⚔️ Дикий ' + enemyPokemon.name + ' (ур. ' + enemyPokemon.level + ') появился!');
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
        btn.textContent = move.name + ' (PP: ' + move.pp + '/' + move.max_pp + ')';
        if (move.pp <= 0) btn.disabled = true;
        btn.addEventListener('click', function() {
            addMessage('🍕 Нажата кнопка атаки ' + move.name);
            // Наносим простой урон
            const dmg = 10;
            enemyPokemon.currentHp = Math.max(0, enemyPokemon.currentHp - dmg);
            addMessage('💥 ' + p.name + ' нанёс ' + dmg + ' урона!');
            updateHpBars();
            if (enemyPokemon.currentHp <= 0) {
                addMessage('🎉 ' + enemyPokemon.name + ' повержен!');
                endBattle();
                return;
            }
            // Враг тоже атакует (упрощённо)
            const enemyDmg = 5;
            p.currentHp = Math.max(0, p.currentHp - enemyDmg);
            addMessage('💢 ' + enemyPokemon.name + ' нанёс ' + enemyDmg + ' урона!');
            updateHpBars();
            if (p.currentHp <= 0) {
                addMessage('💔 ' + p.name + ' потерял сознание!');
                // Переключаем на следующего покемона, если есть
                let next = false;
                for (let i = 0; i < myParty.length; i++) {
                    if (myParty[i].currentHp > 0) {
                        currentPokemonIndex = i;
                        next = true;
                        break;
                    }
                }
                if (!next) {
                    addMessage('😵 Все покемоны потеряли сознание!');
                    endBattle();
                } else {
                    addMessage('🔄 Вы достаёте ' + getCurrentPokemon().name + '!');
                }
            }
            moveList.style.display = 'none';
            showActions();
            moveSelectionMode = false;
        });
        moveList.appendChild(btn);
    });
    const cancel = document.createElement('button');
    cancel.textContent = '↩️ Назад';
    cancel.addEventListener('click', function() {
        moveSelectionMode = false;
        showActions();
        moveList.style.display = 'none';
    });
    moveList.appendChild(cancel);
}

function enemyTurn() {
    // Заглушка
}

function performMove(index) {
    // Не используется
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
        addMessage('🌿 Ваш покемон восстановил часть HP.');
    }
    updateHpBars();
    document.getElementById('btn-fight').textContent = '🌲 Исследовать';
    document.getElementById('btn-fight').disabled = false;
    document.getElementById('btn-fight').onclick = function() {
        if (inBattle) return;
        const wild = generateWildPokemon();
        startBattle(wild);
        document.getElementById('btn-fight').textContent = '⚔️ Бой';
    };
    document.getElementById('btn-bag').disabled = false;
    document.getElementById('btn-switch').disabled = false;
    document.getElementById('btn-run').disabled = false;
    document.getElementById('btn-bag').onclick = function() {
        addMessage('🧪 Использовано зелье');
        const p = getCurrentPokemon();
        if (p) {
            p.currentHp = Math.min(p.currentHp + 20, p.maxHp);
            updateHpBars();
        }
    };
    document.getElementById('btn-switch').onclick = function() {
        addMessage('🔄 Смена покемона');
        for (let i = 0; i < myParty.length; i++) {
            if (i !== currentPokemonIndex && myParty[i].currentHp > 0) {
                currentPokemonIndex = i;
                addMessage('🔄 Вы вывели ' + getCurrentPokemon().name + '!');
                updateHpBars();
                return;
            }
        }
        addMessage('❌ Нет доступных покемонов!');
    };
    document.getElementById('btn-run').onclick = function() {
        if (Math.random() < 0.5) {
            addMessage('🏃 Вы сбежали!');
            enemyPokemon = null;
            inBattle = false;
            showActions();
            document.getElementById('btn-fight').textContent = '🌲 Исследовать';
        } else {
            addMessage('⚠️ Не удалось сбежать!');
        }
    };
}

function healParty() {
    myParty.forEach(p => p.currentHp = p.maxHp);
}

function useBag() {
    // Заглушка
}

console.log('✅ Минимальный battle.js загружен');
function getPokemonImage(id) { return "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/" + id + ".png"; }
