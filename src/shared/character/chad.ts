import { $print } from 'rbxts-transform-debug'
import { Character } from './character'

/** Punch-based character. */
export class ChadCharacter extends Character {
  constructor (player: Player) {
    super(player)
    const punch = this.registerMove(Enum.UserInputType.MouseButton1)
    punch.callback = (state, obj) => this.tryPunch(state, obj)
    punch.cooldown = 0.2 // .2 sec cooldown
  }

  tryPunch (state: Enum.UserInputState, obj?: InputObject): void {
    $print('Hello, world! I am attempting punch!')
  }
}
