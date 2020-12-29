import TrieNode from './trieTree'

const useWordCompleter = () => {
  const createTree = (...lists: Array<readonly string[]>): TrieNode => {
    const tree = new TrieNode()
    lists.forEach(list => list.forEach(word => tree.insert(word)))
    return tree
  }
  const getCurrentWord = (elm: HTMLTextAreaElement, text: string) => {
    text = text.replaceAll('　', ' ')
    const startIndex = elm.selectionStart
    const endIndex = elm.selectionEnd
    const prevSpaceIndex = text.lastIndexOf(' ', startIndex - 1)
    const nextSpaceIndex = text.indexOf(' ', endIndex)
    const begin = prevSpaceIndex < 0 ? 0 : prevSpaceIndex + 1
    const end = nextSpaceIndex < 0 ? text.length : nextSpaceIndex
    const word = text.substring(begin, end)
    return { word, begin, end }
  }
  const getDeterminedCharacters = (candidates: string[]) => {
    const minLength = candidates.reduce((min, candidate) => {
      return min > candidate.length ? candidate.length : min
    }, 32)
    const determined: string[] = []
    for (let i = 0; i < minLength; i++) {
      determined[i] = candidates[0][i]
      for (const candidate of candidates) {
        if (determined[i] !== candidate[i]) {
          return determined.slice(0, determined.length - 1).join('')
        }
      }
    }
    return determined.join('')
  }
  return {
    createTree,
    getCurrentWord,
    getDeterminedCharacters
  }
}

export default useWordCompleter
