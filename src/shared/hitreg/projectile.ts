import FastCast from '@rbxts/fastcast'
import Object from '@rbxts/object-utils'
import { Workspace } from '@rbxts/services'

const _tmpProjFolder = Workspace.FindFirstChild('ProjectileFolder')
export const ProjectileFolder = (_tmpProjFolder !== undefined) ? _tmpProjFolder : new Instance('Folder', Workspace)
ProjectileFolder.Name = 'ProjectileFolder'

// TODO: hitscan firemechanism (might not be needed)
/** Used to create different types of guns; i.e. crossbow or a glock. */
export abstract class FireMechanism {
  abstract fire (origin: Vector3, direction: Vector3): void
}

// FastCast.VisualizeCasts = true

/** Projectile firing style. Works during prediction. */
export class ProjectileMechanism extends FireMechanism {
  caster: FastCast.Caster = FastCast.new()
  castParams = new RaycastParams()
  _bulletSpeed = 100
  _behavior?: FastCast.FastCastBehavior

  constructor () {
    super()
    // this is horrible, but it would be 10x longer otherwise :/
    this.caster.RayHit.Connect((a, b, c, d) => this.onRayHit(a, b, c, d))
    this.caster.CastTerminating.Connect((a) => this.onRayTerminated(a))
    this.caster.RayPierced.Connect((a, b, c, d) => this.onRayPierced(a, b, c, d))
    this.caster.LengthChanged.Connect((a, b, c, d, e, f) => this.onLengthChanged(a, b, c, d, e, f))
    this.castParams.IgnoreWater = true
    this.castParams.FilterType = Enum.RaycastFilterType.Blacklist
    this.castParams.FilterDescendantsInstances = []
    this.behavior()
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

  /** Set a new cast behavior. Shorthand for manually doing it. */
  behavior (options?: Partial<FastCast.FastCastBehavior>): this {
    if (this._behavior === undefined) {
      this._behavior = FastCast.newBehavior()
      Object.assign(this._behavior, {
        RaycastParams: this.castParams,
        CanPierceFunction: (a: FastCast.ActiveCast, b: RaycastResult, c: Vector3) => this.canPierce(a, b, c),
        CosmeticBulletContainer: ProjectileFolder
      })
    }
    Object.assign(this._behavior, options)
    return this
  }

  bulletSpeed (speed: number): this {
    this._bulletSpeed = speed
    return this
  }

  fire (origin: Vector3, direction: Vector3): void {
    this.caster.Fire(origin, direction, this._bulletSpeed, this._behavior)
  }
}
