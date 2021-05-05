import * as Flipper from '@rbxts/flipper'
import Roact, { PureComponent } from '@rbxts/roact'

const AlertContentStyles = {
  TextColor3: Color3.fromRGB(255, 255, 255),
  TextYAlignment: Enum.TextYAlignment.Top,
  TextTruncate: Enum.TextTruncate.AtEnd,
  TextWrap: true,
  BackgroundTransparency: 1
}

interface AlertProps { Text: string, ButtonText: string }

export class Alert extends PureComponent<AlertProps, { Closed: boolean }> {
  motor: Flipper.SingleMotor
  closeBinding: Roact.Binding<number>

  constructor (props: AlertProps) {
    super(props)
    this.setState({ Closed: false })
    this.motor = new Flipper.SingleMotor(0)
    const [closeBinding, setCloseBinding] = Roact.createBinding(this.motor.getValue())
    this.closeBinding = closeBinding

    this.motor.onStep(setCloseBinding)
    this.motor.onComplete(() => this.setState({ Closed: true }))
  }

  close: () => void = () => {
    this.motor.setGoal(new Flipper.Spring(1, {
      frequency: 5,
      dampingRatio: 1
    }))
  }

  render (): Roact.Element {
    return this.state.Closed
      ? (<></>)
      : (
        <frame
          Key='Alert'
          BackgroundColor3={new Color3(0.25, 0.25, 0.25)}
          AnchorPoint={new Vector2(0.5, 0.5)}
          Size={this.closeBinding.map((value: number) => UDim2.fromOffset(300, 150).Lerp(new UDim2(), value))}
          Position={UDim2.fromScale(0.5, 0.5)}
        >
          <uicorner Key='Corner' CornerRadius={new UDim(0, 10)} />
          <textlabel
            Key='Title'
            Text='ALERT'
            Font={Enum.Font.GothamBlack}
            TextSize={24}
            Size={new UDim2(1, -30, 0.6, -30)}
            TextTransparency={this.closeBinding.map((value: number) => value)}
            Position={UDim2.fromOffset(15, 15)}
            {...AlertContentStyles}
          />
          <textlabel
            Key='Content'
            Font={Enum.Font.Gotham}
            Text={this.props.Text}
            TextSize={18}
            Size={new UDim2(1, -30, 0.5, -30)}
            TextTransparency={this.closeBinding.map((value: number) => value)}
            Position={new UDim2(0, 15, 0.2, 15)}
            {...AlertContentStyles}
          />
          <frame
            Key='HorizontalRule'
            Size={new UDim2(1, -30, 0, 1)}
            BorderSizePixel={0}
            Position={new UDim2(0, 15, 0.725, -15)}
            BackgroundTransparency={this.closeBinding.map((value: number) => value)}
            BackgroundColor3={new Color3(0.5, 0.5, 0.5)}
          />
          <textbutton
            Key='Button'
            Text={this.props.ButtonText.upper()}
            Size={new UDim2(1, -30, 0.2, 0)}
            Position={new UDim2(0.5, 0, 0.8, 0)}
            AnchorPoint={new Vector2(0.5, 0.5)}
            BackgroundColor3={new Color3(1, 1, 1)}
            Font={Enum.Font.GothamBold}
            TextTruncate={Enum.TextTruncate.AtEnd}
            TextSize={24}
            TextTransparency={this.closeBinding.map((value: number) => value)}
            BackgroundTransparency={this.closeBinding.map((value: number) => value)}
            TextColor3={new Color3()}
            AutoButtonColor={false}
            Event={{ Activated: this.close }}
          >
            <uicorner Key='Corner' CornerRadius={new UDim(0, 5)} />
          </textbutton>
        </frame>
      )
  }
}
