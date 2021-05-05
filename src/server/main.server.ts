import { Players, RunService } from '@rbxts/services'
import { ChadCharacter } from 'shared/character/chad'

function connectPlayer (player: Player): void {
  const char = new ChadCharacter(player)
  RunService.Heartbeat.Connect((delta) => char.think(delta))
}

Players.PlayerAdded.Connect(connectPlayer)

Players.GetPlayers().forEach(connectPlayer)
