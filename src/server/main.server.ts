import { Players } from '@rbxts/services'
import * as MasterClock from './hitreg/clock'
import { connect } from './selection'

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

connect()
MasterClock.forceSync()
