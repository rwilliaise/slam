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

/** A players limb. Should reconstruct the original limb with as little data we can give. */
interface Limb {
  cframe: CFrame
  size: Vector3
}

/** A snapshot in time containing all the players and their positions */
export interface SnapshotItem {
  // FIXME: less memory intensive maps
  /** An map of player userids and their limbs, mapped by name */
  players: Map<number, Map<string, Limb>>
  markedTime: number
}

const stack: SnapshotItem[] = []

export function update (): void {
  // TODO: add continual snapshotting
}

// TODO: create addStackItem
// addStackItem (snapshot): void {

// }

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

  // TODO: create remapping
  return 1
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

/**
 * A recreated player out of parts at Time `time`. For use inside of a `WorldModel` for raycasting (& hopefully melee
 * stuff)
 * @param time The time closest to find
 */
// TODO: get WorldModel rotatedregion3s working, or another workaround
export function getRecreatedPlayer (time: number): Model {
  const outModel = new Instance('Model')
  const snapshots = getSnapshots(time)
  if (snapshots.size() === 2) {

  } else if (snapshots.isEmpty()) {
    // we don't need to do anything more
    return outModel
  }
  return outModel
}
