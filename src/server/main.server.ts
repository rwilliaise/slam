import { ipcServer } from '@rbxts/abstractify'
import { Players, RunService } from '@rbxts/services'
import { promiseError } from 'shared/utils'
import * as MasterClock from './clock'
import * as LagCompensation from 'shared/hitreg/lag'
import { disconnect, handleSelection } from './selection'

Players.PlayerAdded.Connect((player: Player) => {
  function characterAdded (character: Model): void {
    const humanoid = character.FindFirstChildOfClass('Humanoid')
    if (humanoid !== undefined) {
      humanoid.Died.Connect(() => {
        player.LoadCharacter()
      })
    }
  }

  player.CharacterAdded.Connect(characterAdded)
  if (player.Character !== undefined) {
    characterAdded(player.Character)
  }
})

Players.PlayerRemoving.Connect(disconnect)

ipcServer.on('characterSelect', handleSelection).catch(promiseError)
MasterClock.forceSync()

RunService.Heartbeat.Connect((delta) => {
  LagCompensation.update(delta)
})
