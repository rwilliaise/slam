import { ipcClient } from '@rbxts/abstractify'
import { Players } from '@rbxts/services'
import { fire, ProjectileMap, ProjectilePredictor } from 'shared/hitreg/projectile'
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
    const accel = projectile.behavior?.Acceleration
    if (accel !== undefined && accel.Magnitude !== 0) {
      fire(origin, direction, projectile, ignore)
    } else {
      const timeAhead = SlaveClock.getTime() - time
      let predictor
      if (ignore !== undefined) {
        predictor = new ProjectilePredictor(timeAhead, origin, direction, projectile, ignore)
      } else {
        predictor = new ProjectilePredictor(timeAhead, origin, direction, projectile)
      }
      predictor.fire()
    }
  }
}).catch(promiseError)
