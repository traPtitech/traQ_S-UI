import { useChannelsStore } from '/@/store/entities/channels'
import { useGroupsStore } from '/@/store/entities/groups'
import { useStampsStore } from '/@/store/entities/stamps'
import { useUsersStore } from '/@/store/entities/users'

import { isDefined } from '../basic/array'
import { getMarkdown } from './parser'

const waitForInitialFetch = () => {
  const { usersMapInitialFetchPromise } = useUsersStore()
  const { userGroupsMapInitialFetchPromise } = useGroupsStore()
  const { bothChannelsMapInitialFetchPromise } = useChannelsStore()
  const { stampsMapInitialFetchPromise } = useStampsStore()

  return Promise.all([
    usersMapInitialFetchPromise,
    userGroupsMapInitialFetchPromise,
    bothChannelsMapInitialFetchPromise,
    stampsMapInitialFetchPromise
  ])
}

export const render = async (text: string) => {
  await waitForInitialFetch()
  return getMarkdown().render(text)
}

export const renderInline = async (text: string) => {
  await waitForInitialFetch()
  return getMarkdown().renderInline(text)
}

export const parse = async (text: string) => {
  await waitForInitialFetch()
  return getMarkdown().md.parse(text, {})
}

export const isEmbeddedLink = async (text: string) => {
  await waitForInitialFetch()
  return isDefined(getMarkdown().embeddingExtractor.urlToEmbeddingData(text))
}
