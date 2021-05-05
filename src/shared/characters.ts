import { ChadCharacter } from './character/chad'
import { Character } from './character/character'
import { DummyCharacter } from './character/dummy'

type Class<T> = new(...args: any[]) => T

export const Characters: Map<string, Class<Character>> = new Map([['CHAD', ChadCharacter], ['DUMMY', DummyCharacter]])
