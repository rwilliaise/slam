import Roact from '@rbxts/roact'
import { CharacterSelection } from '../character'

export = (target: Instance) => {
  const mountTree = Roact.mount(
    <CharacterSelection />,
    target
  )

  return () => {
    Roact.unmount(mountTree)
  }
}
