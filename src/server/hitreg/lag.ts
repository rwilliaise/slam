
interface Limb {
  cframe: CFrame
  size: Vector3
}

/** A snapshot in time containing all the players and their positions */
export interface SnapshotItem {
  /** A 2d array where each array inside is a player and their limbs */
  players: Limb[][]
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

  /** Get an item from the stack closest to the time given */
  getSnapshot (time: number): SnapshotItem | undefined {
    let smallestItem: SnapshotItem | undefined
    let found = false
    /*
     loop through the stack, and see which item is less than time
     as an example, if we had a snapshot at time 1 and time 2, and someone requested a time at 1.5, we should return
     time 1
     */
    for (let i = 0; i < this.stack.size(); i++) {
      const stackItem = this.stack[i]
      if (stackItem.markedTime > time) {
        smallestItem = stackItem
      } else { // if it is less than time
        if (i === 0) { // unlikely edge-case
          smallestItem = stackItem
        }
        found = true
        break
      }
    }
    if (found) { // definite the smallest item
      return smallestItem
    } else if (smallestItem !== undefined) { // we finished w/o
      if (smallestItem.markedTime - time > 0.1) { // this is wayy out of range

      }
    }
  }

  /**
   * A recreated player out of parts. For use inside of a `WorldModel` for raycasting (& hopefully melee stuff)
   * @param time The time closest to find
   */
  // TODO: create getRecreatedPlayer
  // getRecreatedPlayer (time: number): Model {

  // }
}
