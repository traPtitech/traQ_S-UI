import { LocationQueryValue, RouteParamValue } from 'vue-router'

/**
 * 配列だった場合に先頭を受け取る
 */
export const getFirstParam = (
  param: RouteParamValue | RouteParamValue[] | undefined
): string | undefined => {
  if (Array.isArray(param)) {
    return param[0]
  }
  return param ?? undefined
}

/**
 * 配列だった場合に先頭を受け取る
 */
export const getFirstQuery = (
  query: LocationQueryValue | LocationQueryValue[] | undefined
): string | null | undefined => {
  if (Array.isArray(query)) {
    return query[0]
  }
  return query ?? undefined
}

/**
 * httpsのURLだった場合はそのURLを返し、
 * そうでない場合はundefinedを返す
 */
export const ifIsHttps = (url: string | undefined) => {
  if (url === undefined) return undefined

  let urlObj: URL
  try {
    urlObj = new URL(url)
  } catch {
    return undefined
  }
  return urlObj.protocol === 'https:' ? url : undefined
}
