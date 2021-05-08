import { ChadCharacter } from './character/chad'
import { Character } from './character/character'
import { PityCharacter } from './character/pity'

type Class<T> = new(...args: any[]) => T

// FIXME: this should NOT use the ancient maps constructor format
export const Characters: Map<string, Class<Character>> = new Map()
Characters.set('Chad', ChadCharacter)
Characters.set('Pity', PityCharacter)
