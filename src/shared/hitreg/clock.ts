import { isServer, promiseError } from 'shared/utils'
import { ipcClient } from '@rbxts/abstractify'
import { ReplicatedStorage } from '@rbxts/services'
import { $print, $warn } from 'rbxts-transform-debug'

if (isServer()) {
  // stop the script if we are server-side
  error()
}

const SyncFunction = ReplicatedStorage.WaitForChild('SyncHitreg') as RemoteFunction

ipcClient.on('syncHitreg', (timeOne: number) => {
  $print(timeOne)
  handleSyncEvent(timeOne)
})
  .catch(promiseError)
ipcClient.emit('syncHitreg')
  .catch(promiseError)

/** An estimation of how long network events take to receive */
export let offset = -1

/** An estimation for how long network events take to send */
export let oneWayDelay = -1

/** Sync a time to the server */
export function syncTime (unsyncedTime: number): number {
  return unsyncedTime - offset
}

/** Get the current, synced time to the server */
export function getTime (): number {
  if (!hasSynced()) {
    $warn('SlaveClock called before sync! This is NOT good!')
    error('[SlaveClock.getTime] - Slave clock is not yet synced')
  }
  return tick() - offset
}

/** Check if the slave is synced to the server */
export function hasSynced (): boolean {
  return offset !== -1
}

/**
   * Handles the sync event from the server MasterClock.
   * @param timeOne The tick() on the server.
   */
export function handleSyncEvent (timeOne: number): void {
  const timeTwo = tick()
  const masterSlaveDifference = timeTwo - timeOne

  const timeThree = tick()
  const slaveMasterDifference = requestDelay(timeThree)

  offset = (masterSlaveDifference - slaveMasterDifference) / 2
  oneWayDelay = (masterSlaveDifference + slaveMasterDifference) / 2
}

function requestDelay (timeThree: number): number {
  return SyncFunction.InvokeServer(timeThree)
}
