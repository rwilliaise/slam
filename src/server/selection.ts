import { ipcServer } from '@rbxts/abstractify'
import { Characters } from 'shared/characters'
import { promiseError } from 'shared/utils'

function handleSelection (player: Player, id: string): void {
  const CharacterConstructor = Characters.get(id)
  if (CharacterConstructor !== undefined) {
    const char = new CharacterConstructor(player)
    char.pollEvents()
    player.LoadCharacter()
  }
}

export function connect (): void {
  ipcServer.on('characterSelect', handleSelection).catch(promiseError)
}
