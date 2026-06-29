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

// Параллельная загрузка с ограничением
async function parallelLoad(urls, concurrency = 20) {
    const results = [];
    const queue = [...urls];
    let active = 0;
    let index = 0;

    return new Promise((resolve) => {
        function next() {
            if (queue.length === 0 && active === 0) {
                resolve(results);
                return;
            }
            while (active < concurrency && queue.length > 0) {
                const url = queue.shift();
                const currentIndex = index++;
                active++;
                getJSON(url)
                    .then(data => {
                        results[currentIndex] = data;
                    })
                    .catch(err => {
                        results[currentIndex] = null;
                        console.warn(`Ошибка загрузки ${url}: ${err.message}`);
                    })
                    .finally(() => {
                        active--;
                        next();
                    });
            }
        }
        next();
    });
}

// =======================================================================
// Основная загрузка
// =======================================================================
async function loadAllPokemon() {
    console.log('⏳ Загрузка списка покемонов...');
    const list = await getJSON('https://pokeapi.co/api/v2/pokemon?limit=1025');
    const results = list.results;
    const total = results.length;
    console.log(`📦 Всего найдено: ${total} покемонов`);

    // Получаем все URL-адреса покемонов
    const urls = results.map(item => item.url);
    console.log(`⏳ Загрузка данных покемонов (параллельно, до 20 одновременно)...`);
    const pokemons = await parallelLoad(urls, 20);

    const pokedex = {};
    // Используем русские названия приёмов
    let count = 0;

    for (let i = 0; i < pokemons.length; i++) {
        const pokemonData = pokemons[i];
        if (!pokemonData) continue;
        const id = pokemonData.id;
        const speciesData = await getJSON(pokemonData.species.url);

        const ruNameEntry = speciesData.names.find(n => n.language.name === 'ru');
        const nameRu = ruNameEntry ? ruNameEntry.name : pokemonData.name.charAt(0).toUpperCase() + pokemonData.name.slice(1);

        const types = pokemonData.types.map(t => t.type.name);

        const stats = {
            hp: pokemonData.stats[0].base_stat,
            attack: pokemonData.stats[1].base_stat,
            defense: pokemonData.stats[2].base_stat,
            spAttack: pokemonData.stats[3].base_stat,
            spDefense: pokemonData.stats[4].base_stat,
            speed: pokemonData.stats[5].base_stat
        };

        const abilities = pokemonData.abilities.map(a => a.ability.name);

        const moves = pokemonData.moves
            .filter(m => m.version_group_details.some(v => v.move_learn_method.name === 'level-up'))
            .slice(0, 4)
            .map(m => {
                return {
                    name: MOVE_RU[m.move.name] || m.move.name,
                    type: 'normal',
                    power: 40,
                    accuracy: 100,
                    category: 'physical',
                    max_pp: 35,
                    learnLevel: 1
                };
            });

        pokedex[id] = {
            name: { ru: nameRu },
            types: types,
            stats: stats,
            abilities: abilities,
            moves: moves,
            evolutions: []
        };

        count++;
        if (count % 50 === 0) console.log(`⏳ Обработано ${count}/${total}`);
    }

    console.log(`✅ Загружено ${count} покемонов`);
    return pokedex;
}

async function savePokedex() {
    try {
        const data = await loadAllPokemon();
        const content = `// =======================================================================\n` +
                        `// АВТОМАТИЧЕСКИ СГЕНЕРИРОВАННЫЙ ФАЙЛ – НЕ РЕДАКТИРОВАТЬ ВРУЧНУЮ\n` +
                        `// =======================================================================\n` +
                        `const ALL_POKEMON_DATA = ${JSON.stringify(data, null, 2)};\n`;
        const targetPath = PATHS.GAME_DIR + '/' + PATHS.POKEDEX_FILE;
        fs.writeFileSync(targetPath, content);
        console.log(`📁 Файл ${targetPath} успешно создан!`);
    } catch(err) {
        console.error('❌ Ошибка:', err.message);
        process.exit(1);
    }
}

savePokedex();
