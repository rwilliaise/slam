import Roact from '@rbxts/roact'
import { Healthbar } from '../hud'

class HealthbarTest extends Roact.PureComponent<{}, { health: number }> {
  constructor () {
    super({})
    this.setState({ health: 100 })
  }

  focusLost: (box: TextBox, e: boolean, obj: InputObject) => void
  = (textBox, enterPressed, inputObject) => {
    if (enterPressed) {
      const health = tonumber(textBox.Text)
      this.setState({ health: health !== undefined ? health : 100 })
    }
  }

  public render (): Roact.Element | undefined {
    return (
      <frame
        Key='HealthbarTest'
        Size={UDim2.fromScale(0.5, 0.5)}
        Position={UDim2.fromScale(0.5, 0.5)}
        AnchorPoint={new Vector2(0.5, 0.5)}
      >
        <Healthbar Health={this.state.health} />
        <textbox
          Key='HealthBox'
          Text=''
          PlaceholderText='Enter Health'
          Position={UDim2.fromScale(0, 0.75)}
          Size={UDim2.fromScale(1, 0.25)}
          BackgroundColor3={new Color3(1, 1, 1)}
          Event={{ FocusLost: this.focusLost }}
        />
      </frame>
    )
  }
}

export = (target: Instance) => {
  const mountTree = Roact.mount(<HealthbarTest />, target)

  return () => Roact.unmount(mountTree)
}
