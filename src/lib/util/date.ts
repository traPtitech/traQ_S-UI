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
