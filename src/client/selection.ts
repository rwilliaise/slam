import { Players } from '@rbxts/services'
import { Character } from 'shared/character/character'
import { Characters } from 'shared/characters'

let currentlySelected: Character | undefined

function purge (): void {
  if (currentlySelected !== undefined) {
    currentlySelected.destroy()
  }
}

export function selectCharacter (id: string): void {
  purge()
  const CharacterConstructor = Characters.get(id)
  if (CharacterConstructor !== undefined) {
    const char = new CharacterConstructor(Players.LocalPlayer)
    char.pollEvents()
    currentlySelected = char
  }
}
