import createTree from '@/lib/trieTree'

const tree = createTree(
  ['', '@temma', '@takashi_trap', '@takashi', '@'],
  ['@sappi_red'],
  []
)

describe('trieTree class', () => {
  it('can create', () => {
    expect(tree.isWord || Object.keys(tree.children).length !== 0).toEqual(true)
  })
})

describe('trieTree class', () => {
  it('can search', () => {
    expect(tree.search('@ta').sort()).toEqual(['@takashi', '@takashi_trap'])
  })
})

describe('trieTree class', () => {
  it('can insert', () => {
    tree.insert('@ryoha')
    expect(tree.search('@r')).toEqual(['@ryoha'])
  })
})

describe('trieTree class', () => {
  it('can remove', () => {
    tree.remove('@ryoha')
    expect(tree.search('@ryoha')).toEqual([])
  })
})

describe('trieTree class', () => {
  it('can update', () => {
    tree.update('@sappi_red', '@sapphi_red')
    expect(tree.search('@sapp')).toEqual(['@sapphi_red'])
  })
})
