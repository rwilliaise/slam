import { Players } from '@rbxts/services'
import { PityCharacter } from 'shared/character/pity'
import { promiseError } from 'shared/utils'
import mount from './ui'

const chad = new PityCharacter(Players.LocalPlayer)
chad.pollEvents()

mount()
  .catch(promiseError)

// TODO: !! IMPORTANT !! find feasible place to put the time syncing.
