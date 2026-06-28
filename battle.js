// =======================================================================
// БОЕВЫЕ ФУНКЦИИ (полная рабочая версия с изображениями и инвентарём)
// =======================================================================

function getPokemonImage(id) {
    return "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/" + id + ".png";
}

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
            // временный упрощённый бой
            addMessage('🍕 Нажата кнопка атаки ' + move.name);
            const dmg = 10;
            enemyPokemon.currentHp = Math.max(0, enemyPokemon.currentHp - dmg);
            addMessage('💥 ' + p.name + ' нанёс ' + dmg + ' урона!');
            updateHpBars();
            if (enemyPokemon.currentHp <= 0) {
                addMessage('🎉 ' + enemyPokemon.name + ' повержен!');
                endBattle();
                return;
            }
            const enemyDmg = 5;
            p.currentHp = Math.max(0, p.currentHp - enemyDmg);
            addMessage('💢 ' + enemyPokemon.name + ' нанёс ' + enemyDmg + ' урона!');
            updateHpBars();
            if (p.currentHp <= 0) {
                addMessage('💔 ' + p.name + ' потерял сознание!');
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
    // заглушка
}

function updateHpBars() {
    if (!myParty.length) return;
    const p = getCurrentPokemon();
    if (p) {
        const pNameEl = document.getElementById('p-name');
        pNameEl.innerHTML = `<img class="pokemon-img" src="${getPokemonImage(p.speciesId)}" alt="${p.name}"> ${p.name}`;
        addMessage("🔍 URL игрока: " + getPokemonImage(p.speciesId));
        document.getElementById('p-level').textContent = p.level;
        const hpPercent = Math.max(0, (p.currentHp / p.maxHp) * 100);
        document.getElementById('p-hp-bar').style.width = hpPercent + '%';
        document.getElementById('p-hp-bar').className = 'hp' + (hpPercent < 25 ? ' low' : '');
        document.getElementById('p-hp-text').textContent = p.currentHp + '/' + p.maxHp;
    }
    if (enemyPokemon) {
        const eNameEl = document.getElementById('e-name');
        eNameEl.innerHTML = `<img class="pokemon-img" src="${getPokemonImage(enemyPokemon.speciesId)}" alt="${enemyPokemon.name}"> ${enemyPokemon.name}`;
        addMessage("🔍 URL врага: " + getPokemonImage(enemyPokemon.speciesId));
        document.getElementById('e-level').textContent = enemyPokemon.level;
        const hpPercent = Math.max(0, (enemyPokemon.currentHp / enemyPokemon.maxHp) * 100);
        document.getElementById('e-hp-bar').style.width = hpPercent + '%';
        document.getElementById('e-hp-bar').className = 'hp' + (hpPercent < 25 ? ' low' : '');
        document.getElementById('e-hp-text').textContent = enemyPokemon.currentHp + '/' + enemyPokemon.maxHp;
    } else {
        document.getElementById('e-name').innerHTML = '—';
        document.getElementById('e-hp-bar').style.width = '0%';
        document.getElementById('e-hp-text').textContent = '0/0';
    }
    document.getElementById('party-count').textContent = myParty.length;
    document.getElementById('money').textContent = money;
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
    document.getElementById('btn-bag').onclick = openInventory;
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
            // Возврат на карту
            document.getElementById('battle-screen').style.display = 'none';
            document.getElementById('hp-bars').style.display = 'none';
            document.getElementById('actions').style.display = 'none';
            document.getElementById('info-panel').style.display = 'none';
            if (window._canvas) window._canvas.style.display = 'block';
            if (document.getElementById('controls')) document.getElementById('controls').style.display = 'grid';
        } else {
            addMessage('⚠️ Не удалось сбежать!');
        }
    };
    // Возврат на карту после боя
    document.getElementById('battle-screen').style.display = 'none';
    document.getElementById('hp-bars').style.display = 'none';
    document.getElementById('actions').style.display = 'none';
    document.getElementById('info-panel').style.display = 'none';
    if (window._canvas) window._canvas.style.display = 'block';
    if (document.getElementById('controls')) document.getElementById('controls').style.display = 'grid';
}

function healParty() {
    myParty.forEach(p => p.currentHp = p.maxHp);
}

// =======================================================================
// ИНВЕНТАРЬ
// =======================================================================
function openInventory() {
    if (!inBattle) {
        addMessage('❌ Инвентарь доступен только в бою');
        return;
    }
    const modal = document.getElementById('inventory-modal');
    const itemsContainer = document.getElementById('inventory-items');
    if (!modal || !itemsContainer) {
        addMessage('❌ Интерфейс инвентаря не найден');
        return;
    }
    const items = gameState.items || {};
    const potions = items.potion || 0;
    const pokeballs = items.pokeball || 0;
    let html = '';
    html += '<div class="item-row">Зелье (' + potions + ' шт.)';
    if (potions > 0) html += ' <button onclick="usePotion()">Использовать</button>';
    else html += ' <span style="color:#888;">нет</span>';
    html += '</div>';
    html += '<div class="item-row">Покебол (' + pokeballs + ' шт.)';
    if (pokeballs > 0 && enemyPokemon) html += ' <button onclick="usePokeball()">Использовать</button>';
    else html += ' <span style="color:#888;">' + (enemyPokemon ? 'нет' : ' (нет врага)') + '</span>';
    html += '</div>';
    itemsContainer.innerHTML = html;
    modal.style.display = 'flex';
}

window.usePotion = function() {
    const p = getCurrentPokemon();
    if (!p) { addMessage('❌ Нет покемона'); return; }
    if (gameState.items.potion <= 0) { addMessage('❌ Нет зелий!'); return; }
    const heal = 20;
    p.currentHp = Math.min(p.currentHp + heal, p.maxHp);
    gameState.items.potion--;
    addMessage('🧪 Вы использовали Зелье, восстановили ' + heal + ' HP. (Осталось ' + gameState.items.potion + ')');
    updateHpBars();
    saveGame();
    document.getElementById('inventory-modal').style.display = 'none';
};

window.usePokeball = function() {
    if (!enemyPokemon) { addMessage('❌ Нет дикого покемона!'); return; }
    if (gameState.items.pokeball <= 0) { addMessage('❌ Нет покеболов!'); return; }
    const chance = Math.min(0.3 + (enemyPokemon.level / 100), 0.9);
    if (Math.random() < chance) {
        addMessage('🎉 Вы поймали ' + enemyPokemon.name + '!');
        myParty.push(enemyPokemon);
        enemyPokemon = null;
        inBattle = false;
        document.getElementById('inventory-modal').style.display = 'none';
        endBattle();
    } else {
        addMessage('😞 Покебол не сработал! ' + enemyPokemon.name + ' сбежал!');
        enemyPokemon = null;
        inBattle = false;
        document.getElementById('inventory-modal').style.display = 'none';
        endBattle();
    }
    gameState.items.pokeball--;
    saveGame();
};

document.addEventListener('DOMContentLoaded', function() {
    const closeBtn = document.getElementById('inv-close');
    if (closeBtn) closeBtn.addEventListener('click', function() {
        document.getElementById('inventory-modal').style.display = 'none';
    });
});

console.log('✅ battle.js загружен (полная версия)');
