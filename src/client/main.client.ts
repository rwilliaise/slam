import { promiseError } from 'shared/utils'
import mount from './ui'

mount()
  .catch(promiseError)

// TODO: !! IMPORTANT !! find feasible place to put the time syncing.
