import Roact from '@rbxts/roact'
import { Players } from '@rbxts/services'
import { App } from './app'

const Player = Players.LocalPlayer

/**
 * Mounts the UI onto the PlayerGui. Returns the resulting tree.
 * Can yield.
 * @returns Promise for Roact.Tree
 */
export default async function mount (): Promise<Roact.Tree> {
  return Roact.mount(<App />, Player.WaitForChild('PlayerGui'))
}
