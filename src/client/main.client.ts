import { $warn } from 'rbxts-transform-debug'
import mount from './ui'

mount()
  .catch((err) => { $warn(err) })
