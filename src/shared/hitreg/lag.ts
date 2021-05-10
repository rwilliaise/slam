/**
 * Fair warning - this file is a little magic. I would not mess with any of the lag compensation stuff as it could
 * easily go wrong. If you ever have to deal with directly screwing with lag compensation, a few pointers:
 *
 * 1. The only thing you probably need is .getRecreatedPlayer(time: number) and .update(delta: number).
 *    It sounds crazy but the rest of the module functions are completely useless to any outside functions.
 *    I export them only when they ARE useful to outside functions. By that point, they should be moved into this file.
 * 2. Don't. Change. Any. Code.
 *    This is basically trying to handle glass - it's gonna break eventually. I wouldn't really touch any functions or
 *    the code inside. It can lead to hard-to-fix bugs which will plague large portions of the code, forever... pretty
 *    much.
 * 3. Keep OOP out of the picture.
 *    There shouldn't really be any OOP here; there only really needs to be one lag compensation instance. More than
 *    that, and it'll start lagging.
 */

import { Players } from '@rbxts/services'
import { LAG_COMP_MEMORY_SECONDS, LAG_COMP_MEMORY_SIZE, LAG_COMP_RESOLUTION } from 'shared/hitreg/regtils'

/** A players limb. Should reconstruct the original limb with as little data we can give. */
interface Limb {
  // FIXME: don't use cframe, its 2x bigger than storing position and rotation manually
  cframe: CFrame
  size: Vector3
}

/** A snapshot in time containing all the players and their positions */
export interface SnapshotItem {
  /** An map of player usernames (not DisplayNames) and their limbs, mapped by name */
  players: Map<string, Map<string, Limb>>
  markedTime: number
}

let stack: SnapshotItem[] = []
let deltaCombined: number = 0

/** Call this every frame. It will automatically handle the configuration. */
export function update (delta: number): void {
  if ((deltaCombined += delta) >= LAG_COMP_RESOLUTION) {
    deltaCombined = 0
    snapshot()
  }
}

/** Prunes the stack of any old snapshots. */
export function prune (): void {
  const currentTime = tick()
  stack = stack.filter((value, index) => currentTime - value.markedTime < LAG_COMP_MEMORY_SECONDS && index < LAG_COMP_MEMORY_SIZE)
}

/** Takes a snapshot of all characters and adds it to the stack */
export function snapshot (): void {
  prune()
  const outPlayers = new Map<string, Map<string, Limb>>()
  for (const player of Players.GetPlayers()) {
    if (player.Character !== undefined) {
      outPlayers.set(player.Name, fromCharacter(player.Character))
    }
  }
  stack.insert(0, { players: outPlayers, markedTime: tick() })
}

export function fromCharacter (character: Model): Map<string, Limb> {
  const out = new Map<string, Limb>()
  for (const limb of character.GetChildren()) {
    if (limb.IsA('BasePart')) {
      out.set(limb.Name, { size: limb.Size, cframe: limb.CFrame })
    }
  }
  return out
}

/** Get items from the stack closest to the time given. Returns multiple for interp. Returns <=2 snapshots */
export function getSnapshots (time: number): SnapshotItem[] {
  const out: SnapshotItem[] = []
  let closestTime: number = math.huge
  let smallestItem: number | undefined
  const sortedStack = stack.sort((a, b) => a.markedTime < b.markedTime)
  // first, get the snapshot closest to the time given
  for (let i = 0; i < sortedStack.size(); i++) {
    const item = sortedStack[i]
    if (math.abs(item.markedTime - time) < closestTime) {
      smallestItem = i
      closestTime = math.abs(item.markedTime - time)
    }
  }
  if (smallestItem === undefined) { // the snapshot stack is empty, and we can't find any times smaller than math.huge
    return out
  }
  out.push(sortedStack[smallestItem])
  // closest is behind time
  if (closestTime < time && sortedStack.size() < smallestItem + 1) {
    out.push(sortedStack[smallestItem + 1])
  } else if (closestTime > time && smallestItem - 1 >= 0) { // closest is after time
    out.push(sortedStack[smallestItem - 1])
  } else {
    // this is ignored, and should be accounted for when using getSnapshots
  }
  return out
}

/**
 * Takes two snapshots and a time between their marked times, and maps the times to a value between 0-1.
 *
 * As a visual example, if we have snapshots at Time 1 and Time 3, and `time` equals Time 2, this function will
 * return 0.5. This sounds unintuitive until you notice that 0.5 is one half - and 2 is halfway between 1 and 3.
 */
export function remapSnapshots (snapshots: SnapshotItem[], time: number): number {
  // this is an invalid state, so just return 1
  if (snapshots.size() !== 2) {
    return 1
  }

  // again, invalid state. just return 1
  // this should be impossible but spaghetti needs to be accounted for
  if (snapshots[0].markedTime === snapshots[1].markedTime) {
    return 1
  }

  let largestTime = snapshots[1] // guess that last element is largest
  let smallestTime = snapshots[0]

  if (largestTime.markedTime < smallestTime.markedTime) {
    largestTime = smallestTime
    smallestTime = snapshots[1]
  }

  const difference = largestTime.markedTime - smallestTime.markedTime // the time between the snapshots
  const between = largestTime.markedTime - time // from the largest time to the smallest
  return between / difference
}

export function interpolateLimbs (start: Map<string, Limb>, goal: Map<string, Limb>, alpha: number): Limb[] {
  const out: Limb[] = []
  for (const [name, limb] of start) {
    const goalLimb = goal.get(name)
    if (goalLimb !== undefined) {
      out.push({
        cframe: limb.cframe.Lerp(goalLimb.cframe, alpha),
        size: limb.size.Lerp(goalLimb.size, alpha) // rare, but should account for it
      })
    }
  }
  return out
}

export function reconstruct (limbs: Limb[]): Part[] {
  const out: Part[] = []
  limbs.forEach((limb) => {
    const limbOut = new Instance('Part')
    limbOut.Anchored = true
    limbOut.CFrame = limb.cframe
    limbOut.Size = limb.size
    out.push(limbOut)
  })
  return out
}

/**
 * A recreated player out of parts at Time `time`. For use inside of a `WorldModel` for raycasting (& hopefully melee
 * stuff)
 * @param name The player name to find
 * @param time The time closest to find
 */
export function getRecreatedPlayer (name: string, time: number): Model {
  const outModel = new Instance('Model')
  const snapshots = getSnapshots(time)
  let limbs: Limb[] | undefined
  if (snapshots.size() === 2) {
    const alpha = remapSnapshots(snapshots, time)
    const snapshot1 = snapshots[0].players.get(name)
    const snapshot2 = snapshots[1].players.get(name)
    if (snapshot1 === undefined || snapshot2 === undefined) {
      return outModel
    }
    limbs = interpolateLimbs(snapshot1, snapshot2, alpha)
  } else if (snapshots.size() === 1) {
    const snapshot = snapshots[0].players.get(name)
    if (snapshot === undefined) {
      return outModel
    }
    limbs = []
    snapshot.forEach((value) => limbs?.push(value))
  } else if (snapshots.isEmpty()) {
    // we don't need to do anything more
    return outModel
  }
  if (limbs === undefined) { // either #snapshots > 3, or another edge case broke this
    return outModel
  }
  const reconstructed = reconstruct(limbs)
  reconstructed.forEach((part) => { part.Parent = outModel })
  return outModel
}
