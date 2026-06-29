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
                checkForSwitchOrEndBattle();
                return;
            }

            moveList.style.display = 'none';
            showActions();
            moveSelectionMode = false;
        });

        item.appendChild(row);
        row.appendChild(btn);

        if (move.description) {
            const desc = document.createElement('div');
            desc.className = 'move-description';
            desc.textContent = move.description;
            item.appendChild(desc);
        }

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

function checkForSwitchOrEndBattle() {
    var alivePokemon = myParty.filter(function(p) { return p.currentHp > 0; });
    
    if (alivePokemon.length === 0) {
        addMessage('😢 Все ваши покемоны потеряли сознание!');
        endBattle();
    } else {
        addMessage('🔄 Выберите следующего покемона!');
        forceSwitchPokemon();
    }
}

function forceSwitchPokemon() {
    if (!inBattle) return;

    const moveList = document.getElementById('move-list');
    const actions = document.getElementById('actions');
    if (actions) actions.style.display = 'none';
    if (moveList) {
        moveList.style.display = 'grid';
        moveList.innerHTML = '';

        const header = document.createElement('div');
        header.style.cssText = 'grid-column:1/-1;text-align:center;color:#f1c40f;font-weight:bold;padding:8px;';
        header.textContent = '🔄 Выберите покемона для боя:';
        moveList.appendChild(header);

        for (let i = 0; i < myParty.length; i++) {
            const p = myParty[i];
            if (i === currentPokemonIndex) continue;
            if (p.currentHp <= 0) continue;

            const btn = document.createElement('button');
            btn.style.cssText = 'display:flex;align-items:center;gap:8px;padding:10px;background:#2c1a3d;border:2px solid #7b4a9e;border-radius:8px;color:#fff;cursor:pointer;';

            const sprite = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/" + p.speciesId + ".png";
            btn.innerHTML = '<img src="' + sprite + '" style="width:40px;height:40px;">' + p.name + ' Ур.' + p.level + ' HP:' + p.currentHp + '/' + p.maxHp + '';

            const idx = i;
            btn.onclick = function() {
                currentPokemonIndex = idx;
                addMessage('🔄 ' + myParty[idx].name + ' выходит на бой!');
                moveList.style.display = 'none';
                moveList.innerHTML = '';
                showActions();
                updateHpBars();
                moveSelectionMode = false;
            };

            moveList.appendChild(btn);
        }
    }
}

function switchPokemon() {
    if (!inBattle) return;
    if (!myParty || myParty.length <= 1) {
        addMessage('❌ Нет других покемонов для смены!');
        return;
    }

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
            btn.innerHTML = '<img src="' + sprite + '" style="width:40px;height:40px;">' + p.name + ' Ур.' + p.level + ' HP:' + p.currentHp + '/' + p.maxHp + '';

            const idx = i;
            btn.onclick = function() {
                currentPokemonIndex = idx;
                addMessage('🔄 ' + myParty[idx].name + ' выходит на бой!');
                moveList.style.display = 'none';
                moveList.innerHTML = '';
                showActions();
                updateHpBars();

                setTimeout(function() {
                    if (inBattle && enemyPokemon) {
                        var curP = myParty[currentPokemonIndex];
                        var enemyDmg = 5;
                        curP.currentHp = Math.max(0, curP.currentHp - enemyDmg);
                        addMessage(enemyPokemon.name + ' нанёс ' + enemyDmg + ' урона!');
                        updateHpBars();
                        if (curP.currentHp <= 0) {
                            addMessage(curP.name + ' потерял сознание!');
                            checkForSwitchOrEndBattle();
                        }
                    }
                }, 500);
            };

            moveList.appendChild(btn);
        }

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

// ИСПРАВЛЕНИЕ: Добавлена функция openInventory
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
    html += '<div style="padding:8px;border-bottom:1px solid #7b4a9e;">';
    html += '<strong>Зелье (' + potions + ' шт.)</strong>';
    if (potions > 0) html += ' <button onclick="usePotion()">Использовать</button>';
    else html += ' <span style="color:#999;">нет</span>';
    html += '</div>';
    html += '<div style="padding:8px;">';
    html += '<strong>Покебол (' + pokeballs + ' шт.)</strong>';
    if (pokeballs > 0 && enemyPokemon) html += ' <button onclick="usePokeball()">Использовать</button>';
    else html += ' <span style="color:#999;">' + (enemyPokemon ? 'нет' : '(нет врага)') + '</span>';
    html += '</div>';
    itemsContainer.innerHTML = html;
    modal.style.display = 'flex';
}

window.usePotion = function() {
    const p = getCurrentPokemon();
    if (!p) {
        addMessage('❌ Нет покемона');
        return;
    }
    if (gameState.items.potion <= 0) {
        addMessage('❌ Нет зелий!');
        return;
    }
    const heal = 20;
    p.currentHp = Math.min(p.currentHp + heal, p.maxHp);
    gameState.items.potion--;
    addMessage('🧪 Вы использовали Зелье, восстановили ' + heal + ' HP. (Осталось ' + gameState.items.potion + ')');
    updateHpBars();
    saveGame();
    document.getElementById('inventory-modal').style.display = 'none';
};

window.usePokeball = function() {
    if (!enemyPokemon) {
        addMessage('❌ Нет дикого покемона!');
        return;
    }
    if (gameState.items.pokeball <= 0) {
        addMessage('❌ Нет покеболов!');
        return;
    }
    gameState.items.pokeball--;
    const chance = Math.min(0.3 + (enemyPokemon.level / 100), 0.9);
    if (Math.random() < chance) {
        addMessage('🎉 Вы поймали ' + enemyPokemon.name + '!');
        myParty.push(enemyPokemon);
        saveGame();
        document.getElementById('inventory-modal').style.display = 'none';
        endBattle();
    } else {
        addMessage('😞 Покебол не сработал! ' + enemyPokemon.name + ' сбежал!');
        saveGame();
        document.getElementById('inventory-modal').style.display = 'none';
        endBattle();
    }
};

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
