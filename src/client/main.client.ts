import { Players, RunService } from '@rbxts/services'
import { DummyCharacter } from 'shared/character/dummy'

const char = new DummyCharacter(Players.LocalPlayer)

RunService.Heartbeat.Connect((delta) => char.think(delta))
