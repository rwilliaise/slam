import { Debris, Players, ReplicatedStorage } from '@rbxts/services'
import { Character } from './character'
import { add, fireReplicated, ProjectileFolder } from '../hitreg/projectile'
import { isClient, isServer } from 'shared/utils'
const Arrow = ReplicatedStorage.WaitForChild('Arrow') as BasePart

const CrossbowProjectile = add('crossbow.arrow', {
  behavior: {
    CosmeticBulletTemplate: Arrow
  },
  velocity: 150,
  lengthChanged: (_, segmentOrigin, segmentDir, length, __, bullet) => {
    if (isServer() && bullet?.IsA('BasePart') === true && bullet.IsA('BasePart')) {
      bullet.Transparency = 1
      return
    }
    if (bullet?.IsA('BasePart') === true && bullet.IsA('BasePart')) { // ??
      const bulletLength = bullet.Size.Z / 2
      const baseCFrame = new CFrame(segmentOrigin, segmentOrigin.add(segmentDir))
      bullet.CFrame = baseCFrame.mul(new CFrame(0, 0, -(length - bulletLength)))
    }
  },
  hit: (_, result) => {
    const hitPart = result.Instance
    if (hitPart?.Parent !== undefined) {
      const humanoid = hitPart.FindFirstAncestorOfClass('Model')?.FindFirstChildOfClass('Humanoid')
      if (humanoid !== undefined) {
        humanoid.TakeDamage(10)
      }
    }
  },
  terminated: (cast) => {
    const bullet = cast.RayInfo.CosmeticBulletObject
    if (bullet !== undefined) {
      Debris.AddItem(bullet, 3) // FIXME: don't use debris
    }
  }
})

export class PityCharacter extends Character {
  character!: Model

  constructor (player: Player) {
    super(player)
    const primary = this.createMove(Enum.UserInputType.MouseButton1)
    primary.predicted = true
    primary.cooldown = 0.5
    primary.callback = (data) => this.primaryFire(data)
    primary.assemble = (state) => { return { State: state, Hit: Players.LocalPlayer.GetMouse().Hit.Position } }
    if (isClient()) {
      Players.LocalPlayer.GetMouse().TargetFilter = ProjectileFolder
    }
  }

  primaryFire (data: { State: Enum.UserInputState, Hit: Vector3 }): void {
    if (data.State !== Enum.UserInputState.Begin) {
      return
    }
    const rootPart = this.character.WaitForChild('HumanoidRootPart') as BasePart
    const position = rootPart.Position.add(new Vector3(0, 0, 0))
    fireReplicated(position, data.Hit.sub(position), this.player, CrossbowProjectile, this.character)
  }

  onCharacterAdded (character: Model): void {
    this.character = character
  }
}
