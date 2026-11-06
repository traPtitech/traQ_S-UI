import { useChannelsStore } from '/@/store/entities/channels'
import { useGroupsStore } from '/@/store/entities/groups'
import { useStampsStore } from '/@/store/entities/stamps'
import { useUsersStore } from '/@/store/entities/users'

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
  const [, { getMarkdownRenderer }] = await Promise.all([
    waitForInitialFetch(),
    import('./parser')
  ])

  return getMarkdownRenderer().render(text)
}

export const renderInline = async (
  text: string,
  environment?: MarkdownEnvironment
) => {
  const [, { renderInlineWithCurrentEntities }] = await Promise.all([
    waitForInitialFetch(),
    import('./parser')
  ])

  return renderInlineWithCurrentEntities(text, environment)
}

export const parse = async (text: string) => {
  const [, { getMarkdownRenderer }] = await Promise.all([
    waitForInitialFetch(),
    import('./parser')
  ])

  return getMarkdownRenderer().md.parse(text, {})
}
