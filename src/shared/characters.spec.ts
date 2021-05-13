/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference types="@rbxts/testez/globals" />

import { Characters } from './characters'
import Metadata from 'shared/character/metadata.json'

export = () => {
  it('should have characters', () => {
    expect(Characters.has('chad')).to.equal(true)
    expect(Characters.has('pity')).to.equal(true)
    expect(Characters.has('wimp')).to.equal(true)
  })

  it('should line up with metadata.json', () => {
    for (const character of Metadata) {
      expect(Characters.has(character.id))
    }
  })
}
