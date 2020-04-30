const getTimeString = (date: Date) =>
  date.getHours().toString().padStart(2, '0') +
  ':' +
  date.getMinutes().toString().padStart(2, '0')

const getDayString = (date: Date) =>
  (date.getMonth() + 1).toString().padStart(2, '0') +
  '/' +
  date.getDate().toString().padStart(2, '0')

export const getFullDayString = (date: Date) =>
  date.getFullYear() + '/' + getDayString(date)

/**
 * 2つの日時を比べ、差異がない部分については省略したものを出力する
 * @param ofDate 出力する日時
 * @param fromDate 比較する日時
 */
const getDateRepresentationWithoutSameDate = (ofDate: Date, fromDate: Date) => {
  let result = getTimeString(ofDate)
  if (
    fromDate.getDate() !== ofDate.getDate() ||
    fromDate.getMonth() !== ofDate.getMonth()
  ) {
    result = getDayString(ofDate) + ' ' + result
  }
  if (fromDate.getFullYear() !== ofDate.getFullYear()) {
    result = ofDate.getFullYear().toString() + '/' + result
  }
  return result
}

export const getDisplayDate = (createdAt: string, updatedAt: string) => {
  const createdDate = new Date(createdAt)
  if (createdAt === updatedAt) {
    return getTimeString(createdDate)
  } else {
    const updatedDate = new Date(updatedAt)
    return getDateRepresentationWithoutSameDate(updatedDate, createdDate)
  }
}

export const getCreatedDate = (createdAt: string) => {
  const createdDate = new Date(createdAt)
  const now = new Date()
  return getDateRepresentationWithoutSameDate(createdDate, now)
}
