import { Players } from '@rbxts/services'
import { ChadCharacter } from 'shared/character/chad'
import { promiseError } from 'shared/utils'
import mount from './ui'

const chad = new ChadCharacter(Players.LocalPlayer)
chad.pollEvents()

mount()
  .catch(promiseError)

// TODO: !! IMPORTANT !! find feasible place to put the time syncing.
