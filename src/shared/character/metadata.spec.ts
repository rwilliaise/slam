import Metadata from './metadata.json'

export = () => {
  it('should not be missing elements', () => {
    for (const character of Metadata) {
      expect(character.id).to.never.equal(undefined)
      expect(character.info).to.never.equal(undefined)
      expect(character.name).to.never.equal(undefined)
      expect(character.image).to.never.equal(undefined)
      expect(character.strategies).to.never.equal(undefined)
      expect(character.description).to.never.equal(undefined)
    }
  })

  it('should be self-consistent', () => {
    for (const character of Metadata) {
      expect(character.name.lower().match(character.id.lower())).to.never.equal(undefined)
    }
  })
}
