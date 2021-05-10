import { ipcClient } from '@rbxts/abstractify'
import { Players } from '@rbxts/services'
import { ProjectileMap, firePredicted } from 'shared/hitreg/projectile'
import { promiseError } from 'shared/utils'
import * as SlaveClock from 'shared/hitreg/clock'
import mount from './ui'

mount()
  .catch(promiseError)

ipcClient.on('projectileFired', (time: number, origin: Vector3, direction: Vector3, player: Player, foundKey: string, ignore?: Instance) => {
  if (player === Players.LocalPlayer) {
    return
  }
  const projectile = ProjectileMap.get(foundKey)
  if (projectile !== undefined) {
    const timeAhead = SlaveClock.getTime() - time
    firePredicted(timeAhead, origin, direction, projectile, ignore)
  }
}).catch(promiseError)

// TODO: !! IMPORTANT !! find feasible place to put the time syncing.
