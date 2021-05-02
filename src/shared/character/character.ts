import { ContextActionService } from '@rbxts/services'
import { isClient } from 'shared/utils'

/**
 * A move that a character can do.
 */
interface Move {
  callback?: Callback
  cooldown?: number
}

export class Character {
  private readonly moveMap: Map<string, Move> = new Map()
  private moveId: number = 0

  /**
   * Takes in a player and binds the character to them
   * @param player Player to bind to
   */
  constructor (public player: Player) {
    this.pollEvents()
  }

  pollInputs (name: string, state: Enum.UserInputState, inputObject: InputObject): void {

  }

  /**
   *
   */
  pollEvents (): void {
    this.player.CharacterAdded.Connect((character: Model) => this.onCharacterAdded(character))
  }

  /**
   * Called when the character is added.
   */
  onCharacterAdded (character: Model): void {}

  /**
   * Called every frame.
   */
  think (delta: number): void {}

  /**
   * Creates a move with the given keycode
   * @param keyCodes Keycodes for the move to fire on (unused on server)
   * @returns The move for editing
   */
  registerMove (...keyCodes: Enum.KeyCode[]): Move {
    const id = tostring(this.moveId++)
    const move: Move = { }
    this.moveMap.set(id, move)
    if (isClient()) {
      ContextActionService.BindAction(id, (name, state, obj) => this.pollInputs(name, state, obj), false, ...keyCodes)
    }
    return move
  }
}
