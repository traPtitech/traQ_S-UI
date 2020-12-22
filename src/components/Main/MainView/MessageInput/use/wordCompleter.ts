import TrieNode from './trieTree'

const useWordCompleter = () => {
  const getCurrentWord = (elm: HTMLTextAreaElement, text: string) => {
    const start_index = elm.selectionStart
    const end_index = elm.selectionEnd
    const previous_space_index = text.lastIndexOf(' ', start_index - 1)
    const next_space_index = text.indexOf(' ', end_index)
    const begin = previous_space_index < 0 ? 0 : previous_space_index + 1
    const end = next_space_index < 0 ? text.length : next_space_index
    const current_word = text.substring(begin, end)
    return current_word
  }

  return { getCurrentWord }
}

export default useWordCompleter
