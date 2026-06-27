// =======================================================================
// ТАБЛИЦА ЭФФЕКТИВНОСТИ ТИПОВ
// =======================================================================
const TYPE_EFFECTIVENESS = {
    "normal:ghost":0, "normal:rock":0.5, "normal:steel":0.5,
    "fire:fire":0.5, "fire:water":0.5, "fire:grass":2, "fire:ice":2, "fire:bug":2, "fire:rock":0.5, "fire:dragon":0.5, "fire:steel":2,
    "water:fire":2, "water:water":0.5, "water:grass":0.5, "water:ground":2, "water:rock":2, "water:dragon":0.5,
    "grass:fire":0.5, "grass:water":2, "grass:grass":0.5, "grass:poison":0.5, "grass:ground":2, "grass:flying":0.5, "grass:bug":0.5, "grass:rock":2, "grass:dragon":0.5, "grass:steel":0.5,
    "electric:water":2, "electric:grass":0.5, "electric:electric":0.5, "electric:ground":0, "electric:flying":2, "electric:dragon":0.5, "electric:steel":0.5,
    "ice:fire":0.5, "ice:water":0.5, "ice:grass":2, "ice:ice":0.5, "ice:ground":2, "ice:flying":2, "ice:dragon":2, "ice:steel":0.5, "ice:fairy":0.5,
    "fighting:normal":2, "fighting:fire":0.5, "fighting:water":0.5, "fighting:grass":0.5, "fighting:electric":0.5, "fighting:ice":2, "fighting:poison":0.5, "fighting:flying":0.5, "fighting:psychic":0.5, "fighting:bug":0.5, "fighting:rock":2, "fighting:ghost":0, "fighting:dark":2, "fighting:dragon":0.5, "fighting:steel":2, "fighting:fairy":0.5,
    "poison:grass":2, "poison:poison":0.5, "poison:ground":0.5, "poison:rock":0.5, "poison:ghost":0.5, "poison:steel":0, "poison:fairy":2,
    "ground:fire":2, "ground:grass":0.5, "ground:electric":2, "ground:poison":2, "ground:flying":0, "ground:bug":0.5, "ground:rock":2, "ground:steel":2,
    "flying:grass":2, "flying:fighting":2, "flying:bug":2, "flying:rock":0.5, "flying:steel":0.5, "flying:electric":0.5,
    "psychic:fighting":2, "psychic:poison":2, "psychic:psychic":0.5, "psychic:steel":0.5, "psychic:dark":0,
    "bug:grass":2, "bug:fire":0.5, "bug:water":0.5, "bug:electric":0.5, "bug:ice":0.5, "bug:poison":0.5, "bug:psychic":2, "bug:dark":2, "bug:fairy":0.5, "bug:steel":0.5,
    "rock:fire":2, "rock:water":0.5, "rock:grass":0.5, "rock:electric":0.5, "rock:ice":2, "rock:fighting":0.5, "rock:ground":0.5, "rock:flying":2, "rock:bug":2, "rock:steel":0.5,
    "ghost:normal":0, "ghost:psychic":2, "ghost:ghost":2, "ghost:dark":0.5,
    "dragon:dragon":2, "dragon:steel":0.5, "dragon:fairy":0,
    "dark:psychic":2, "dark:ghost":2, "dark:dark":0.5, "dark:fairy":0.5, "dark:steel":0.5,
    "steel:fire":0.5, "steel:water":0.5, "steel:electric":0.5, "steel:ice":2, "steel:rock":2, "steel:steel":0.5, "steel:fairy":2, "steel:poison":0, "steel:grass":0.5,
    "fairy:fire":0.5, "fairy:water":0.5, "fairy:grass":0.5, "fairy:electric":0.5, "fairy:ice":0.5, "fairy:fighting":2, "fairy:poison":0.5, "fairy:ground":0.5, "fairy:flying":0.5, "fairy:psychic":0.5, "fairy:bug":0.5, "fairy:rock":0.5, "fairy:ghost":0.5, "fairy:dragon":2, "fairy:dark":2, "fairy:steel":0.5,
};
function getEffectiveness(attackType, defenderTypes) {
    let multiplier = 1;
    for (let def of defenderTypes) {
        const key = attackType.toLowerCase() + ":" + def.toLowerCase();
        if (TYPE_EFFECTIVENESS[key] !== undefined) multiplier *= TYPE_EFFECTIVENESS[key];
    }
    return multiplier;
}