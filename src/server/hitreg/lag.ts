
interface Limb {
  cframe: CFrame
  size: Vector3
}

/** A snapshot in time containing all the players and their positions */
export interface SnapshotItem {
  /** An array of players and their limbs, mapped by name */
  players: Array<Map<string, Limb>>
  markedTime: number
}

export class LagCompensation {
  stack: SnapshotItem[] = []
  lastDelta: number = 0

  update (delta: number): void {
    this.lastDelta = delta
  }

  // TODO: create addStackItem
  // addStackItem (snapshot): void {

  // }

  /** Get items from the stack closest to the time given. Returns multiple for interp. May return <2 */
  getSnapshots (time: number): SnapshotItem[] {
    const out: SnapshotItem[] = []
    let closestTime: number = math.huge
    let smallestItem: number | undefined
    const sortedStack = this.stack.sort((a, b) => a.markedTime < b.markedTime)
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
   * A recreated player out of parts. For use inside of a `WorldModel` for raycasting (& hopefully melee stuff)
   * @param time The time closest to find
   */
  // TODO: create getRecreatedPlayer
  // getRecreatedPlayer (time: number): Model {

  // }
}
