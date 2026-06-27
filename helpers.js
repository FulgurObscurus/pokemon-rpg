// =======================================================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// =======================================================================
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function addMessage(msg) {
    gameLog.push(msg);
    if (gameLog.length > 20) gameLog.shift();
    const screen = document.getElementById('battle-screen');
    screen.textContent = gameLog.join('\n');
    screen.scrollTop = screen.scrollHeight;
}

function updateHpBars() {
    if (!myParty.length) return;
    const p = getCurrentPokemon();
    if (p) {
        document.getElementById('p-name').textContent = p.name;
        document.getElementById('p-level').textContent = p.level;
        const hpPercent = Math.max(0, (p.currentHp / p.maxHp) * 100);
        document.getElementById('p-hp-bar').style.width = hpPercent + '%';
        document.getElementById('p-hp-bar').className = 'hp' + (hpPercent < 25 ? ' low' : '');
        document.getElementById('p-hp-text').textContent = `${p.currentHp}/${p.maxHp}`;
    }
    if (enemyPokemon) {
        document.getElementById('e-name').textContent = enemyPokemon.name;
        document.getElementById('e-level').textContent = enemyPokemon.level;
        const hpPercent = Math.max(0, (enemyPokemon.currentHp / enemyPokemon.maxHp) * 100);
        document.getElementById('e-hp-bar').style.width = hpPercent + '%';
        document.getElementById('e-hp-bar').className = 'hp' + (hpPercent < 25 ? ' low' : '');
        document.getElementById('e-hp-text').textContent = `${enemyPokemon.currentHp}/${enemyPokemon.maxHp}`;
    } else {
        document.getElementById('e-name').textContent = '—';
        document.getElementById('e-hp-bar').style.width = '0%';
        document.getElementById('e-hp-text').textContent = '0/0';
    }
    document.getElementById('party-count').textContent = myParty.length;
    document.getElementById('money').textContent = money;
}

function getCurrentPokemon() {
    return myParty[currentPokemonIndex] || null;
}