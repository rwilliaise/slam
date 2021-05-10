import { Debris, Players, ReplicatedStorage, Workspace } from '@rbxts/services'
import { Character } from './character'
import { add, fireReplicated, ProjectileFolder } from '../hitreg/projectile'
import { isClient, isServer } from 'shared/utils'

const Arrow = ReplicatedStorage.WaitForChild('Arrow') as BasePart

const CrossbowProjectile = add('crossbow.arrow', {
  behavior: {
    Acceleration: new Vector3(0, -Workspace.Gravity * Arrow.Mass),
    CosmeticBulletTemplate: Arrow
  },
  lengthChanged: (cast, segmentOrigin, segmentDir, length, __, bullet) => {
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
    primary.callback = (state, _, hit) => this.primaryFire(state, hit)
    if (isClient()) {
      Players.LocalPlayer.GetMouse().TargetFilter = ProjectileFolder
    }
  }

  primaryFire (state: Enum.UserInputState, hit: CFrame): void {
    if (state !== Enum.UserInputState.Begin) {
      return
    }
    const rootPart = this.character.WaitForChild('HumanoidRootPart') as BasePart
    const position = rootPart.Position.add(new Vector3(0, 5, 0))
    fireReplicated(position, hit.Position.sub(position), this.player, CrossbowProjectile)
  }

  onCharacterAdded (character: Model): void {
    this.character = character
  }
}
