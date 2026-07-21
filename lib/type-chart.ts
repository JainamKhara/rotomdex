/**
 * Static Pokémon Type Effectiveness Chart (Gen 6+)
 * Source: https://bulbapedia.bulbagarden.net/wiki/Type/Damage_chart
 *
 * Usage:
 *   getWeaknesses(['fire', 'flying'])  → [['rock', 2], ['water', 2], ['electric', 2]]
 *   getResistances(['steel'])          → [['grass', 0.5], ...]
 */

// [attacker type] → { defender type: multiplier }
const TYPE_CHART: Record<string, Record<string, number>> = {
  normal:   { rock: 0.5, ghost: 0, steel: 0.5 },
  fire:     { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water:    { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  grass:    { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  ice:      { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison:   { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground:   { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying:   { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic:  { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug:      { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock:     { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost:    { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon:   { dragon: 2, steel: 0.5, fairy: 0 },
  dark:     { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel:    { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy:    { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
}

const ALL_TYPES = Object.keys(TYPE_CHART)

/**
 * Given a Pokémon's defending type(s), compute the damage multiplier
 * it would receive from each attacking type.
 */
export function getTypeMatchups(defenderTypes: string[]): Record<string, number> {
  const result: Record<string, number> = {}

  for (const attackType of ALL_TYPES) {
    let multiplier = 1
    const chart = TYPE_CHART[attackType]
    for (const defType of defenderTypes) {
      const key = defType.toLowerCase()
      if (key in chart) {
        multiplier *= chart[key]
      }
    }
    result[attackType] = multiplier
  }

  return result
}

/**
 * Returns types that deal >1× damage to these defending types.
 */
export function getWeaknesses(defenderTypes: string[]): [string, number][] {
  const matchups = getTypeMatchups(defenderTypes)
  return Object.entries(matchups).filter(([, v]) => v > 1).sort((a, b) => b[1] - a[1])
}

/**
 * Returns types that deal <1× (but >0×) damage to these defending types.
 */
export function getResistances(defenderTypes: string[]): [string, number][] {
  const matchups = getTypeMatchups(defenderTypes)
  return Object.entries(matchups).filter(([, v]) => v < 1 && v > 0).sort((a, b) => a[1] - b[1])
}

/**
 * Returns types that deal 0× damage (immunities).
 */
export function getImmunities(defenderTypes: string[]): string[] {
  const matchups = getTypeMatchups(defenderTypes)
  return Object.entries(matchups).filter(([, v]) => v === 0).map(([t]) => t)
}
