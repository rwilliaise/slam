import { Character } from './character'

export class ChadCharacter extends Character {

}
// import { compensatedTryMelee } from 'shared/hitreg'
// import { isServer, promiseError } from 'shared/utils'
// import { Character } from './character'
// import { ipcClient, ipcServer } from '@rbxts/abstractify'
// import * as SlaveClock from 'shared/hitreg/clock'

// /** Punch-based character. */
// export class ChadCharacter extends Character {
//   private punchTrack?: AnimationTrack = undefined
//   private readonly animation: Animation

//   private character?: Model
//   tryPunchConnection!: RBXScriptConnection

//   constructor (player: Player) {
//     super(player)
//     const punch = this.createMove(Enum.UserInputType.MouseButton1)
//     punch.callback = (state) => this.tryPunch(state)
//     punch.cooldown = 0.85 // 1 sec cooldown
//     this.animation = new Instance('Animation')
//     this.animation.AnimationId = 'rbxassetid://6053790188'
//     if (isServer()) {
//       ipcServer.on('tryPunch.chad', (player: Player, time: number) => {

//       }).then((connection) => {
//         this.tryPunchConnection = connection
//       }, promiseError)
//     }
//   }

//   destroy (): void {
//     super.destroy()
//     this.tryPunchConnection.Disconnect()
//   }

//   onCharacterAdded (character: Model): void {
//     super.onCharacterAdded(character)
//     this.character = character
//     if (!character.IsDescendantOf(game)) {
//       character.AncestryChanged.Wait()
//     }
//     const Humanoid = character.WaitForChild('Humanoid')
//     const Animator = Humanoid.WaitForChild('Animator') as Animator
//     this.punchTrack = Animator.LoadAnimation(this.animation)
//     this.punchTrack
//       .GetMarkerReachedSignal('RegisterHit')
//       .Connect(() => {
//         ipcClient.emit('tryPunch.chad', SlaveClock.getTime()).catch(promiseError)
//       })
//   }

//   tryPunch (state: Enum.UserInputState): void {
//     if (state !== Enum.UserInputState.Begin) {
//       return
//     }
//     this.punchTrack?.Play(0.2, isServer() ? 0.01 : 1) // cheeky asf hack that i cant circumvent. this is agony
//   }

//   async registerHit (time: number): Promise<void> {
//     const rootPart = this.character?.FindFirstChild('HumanoidRootPart') as BasePart | undefined
//     const charCFrame = rootPart?.CFrame
//     if (charCFrame !== undefined && rootPart !== undefined) {
//       const result = compensatedTryMelee(charCFrame.mul(new CFrame(0, 0, -2)), new Vector3(4, 4, 4), time, { ignorePlayers: this.player })
//       if (result.hitHumanoid !== undefined) {
//         result.hitHumanoid.TakeDamage(10) // TODO: damage system, different damage types for damage invulns and counters
//       }
//       return
//     }
//     error('Illegal state: character was not available')
//   }
// }
