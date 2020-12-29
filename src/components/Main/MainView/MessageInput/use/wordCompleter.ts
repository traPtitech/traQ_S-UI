const useWordCompleter = () => {
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
    const minLength = Math.min(...candidates.map(c => c.length))
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
    getCurrentWord,
    getDeterminedCharacters
  }
}

export default useWordCompleter
