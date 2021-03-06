import { ContextActionService } from '@rbxts/services'
import { isClient, isServer, promiseError } from 'shared/utils'
import { $print } from 'rbxts-transform-debug'
import { ipcClient, ipcServer } from '@rbxts/abstractify'

type ActionType = Enum.KeyCode | Enum.PlayerActions | Enum.UserInputType

/**
 * A move that a character can do.
 *  */
interface Move {
  callback?: (data: any) => unknown
  cooldown?: number
  /** Called on the client to assemble data to send over to the server. Whatever this returns will be  */
  assemble: (state: Enum.UserInputState, inputObject: InputObject | undefined) => {}
  predicted: boolean
}

/**
 * A playable character. All code is present on both sides for easy prediction.
 */
export class Character {
  // FIXME: potential memory overhead, ideally moveMap should be static
  private readonly moveMap: Map<string, Move> = new Map()
  // FIXME: another potential memory overhead, 64 bit numbers are intensive
  private readonly cooldownMap: Map<string, number> = new Map()
  private moveId: number = 0

  characterAdded!: RBXScriptConnection
  netMoveInput!: RBXScriptConnection

  /**
   * Takes in a player and binds the character to them
   * @param player Player to bind to
   */
  constructor (public player: Player) {
    // FIXME: there should really only be one connection, this wastes memory
    if (isServer()) {
      ipcServer.on('moveInput', (player: Player, name: string, state: Enum.UserInputState, data) => {
        if (player === this.player) {
          if (this.getCooldown(name, state)) {
            $print(`Move with id: ${name} is on cooldown. Please wait!`)
            return
          }
          let move: Move | undefined
          if ((move = this.moveMap.get(name)) !== undefined && move.callback !== undefined) {
            move.callback(data)
          }
        }
      })
        .then((connection) => {
          this.netMoveInput = connection
        }, promiseError)
    }
  }

  /** Default assembler function for moves */
  defaultAssemble: (state: Enum.UserInputState, inputObject: InputObject | undefined) => {
    State: Enum.UserInputState
    InputObject: InputObject | undefined
  } = (state: Enum.UserInputState, inputObject: InputObject | undefined) => {
    return {
      State: state,
      InputObject: inputObject
    }
  }

  /** This should disconnect all events relating to the character. */
  destroy (): void {
    $print('Cleaning up!')
    this.characterAdded.Disconnect()
    if (isClient()) {
      $print('isClient - cleaning up moves!')
      this.moveMap.forEach((_, key) => {
        $print('Cleaning up move ' + key)
        ContextActionService.UnbindAction(key)
      })
    }
    if (isServer()) {
      $print('isServer - cleaning up moveInput!')
      this.netMoveInput.Disconnect()
    }
    $print('Cleaning up - Done!')
  }

  /**
   * Get if a move can be executed. Cooldown is on a input state basis, which might be a vulnerability. Stay frosty.
   * @param name Name/id of the move
   * @returns True if the move is on cooldown.
   */
  getCooldown (name: string, state: Enum.UserInputState): boolean {
    let move: Move | undefined
    if ((move = this.moveMap.get(name)) !== undefined && move.cooldown !== undefined) {
      const cooldownTime = this.cooldownMap.get(name + state.Name)
      if (cooldownTime !== undefined && cooldownTime >= tick()) {
        return true
      }
      // FIXME: cooldowns with this system are inaccurate and buggy
      // this SHOULD use the synced time, and keep track with the server
      this.cooldownMap.set(name + state.Name, tick() + move.cooldown)
      return false
    }
    return false
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
      if (this.getCooldown(name, state)) {
        $print(`Move with id: ${name} is on cooldown. Please wait!`)
        return
      }
      const assembled = move.assemble(state, inputObject)
      ipcClient.emit('moveInput', name, state, assembled).catch(promiseError)
      if (move.predicted) {
        $print('Predicting!')
        debug.profilebegin('NetPredict') // prediction profile
        move.callback(assembled)
        debug.profileend()
      }
      return
    }
    $print(`Move or move callback with move id ${name} does not exist!`)
  }

  /**
   * Binds events to the player.
   */
  pollEvents (): void {
    this.characterAdded = this.player.CharacterAdded.Connect((character: Model) => this.onCharacterAdded(character))
    if (this.player.Character !== undefined) {
      this.onCharacterAdded(this.player.Character)
    }
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
  createMove (...keyCodes: ActionType[]): Move {
    const id = tostring((this.moveId = this.moveId + 1))
    const move: Move = { predicted: true, assemble: this.defaultAssemble } // predict all moves by default
    this.moveMap.set(id, move)
    if (isClient()) {
      ContextActionService.BindAction(id, (name, state, obj) => this.pollInputs(name, state, obj), false, ...keyCodes)
    }
    return move
  }
}
