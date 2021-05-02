import { RunService } from '@rbxts/services'

export function isClient (): boolean {
  return RunService.IsClient()
}

export function isServer (): boolean {
  return RunService.IsServer()
}
