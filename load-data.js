// =======================================================================
// ЗАГРУЗКА ДАННЫХ ИЗ ВСТРОЕННОГО ФАЙЛА pokedex.js
// =======================================================================

function loadAllPokemon() {
    document.getElementById('loading').textContent = '⏳ Шаг 1: функция loadAllPokemon вызвана...';
    console.log('loadAllPokemon вызвана');

    document.getElementById('loading').textContent = '⏳ Шаг 2: проверка ALL_POKEMON_DATA...';
    if (typeof ALL_POKEMON_DATA === 'undefined') {
        document.getElementById('loading').textContent = '❌ Ошибка: файл pokedex.js не загружен!';
        console.error('ALL_POKEMON_DATA не определён');
        return;
    }

    document.getElementById('loading').textContent = '⏳ Шаг 3: копирование данных...';
    allPokemonData = ALL_POKEMON_DATA;
    const count = Object.keys(allPokemonData).length;
    document.getElementById('loading').textContent = `✅ Шаг 4: загружено ${count} покемонов!`;
    console.log(`Загружено ${count} покемонов`);

    try {
        localStorage.setItem('pokemonData151', JSON.stringify(allPokemonData));
        document.getElementById('loading').textContent = `✅ Шаг 5: данные сохранены в кэш (${count} покемонов)`;
    } catch(e) {
        console.warn('Не удалось сохранить в localStorage:', e);
        document.getElementById('loading').textContent = '⚠️ Шаг 5: кэш не сохранён, но данные загружены';
    }
    document.getElementById('loading').textContent = `✅ Готово! (${count} покемонов)`;
}

// Заглушки для старых функций
function fetchWithTimeout() { console.warn('fetchWithTimeout не используется'); }
function getRussianName() { console.warn('getRussianName не используется'); }
function getMoveData() { console.warn('getMoveData не используется'); }
function getMoveData(name) {
    const moveDb = {
        "tackle": { name: "Удар", type: "normal", power: 40, accuracy: 100, category: "physical", max_pp: 35 },
        "vine-whip": { name: "Семенной луч", type: "grass", power: 25, accuracy: 100, category: "physical", max_pp: 30 },
        "growl": { name: "Рык", type: "normal", power: 0, accuracy: 100, category: "status", max_pp: 40 },
        "ember": { name: "Огненный клык", type: "fire", power: 40, accuracy: 100, category: "special", max_pp: 25 },
        "water-gun": { name: "Водяной пистолет", type: "water", power: 40, accuracy: 100, category: "special", max_pp: 25 },
        "thunder-shock": { name: "Искра", type: "electric", power: 40, accuracy: 100, category: "special", max_pp: 30 },
        "scratch": { name: "Царапина", type: "normal", power: 40, accuracy: 100, category: "physical", max_pp: 35 },
        "leer": { name: "Взгляд", type: "normal", power: 0, accuracy: 100, category: "status", max_pp: 30 },
        "bite": { name: "Укус", type: "dark", power: 60, accuracy: 100, category: "physical", max_pp: 25 },
        "quick-attack": { name: "Быстрая атака", type: "normal", power: 40, accuracy: 100, category: "physical", max_pp: 30 },
        "razor-leaf": { name: "Острый лист", type: "grass", power: 55, accuracy: 95, category: "physical", max_pp: 25 },
        "flame-wheel": { name: "Огненное колесо", type: "fire", power: 60, accuracy: 100, category: "physical", max_pp: 25 },
        "bubble": { name: "Пузырь", type: "water", power: 40, accuracy: 100, category: "special", max_pp: 30 },
        "thunderbolt": { name: "Гром", type: "electric", power: 90, accuracy: 100, category: "special", max_pp: 15 },
        "fire-blast": { name: "Огненный взрыв", type: "fire", power: 110, accuracy: 85, category: "special", max_pp: 5 },
        "hydro-pump": { name: "Гидронасос", type: "water", power: 110, accuracy: 80, category: "special", max_pp: 5 },
        "solar-beam": { name: "Солнечный луч", type: "grass", power: 120, accuracy: 100, category: "special", max_pp: 10 },
        "psychic": { name: "Психический", type: "psychic", power: 90, accuracy: 100, category: "special", max_pp: 10 },
        "shadow-ball": { name: "Теневой шар", type: "ghost", power: 80, accuracy: 100, category: "special", max_pp: 15 },
        "hyper-beam": { name: "Гиперлучь", type: "normal", power: 150, accuracy: 90, category: "special", max_pp: 5 },
        "flamethrower": { name: "Огнемёт", type: "fire", power: 90, accuracy: 100, category: "special", max_pp: 15 },
        "ice-beam": { name: "Ледяной луч", type: "ice", power: 90, accuracy: 100, category: "special", max_pp: 10 },
        "thunder": { name: "Громовой удар", type: "electric", power: 110, accuracy: 70, category: "special", max_pp: 5 },
        "earthquake": { name: "Землетрясение", type: "ground", power: 100, accuracy: 100, category: "physical", max_pp: 10 },
        "surf": { name: "Волна", type: "water", power: 90, accuracy: 100, category: "special", max_pp: 15 },
        "fly": { name: "Полёт", type: "flying", power: 90, accuracy: 95, category: "physical", max_pp: 15 },
        "dig": { name: "Копать", type: "ground", power: 80, accuracy: 100, category: "physical", max_pp: 10 },
        "strength": { name: "Сила", type: "normal", power: 80, accuracy: 100, category: "physical", max_pp: 15 },
        "cut": { name: "Разрез", type: "normal", power: 50, accuracy: 95, category: "physical", max_pp: 30 },
        "rock-smash": { name: "Крушитель", type: "fighting", power: 40, accuracy: 100, category: "physical", max_pp: 15 },
        "shadow-punch": { name: "Теневой удар", type: "ghost", power: 60, accuracy: 100, category: "physical", max_pp: 20 },
        "dragon-claw": { name: "Коготь дракона", type: "dragon", power: 80, accuracy: 100, category: "physical", max_pp: 15 },
        "dark-pulse": { name: "Тёмный импульс", type: "dark", power: 80, accuracy: 100, category: "special", max_pp: 15 },
        "dazzling-gleam": { name: "Ослепительный блеск", type: "fairy", power: 80, accuracy: 100, category: "special", max_pp: 10 },
        "moonblast": { name: "Лунный взрыв", type: "fairy", power: 95, accuracy: 100, category: "special", max_pp: 15 },
        "play-rough": { name: "Игривый удар", type: "fairy", power: 90, accuracy: 90, category: "physical", max_pp: 10 },
        "x-scissor": { name: "X-ножницы", type: "bug", power: 80, accuracy: 100, category: "physical", max_pp: 15 },
        "bug-buzz": { name: "Жужжание", type: "bug", power: 90, accuracy: 100, category: "special", max_pp: 10 },
        "poison-jab": { name: "Ядовитый удар", type: "poison", power: 80, accuracy: 100, category: "physical", max_pp: 20 },
        "sludge-bomb": { name: "Грязевой заряд", type: "poison", power: 90, accuracy: 100, category: "special", max_pp: 10 },
        "steel-wing": { name: "Стальное крыло", type: "steel", power: 70, accuracy: 90, category: "physical", max_pp: 25 },
        "iron-tail": { name: "Железный хвост", type: "steel", power: 100, accuracy: 75, category: "physical", max_pp: 15 },
        "rock-slide": { name: "Камнепад", type: "rock", power: 75, accuracy: 90, category: "physical", max_pp: 10 },
        "stone-edge": { name: "Каменный край", type: "rock", power: 100, accuracy: 80, category: "physical", max_pp: 5 },
        "slam": { name: "Шлепок", type: "normal", power: 80, accuracy: 75, category: "physical", max_pp: 20 },
        "double-kick": { name: "Двойной удар", type: "fighting", power: 30, accuracy: 100, category: "physical", max_pp: 30 },
        "tail-whip": { name: "Хвост-молния", type: "normal", power: 0, accuracy: 100, category: "status", max_pp: 30 },
    };
    const defaultMove = { name: name, type: "normal", power: 40, accuracy: 100, category: "physical", max_pp: 35 };
    return moveDb[name] || defaultMove;
}
