import { Workspace } from '@rbxts/services'
import { unCompensatedTryMelee } from 'shared/hitreg'
import { isClient, isServer, promiseError } from 'shared/utils'
import { Character } from './character'

/** Punch-based character. */
export class ChadCharacter extends Character {
  private punchTrack?: AnimationTrack = undefined
  private readonly animation: Animation

  private character?: Model

  constructor (player: Player) {
    super(player)
    const punch = this.registerMove(Enum.UserInputType.MouseButton1)
    punch.callback = (state) => this.tryPunch(state)
    punch.cooldown = 0.85 // 1 sec cooldown
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

  tryPunch (state: Enum.UserInputState): void {
    if (state !== Enum.UserInputState.Begin) {
      return
    }
    this.punchTrack?.Play(0.2, isServer() ? 0.01 : 1) // cheeky asf hack that i cant circumvent. this is agony
  }

  async registerHit (): Promise<void> {
    const rootPart = this.character?.FindFirstChild('HumanoidRootPart') as BasePart | undefined
    const charCFrame = rootPart?.CFrame
    if (charCFrame !== undefined && rootPart !== undefined) {
      // TODO: lag compensated instead of velocity compensation
      if (isServer()) {
        const compensatedCFrame = charCFrame.add(rootPart.AssemblyLinearVelocity.mul(0.5))
        const part = new Instance('Part')
        part.CFrame = compensatedCFrame.mul(new CFrame(0, 0, -2))
        part.Size = new Vector3(4, 4, 4)
        part.CanCollide = false
        part.Anchored = true
        part.BrickColor = new BrickColor('Bright blue')
        part.Transparency = 0.5
        part.Parent = Workspace
      }
      const part = new Instance('Part')
      part.CFrame = charCFrame.mul(new CFrame(0, 0, -2))
      part.Size = new Vector3(4, 4, 4)
      part.CanCollide = false
      part.Anchored = true
      part.BrickColor = new BrickColor('Bright red')
      if (isClient()) {
        part.BrickColor = new BrickColor('Bright green')
      }
      part.Transparency = 0.5
      part.Parent = Workspace
      const result = unCompensatedTryMelee(charCFrame.mul(new CFrame(0, 0, -2)), new Vector3(4, 4, 4), { ignorePlayers: this.player })
      if (result.hitHumanoid !== undefined) {
        result.hitHumanoid.TakeDamage(10) // TODO: damage system, different damage types for damage invulns and counters
      }
      return
    }
    error('Illegal state: character was not available')
  }
}
