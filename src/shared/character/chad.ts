import { $dbg } from 'rbxts-transform-debug'
import { tryMelee } from 'shared/hitreg'
import { isServer, promiseError } from 'shared/utils'
import { Character } from './character'

/** Punch-based character. */
export class ChadCharacter extends Character {
  private punchTrack?: AnimationTrack = undefined
  private readonly animation: Animation

  private character?: Model

  constructor (player: Player) {
    super(player)
    const punch = this.registerMove(Enum.UserInputType.MouseButton1)
    punch.callback = (state, obj) => this.tryPunch(state, obj)
    punch.cooldown = 0.8 // 1 sec cooldown
    this.animation = new Instance('Animation')
    this.animation.AnimationId = 'rbxassetid://6053790188'
  }

  onCharacterAdded (character: Model): void {
    super.onCharacterAdded(character)
    this.character = character
    if (!character.IsDescendantOf(game)) {
      character.AncestryChanged.Wait()
    }
    const Humanoid = character.WaitForChild('Humanoid')
    const Animator = Humanoid.WaitForChild('Animator') as Animator
    this.punchTrack = Animator.LoadAnimation(this.animation)
    this.punchTrack
      .GetMarkerReachedSignal('RegisterHit')
      .Connect(() => {
        this.registerHit()
          .catch(promiseError)
      })
  }

  tryPunch (state: Enum.UserInputState, obj?: InputObject): void {
    if (state !== Enum.UserInputState.Begin) {
      return
    }
    this.punchTrack?.Play(0.2, isServer() ? 0.01 : 1) // cheeky asf hack that i cant circumvent. this is agony
  }

  async registerHit (): Promise<void> {
    const charCFrame = this.character?.GetPrimaryPartCFrame()
    if (charCFrame !== undefined) {
      const result = tryMelee(charCFrame.mul(new CFrame(0, 0, -2)), new Vector3(4, 4, 4), { ignorePlayer: this.player })
      $dbg(result)
      if (result.hitHumanoid !== undefined) {
        result.hitHumanoid.TakeDamage(10) // TODO: damage system, different damage types for damage invulns and counters
      }
      return
    }
    error('Illegal state: character was not available')
  }
}
