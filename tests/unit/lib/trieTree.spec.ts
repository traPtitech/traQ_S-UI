import createTree from '@/lib/trieTree'

const tree = createTree(
  ['', '@temma', '@takashi_trap', '@takashi', '@'],
  ['@sappi_red', 'abc'],
  []
)

describe('trieTree class', () => {
  it('can create', () => {
    expect(Object.keys(tree.children).length !== 0).toEqual(true)
  })
  it('can isWord', () => {
    expect(tree.children['a'].children['b'].children['c'].isWord).toEqual(true)
  })
  it('can search', () => {
    expect(tree.search('@ta').sort()).toEqual(['@takashi', '@takashi_trap'])
  })
  it('can insert', () => {
    tree.insert(('@ryoha' as unknown) as Parameters<typeof tree.insert>[0])
    expect(tree.search('@r')).toEqual(['@ryoha'])
  })
  it('can remove', () => {
    tree.remove('@ryoha')
    expect(tree.search('@ryoha')).toEqual([])
  })
  it('can update', () => {
    tree.update('@sappi_red', '@sapphi_red')
    expect(tree.search('@sapp')).toEqual(['@sapphi_red'])
  })
})
