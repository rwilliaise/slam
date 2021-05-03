import { Players, RunService } from '@rbxts/services'
import { DummyCharacter } from 'shared/character/dummy'

function connectPlayer (player: Player): void {
  const char = new DummyCharacter(player)
  RunService.Heartbeat.Connect((delta) => char.think(delta))
}

Players.PlayerAdded.Connect(connectPlayer)

Players.GetPlayers().forEach(connectPlayer)
