// TODO: this file should be removed/revamped
import { Debris, Workspace } from '@rbxts/services'
import { Particle } from './particle'

/** The default Roblox explosion. Used for testing. */
export class DefaultExplosion extends Particle {
  play (position: Vector3): void {
    const explosion = new Instance('Explosion')
    explosion.DestroyJointRadiusPercent = 0
    explosion.BlastPressure = 0
    explosion.Position = position
    explosion.Parent = Workspace
    Debris.AddItem(explosion, 2)
  }
}

/** A replication of the '07 explosion. */
export class OldExplosion extends Particle {
  play (position: Vector3): void {
    const part = new Instance('Part')
    part.Name = 'Explosion'
    part.Size = new Vector3(12, 12, 12)
    part.Material = Enum.Material.SmoothPlastic
    part.Position = position
    part.Color = new Color3(1, 0, 0)
    part.Anchored = true
    part.CanCollide = false
    part.Parent = Workspace
    const mesh = new Instance('SpecialMesh', part)
    mesh.MeshType = Enum.MeshType.Sphere
    Debris.AddItem(part, 0.5)
  }
}
