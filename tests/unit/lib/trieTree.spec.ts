import createTree from '@/lib/trieTree'

const tree = createTree(
  ['@temma', '@takashi_trap', '@takashi', '@'],
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
  it('is case insensitive', () => {
    expect(tree.search('@SAPP').sort()).toEqual(['@sappi_red'])
  })
  it('cannot overwrite a word which is same when case insensitive', () => {
    const before = tree.search('@temma')
    tree.insert('@TEMMA')
    expect(before).toEqual(tree.search('@temma'))
  })
  it('can insert', () => {
    tree.insert('@ryoha')
    expect(tree.search('@r')).toEqual(['@ryoha'])
  })
  it('cannot insert blank as a word', () => {
    tree.insert('')
    expect(tree.children['']).toEqual(undefined)
  })
  it('can remove', () => {
    tree.remove('@ryoha')
    expect(tree.search('@ryoha')).toEqual([])
  })
  it('can hundle blank remove', () => {
    const before = tree
    tree.remove('')
    expect(before).toEqual(tree)
  })
  it('can update', () => {
    tree.update('@sappi_red', '@sapphi_red')
    expect(tree.search('@sapp')).toEqual(['@sapphi_red'])
  })
})
