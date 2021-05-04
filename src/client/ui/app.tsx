import Roact from '@rbxts/roact'

export class App extends Roact.PureComponent {
  render (): Roact.Element {
    return <screengui ResetOnSpawn={false} />
  }
}
