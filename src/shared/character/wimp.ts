import { Character } from './character'

export class WimpCharacter extends Character {
  constructor (player: Player) {
    super(player)
    this.createMove(Enum.UserInputType.MouseButton1)
  }
}
