import RotatedRegion3 from '@rbxts/rotatedregion3'
import { Players } from '@rbxts/services'
import { isClient } from 'shared/utils'

function mapHumanoid (value: Instance): Humanoid | undefined {
  let humanoid: Humanoid | undefined
  if (value.IsA('ObjectValue')) {
    humanoid = value.Value as Humanoid
  } else if (value.IsA('Humanoid')) {
    humanoid = value
  }
  return humanoid
}

function getCharacters (): Model[] {
  return Players.GetPlayers().mapFiltered((value) => value.Character)
}

export function tryMeleeTargeted (cframe: CFrame, size: Vector3, whitelist: Instance[]): Humanoid[] {
  const region3 = RotatedRegion3.Block(cframe, size)
  const parts = region3.FindPartsInRegion3WithWhiteList(whitelist)
  const humanoids = []
  for (const part of parts) {
    const humanoid = part.FindFirstAncestorOfClass('Model')?.FindFirstChild('Humanoid')
    if (humanoid !== undefined) {
      humanoids.push(humanoid)
    }
  }
  return humanoids.mapFiltered(mapHumanoid)
}

export function tryMelee (time: number, cframe: CFrame, size: Vector3, ...ignore: Instance[]): Humanoid[] {
  if (isClient()) {
    return tryMeleeTargeted(cframe, size, getCharacters())
  }
  return []
}
