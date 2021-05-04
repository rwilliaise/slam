import { ContextActionService } from '@rbxts/services'
import { isClient, isServer } from 'shared/utils'
import { $print } from 'rbxts-transform-debug'
import { ipcClient, ipcServer } from '@rbxts/abstractify'

/**
 * A move that a character can do.
 */
interface Move {
  callback?: Callback
  cooldown?: number
  predicted: boolean
}

/**
 * A playable character. All code is present on both sides for easy prediction.
 */
export class Character {
  private readonly moveMap: Map<string, Move> = new Map()
  private moveId: number = 0

  /**
   * Takes in a player and binds the character to them
   * @param player Player to bind to
   */
  constructor (public player: Player) {
    this.pollEvents()
    // all inputs are captured and run on both sides, ensuring massive ping doesn't ruin a match
    // TODO: lag compensation - there should be lag comp for both melee and ranged attacks, but that will be difficult
    if (isServer()) {
      ipcServer.on('moveInput', (player: Player, name, state) => {
        if (player === this.player) {
          let move: Move | undefined
          if ((move = this.moveMap.get(name)) !== undefined && move.callback !== undefined) {
            move.callback(state)
          }
        }
      })
        .catch((err) => { $print(err) })
    }
  }

  /**
   * Handles input for all moves.
   * @param name Id of the move
   * @param state State of the move fired
   * @param inputObject InputObject relating to the move input
   * @client
   */
  pollInputs (name: string, state: Enum.UserInputState, inputObject: InputObject): void {
    let move: Move | undefined
    if ((move = this.moveMap.get(name)) !== undefined && move.callback !== undefined) {
      if (move.predicted) {
        ipcClient.emit('moveInput', name, state).catch((err) => { $print(err) })
      }
      move.callback(state, inputObject)
      return
    }
    $print(`Move or move callback with move id ${name} does not exist!`)
  }

  /**
   * Binds events to the player.
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
    const move: Move = { predicted: true } // predict all moves by default
    this.moveMap.set(id, move)
    if (isClient()) {
      ContextActionService.BindAction(id, (name, state, obj) => this.pollInputs(name, state, obj), false, ...keyCodes)
    }
    return move
  }
}
