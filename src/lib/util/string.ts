/** 文字列を比較する
 *
 *  `undefined`を渡した場合は空文字列として扱う
 */
export const compareString = (
  str1?: string,
  str2?: string,
  inverse = false
) => {
  const _str1 = str1 ?? ''
  const _str2 = str2 ?? ''
  const _inv = inverse ? -1 : 1
  return _str1 < _str2 ? -_inv : _str1 > _str2 ? _inv : 0
}
