import { $print } from 'rbxts-transform-debug'
import { Character } from './character'

// TODO: this should have more moves as well as some lag compensation testing.
export class DummyCharacter extends Character {
  constructor (player: Player) {
    super(player)
    this.registerMove(Enum.KeyCode.E).callback = () => {
      $print('ayo')
    }
  }
}
