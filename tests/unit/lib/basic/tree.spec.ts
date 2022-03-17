import { deepSome, filterTree } from '/@/lib/basic/tree'

describe('deepSome', () => {
  it(`can detect false`, () => {
    expect(deepSome(tree1, isUnread)).toBe(false)
  })
  it(`can detect child`, () => {
    expect(deepSome(tree2, isUnread)).toBe(true)
  })
  it(`can detect non first child`, () => {
    expect(deepSome(tree3, isUnread)).toBe(true)
  })
  it(`can detect grandchild`, () => {
    expect(deepSome(tree4, isUnread)).toBe(true)
  })
  it(`can detect parent`, () => {
    expect(deepSome(tree5, isUnread, true)).toBe(true)
  })
  it(`can ignore parent`, () => {
    expect(deepSome(tree5, isUnread, false)).toBe(false)
  })
  it(`can detect complex tree`, () => {
    expect(deepSome(tree6, isUnread)).toBe(true)
  })
})

describe('filterTree', () => {
  it('can filter all', () => {
    expect(filterTree(tree10, isArchived)).toStrictEqual(tree10)
  })
  it('can filter child', () => {
    expect(filterTree(tree11, isArchived)).toStrictEqual({
      archived: false,
      children: []
    })
  })
  it('can filter out all', () => {
    expect(filterTree(tree12, isArchived)).toBe(null)
  })
  it('can filter deep child', () => {
    expect(filterTree(tree13, isArchived)).toStrictEqual({
      archived: false,
      children: []
    })
  })
})

const isUnread = (t: { unread: boolean }) => t.unread
const isArchived = (t: { archived: boolean }) => !t.archived

const tree1 = {
  unread: false,
  children: [
    {
      unread: false,
      children: []
    }
  ]
}

const tree2 = {
  unread: false,
  children: [
    {
      unread: true,
      children: []
    }
  ]
}

const tree3 = {
  unread: false,
  children: [
    {
      unread: false,
      children: []
    },
    {
      unread: true,
      children: []
    }
  ]
}

const tree4 = {
  unread: false,
  children: [
    {
      unread: false,
      children: [
        {
          unread: true,
          children: []
        }
      ]
    }
  ]
}

const tree5 = {
  unread: true,
  children: [
    {
      unread: false,
      children: [
        {
          unread: false,
          children: []
        }
      ]
    }
  ]
}

const tree6 = {
  unread: false,
  children: [
    {
      unread: false,
      children: [
        {
          unread: false,
          children: [
            {
              unread: false,
              children: []
            },
            {
              unread: true,
              children: [
                {
                  unread: false,
                  children: []
                }
              ]
            }
          ]
        },
        {
          unread: false,
          children: []
        }
      ]
    }
  ]
}

const tree10 = {
  archived: false,
  children: [
    {
      archived: false,
      children: []
    }
  ]
}

const tree11 = {
  archived: false,
  children: [
    {
      archived: true,
      children: []
    }
  ]
}

const tree12 = {
  archived: true,
  children: [
    {
      archived: true,
      children: []
    }
  ]
}

const tree13 = {
  archived: false,
  children: [
    {
      archived: true,
      children: [
        {
          archived: true,
          children: []
        }
      ]
    }
  ]
}
