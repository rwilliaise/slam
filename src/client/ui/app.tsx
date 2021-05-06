import Roact from '@rbxts/roact'
import { HudScreen } from './hud'

export class App extends Roact.PureComponent {
  render (): Roact.Element {
    return (
      <screengui ResetOnSpawn={false}>
        <HudScreen />
      </screengui>
    )
  }
}
