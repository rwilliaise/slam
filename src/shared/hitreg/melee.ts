import { HitParams } from './regtils'
import { isServer } from 'shared/utils'
// import * as LagCompensation from './lag'

export class MeleeRegistrar {
  _hitEvent = new Instance('BindableEvent')
  hit: RBXScriptSignal<(hitHumanoids: Humanoid[]) => void> = this._hitEvent.Event
  options: HitParams = {}

  fire (origin: Vector3, direction: Vector3): void {
    if (isServer()) {

    }
  }
}

// /**
//  * Attempts to calculate if players are inside a given hitbox. By default, the calculation will be a blacklist.
//  * @param cframe CFrame of melee hitbox.
//  * @param size Size of melee hitbox.
//  * @param options Options for the melee operation.
//  */
// export function unCompensatedTryMelee (cframe: CFrame, size: Vector3, options?: MeleeOptions): HitResult {
//   if (options?.whitelist !== undefined && options.blacklist !== undefined) {
//     warnThread()
//     error('Unexpected state: both whitelist and blacklist are defined!')
//   }
//   const hbox = RotatedRegion3.Block(cframe, size) // TODO: install new ver of rr3 when the static callback bug is fixed
//   let parts: Part[] | undefined
//   if (options?.whitelist === undefined) {
//     const ignore: Instance[] = []
//     if (options?.blacklist !== undefined) {
//       options.blacklist.forEach((value) => ignore.push(value))
//     }
//     // ignore player if given
//     if (options?.ignorePlayers !== undefined) {
//       if (type(options?.ignorePlayers) === 'table') {
//         ((options.ignorePlayers as Player[])
//           .mapFiltered((value) => value.Character))
//           .forEach((value) => ignore.push(value))
//       } else if ((options.ignorePlayers as Player).Character !== undefined) {
//         ignore.push((options.ignorePlayers as Player).Character as Model)
//       }
//     }
//     parts = hbox.FindPartsInRegion3WithIgnoreList(ignore, options?.maxParts)
//   } else {
//     // all other options can be ignored
//     parts = hbox.FindPartsInRegion3WithWhiteList(options.whitelist, options?.maxParts)
//   }
//   if (parts === undefined) {
//     warnThread()
//     error('Unexpected state: parts is undefined! This should be impossible!')
//   }
//   let hitPlayer: Player | undefined
//   let hitHumanoid: Humanoid | undefined
//   for (const part of parts) {
//     if (hitPlayer === undefined) {
//       hitPlayer = Players.GetPlayerFromCharacter(part.Parent)
//     }
//     if (hitHumanoid === undefined) {
//       hitHumanoid = part.Parent?.FindFirstChild('Humanoid') as Humanoid | undefined
//     }
//   }
//   return {
//     hitAnything: !parts.isEmpty(),
//     hitParts: parts,
//     hitHumanoid: hitHumanoid,
//     hitPlayer: hitPlayer
//   }
// }

// export function compensatedTryMelee (cframe: CFrame, size: Vector3, time: number, options?: MeleeOptions): HitResult {
//   if (isClient()) {
//     return unCompensatedTryMelee(cframe, size)
//   }
//   const inRange = Players.GetPlayers()
//     .filter((value) => value !== options?.ignorePlayers)
//     .filter((value) => {
//       if (type(options?.ignorePlayers) === 'table') {
//         return (options?.ignorePlayers as Player[]).includes(value)
//       }
//       return true
//     })
//     .mapFiltered((value) => value.Character)
//     .filter((value) => {
//       const magnitude = (value.FindFirstChild('HumanoidRootPart') as BasePart | undefined)?.Position.sub(cframe.Position).Magnitude
//       if (magnitude !== undefined) {
//         return magnitude < size.Magnitude
//       }
//       return false
//     })
//     .mapFiltered((value) => LagCompensation.getRecreatedPlayer(value.Name, time))
//   return {
//     hitAnything: false
//   }
// }
