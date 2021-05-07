import Object from '@rbxts/object-utils'

/** Add to this instead of using generics on the class */
export interface ParticleOptions {
  size: number
  speed: number
}

export abstract class Particle {
  currentOptions: Partial<ParticleOptions> = {}

  constructor (options?: Partial<ParticleOptions>) {
    this.options({ size: 1, speed: 1 })
    if (options !== undefined) {
      this.options(options)
    }
  }

  options (options: Partial<ParticleOptions>): this {
    Object.assign(this.currentOptions, options)
    return this
  }

  abstract play (position: Vector3): void
}
