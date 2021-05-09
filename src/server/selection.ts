import { Character } from 'shared/character/character'
import { Characters } from 'shared/characters'

const playerCharacterMap = new Map<number, Character>()

export function handleSelection (player: Player, id: string): void {
  const CharacterConstructor = Characters.get(id)
  if (CharacterConstructor !== undefined) {
    const char = new CharacterConstructor(player)
    char.pollEvents()
    playerCharacterMap.set(player.UserId, char)
    player.LoadCharacter()
  }
}

export function disconnect (player: Player): void {
  const char = playerCharacterMap.get(player.UserId)
  if (char !== undefined) {
    char.destroy()
    playerCharacterMap.delete(player.UserId)
  }
}
