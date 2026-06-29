const fs = require('fs');
const pokemon = require('pokemon');

const pokedexPath = '/storage/emulated/0/Моя RPG/pokedex.js';
const content = fs.readFileSync(pokedexPath, 'utf-8');
const match = content.match(/const ALL_POKEMON_DATA = (.*?);/s);
if (!match) {
    console.error('❌ Не удалось найти ALL_POKEMON_DATA');
    process.exit(1);
}
const data = JSON.parse(match[1]);
const russianNames = pokemon.all('ru');

for (const id in data) {
    const index = parseInt(id) - 1;
    if (russianNames[index]) {
        data[id].name = { ru: russianNames[index] };
    }
}

const newContent = '// =======================================================================\n' +
                   '// АВТОМАТИЧЕСКИ СГЕНЕРИРОВАННЫЙ ФАЙЛ – НЕ РЕДАКТИРОВАТЬ ВРУЧНУЮ\n' +
                   '// =======================================================================\n' +
                   'const ALL_POKEMON_DATA = ' + JSON.stringify(data, null, 2) + ';\n';
fs.writeFileSync(pokedexPath, newContent);
console.log('✅ Имена покемонов обновлены на русские (из пакета pokemon)');
