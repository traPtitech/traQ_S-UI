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
