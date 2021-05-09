import { ipcClient } from '@rbxts/abstractify'
import Roact from '@rbxts/roact'
import { ContextActionService, RunService } from '@rbxts/services'
import { selectCharacter } from 'client/selection'
import { $print } from 'rbxts-transform-debug'
import CharacterMetadata from 'shared/character/metadata.json'
import { promiseError } from 'shared/utils'

type ChangeCharacter = (character: Character) => () => void

interface Character {
  id: string
  name: string
  description: string
  image: string
  info: {
    health: number
    speed: string
    damage: string
  }
  strategies: string[]
}

interface CharacterButtonProps {
  Character: Character
  ChangeCharacter: ChangeCharacter
}

function CharacterButton (props: CharacterButtonProps): Roact.Element {
  return (
    <textbutton
      Key={props.Character.name}
      BackgroundTransparency={0.7}
      BackgroundColor3={new Color3(0, 0, 0)}
      Text=''
      Event={{ Activated: props.ChangeCharacter(props.Character) }}
    >
      <uipadding
        Key='Padding'
        PaddingBottom={new UDim(0, 5)}
        PaddingTop={new UDim(0, 5)}
        PaddingLeft={new UDim(0, 5)}
        PaddingRight={new UDim(0, 5)}
      />
      <imagelabel
        Key='Icon'
        Size={UDim2.fromScale(1, 1)}
        Image={props.Character.image}
        BackgroundTransparency={1}
      />
      <textlabel
        Key='Label'
        Size={UDim2.fromScale(1, 0.2)}
        Position={UDim2.fromScale(0, 0.8)}
        Text={props.Character.name}
        BackgroundTransparency={1}
        TextColor3={new Color3(1, 1, 1)}
        Font={Enum.Font.GothamBlack}
        FontSize={Enum.FontSize.Size24}
        TextStrokeTransparency={0}
      />
    </textbutton>
  )
}

function getCharacterButtons (changeCharacter: ChangeCharacter): Roact.Element[] {
  const out: Roact.Element[] = []
  CharacterMetadata.forEach((value) => {
    out.push(<CharacterButton ChangeCharacter={changeCharacter} Character={value} />)
  })
  return out
}

function CharacterInfo (props: { char: Character }): Roact.Element {
  return (
    <scrollingframe
      Key='Info'
      Size={new UDim2(0.4, -10, 1, -10)}
      Position={new UDim2(0.6, 5, 0, 5)}
      BackgroundTransparency={0.7}
      BackgroundColor={new BrickColor('Really black')}
      CanvasSize={UDim2.fromScale(0, 1.25)}
      AutomaticCanvasSize='Y'
      ScrollBarThickness={4}
    >
      <uipadding
        Key='Padding'
        PaddingBottom={new UDim(0, 5)}
        PaddingTop={new UDim(0, 5)}
        PaddingLeft={new UDim(0, 5)}
        PaddingRight={new UDim(0, 5)}
      />
      <uilistlayout
        Key='List'
        Padding={new UDim(0, 7)}
        HorizontalAlignment={Enum.HorizontalAlignment.Center}
        SortOrder={Enum.SortOrder.LayoutOrder}
      />
      <imagelabel
        Key='Icon'
        Size={UDim2.fromScale(0.5, 0.5)}
        AnchorPoint={new Vector2(0.5, 0.5)}
        Image={props.char.image}
        LayoutOrder={1}
        SizeConstraint={Enum.SizeConstraint.RelativeXX}
      />
      <textlabel
        Key='Title'
        Text={props.char.name.upper()}
        Size={new UDim2(1, 0, 0, 30)}
        BackgroundTransparency={1}
        TextColor3={new Color3(1, 1, 1)}
        Font={Enum.Font.GothamBlack}
        FontSize={Enum.FontSize.Size24}
        AutomaticSize='Y'
        LayoutOrder={2}
      />
      <textlabel
        Key='Description'
        Text={props.char.description}
        Size={new UDim2(1, 0, 0, 0)}
        BackgroundTransparency={1}
        TextColor3={new Color3(1, 1, 1)}
        Font={Enum.Font.GothamBold}
        FontSize={Enum.FontSize.Size18}
        TextYAlignment={Enum.TextYAlignment.Top}
        AutomaticSize='Y'
        LayoutOrder={3}
        TextWrap
      />
      <textlabel
        Key='Stats'
        Text={`${props.char.info.health} HP / ${props.char.info.damage} DMG / ${props.char.info.speed} SPD`}
        Size={new UDim2(1, 0, 0, 0)}
        BackgroundTransparency={1}
        TextColor3={new Color3(1, 1, 1)}
        Font={Enum.Font.GothamBold}
        FontSize={Enum.FontSize.Size12}
        AutomaticSize='Y'
        TextYAlignment={Enum.TextYAlignment.Top}
        LayoutOrder={4}
        TextWrap
      />
      <textlabel
        Key='Strategies'
        Text='STRATEGIES'
        Size={new UDim2(1, 0, 0, 30)}
        BackgroundTransparency={1}
        TextColor3={new Color3(1, 1, 1)}
        Font={Enum.Font.GothamBlack}
        FontSize={Enum.FontSize.Size24}
        AutomaticSize='Y'
        LayoutOrder={5}
      />
      {
        props.char.strategies.map((value, index) =>
          <textlabel
            Key={index}
            Text={`- ${value}`}
            Size={new UDim2(1, 0, 0, 0)}
            BackgroundTransparency={1}
            TextColor3={new Color3(1, 1, 1)}
            Font={Enum.Font.GothamBold}
            FontSize={Enum.FontSize.Size12}
            LineHeight={1.5}
            TextYAlignment={Enum.TextYAlignment.Top}
            AutomaticSize='Y'
            LayoutOrder={6 + index}
            TextWrap
          />)
      }
    </scrollingframe>
  )
}

class PlayButton extends Roact.PureComponent<{ Pressed: () => void }> {
  static NO_HOVER = new Vector2(0, 0)
  static HOVER = new Vector2(0, 48)

  binding: Roact.Binding<Vector2>
  setBinding: (value: Vector2) => void

  constructor (props: { Pressed: () => void }) {
    super(props)
    const [binding, setBinding] = Roact.createBinding(PlayButton.NO_HOVER)
    this.binding = binding
    this.setBinding = setBinding
  }

  onHover: () => void = () => {
    this.setBinding(PlayButton.HOVER)
  }

  onUnhover: () => void = () => {
    this.setBinding(PlayButton.NO_HOVER)
  }

  public render (): Roact.Element | undefined {
    return (
      <imagebutton
        Key='Play'
        Image='rbxassetid://5781746911'
        Size={UDim2.fromScale(0.5, 1)}
        Position={UDim2.fromScale(0.25, 0)}
        BorderColor3={Color3.fromRGB(0, 112, 1)}
        BackgroundColor3={Color3.fromRGB(48, 113, 169)}
        Event={{ MouseEnter: this.onHover, MouseLeave: this.onUnhover, Activated: this.props.Pressed }}
        ImageRectSize={new Vector2(0, 48)}
        ImageRectOffset={this.binding}
      >
        <textlabel
          Text='PLAY'
          Size={UDim2.fromScale(1, 1)}
          TextColor3={new Color3(1, 1, 1)}
          TextSize={40}
          Font={Enum.Font.SourceSans}
          BackgroundTransparency={1}
        />
      </imagebutton>
    )
  }
}

export class CharacterSelection extends Roact.PureComponent<{}, { SelectedCharacter?: Character, Open: boolean }> {
  constructor () {
    super({})
    this.setState({
      SelectedCharacter: CharacterMetadata[0],
      Open: true
    })
    if (RunService.IsRunning()) {
      ContextActionService.BindAction('OpenSelection', (_, state) => {
        if (state === Enum.UserInputState.Begin) {
          this.openScreen()
        }
      }, true, Enum.KeyCode.M)
    }
  }

  willUnmount (): void {
    ContextActionService.UnbindAction('OpenSelection')
  }

  changeCharacter: ChangeCharacter = (character: Character) => {
    return () => {
      $print('Selecting!')
      this.setState({
        SelectedCharacter: character
      })
    }
  }

  submitCharacter: () => void = () => {
    this.setState({
      Open: false
    })
    ipcClient.emit('characterSelect', this.state.SelectedCharacter?.id).catch(promiseError)
    if (this.state.SelectedCharacter !== undefined) {
      selectCharacter(this.state.SelectedCharacter.id)
    }
  }

  openScreen: () => void = () => {
    this.setState({
      Open: true
    })
  }

  public render (): Roact.Element | undefined {
    const char = this.state.SelectedCharacter
    return this.state.Open
      ? (
        <frame
          Key='CharacterSelection'
          Size={UDim2.fromScale(0.75, 0.75)}
          AnchorPoint={new Vector2(0.5, 0.5)}
          Position={UDim2.fromScale(0.5, 0.5)}
          BackgroundColor={new BrickColor('Really black')}
          BackgroundTransparency={0.7}
        >
          <uicorner Key='UICorner' CornerRadius={new UDim(0, 5)} />
          <uistroke Key='UIStroke' Enabled />
          <frame
            Key='Content'
            Size={new UDim2(0.6, -10, 0.8, -10)}
            Position={new UDim2(0, 5, 0, 5)}
            BackgroundTransparency={1}
          >
            <uigridlayout Key='Layout' />
            {
              getCharacterButtons(this.changeCharacter)
            }
          </frame>
          <frame
            Key='Button'
            Size={new UDim2(0.6, -10, 0.2, -10)}
            Position={new UDim2(0, 5, 0.8, 5)}
            BackgroundTransparency={1}
          >
            <PlayButton Pressed={this.submitCharacter} />
          </frame>
          {
            char !== undefined
              ? (<CharacterInfo char={char} />)
              : undefined
          }
        </frame>
      )
      : undefined
  }
}
