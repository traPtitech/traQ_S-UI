import { isDefined } from '@/lib/util/array'

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
  search(str: string, pos = 0): number[] | undefined {
    if (str.length === 0) {
      return
    }

    const k = [...str][pos]
    if (!this.children[k]) return
    if (pos === str.length - 1) {
      return this.children[k].getAllWords()
    }

    return this.children[k].search(str, pos + 1)
  }

  insert(str: string, pos = 0): number | undefined {
    if (str.length === 0) {
      return
    }

    if (pos === str.length) {
      if (this.isWord === true) return
      this.isWord = true
      return this.id
    }

    const k = [...str][pos]
    if (this.children[k] === undefined) {
      this.children[k] = new TrieNode(lastInsertedId + 1)
      lastInsertedId++
    }

    return this.children[k].insert(str, pos + 1)
  }

  remove(str: string, pos = 0): number | undefined {
    if (str.length === 0) {
      return
    }

    if (pos === str.length) {
      this.isWord = false
      return this.id
    }

    const k = [...str][pos]
    if (this.children[k] === undefined) return

    return this.children[k].remove(str, pos + 1)
  }

  /**
   * 自身以下の単語をすべて取得する
   */
  private getAllWords() {
    let results: number[] = []

    if (this.isWord) {
      results.push(this.id)
    }

    for (const k in this.children) {
      const child = this.children[k]
      results = results.concat(child.getAllWords())
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
