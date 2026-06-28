// =======================================================================
// БОЕВЫЕ ФУНКЦИИ
// =======================================================================

function getPokemonImage(id) {
    return "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/" + String(id) + ".png";
}

function updateHpBars() {
    if (!myParty || !myParty.length) return;

    const p = getCurrentPokemon();
    if (p) {
        const pNameEl = document.getElementById('p-name');
        if (pNameEl) {
            pNameEl.innerHTML = '<img class="pokemon-img" src="' + getPokemonImage(p.speciesId) + '" alt="' + p.name + '"> ' + p.name;
        }

        const pLevelEl = document.getElementById('p-level');
        if (pLevelEl) pLevelEl.textContent = p.level;

        const pHpPercent = Math.max(0, (p.currentHp / p.maxHp) * 100);
        const pHpBar = document.getElementById('p-hp-bar');
        if (pHpBar) {
            pHpBar.style.width = pHpPercent + '%';
            pHpBar.className = 'hp' + (pHpPercent < 25 ? ' low' : '');
        }

        const pHpText = document.getElementById('p-hp-text');
        if (pHpText) pHpText.textContent = p.currentHp + '/' + p.maxHp;
    }

    if (enemyPokemon) {
        const eNameEl = document.getElementById('e-name');
        if (eNameEl) {
            eNameEl.innerHTML = '<img class="pokemon-img" src="' + getPokemonImage(enemyPokemon.speciesId) + '" alt="' + enemyPokemon.name + '"> ' + enemyPokemon.name;
        }

        const eLevelEl = document.getElementById('e-level');
        if (eLevelEl) eLevelEl.textContent = enemyPokemon.level;

        const eHpPercent = Math.max(0, (enemyPokemon.currentHp / enemyPokemon.maxHp) * 100);
        const eHpBar = document.getElementById('e-hp-bar');
        if (eHpBar) {
            eHpBar.style.width = eHpPercent + '%';
            eHpBar.className = 'hp' + (eHpPercent < 25 ? ' low' : '');
        }

        const eHpText = document.getElementById('e-hp-text');
        if (eHpText) eHpText.textContent = enemyPokemon.currentHp + '/' + enemyPokemon.maxHp;
    } else {
        const eNameEl = document.getElementById('e-name');
        if (eNameEl) eNameEl.innerHTML = '—';

        const eLevelEl = document.getElementById('e-level');
        if (eLevelEl) eLevelEl.textContent = '0';

        const eHpBar = document.getElementById('e-hp-bar');
        if (eHpBar) eHpBar.style.width = '0%';

        const eHpText = document.getElementById('e-hp-text');
        if (eHpText) eHpText.textContent = '0/0';
    }

    const partyCountEl = document.getElementById('party-count');
    if (partyCountEl) partyCountEl.textContent = myParty.length;

    const moneyEl = document.getElementById('money');
    if (moneyEl) moneyEl.textContent = gameState.money;
}

function generateWildPokemon() {
    const ids = Object.keys(allPokemonData || {});
    if (!ids.length) return null;

    const id = parseInt(ids[rand(0, ids.length - 1)], 10);
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
    const moveList = document.getElementById('move-list');
    const actions = document.getElementById('actions');

    if (moveList) moveList.style.display = 'none';
    if (actions) actions.style.display = 'grid';

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

    p.moves.forEach((move) => {
        const btn = document.createElement('button');
        btn.textContent = move.name + ' (PP: ' + move.pp + '/' + move.max_pp + ')';
        if (move.pp <= 0) btn.disabled = true;

        btn.addEventListener('click', function() {
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
                endBattle();
                return;
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
        moveList.style.display = 'none';
        showActions();
    });
    moveList.appendChild(cancel);
}

function endBattle() {
    enemyPokemon = null;
    inBattle = false;
    moveSelectionMode = false;

    const moveList = document.getElementById('move-list');
    const btnFight = document.getElementById('btn-fight');
    const btnBag = document.getElementById('btn-bag');
    const btnSwitch = document.getElementById('btn-switch');
    const btnRun = document.getElementById('btn-run');

    if (moveList) {
        moveList.style.display = 'none';
        moveList.innerHTML = '';
    }

    if (btnFight) {
        btnFight.textContent = '🌲 Исследовать';
        btnFight.disabled = false;
    }
    if (btnBag) btnBag.disabled = true;
    if (btnSwitch) btnSwitch.disabled = true;
    if (btnRun) btnRun.disabled = true;

    if (window.showMapScreen) window.showMapScreen();
    updateHpBars();
}

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
    if (!p) return;
    if (gameState.items.potion <= 0) return;

    const heal = 20;
    p.currentHp = Math.min(p.currentHp + heal, p.maxHp);
    gameState.items.potion--;
    addMessage('🧪 Вы использовали Зелье');
    updateHpBars();
    saveGame();
    document.getElementById('inventory-modal').style.display = 'none';
};

window.usePokeball = function() {
    if (!enemyPokemon) return;
    if (gameState.items.pokeball <= 0) return;

    gameState.items.pokeball--;

    if (Math.random() < 0.5) {
        addMessage('🎉 Вы поймали ' + enemyPokemon.name + '!');
        myParty.push(enemyPokemon);
    } else {
        addMessage('😞 Покебол не сработал!');
    }

    saveGame();
    document.getElementById('inventory-modal').style.display = 'none';
    endBattle();
};

document.addEventListener('DOMContentLoaded', function() {
    const closeBtn = document.getElementById('inv-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            document.getElementById('inventory-modal').style.display = 'none';
        });
    }

    const btnRun = document.getElementById('btn-run');
    if (btnRun) {
        btnRun.onclick = function() {
            addMessage('🏃 Вы сбежали!');
            endBattle();
        };
    }
});
