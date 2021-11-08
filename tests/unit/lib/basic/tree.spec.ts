import { deepSome } from '/@/lib/basic/tree'

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

const isUnread = (t: { unread: boolean }) => t.unread

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
