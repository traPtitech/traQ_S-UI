import { toArray } from '@vueuse/core'

export const fallbackChannelPath = traQConfig.fallbackChannelPath ?? ''

export const defaultChannelIds = (() => {
  const ids = traQConfig.defaultChannelId
  if (!ids) return []
  return toArray(ids)
})()
