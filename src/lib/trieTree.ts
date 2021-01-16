let lastInsertedId = 0
const dict = new Map<number, string>()
class TrieNode {
  id: number
  isWord: boolean
  children: Record<string, TrieNode>

  constructor(id = 0) {
    this.isWord = false
    this.children = {}
    this.id = id
  }

  insert(str: string, pos = 0) {
    if (str.length === 0) {
      return
    }

    if (pos === str.length) {
      if (this.isWord === true) return
      this.isWord = true
      dict.set(this.id, str)
      return
    }

    const k = [...str.toLocaleLowerCase()][pos]
    if (this.children[k] === undefined) {
      this.children[k] = new TrieNode(lastInsertedId + 1)
      lastInsertedId++
    }
    const child = this.children[k]
    child.insert(str, pos + 1)
  }

  remove(str: string, pos = 0) {
    if (str.length === 0) {
      return
    }

    if (this === undefined) {
      return
    }
    if (pos === str.length) {
      this.isWord = false
      dict.delete(this.id)
      return
    }

    const k = [...str.toLocaleLowerCase()][pos]
    const child = this.children[k]
    child.remove(str, pos + 1)
  }

  update(strOld: string, strNew: string) {
    if (strOld.length === 0 || strNew.length === 0) {
      return
    }
    this.remove(strOld)
    this.insert(strNew)
  }

  getAllWords(str = '') {
    let ret = [] as string[]

    if (this.isWord) {
      const val = dict.get(this.id)
      if (val !== undefined) {
        ret.push(val)
      }
    }

    for (const k in this.children) {
      const child = this.children[k]
      ret = ret.concat(child.getAllWords(str + k))
    }
    return ret
  }

  // 結果はヒットした順
  search(str: string, pos = 0): string[] {
    if (str.length === 0) {
      return []
    }

    const k = [...str.toLocaleLowerCase()][pos]
    const child = this.children[k]
    if (child === undefined) {
      return []
    }
    if (pos === str.length - 1) {
      return child.getAllWords(str)
    }
    return child.search(str, pos + 1)
  }
}

function createTree(...lists: Array<readonly string[]>): TrieNode {
  const tree = new TrieNode()
  lists.forEach(list => list.forEach(word => tree.insert(word)))
  return tree
}

export default createTree
