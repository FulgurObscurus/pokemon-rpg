// =======================================================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// =======================================================================

function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function addMessage(msg) {
    gameLog.push(msg);
    if (gameLog.length > 20) gameLog.shift();

    const screen = document.getElementById('battle-screen');
    if (screen) {
        screen.textContent = gameLog.join('\n');
        screen.scrollTop = screen.scrollHeight;
    }
}

function getCurrentPokemon() {
    return myParty[currentPokemonIndex] || null;
}

function updateHpBars() {
    if (!myParty || !myParty.length) return;

    const p = getCurrentPokemon();
    if (p) {
        const pName = document.getElementById('p-name');
        const pLevel = document.getElementById('p-level');
        const pHpBar = document.getElementById('p-hp-bar');
        const pHpText = document.getElementById('p-hp-text');

        if (pName) pName.textContent = p.name;
        if (pLevel) pLevel.textContent = p.level;

        const hpPercent = Math.max(0, (p.currentHp / p.maxHp) * 100);
        if (pHpBar) {
            pHpBar.style.width = hpPercent + '%';
            pHpBar.className = 'hp' + (hpPercent < 25 ? ' low' : '');
        }
        if (pHpText) pHpText.textContent = `${p.currentHp}/${p.maxHp}`;
    }

    if (enemyPokemon) {
        const eName = document.getElementById('e-name');
        const eLevel = document.getElementById('e-level');
        const eHpBar = document.getElementById('e-hp-bar');
        const eHpText = document.getElementById('e-hp-text');

        if (eName) eName.textContent = enemyPokemon.name;
        if (eLevel) eLevel.textContent = enemyPokemon.level;

        const hpPercent = Math.max(0, (enemyPokemon.currentHp / enemyPokemon.maxHp) * 100);
        if (eHpBar) {
            eHpBar.style.width = hpPercent + '%';
            eHpBar.className = 'hp' + (hpPercent < 25 ? ' low' : '');
        }
        if (eHpText) eHpText.textContent = `${enemyPokemon.currentHp}/${enemyPokemon.maxHp}`;
    } else {
        const eName = document.getElementById('e-name');
        const eLevel = document.getElementById('e-level');
        const eHpBar = document.getElementById('e-hp-bar');
        const eHpText = document.getElementById('e-hp-text');

        if (eName) eName.textContent = '—';
        if (eLevel) eLevel.textContent = '0';
        if (eHpBar) eHpBar.style.width = '0%';
        if (eHpText) eHpText.textContent = '0/0';
    }

    const partyCount = document.getElementById('party-count');
    const moneyEl = document.getElementById('money');

    if (partyCount) partyCount.textContent = myParty.length;
    if (moneyEl) moneyEl.textContent = gameState.money;
    if (!myParty || myParty.length === 0 || !myParty[currentPokemonIndex]) return;
    const p = myParty[currentPokemonIndex];
    if (!p) return;
}
