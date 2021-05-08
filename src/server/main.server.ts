import { Players } from '@rbxts/services'
import { PityCharacter } from 'shared/character/pity'
import * as MasterClock from './hitreg/clock'

function connectPlayer (player: Player): void {
  const char = new PityCharacter(player)
  char.pollEvents()
}

Players.PlayerAdded.Connect(connectPlayer)

Players.GetPlayers().forEach(connectPlayer)

MasterClock.forceSync()
