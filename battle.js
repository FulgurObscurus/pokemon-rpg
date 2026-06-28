// =======================================================================
// БОЕВАЯ СИСТЕМА
// =======================================================================

let inBattle = false;
let currentEnemy = null;
let battleMoves = [];

function startBattle(enemy) {
    inBattle = true;
    currentEnemy = enemy;
    
    const player = myParty[currentPokemonIndex];
    
    // Показываем HP
    updateHpBars();
    
    // Генерируем атаки для кнопки "Бой"
    generateBattleMoves(player);
    
    // Показываем сообщение о появлении
    const enemyName = enemy.getName();
    const enemyLevel = enemy.level;
    addMessage(`⚔️ Дикий ${enemyName} (ур. ${enemyLevel}) появился!`);
    
    // Включаем кнопки
    document.getElementById('btn-fight').disabled = false;
    document.getElementById('btn-bag').disabled = false;
    document.getElementById('btn-switch').disabled = false;
    document.getElementById('btn-run').disabled = false;
}

function generateBattleMoves(pokemon) {
    battleMoves = pokemon.moves.slice(0, 4);
    
    // Создаём обработчик для кнопки "Бой"
    const btnFight = document.getElementById('btn-fight');
    btnFight.onclick = function() {
        showMoveSelection();
    };
}

function showMoveSelection() {
    const actionsDiv = document.getElementById('actions');
    const originalButtons = actionsDiv.innerHTML;
    
    // Показываем атаки вместо кнопок действий
    let movesHTML = '';
    battleMoves.forEach((move, index) => {
        movesHTML += `<button onclick="useMove(${index})">${move.name}</button>`;
    });
    movesHTML += `<button onclick="cancelMoveSelection()">← Назад</button>`;
    
    actionsDiv.innerHTML = movesHTML;
}

function cancelMoveSelection() {
    // Возвращаем оригинальные кнопки
    document.getElementById('btn-fight').textContent = '⚔️ Бой';
    document.getElementById('btn-fight').disabled = false;
    document.getElementById('btn-bag').disabled = false;
    document.getElementById('btn-switch').disabled = false;
    document.getElementById('btn-run').disabled = false;
    
    // Восстанавливаем обработчики
    const btnFight = document.getElementById('btn-fight');
    btnFight.onclick = function() {
        showMoveSelection();
    };
}

function useMove(moveIndex) {
    const player = myParty[currentPokemonIndex];
    const move = battleMoves[moveIndex];
    
    // Ход игрока
    const damage = calculateDamage(player, currentEnemy, move);
    currentEnemy.hp -= damage;
    addMessage(`${player.getName()} использует ${move.name}! Нанесено ${damage} урона.`);
    
    if (currentEnemy.hp <= 0) {
        currentEnemy.hp = 0;
        updateHpBars();
        winBattle();
        return;
    }
    
    updateHpBars();
    
    // Ход противника
    setTimeout(() => {
        enemyTurn();
    }, 1000);
}

function enemyTurn() {
    if (!inBattle || !currentEnemy) return;
    
    const enemyMove = currentEnemy.moves[Math.floor(Math.random() * currentEnemy.moves.length)];
    const player = myParty[currentPokemonIndex];
    
    const damage = calculateDamage(currentEnemy, player, enemyMove);
    player.hp -= damage;
    addMessage(`Дикий ${currentEnemy.getName()} использует ${enemyMove.name}! Нанесено ${damage} урона.`);
    
    if (player.hp <= 0) {
        player.hp = 0;
        updateHpBars();
        loseBattle();
        return;
    }
    
    updateHpBars();
}

function calculateDamage(attacker, defender, move) {
    const level = attacker.level;
    const attack = attacker.stats.attack;
    const defense = defender.stats.defense;
    const power = move.power || 40;
    
    // Упрощённая формула урона
    let damage = Math.floor(((2 * level / 5 + 2) * power * attack / defense) / 50) + 2;
    
    // Типовая эффективность
    const effectiveness = getTypeEffectiveness(move.type, defender.type);
    damage *= effectiveness;
    
    // Случайный множитель (0.85 - 1.0)
    damage *= (Math.floor(Math.random() * 16) + 85) / 100;
    
    return Math.floor(damage);
}

function winBattle() {
    addMessage(`🎉 Победа! Дикий ${currentEnemy.getName()} повержен!`);
    
    // Награда
    const expGain = Math.floor(currentEnemy.level * 2.5);
    const moneyGain = Math.floor(Math.random() * 20) + 10;
    
    myParty[currentPokemonIndex].exp += expGain;
    gameState.money += moneyGain;
    
    addMessage(`+${expGain} опыта, +${moneyGain} монет!`);
    
    // Проверяем эволюцию
    checkEvolution(myParty[currentPokemonIndex]);
    
    // Возвращаем на карту
    setTimeout(() => {
        endBattle();
    }, 2000);
}

function loseBattle() {
    addMessage(`💀 ${myParty[currentPokemonIndex].getName()} потерял сознание!`);
    addMessage('Вы потеряли немного денег...');
    
    gameState.money = Math.floor(gameState.money / 2);
    
    setTimeout(() => {
        endBattle();
    }, 2000);
}

function endBattle() {
    inBattle = false;
    currentEnemy = null;
    battleMoves = [];
    
    // Показываем карту
    canvas.style.display = 'block';
    document.getElementById('controls').style.display = 'grid';
    document.getElementById('battle-screen').style.display = 'none';
    document.getElementById('hp-bars').style.display = 'none';
    document.getElementById('actions').style.display = 'none';
    
    // Возвращаем кнопки
    const btnFight = document.getElementById('btn-fight');
    btnFight.textContent = '🌲 Исследовать';
    btnFight.disabled = false;
    document.getElementById('btn-bag').disabled = true;
    document.getElementById('btn-switch').disabled = true;
    document.getElementById('btn-run').disabled = true;
    
    // Обновляем интерфейс
    updateInfoPanel();
    
    // Сохраняем
    saveGame();
}

function checkEvolution(pokemon) {
    // Простая проверка эволюции
    if (pokemon.evolution && pokemon.level >= pokemon.evolution.level) {
        addMessage(` ${pokemon.getName()} эволюционирует в ${pokemon.evolution.name}!`);
        // Здесь можно добавить логику эволюции
    }
}
