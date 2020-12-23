import TrieNode from './trieTree'

const useWordCompleter = () => {
  const createTree = (...lists: Array<readonly string[]>): TrieNode => {
    const tree = new TrieNode()
    lists.forEach(list => list.forEach(word => tree.insert(word)))
    return tree
  }
  const getCurrentWord = (elm: HTMLTextAreaElement, text: string) => {
    text = text.replaceAll('　', ' ')
    const start_index = elm.selectionStart
    const end_index = elm.selectionEnd
    const previous_space_index = text.lastIndexOf(' ', start_index - 1)
    const next_space_index = text.indexOf(' ', end_index)
    const begin = previous_space_index < 0 ? 0 : previous_space_index + 1
    const end = next_space_index < 0 ? text.length : next_space_index
    const word = text.substring(begin, end)
    return { word, begin, end }
  }
  return {
    createTree,
    getCurrentWord
  }
}

export default useWordCompleter
