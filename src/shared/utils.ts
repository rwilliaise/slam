import { RunService } from '@rbxts/services'
import { $warn } from 'rbxts-transform-debug'

export function isClient (): boolean {
  return RunService.IsClient()
}

export function isServer (): boolean {
  return RunService.IsServer()
}

// this means that utils.ts HAS to be imported from main thread, which is inherently dangerous
const mainThread = coroutine.running()

/** Check if the current running thread is the main thread. */
export function checkThread (): boolean {
  return coroutine.running() === mainThread
}

// this function will be empty in the non-dev version
/** Prints a warning to console about an error */
export function warnThread (): void {
  $warn('An error will be thrown - this could possibly interrupt the main coroutine. Make sure this is checked!')
  $warn(`Is main thread: ${checkThread() ? 'yes' : 'no'}`)
}
