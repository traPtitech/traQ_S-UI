import { useChannelsStore } from '/@/store/entities/channels'
import { useGroupsStore } from '/@/store/entities/groups'
import { useStampsStore } from '/@/store/entities/stamps'
import { useUsersStore } from '/@/store/entities/users'

import { isDefined } from '../basic/array'
import { getMarkdown, renderMarkdownInline } from './parser'
import type { MarkdownEnvironment } from './types'

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

export const renderInline = async (
  text: string,
  environment?: MarkdownEnvironment
) => {
  await waitForInitialFetch()

  return renderMarkdownInline(text, environment)
}

export const parse = async (text: string) => {
  await waitForInitialFetch()
  return getMarkdown().md.parse(text, {})
}

export const isEmbeddedLink = async (text: string) => {
  await waitForInitialFetch()
  return isDefined(getMarkdown().embeddingExtractor.urlToEmbeddingData(text))
}
