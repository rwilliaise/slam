import { ChadCharacter } from './character/chad'
import { Character } from './character/character'
import { WimpCharacter } from './character/wimp'
import { PityCharacter } from './character/pity'

type Class<T> = new(...args: any[]) => T

// FIXME: this should NOT use the ancient maps constructor format
export const Characters: Map<string, Class<Character>> = new Map()
Characters.set('chad', ChadCharacter)
Characters.set('pity', PityCharacter)
Characters.set('wimp', WimpCharacter)
