const useDetecter = (text: string) => {
  let isInside = false
  let startIndex = -1
  let isString = false
  const ret = []
  const isMention = (str: string) => {
    try {
      const data = JSON.parse(str)
      if (
        data['type'] === 'user' &&
        typeof data['id'] === 'string' &&
        typeof data['raw'] === 'string'
      ) {
        return true
      } else {
        return false
      }
    } catch (e) {
      return false
    }
  }
  for (let i = 0; i < text.length; i++) {
    if (isInside) {
      if (text[i] === '"') {
        if (isString) isString = false
        else isString = true
      } else if (!isString && text[i] === '}') {
        isInside = false
        if (isMention(text.substr(startIndex + 1, i - startIndex))) {
          ret.push(JSON.parse(text.substr(startIndex + 1, i - startIndex)))
        } else {
          i = startIndex + 1
        }
      }
    } else {
      if (i < text.length - 1 && text[i] === '!' && text[i + 1] === '{') {
        startIndex = i
        i++
        isInside = true
        isString = false
      }
    }
  }
  return { detectMentions: ret }
}

export default useDetecter
