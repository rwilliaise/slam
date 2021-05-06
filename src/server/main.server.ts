import { Players } from '@rbxts/services'
import { ChadCharacter } from 'shared/character/chad'
import * as MasterClock from './hitreg/clock'

function connectPlayer (player: Player): void {
  const char = new ChadCharacter(player)
  char.pollEvents()
}

Players.PlayerAdded.Connect(connectPlayer)

Players.GetPlayers().forEach(connectPlayer)

MasterClock.forceSync()
