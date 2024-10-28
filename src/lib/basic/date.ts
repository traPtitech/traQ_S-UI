export const getTimeString = (date: Readonly<Date>) =>
  date.getHours().toString().padStart(2, '0') +
  ':' +
  date.getMinutes().toString().padStart(2, '0')

export const getDayString = (date: Readonly<Date>) =>
  (date.getMonth() + 1).toString().padStart(2, '0') +
  '/' +
  date.getDate().toString().padStart(2, '0')

export const getFullDayString = (date: Readonly<Date>) =>
  date.getFullYear() + '/' + getDayString(date)

export const getFullDayWithTimeString = (date: Readonly<Date>) =>
  getFullDayString(date) + ' ' + getTimeString(date)

export const getISOFullDayString = (date: Readonly<Date>) =>
  date.toISOString().split('T')[0]

export const getCurrentTimeString = () => getTimeString(new Date())

/**
 * 2つの日時を比べ、差異がない部分については省略したものを出力する
 * @param ofDate 出力する日時
 * @param fromDate 比較する日時
 */
export const getDateRepresentationWithoutSameDate = (
  ofDate: Readonly<Date>,
  fromDate: Readonly<Date>
) => {
  const timeString = getTimeString(ofDate)
  if (fromDate.getFullYear() !== ofDate.getFullYear()) {
    return getFullDayString(ofDate) + ' ' + timeString
  }
  if (
    fromDate.getDate() !== ofDate.getDate() ||
    fromDate.getMonth() !== ofDate.getMonth()
  ) {
    return getDayString(ofDate) + ' ' + timeString
  }
  return timeString
}

export const getDateRepresentation = (date: Readonly<Date> | string) => {
  const displayDate = new Date(date)
  if (Number.isNaN(displayDate.getTime())) {
    return ''
  }
  const today = new Date()
  const timeString = getTimeString(displayDate)
  const yesterday = new Date(today.getTime() - 1000 * 60 * 60 * 24)

  if (
    displayDate.getFullYear() === today.getFullYear() &&
    displayDate.getMonth() === today.getMonth() &&
    displayDate.getDate() === today.getDate()
  ) {
    return '今日' + ' ' + timeString
  }
  if (
    displayDate.getFullYear() === yesterday.getFullYear() &&
    displayDate.getMonth() === yesterday.getMonth() &&
    displayDate.getDate() === yesterday.getDate()
  ) {
    return '昨日' + ' ' + timeString
  }
  if (displayDate.getFullYear() === today.getFullYear()) {
    return getDayString(displayDate) + ' ' + timeString
  } else {
    return getFullDayString(displayDate) + ' ' + timeString
  }
}

export const compareDate = (date1: Date, date2: Date, inverse = false) => {
  const _inv = inverse ? -1 : 1
  const _t1 = date1.getTime()
  const _t2 = date2.getTime()
  return _t1 < _t2 ? -_inv : _t1 > _t2 ? _inv : 0
}

export const compareDateString = (
  str1: string,
  str2: string,
  inverse = false
) => compareDate(new Date(str1), new Date(str2), inverse)
