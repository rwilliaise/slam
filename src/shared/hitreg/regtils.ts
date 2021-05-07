/** How much time should lag compensation remember. Adjust this if moves are frequently missing, but leave it low. */
export const LAG_COMP_MEMORY_SECONDS = 1
/** How many snapshots should lag compensation remember. Keep in mind that snapshots are expensive for memory. */
export const LAG_COMP_MEMORY_SIZE = 15
/** How many seconds between snapshots; in other words the resolution of lag compensation. Should be >=0.1 */
export const LAG_COMP_RESOLUTION = 0.1

/** Result of a hit */
export interface HitResult {
  /** Parts that were hit */
  hitParts?: BasePart[]
  /** Part that was hit (for raycasts) */
  hitPart?: BasePart
  /** Hit player, if there was one */
  hitPlayer?: Player
  /** Hit humanoid, if there was */
  hitHumanoid?: Humanoid
  /** Used to see if the hit had hit anything */
  hitAnything: boolean
}

/** Options for a hit calculation */
export interface HitOptions {
  /** Ignore specific player */
  ignorePlayer?: Player
  /** Ignore all water (does not apply to melee) */
  ignoreWater?: boolean
  /** A list of Instances (including their children) to seek out when casting. Mutally exclusive with `blacklist`. */
  whitelist?: Instance[]
  /** A list of Instances (including their children) to ignore when casting. Mutally exclusive with `whitelist`. */
  blacklist?: Instance[]
}
