import RotatedRegion3 from '@rbxts/rotatedregion3'
import { Players } from '@rbxts/services'
import { warnThread } from 'shared/utils'
import { HitOptions, HitResult } from './regtils'

/** Options for a melee hit */
export interface MeleeOptions extends HitOptions {
  /** Maximum number of parts to hit */
  maxParts?: number
}

/**
 * Attempts to calculate if players are inside a given hitbox. By default, the calculation will be a blacklist.
 * @param cframe CFrame of melee hitbox.
 * @param size Size of melee hitbox.
 * @param options Options for the melee operation.
 */
export function tryMelee (cframe: CFrame, size: Vector3, options?: MeleeOptions): HitResult {
  if (options?.whitelist !== undefined && options.blacklist !== undefined) {
    warnThread()
    error('Unexpected state: both whitelist and blacklist are defined!')
  }
  const hbox = RotatedRegion3.Block(cframe, size) // TODO: install new ver of rr3 when the static callback bug is fixed
  let parts: Part[] | undefined
  if (options?.whitelist === undefined) {
    const ignore: Instance[] = []
    if (options?.blacklist !== undefined) {
      options.blacklist.forEach((value) => ignore.push(value))
    }
    // ignore player if given
    if (options?.ignorePlayer !== undefined && options.ignorePlayer.Character !== undefined) {
      ignore.push(options.ignorePlayer.Character)
    }
    parts = hbox.FindPartsInRegion3WithIgnoreList(ignore, options?.maxParts)
  } else {
    // all other options can be ignored
    parts = hbox.FindPartsInRegion3WithWhiteList(options.whitelist, options?.maxParts)
  }
  if (parts === undefined) {
    warnThread()
    error('Unexpected state: parts is undefined! This should be impossible!')
  }
  let hitPlayer: Player | undefined
  let hitHumanoid: Humanoid | undefined
  for (const part of parts) {
    if (hitPlayer === undefined) {
      hitPlayer = Players.GetPlayerFromCharacter(part.Parent)
    }
    if (hitHumanoid === undefined) {
      hitHumanoid = part.Parent?.FindFirstChild('Humanoid') as Humanoid | undefined
    }
  }
  return {
    hitAnything: !parts.isEmpty(),
    hitParts: parts,
    hitHumanoid: hitHumanoid,
    hitPlayer: hitPlayer
  }
}
