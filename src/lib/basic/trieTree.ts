import { isDefined } from '/@/lib/basic/array'

let lastInsertedId = 0

type SearchOptions = {
  stopAtNextDelimiter?: boolean
}

class TrieNode {
  id: number
  isWord: boolean
  isDelimiter: boolean
  children: Record<string, TrieNode>

  constructor(id = 0) {
    this.isWord = false
    this.isDelimiter = false
    this.children = {}
    this.id = id
  }

  /**
   * 結果の並びは取り出した順
   */
  search(str: string, options: SearchOptions = {}): number[] | undefined {
    if (str.length === 0) {
      return
    }

    const chars = [...str]
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let self: TrieNode = this

    for (const char of chars) {
      const newSelf = self.children[char]
      if (newSelf === undefined) return
      self = newSelf
    }

    return self.getAllWords(options)
  }

  insert(
    str: string,
    { delimiter = null }: { delimiter?: string | null } = {}
  ): number | undefined {
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
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      self = self.children[char]!

      if (char === delimiter) self.isDelimiter = true
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
      const newSelf = self.children[char]
      if (newSelf === undefined) return
      self = newSelf
    }

    self.isWord = false
    return self.id
  }

  /**
   * 自身以下の単語をすべて取得する
   */
  private getAllWords({
    stopAtNextDelimiter = false
  }: SearchOptions = {}): number[] {
    const results: number[] = []

    const childrens: TrieNode[] = [this]
    while (childrens.length > 0) {
      const child = childrens.pop() as TrieNode
      if (child.isWord) {
        results.push(child.id)
      }

      if (stopAtNextDelimiter && child.isDelimiter && child.id !== this.id) {
        continue
      }

      childrens.push(...Object.values(child.children))
    }

    return results
  }
}

class TrieTree<Word extends { text: string; delimiter?: string }> {
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
  search(str: string, options: SearchOptions = {}): Word[] {
    const ids = this.root.search(str.toLocaleLowerCase(), options)
    if (!ids) return []
    return ids
      .map(id => this.dict.get(id))
      .filter(isDefined)
      .sort((a, b) => (a.text < b.text ? -1 : 1))
  }

  insert(word: Word) {
    const insertedId = this.root.insert(word.text.toLocaleLowerCase(), {
      delimiter: word.delimiter
    })

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
