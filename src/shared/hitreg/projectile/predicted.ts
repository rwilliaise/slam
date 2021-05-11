import FastCast from '@rbxts/fastcast'
import { $print } from 'rbxts-transform-debug'
import { PartialDeep } from '../regtils'
import { fire } from './fire'
import {
  defaultOptions,
  Projectile,
  ProjectileFolder,
  PROJECTILE_CASTER,
  addIgnore
} from './utils'

/** Predicts where a projectile will be. */
export class ProjectilePredictor {
  time: number
  origin: Vector3
  direction: Vector3
  dataPacket: PartialDeep<Projectile>
  ignore?: Instance[]

  speed: number
  cosmeticBulletContainer: Instance
  cosmeticBulletTemplate?: Instance

  newProjectile!: BasePart
  result?: RaycastResult

  predictedDirection: Vector3
  predictedOrigin: Vector3

  lengthChanged: Callback
  hit: Callback
  terminated: Callback

  constructor (
    time: number,
    origin: Vector3,
    direction: Vector3,
    dataPacket: PartialDeep<Projectile>,
    ...ignore: Instance[]
  ) {
    this.time = time
    this.origin = origin
    this.direction = direction
    this.dataPacket = dataPacket
    this.ignore = ignore

    this.speed = dataPacket.velocity ?? defaultOptions.velocity

    const cast = (dataPacket.behavior as unknown as { CosmeticBulletContainer?: Instance })
    this.cosmeticBulletContainer = cast.CosmeticBulletContainer ?? ProjectileFolder

    if (this.ignore !== undefined) {
      this.dataPacket = addIgnore(this.dataPacket, this.cosmeticBulletContainer, ...this.ignore)
    }

    this.cosmeticBulletTemplate = dataPacket.behavior?.CosmeticBulletTemplate as BasePart

    this.predictedDirection = direction.Unit.mul(time * this.speed)
    this.predictedOrigin = origin.add(this.predictedDirection)

    this.lengthChanged = dataPacket.lengthChanged ?? defaultOptions.lengthChanged
    this.hit = dataPacket.hit ?? defaultOptions.hit
    this.terminated = dataPacket.terminated ?? defaultOptions.terminated
  }

  getActiveCast (): FastCast.ActiveCast {
    return {
      Caster: PROJECTILE_CASTER,

      StateInfo: {
        UpdateConnection: undefined as unknown as RBXScriptSignal,
        Paused: false,
        TotalRuntime: this.time,
        DistanceCovered: this.time * this.speed,
        IsActivelySimulatingPierce: false,
        Trajectories: [
          {
            StartTime: 0,
            EndTime: -1,
            Origin: this.origin,
            InitialVelocity: this.direction.mul(this.speed),
            Acceleration: this.dataPacket.behavior?.Acceleration as Vector3 ?? new Vector3()
          }
        ]
      },

      RayInfo: {
        Parameters: this.dataPacket.behavior?.RaycastParams,
        WorldRoot: PROJECTILE_CASTER.WorldRoot,
        MaxDistance: this.dataPacket.behavior?.MaxDistance ?? 1000,
        CosmeticBulletObject: this.newProjectile,
        CanPierceCallback: this.dataPacket.behavior?.CanPierceFunction ?? (() => false)
      },
      UserData: {}
    } as unknown as FastCast.ActiveCast
  }

  terminateCast (): void {
    if (this.cosmeticBulletTemplate === undefined) {
      return
    }
    if (this.result === undefined) {
      return
    }
    this.newProjectile = this.cosmeticBulletTemplate.Clone() as BasePart
    this.newProjectile.Parent = this.cosmeticBulletContainer
    const ActiveCastRemake = this.getActiveCast()
    const distance = this.result?.Position.sub(this.origin).Magnitude
    this.lengthChanged(ActiveCastRemake, this.origin, this.direction, distance, this.predictedDirection, this.newProjectile)
    this.hit(ActiveCastRemake, this.result, this.predictedDirection, this.newProjectile)
    this.terminated(ActiveCastRemake)
  }

  fireInstantly (): boolean {
    this.result = PROJECTILE_CASTER.WorldRoot.Raycast(this.origin, this.predictedDirection, this.dataPacket.behavior?.RaycastParams as RaycastParams)
    if (this.result?.Instance !== undefined) {
      return true
    } else {
      return false
    }
  }

  fire (): void {
    $print(this.dataPacket)
    if (this.fireInstantly()) {
      this.terminateCast()
    } else {
      fire(this.predictedOrigin, this.direction, this.dataPacket)
    }
  }
}
