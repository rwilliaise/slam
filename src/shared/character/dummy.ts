import { $print } from 'rbxts-transform-debug'
import { Character } from './character'

export class DummyCharacter extends Character {
  constructor (player: Player) {
    super(player)
    this.registerMove(Enum.KeyCode.E).callback = () => { $print('ayo') }
  }
}
