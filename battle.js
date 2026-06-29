// =======================================================================
// БОЕВЫЕ ФУНКЦИИ
// =======================================================================

function switchPokemon() {
    if (!inBattle) return;
    if (!myParty || myParty.length <= 1) {
        addMessage('❌ Нет других покемонов для смены!');
        return;
    }

    // Показываем список покемонов для смены
    const moveList = document.getElementById('move-list');
    const actions = document.getElementById('actions');
    if (actions) actions.style.display = 'none';
    if (moveList) {
        moveList.style.display = 'grid';
        moveList.innerHTML = '';

        const header = document.createElement('div');
        header.style.cssText = 'grid-column:1/-1;text-align:center;color:#f1c40f;font-weight:bold;padding:8px;';
        header.textContent = '🔄 Сменить покемона:';
        moveList.appendChild(header);

        for (let i = 0; i < myParty.length; i++) {
            const p = myParty[i];
            if (i === currentPokemonIndex) continue;
            if (p.currentHp <= 0) continue;

            const btn = document.createElement('button');
            btn.style.cssText = 'display:flex;align-items:center;gap:8px;padding:10px;background:#2c1a3d;border:2px solid #7b4a9e;border-radius:8px;color:#fff;cursor:pointer;';

            const sprite = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/" + p.speciesId + ".png";
            btn.innerHTML = '<img src="' + sprite + '" style="width:40px;height:40px;image-rendering:pixelated;"><span>' + p.name + ' Ур.' + p.level + ' HP:' + p.currentHp + '/' + p.maxHp + '</span>';

            const idx = i;
            btn.onclick = function() {
                currentPokemonIndex = idx;
                addMessage('🔄 ' + myParty[idx].name + ' выходит на бой!');
                moveList.style.display = 'none';
                moveList.innerHTML = '';
                showActions();
                updateHpBars();

                // Враг атакует после смены
                setTimeout(function() {
                    if (inBattle && enemyPokemon) {
                        var curP = myParty[currentPokemonIndex];
                        var enemyDmg = 5;
                        curP.currentHp = Math.max(0, curP.currentHp - enemyDmg);
                        addMessage(enemyPokemon.name + ' нанёс ' + enemyDmg + ' урона!');
                        updateHpBars();
                        if (curP.currentHp <= 0) {
                            addMessage(curP.name + ' потерял сознание!');
                            endBattle();
                        }
                    }
                }, 500);
            };

            moveList.appendChild(btn);
        }

        // Кнопка отмены
        const cancelBtn = document.createElement('button');
        cancelBtn.style.cssText = 'grid-column:1/-1;padding:10px;background:#c0392b;border:none;color:#fff;border-radius:8px;cursor:pointer;font-size:14px;';
        cancelBtn.textContent = '✕ Отмена';
        cancelBtn.onclick = function() {
            moveList.style.display = 'none';
            moveList.innerHTML = '';
            showActions();
        };
        moveList.appendChild(cancelBtn);
    }
}
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

function toggleMoveDescription(container, arrowBtn, descriptionText) {
    const existing = container.querySelector('.move-description');
    if (existing) {
        existing.remove();
        arrowBtn.textContent = '▾';
        return;
    }

    const desc = document.createElement('div');
    desc.className = 'move-description';
    desc.textContent = descriptionText || 'Описание отсутствует.';
    container.appendChild(desc);
    arrowBtn.textContent = '▴';
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
        const item = document.createElement('div');
        item.className = 'move-item';

        const row = document.createElement('div');
        row.className = 'move-row';

        const btn = document.createElement('button');
        btn.className = 'move-main-button';
        btn.textContent = move.name + ' (PP: ' + move.pp + '/' + move.max_pp + ')';
        if (move.pp <= 0) btn.disabled = true;

        btn.addEventListener('click', function() {
            const dmg = 10;
            enemyPokemon.currentHp = Math.max(0, enemyPokemon.currentHp - dmg);
            addMessage('💥 ' + p.name + ' использовал ' + move.name + ' и нанёс ' + dmg + ' урона!');
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

        const infoBtn = document.createElement('button');
        infoBtn.className = 'move-toggle-button';
        infoBtn.textContent = '▾';
        infoBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleMoveDescription(item, infoBtn, move.description);
        });

        row.appendChild(btn);
        row.appendChild(infoBtn);
        item.appendChild(row);
        moveList.appendChild(item);
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
