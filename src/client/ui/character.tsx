import { ipcClient } from '@rbxts/abstractify'
import Roact from '@rbxts/roact'
import { Characters } from 'shared/characters'
import { promiseError } from 'shared/utils'

function pressed (name: string): () => void {
  return () => {
    ipcClient.emit('chooseCharacter').catch(promiseError)
  }
}

function CharacterButton (props: { Name: string }): Roact.Element {
  return (
    // TODO: make actual character icons
    // TODO: better design for this tab
    <textbutton
      Text={props.Name}
      Key={props.Name}
      Event={{ Activated: pressed(props.Name) }}
    />
  )
}

function getCharacterButtons (): Roact.Element[] {
  const out: Roact.Element[] = []
  Characters.forEach((_, key) => {
    out.push(<CharacterButton Name={key} />)
  })
  return out
}

export function CharacterSelection (): Roact.Element {
  return (
    <frame
      Key='CharacterSelection'
      Size={UDim2.fromScale(0.75, 0.75)}
      AnchorPoint={new Vector2(0.5, 0.5)}
      Position={UDim2.fromScale(0.5, 0.5)}
      BackgroundColor={new BrickColor('Really black')}
      BackgroundTransparency={0.7}
    >
      <uicorner CornerRadius={new UDim(0, 5)} />
      <uistroke Enabled />
      <frame
        Key='Content'
        Size={new UDim2(1, -10, 1, -10)}
        AnchorPoint={new Vector2(0.5, 0.5)}
        Position={UDim2.fromScale(0.5, 0.5)}
        BackgroundTransparency={1}
      >
        <uigridlayout Key='Layout' />
        {
          getCharacterButtons()
        }
      </frame>
    </frame>
  )
}
