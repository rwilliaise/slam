import { Players } from '@rbxts/services'
import { $warn } from 'rbxts-transform-debug'
import { ChadCharacter } from 'shared/character/chad'
import mount from './ui'

const chad = new ChadCharacter(Players.LocalPlayer)
chad.think(0.1)

mount()
  .catch((err) => { $warn(err) })
