import { Workspace } from '@rbxts/services'
import { ProjectileCharacter } from './projectile'

export class PityCharacter extends ProjectileCharacter {
  crossbowBehavior = this.newBehavior({
    Acceleration: new Vector3(0, -Workspace.Gravity, 0)
  })

  init (): void {
    super.init()
  }
}
