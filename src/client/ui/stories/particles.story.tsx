import Roact from '@rbxts/roact'
import { DefaultExplosion, OldExplosion } from 'client/fx/explosion'
import { Particle, ParticleOptions } from 'client/fx/particle'

const particles: Map<string, new(options?: ParticleOptions) => Particle> = new Map()
particles.set('explosion', DefaultExplosion)
particles.set('07 explosion', OldExplosion)

function buttonEvent (Class: new(options?: ParticleOptions) => Particle): () => void {
  return () => {
    new Class().play(new Vector3(0, 10, 0))
  }
}

function getList (): Roact.Element[] {
  const out: Roact.Element[] = []
  particles.forEach((value, key) => {
    out.push(<textbutton Event={{ Activated: buttonEvent(value) }} Text={key} BackgroundColor3={new Color3(1, 1, 1)} />)
  })
  return out
}

function ParticleTest (): Roact.Element {
  return (
    <frame
      AnchorPoint={new Vector2(0.5, 0.5)}
      Position={UDim2.fromScale(0.5, 0.5)}
      Size={UDim2.fromScale(0.5, 0.5)}
      SizeConstraint={Enum.SizeConstraint.RelativeYY}
    >
      <uigridlayout CellSize={new UDim2(1, 0, 0, 30)} />
      {
        getList()
      }
    </frame>
  )
}

export = (target: Instance) => {
  const tree = Roact.mount(<ParticleTest />, target)

  return () => Roact.unmount(tree)
}
