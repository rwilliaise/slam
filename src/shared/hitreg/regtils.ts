
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
