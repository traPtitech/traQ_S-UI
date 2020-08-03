export const getStringParam = (
  param: string | Array<string | null> | null
): string | undefined => {
  if (Array.isArray(param)) {
    return param[0] === null ? undefined : param[0]
  }
  return param ?? undefined
}
