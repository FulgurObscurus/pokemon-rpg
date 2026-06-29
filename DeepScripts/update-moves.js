const fs = require('fs');
const https = require('https');
const { PATHS } = require('./config.js');

// =======================================================================
// Вспомогательные функции
// =======================================================================
function getJSON(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch(e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

// Кэш для приёмов, чтобы не запрашивать один и тот же приём много раз
const moveCache = {};

async function getMoveDetails(moveName) {
    if (moveCache[moveName]) return moveCache[moveName];
    try {
        const moveData = await getJSON(`https://pokeapi.co/api/v2/move/${moveName}`);
        const type = moveData.type.name;
        const power = moveData.power || 0;
        const accuracy = moveData.accuracy || 100;
        const category = moveData.damage_class.name; // "physical", "special", "status"
        const pp = moveData.pp || 20;
        const result = { type, power, accuracy, category, max_pp: pp };
        moveCache[moveName] = result;
        return result;
    } catch(e) {
        console.warn(`Не удалось загрузить приём ${moveName}: ${e.message}`);
        return null;
    }
}

async function updateMoves() {
    try {
        const pokedexPath = PATHS.GAME_DIR + '/' + PATHS.POKEDEX_FILE;
        console.log(`📂 Читаю файл: ${pokedexPath}`);
        const content = fs.readFileSync(pokedexPath, 'utf-8');
        const match = content.match(/const ALL_POKEMON_DATA = (.*?);/s);
        if (!match) {
            throw new Error('Не удалось найти ALL_POKEMON_DATA в файле');
        }
        const pokedex = JSON.parse(match[1]);
        const ids = Object.keys(pokedex);
        console.log(`📦 Всего покемонов: ${ids.length}`);

        let count = 0;
        for (const id of ids) {
            const pokemonUrl = `https://pokeapi.co/api/v2/pokemon/${id}`;
            try {
                const pokemonData = await getJSON(pokemonUrl);
                // Фильтруем только приёмы, изучаемые по уровню
                const moves = pokemonData.moves
                    .filter(m => m.version_group_details.some(v => v.move_learn_method.name === 'level-up'))
                    .map(m => {
                        const learnLevel = m.version_group_details.find(v => v.move_learn_method.name === 'level-up').level_learned_at;
                        return { name: m.move.name, learnLevel: learnLevel };
                    })
                    .sort((a, b) => a.learnLevel - b.learnLevel); // сортируем по уровню

                // Загружаем детали приёмов и форматируем
                const movesFormatted = [];
                for (const m of moves) {
                    const details = await getMoveDetails(m.name);
                    if (details) {
                        movesFormatted.push({
                            name: m.name,
                            type: details.type,
                            power: details.power,
                            accuracy: details.accuracy,
                            category: details.category,
                            max_pp: details.max_pp,
                            learnLevel: m.learnLevel
                        });
                    }
                }

                // Обновляем поле moves (берём все, либо можно ограничить первыми 20)
                pokedex[id].moves = movesFormatted.slice(0, 20); // ограничим 20 приёмами, чтобы не перегружать

                count++;
                if (count % 50 === 0) console.log(`⏳ Обработано ${count}/${ids.length}`);
            } catch(err) {
                console.warn(`❌ Ошибка для покемона #${id}: ${err.message}`);
            }
        }

        console.log(`✅ Приёмы обновлены для ${count} покемонов`);

        // Сохраняем обновлённый pokedex.js
        const newContent = `// =======================================================================\n` +
                          `// АВТОМАТИЧЕСКИ СГЕНЕРИРОВАННЫЙ ФАЙЛ – НЕ РЕДАКТИРОВАТЬ ВРУЧНУЮ\n` +
                          `// =======================================================================\n` +
                          `const ALL_POKEMON_DATA = ${JSON.stringify(pokedex, null, 2)};\n`;
        fs.writeFileSync(pokedexPath, newContent);
        console.log(`📁 Файл ${pokedexPath} обновлён!`);
    } catch(err) {
        console.error('❌ Ошибка:', err.message);
        process.exit(1);
    }
}

updateMoves();
