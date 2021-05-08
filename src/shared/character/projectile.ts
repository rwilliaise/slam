/**
 * This is NOT hitscan - that is, the bullets do not get to their destination instantly. For that, please visit
 * hitscan.ts.
 */

import FastCast from '@rbxts/fastcast'
import Object from '@rbxts/object-utils'
import { Workspace } from '@rbxts/services'
import { Character } from 'shared/character/character'

const _tmpProjFolder = Workspace.FindFirstChild('ProjectileFolder')
export const ProjectileFolder = (_tmpProjFolder !== undefined) ? _tmpProjFolder : new Instance('Folder', Workspace)
ProjectileFolder.Name = 'ProjectileFolder'

/** A projectile based character. This should be used if you have at least one projectile in your character. */
export class ProjectileCharacter extends Character {
  caster: FastCast.Caster = FastCast.new()
  castParams = new RaycastParams()
  maxDistance = 1024

  init (): void {
    this.castParams.IgnoreWater = true
    this.castParams.FilterType = Enum.RaycastFilterType.Blacklist
    this.castParams.FilterDescendantsInstances = []
  }

  pollEvents (): void {
    super.pollEvents()
    this.caster.RayHit.Connect(this.onRayHit)
    this.caster.RayPierced.Connect(this.onRayPierced)
    this.caster.LengthChanged.Connect(this.onLengthChanged)
  }

  /** Fires whenever the projectile moves */
  onLengthChanged: (
    cast: FastCast.ActiveCast,
    segmentOrigin: Vector3,
    segmentDirection: Vector3,
    length: number,
    segmentVelocity: Vector3,
    bullet?: Instance
  ) => void = () => {}

  /** Fires whenever a ray (part of the projectile) hit an object. */
  onRayHit: (
    cast: FastCast.ActiveCast,
    result: RaycastResult,
    segmentVelocity: Vector3,
    bullet?: Instance
  ) => void = () => {}

  /** Fired whenever the ray pierces an object. Only fires if .canPierce returns true. */
  onRayPierced: (
    cast: FastCast.ActiveCast,
    result: RaycastResult,
    segmentVelocity: Vector3,
    bullet?: Instance
  ) => void = () => {}

  /** Shouldn't override this! Provides functionality for both CosmeticBullet instantiators. */
  onRayTerminated: (
    cast: FastCast.ActiveCast
  ) => void = () => {}

  /** Used to see if a given object can be pierced. */
  canPierce: (
    cast: FastCast.ActiveCast,
    result: RaycastResult,
    segmentVelocity: Vector3
  ) => boolean = () => false

  /** Create a new cast behavior. Shorthand for manually doing it. */
  newBehavior (options?: Partial<FastCast.FastCastBehavior>): FastCast.FastCastBehavior {
    const behavior = FastCast.newBehavior()
    Object.assign(behavior, {
      RaycastParams: this.castParams,
      MaxDistance: this.maxDistance
    })
    Object.assign(behavior, options)
    return behavior
  }
}
