import { ReplicatedStorage, Workspace } from '@rbxts/services'
import { Character } from './character'
import { ProjectileMechanism } from '../hitreg/projectile'
import { $print } from 'rbxts-transform-debug'
import { isServer } from 'shared/utils'

const Arrow = ReplicatedStorage.WaitForChild('Arrow') as BasePart

export class PityCharacter extends Character {
  crossbowMechanism = new ProjectileMechanism()
    .behavior({
      Acceleration: new Vector3(0, -Workspace.Gravity * Arrow.Mass),
      CosmeticBulletTemplate: Arrow
    })

  character!: Model

  constructor (player: Player) {
    super(player)
    this.crossbowMechanism.onLengthChanged = (_, segmentOrigin, segmentDir, length, __, bullet) => {
      if (bullet === undefined || !bullet.IsA('BasePart')) {
        return
      }
      const bulletLength = bullet.Size.Z / 2
      const baseCFrame = new CFrame(segmentOrigin, segmentOrigin.add(segmentDir))
      bullet.CFrame = baseCFrame.mul(new CFrame(0, 0, -(length - bulletLength)))
    }
    this.crossbowMechanism.onRayHit = (cast, result, segmentVelocity, bullet) => {
      $print('Hit!')
    }
    const primary = this.createMove(Enum.UserInputType.MouseButton1)
    primary.predicted = true
    primary.callback = (state, _, hit) => this.primaryFire(state, hit)
  }

  primaryFire (state: Enum.UserInputState, hit: CFrame): void {
    if (isServer()) {
      return
    }
    if (state !== Enum.UserInputState.Begin) {
      return
    }
    $print('Firing!')
    const rootPart = this.character.WaitForChild('HumanoidRootPart') as BasePart
    const position = rootPart.Position.add(new Vector3(0, 5, 0))
    this.crossbowMechanism.fire(position, hit.Position.sub(position))
  }

  onCharacterAdded (character: Model): void {
    this.character = character
    this.crossbowMechanism.castParams.FilterDescendantsInstances.push(character)
  }
}
