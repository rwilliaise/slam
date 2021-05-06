import Roact from '@rbxts/roact'
import { HudScreen } from './hud'

// TODO: seperate some components, possibly move the health up from Healthbar
export class App extends Roact.PureComponent {
  render (): Roact.Element {
    return (
      <screengui ResetOnSpawn={false}>
        <HudScreen />
      </screengui>
    )
  }
}
