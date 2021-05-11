import { ipcServer } from '@rbxts/abstractify'
import Object from '@rbxts/object-utils'
import { isClient, isServer } from 'shared/utils'
import { PartialDeep } from '../regtils'
import {
  defaultOptions,
  Projectile,
  ProjectileMap,
  addIgnore,
  PROJECTILE_CASTER
} from './utils'

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
