import { ipcServer } from '@rbxts/abstractify'
import FastCast from '@rbxts/fastcast'
import Object from '@rbxts/object-utils'
import { Workspace } from '@rbxts/services'
import { $dbg, $print } from 'rbxts-transform-debug'
import { isClient, isServer } from 'shared/utils'
import { PartialDeep } from './regtils'

const _tmpProjFolder = Workspace.FindFirstChild('ProjectileFolder')
export const ProjectileFolder = (_tmpProjFolder !== undefined) ? _tmpProjFolder : new Instance('Folder', Workspace)
ProjectileFolder.Name = 'ProjectileFolder'

/** I use one caster for ALL projectiles. This simplifies everything, and uses less memory on the server! */
const PROJECTILE_CASTER = FastCast.new()

export const ProjectileMap: Map<string, PartialDeep<Projectile>> = new Map()

export interface Projectile {
  behavior: FastCast.FastCastBehavior
  velocity: number
  hit: (casterThatFired: FastCast.ActiveCast, result: RaycastResult, segmentVelocity: Vector3, cosmeticBulletObject?: Instance | undefined) => void
  lengthChanged: (casterThatFired: FastCast.ActiveCast, lastPoint: Vector3, rayDir: Vector3, displacement: number, segmentVelocity: Vector3, cosmeticBulletObject?: Instance | undefined) => void
  pierced: (casterThatFired: FastCast.ActiveCast, result: RaycastResult, segmentVelocity: Vector3, cosmeticBulletObject?: Instance | undefined) => void
  terminated: (casterThatFired: FastCast.ActiveCast) => void
}

const defaultBehavior = FastCast.newBehavior()
defaultBehavior.RaycastParams = new RaycastParams();
(defaultBehavior as unknown as { CosmeticBulletContainer: Instance }).CosmeticBulletContainer = ProjectileFolder

export const defaultOptions: Projectile = {
  behavior: defaultBehavior,
  velocity: 100,
  hit: () => {},
  lengthChanged: () => {},
  pierced: () => {},
  terminated: () => {}
}

const currentOptions: Projectile = Object.copy(defaultOptions)

PROJECTILE_CASTER.RayHit.Connect((...args) => currentOptions.hit(...args))
PROJECTILE_CASTER.LengthChanged.Connect((...args) => currentOptions.lengthChanged(...args))
PROJECTILE_CASTER.RayPierced.Connect((...args) => currentOptions.pierced(...args))
PROJECTILE_CASTER.CastTerminating.Connect((...args) => currentOptions.terminated(...args))

export function add (name: string, projectile: PartialDeep<Projectile>): PartialDeep<Projectile> {
  ProjectileMap.set(name, projectile)
  return projectile
}

if (isServer()) {
  ipcServer.getEvent('projectileFired')
}

function addIgnore (projectile: PartialDeep<Projectile>, ignore: Instance): PartialDeep<Projectile> {
  // copy the projectile
  const out = Object.deepCopy(projectile)
  if (out.behavior === undefined) {
    out.behavior = FastCast.newBehavior()
  }
  // since the behaviors raycastparams arent exact, lets just copy the properties over
  const params = new RaycastParams()
  if (out.behavior.RaycastParams !== undefined) {
    Object.assign(params, out.behavior.RaycastParams)
  }
  params.FilterDescendantsInstances = [ignore]
  out.behavior.RaycastParams = params
  $dbg(out)
  return out
}

/** Replicate a projectile from a player to all other players */
export function fireReplicated (origin: Vector3, direction: Vector3, player: Player, projectile: PartialDeep<Projectile>, ignore?: Instance): void {
  fire(origin, direction, projectile, ignore)
  if (isClient()) {
    return
  }
  let foundKey
  ProjectileMap.forEach((value, key) => {
    if (projectile === value) {
      foundKey = key
    }
  })
  if (foundKey !== undefined) {
    ipcServer.broadcast('projectileFired', tick(), origin, direction, player, foundKey, ignore)
  }
}

// TODO: make this follow a quadratic
/** If the projectile follows a straight path, predict where it will be in timeAhead seconds. */
export function predictPath (timeAhead: number, origin: Vector3, direction: Vector3, speed: number): Vector3 {
  return origin.add(direction.Unit.mul(timeAhead * speed))
}

export function fire (origin: Vector3, direction: Vector3, dataPacket: PartialDeep<Projectile>, ignore?: Instance): void {
  if (ignore !== undefined) {
    dataPacket = addIgnore(dataPacket, ignore)
  }
  let behaviorCopy
  if (dataPacket.behavior !== undefined) {
    behaviorCopy = Object.copy(dataPacket.behavior)
  }
  Object.assign(currentOptions, defaultOptions, dataPacket)
  Object.assign(currentOptions.behavior, defaultOptions.behavior)
  if (behaviorCopy !== undefined) {
    Object.assign(currentOptions.behavior, behaviorCopy)
  }
  PROJECTILE_CASTER.Fire(origin, direction, currentOptions.velocity, currentOptions.behavior)
}

/** Predict where the projectile will be based on how long ago it was shot. Only applies to no acceleration projectiles. */
export function firePredicted (
  time: number,
  origin: Vector3,
  direction: Vector3,
  dataPacket: PartialDeep<Projectile>,
  ignore?: Instance
): void {
  const speed = dataPacket.velocity ?? defaultOptions.velocity
  const predictedOrigin = predictPath(time, origin, direction, speed)
  const predictedDirection = direction.Unit.mul(time * speed)
  if (ignore !== undefined) {
    dataPacket = addIgnore(dataPacket, ignore)
  }
  const cosmeticBulletContainer =
    (dataPacket.behavior as unknown as { CosmeticBulletContainer?: Instance })?.CosmeticBulletContainer ??
    ProjectileFolder
  const params = dataPacket.behavior?.RaycastParams ?? new RaycastParams();
  (params.FilterDescendantsInstances as defined[]).push(cosmeticBulletContainer)
  if (ignore !== undefined) {
    (params.FilterDescendantsInstances as defined[]).push(ignore)
  }
  const result = PROJECTILE_CASTER.WorldRoot.Raycast(origin, predictedDirection, params as RaycastParams)
  if (result?.Instance !== undefined) {
    $print('test')
    // TODO: partcache joes
    const cosemeticBulletTemplate = dataPacket.behavior?.CosmeticBulletTemplate as BasePart | undefined
    // TODO: piercing
    const lengthChanged = dataPacket.lengthChanged ?? defaultOptions.lengthChanged
    const hit = dataPacket.hit ?? defaultOptions.hit
    const terminated = dataPacket.terminated ?? defaultOptions.terminated
    if (cosemeticBulletTemplate !== undefined) {
      const newProjectile = cosemeticBulletTemplate.Clone()
      newProjectile.Parent = cosmeticBulletContainer
      const ActiveCastRemake = {
        Caster: PROJECTILE_CASTER,

        StateInfo: {
          UpdateConnection: undefined as unknown as RBXScriptSignal,
          Paused: false,
          TotalRuntime: time,
          DistanceCovered: time * speed,
          IsActivelySimulatingPierce: false,
          Trajectories: [
            {
              StartTime: 0,
              EndTime: -1,
              Origin: origin,
              InitialVelocity: direction.mul(speed),
              Acceleration: dataPacket.behavior?.Acceleration as Vector3 ?? new Vector3()
            }
          ]
        },

        RayInfo: {
          Parameters: params as RaycastParams,
          WorldRoot: PROJECTILE_CASTER.WorldRoot,
          MaxDistance: dataPacket.behavior?.MaxDistance ?? 1000,
          CosmeticBulletObject: newProjectile,
          CanPierceCallback: dataPacket.behavior?.CanPierceFunction ?? (() => false)
        },
        UserData: {}
      } as unknown as FastCast.ActiveCast
      const distance = result.Position.sub(origin).Magnitude
      lengthChanged(ActiveCastRemake, origin, direction, distance, predictedDirection, newProjectile)
      hit(ActiveCastRemake, result, predictedDirection, newProjectile)
      terminated(ActiveCastRemake)
    }
  } else {
    fire(predictedOrigin, direction, dataPacket) // we already did the ignore
  }
}
