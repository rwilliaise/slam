import { ipcServer } from '@rbxts/abstractify'
import { ReplicatedStorage } from '@rbxts/services'
import { $print } from 'rbxts-transform-debug'
import { promiseError } from 'shared/utils'

const _sync = ReplicatedStorage.FindFirstChild('SyncHitreg') as RemoteFunction | undefined
const SyncFunction = _sync !== undefined ? _sync : new Instance('RemoteFunction', ReplicatedStorage)
SyncFunction.Name = 'SyncHitreg'

if (_sync === undefined) {
  ipcServer.on('syncHitreg', (player: Player) => {
    ipcServer.emit('syncHitreg', player, tick()).catch(promiseError)
  }).catch(promiseError)

  SyncFunction.OnServerInvoke = (player: Player, timeThree: unknown) => {
    return tick() - (timeThree as number)
  }
}

spawn(() => {
  while (true) {
    wait(5)
    forceSync()
  }
})

export function forceSync (): void {
  $print('Forcefully syncing all hitreg clocks!')
  ipcServer.broadcast('syncHitreg', tick())
}
