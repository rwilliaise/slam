import FastCast from '@rbxts/fastcast'
import Object from '@rbxts/object-utils'
import { PartialDeep } from '../regtils'
import { $dbg } from 'rbxts-transform-debug'
import { Workspace } from '@rbxts/services'

/** I use one caster for ALL projectiles. This simplifies everything, and uses less memory on the server! */
export const PROJECTILE_CASTER = FastCast.new()

const _tmpProjFolder = Workspace.FindFirstChild('ProjectileFolder')
export const ProjectileFolder = (_tmpProjFolder !== undefined) ? _tmpProjFolder : new Instance('Folder', Workspace)
ProjectileFolder.Name = 'ProjectileFolder'

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

/** Copy a projectile data packet and add an ignore */
export function addIgnore (projectile: PartialDeep<Projectile>, ...ignores: Instance[]): PartialDeep<Projectile> {
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
  params.FilterDescendantsInstances = ignores
  out.behavior.RaycastParams = params
  $dbg(ignores)
  $dbg(out)
  return out
}
