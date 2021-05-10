import { ipcClient, ipcServer } from '@rbxts/abstractify'
import FastCast from '@rbxts/fastcast'
import Object from '@rbxts/object-utils'
import { Players, Workspace } from '@rbxts/services'
import { $dbg, $print } from 'rbxts-transform-debug'
import { isClient, isServer, promiseError } from 'shared/utils'
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

const defaultOptions: Projectile = {
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
    ipcServer.broadcast('projectileFired', origin, direction, player, foundKey, ignore)
  }
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

if (isClient()) {
  ipcClient.on('projectileFired', (origin: Vector3, direction: Vector3, player: Player, foundKey: string, ignore?: Instance) => {
    if (player === Players.LocalPlayer) {
      return
    }
    const projectile = ProjectileMap.get(foundKey)
    if (projectile !== undefined) {
      fire(origin, direction, projectile, ignore)
    }
  }).then((value) => {
    $print(value)
  }).catch(promiseError)
}
