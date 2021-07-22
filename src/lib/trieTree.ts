import { isDefined } from '/@/lib/util/array'

let lastInsertedId = 0

class TrieNode {
  id: number
  isWord: boolean
  children: Record<string, TrieNode>

  constructor(id = 0) {
    this.isWord = false
    this.children = {}
    this.id = id
  }

  /**
   * 結果の並びは取り出した順
   */
  search(str: string): number[] | undefined {
    if (str.length === 0) {
      return
    }

    const chars = [...str]
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let self: TrieNode = this

    for (const char of chars) {
      if (!self.children[char]) return
      self = self.children[char]
    }

    return self.getAllWords()
  }

  insert(str: string): number | undefined {
    if (str.length === 0) {
      return
    }

    const chars = [...str]
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let self: TrieNode = this

    for (const char of chars) {
      if (self.children[char] === undefined) {
        self.children[char] = new TrieNode(lastInsertedId + 1)
        lastInsertedId++
      }
      self = self.children[char]
    }

    if (self.isWord === true) return
    self.isWord = true
    return self.id
  }

  remove(str: string): number | undefined {
    if (str.length === 0) {
      return
    }

    const chars = [...str]
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let self: TrieNode = this

    for (const char of chars) {
      if (self.children[char] === undefined) return
      self = self.children[char]
    }

    self.isWord = false
    return self.id
  }

  /**
   * 自身以下の単語をすべて取得する
   */
  private getAllWords() {
    const results: number[] = []

    const childrens: TrieNode[] = [this]
    while (childrens.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const child = childrens.shift()!
      if (child.isWord) {
        results.push(child.id)
      }

      childrens.push(...Object.values(child.children))
    }

    return results
  }
}

class TrieTree<Word extends { text: string }> {
  dict: Map<number, Word>
  root: TrieNode

  constructor(...lists: Array<Word[]>) {
    this.dict = new Map<number, Word>()
    this.root = new TrieNode()
    lists.forEach(list => list.forEach(word => this.insert(word)))
  }

  /**
   * ソート済み
   *
   * @param str 検索文字列
   */
  search(str: string): Word[] {
    const ids = this.root.search(str.toLocaleLowerCase())
    if (!ids) return []
    return ids
      .map(id => this.dict.get(id))
      .filter(isDefined)
      .sort((a, b) => (a.text < b.text ? -1 : 1))
  }

  insert(word: Word) {
    const insertedId = this.root.insert(word.text.toLocaleLowerCase())
    if (!insertedId) return
    this.dict.set(insertedId, word)
  }

  remove(word: string) {
    const removedId = this.root.remove(word.toLocaleLowerCase())
    if (!removedId) return
    this.dict.delete(removedId)
  }

  update(oldWord: Word, newWord: Word) {
    if (oldWord.text.length === 0 || newWord.text.length === 0) return
    this.remove(oldWord.text)
    this.insert(newWord)
  }
}

export default TrieTree
