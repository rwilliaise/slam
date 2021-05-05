import Roact from '@rbxts/roact'
import { Alert } from '../alert'

export = (target: Instance) => {
  const mountTree = Roact.mount(
    <Alert Text='Seems like your data got trolled!' ButtonText='okay, whatever' />,
    target
  )

  return () => {
    Roact.unmount(mountTree)
  }
}
