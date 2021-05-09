import Lerps from '@rbxts/lerp-functions'
import Roact from '@rbxts/roact'
import * as Flipper from '@rbxts/flipper'
import { Players } from '@rbxts/services'
import { promiseError } from 'shared/utils'
import { CharacterSelection } from './character'

const BarSizeInterp = Lerps.UDim2(new UDim2(0, 10, 1, 0), UDim2.fromScale(1, 1))
const BarColorInterp = Lerps.Color3(new Color3(0.8, 0.1, 0.1), new Color3(0.1, 0.8, 0.1))

type HealthbarProps = Partial<{ Health: number, Position: UDim2 }>

export class Healthbar extends Roact.PureComponent<HealthbarProps> {
  binding: Roact.Binding<number>
  motor: Flipper.SingleMotor

  constructor (props: HealthbarProps) {
    super(props)
    const health = (props.Health !== undefined ? props.Health : 100)
    this.motor = new Flipper.SingleMotor(health / 100)

    const [binding, setBinding] = Roact.createBinding(this.motor.getValue())
    this.binding = binding

    this.motor.onStep(setBinding)
  }

  didUpdate (previousProps: HealthbarProps, previousState: {}): void {
    // TODO: show health decrease where the decrease will flash white and fade out, instead of a simple tween
    const health = (this.props.Health !== undefined ? this.props.Health : 100)
    this.motor.setGoal(new Flipper.Spring(health / 100, {
      frequency: 6,
      dampingRatio: 0.65
    }))
  }

  public render (): Roact.Element | undefined {
    return (
      <frame
        Key='Healthbar'
        Size={UDim2.fromOffset(200, 15)}
        BackgroundColor3={new Color3(0.1, 0.1, 0.1)}
        Position={
          (this.props.Position !== undefined
            ? this.props.Position
            : UDim2.fromScale(0.5, 0.5))
        }
        AnchorPoint={new Vector2(0.5, 0.5)}
      >
        <uicorner Key='Corner' CornerRadius={new UDim(1, 0)} />
        <frame
          Key='HealthbarContent'
          Size={this.binding.map((value: number) => BarSizeInterp(math.clamp(value, 0, 1)).sub(UDim2.fromOffset(10, 10)))}
          Position={UDim2.fromOffset(5, 5)}
          BackgroundColor3={this.binding.map(BarColorInterp)}
          BorderSizePixel={0}
        >
          <uicorner Key='Corner' CornerRadius={new UDim(1, 0)} />
        </frame>
      </frame>
    )
  }
}

// TODO: cooldown bars
export class HudScreen extends Roact.PureComponent<{}, { Health: number }> {
  constructor () {
    super({})
    this.setState({ Health: 100 })

    const player = Players.LocalPlayer
    if (player !== undefined) {
      player.CharacterAdded.Connect((character: Model) => { this.updateHumanoid(character).catch(promiseError) })

      if (player.Character !== undefined) {
        this.updateHumanoid(player.Character)
          .catch(promiseError)
      }
    }
  }

  async updateHumanoid (character: Model): Promise<void> {
    const humanoid = character.WaitForChild('Humanoid') as Humanoid
    this.setState({ Health: humanoid.Health })
    humanoid.HealthChanged.Connect((health: number) => this.setState({ Health: health }))
  }

  public render (): Roact.Element | undefined {
    return (
      <frame
        Key='HUD'
        Size={UDim2.fromScale(1, 1)}
        BackgroundTransparency={1}
      >
        <Healthbar Position={new UDim2(0.5, 0, 1, -20)} Health={this.state.Health} />
        <CharacterSelection />
      </frame>
    )
  }
}
