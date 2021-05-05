import Roact from '@rbxts/roact'
import { HudScreen } from '../hud'

export = (target: Instance) => {
  const mountTree = Roact.mount(<HudScreen />, target)

  return () => Roact.unmount(mountTree)
}
