import { defineActions } from 'direct-vuex'
import store, { moduleActionContext } from '/@/store'
import { entities } from '.'
import { entityMitt } from './mitt'
import { ActionContext } from 'vuex'
import {
  ChannelId,
  ClipFolderId,
  DMChannelId,
  StampId,
  StampPaletteId,
  UserGroupId,
  UserId
} from '/@/types/entity-ids'
import apis from '/@/lib/apis'
import { createSingleflight } from '/@/lib/async'
import {
  Channel,
  ClipFolder,
  DMChannel,
  Stamp,
  StampPalette,
  User,
  UserGroup
} from '@traptitech/traq'
import {
  clipFoldersMapInitialFetchPromise,
  stampPalettesMapInitialFetchPromise,
  stampsMapInitialFetchPromise,
  userGroupsMapInitialFetchPromise,
  usersMapInitialFetchPromise
} from './promises'
import { AxiosResponse } from 'axios'
import { arrayToMap } from '/@/lib/util/map'
import { getUnicodeStamps, setUnicodeStamps } from '/@/lib/stampCache'
import { dmParentUuid } from '/@/lib/util/uuid'
import { channelIdToPathString } from '/@/lib/channel'

export const entitiesActionContext = (
  context: ActionContext<unknown, unknown>
) => moduleActionContext(context, entities)

/**
 * キャッシュを使うかどうかと全取得が完了するまで待つか
 * forceFetch: キャッシュを一切利用しない
 * useCache: あればキャッシュを利用して、全取得が終わってない場合でもそれを待たずに取得する
 * waitForAllFetch: 全取得が完了してから取得が必要なときだけ取得する
 */
type CacheStrategy = 'forceFetch' | 'useCache' | 'waitForAllFetch'

const getUser = createSingleflight(apis.getUser.bind(apis))
const getUserByName = createSingleflight(
  async (name: string): Promise<{ data: User | undefined }> => {
    const res = await apis.getUsers(undefined, name)
    return { data: res.data[0] }
  }
)
const getUsers = createSingleflight(apis.getUsers.bind(apis))
const getUserGroup = createSingleflight(apis.getUserGroup.bind(apis))
const getUserGroups = createSingleflight(apis.getUserGroups.bind(apis))
const getChannel = createSingleflight(apis.getChannel.bind(apis))
const getChannels = createSingleflight(apis.getChannels.bind(apis))
const getUserDMChannel = createSingleflight(apis.getUserDMChannel.bind(apis))
const getClipFolder = createSingleflight(apis.getClipFolder.bind(apis))
const getClipFolders = createSingleflight(apis.getClipFolders.bind(apis))
const getStamp = createSingleflight(apis.getStamp.bind(apis))
const getStamps = createSingleflight(apis.getStamps.bind(apis))
const getStampPlalette = createSingleflight(apis.getStampPalette.bind(apis))
const getStampPlalettes = createSingleflight(apis.getStampPalettes.bind(apis))

type Entities = typeof store.state.entities

/**
 * キャッシュを使いつつ単体を取得する
 * @param cacheStrategy CacheStrategy型を参照
 * @param map usersMapのように一覧が格納されているMap
 * @param key MapのKey、usersMapならuserId
 * @param fetched 全件取得が完了したか、例えばusersMapFetched
 * @param fetch singleflight化した取得関数
 * @param set 取得が発生したときに行うcommit
 * @returns 取得結果
 *
 * @see [traQ_S-UI#1699](https://github.com/traPtitech/traQ_S-UI/pull/1699#issuecomment-747115101)
 */
const fetchWithCacheStrategy = async <T, R, K extends keyof Entities>(
  cacheStrategy: CacheStrategy,
  mapName: Entities[K] extends Map<unknown, unknown> ? K : never,
  key: T,
  fetched: boolean,
  initialFetchPromise: Promise<void>,
  fetch: (key: T) => Promise<[AxiosResponse<R>, boolean]>,
  set: (res: R) => void
): Promise<R> => {
  // キャッシュを利用する場合はこのブロックに入る
  if (cacheStrategy === 'useCache' || cacheStrategy === 'waitForAllFetch') {
    // mapでない場合はneverになる
    const map = store.state.entities[mapName] as unknown as Map<T, R>
    const res = map.get(key)
    if (res) {
      return res
    }

    // キャッシュに存在してなかったかつ、全取得が完了してない場合は
    // 全取得を待って含まれてるか確認する
    if (cacheStrategy === 'waitForAllFetch' && !fetched) {
      await initialFetchPromise

      // 参照が変わっているので取り直す
      // mapでない場合はneverになる
      const map = store.state.entities[mapName] as unknown as Map<T, R>
      const res = map.get(key)
      if (res) {
        return res
      }
    }
  }

  const [{ data: res }, isShared] = await fetch(key)
  // 他の取得とまとめられていた場合は既にcommitされてるためcommitしない
  if (!isShared) {
    set(res)
  }
  return res
}

// TODO: fetchのエラー処理
export const actions = defineActions({
  async fetchUser(
    context,
    {
      userId,
      cacheStrategy = 'waitForAllFetch'
    }: { userId: UserId; cacheStrategy?: CacheStrategy }
  ): Promise<User | undefined> {
    const { state, commit } = entitiesActionContext(context)
    const user = await fetchWithCacheStrategy(
      cacheStrategy,
      'usersMap',
      userId,
      state.usersMapFetched,
      usersMapInitialFetchPromise,
      getUser,
      user => {
        commit.setUser(user)

        entityMitt.emit('setUser')
      }
    )
    return user
  },
  async fetchUserByName(
    context,
    {
      username,
      cacheStrategy = 'waitForAllFetch'
    }: { username: string; cacheStrategy?: CacheStrategy }
  ): Promise<User | undefined> {
    const { state, getters, commit } = entitiesActionContext(context)
    // usernameが空のものは存在しないので弾く
    if (username === '') {
      return undefined
    }

    // キャッシュを利用する場合はこのブロックに入る
    if (cacheStrategy === 'useCache' || cacheStrategy === 'waitForAllFetch') {
      const res = getters.userByName(username)
      if (res) {
        return res
      }

      // キャッシュに存在してなかったかつ、全取得が完了してない場合は
      // 全取得を待って含まれてるか確認する
      if (cacheStrategy === 'waitForAllFetch' && !state.usersMapFetched) {
        await usersMapInitialFetchPromise

        const res = getters.userByName(username)
        if (res) {
          return res
        }
      }
    }

    const [{ data: res }, isShared] = await getUserByName(username)
    // 他の取得とまとめられていた場合は既にcommitされてるためcommitしない
    if (!isShared && res) {
      commit.setUser(res)
    }
    return res
  },
  async fetchUsers(
    context,
    { ignoreCache = false }: { ignoreCache?: boolean } = {}
  ): Promise<Map<UserId, User>> {
    const { state, commit } = entitiesActionContext(context)
    if (!ignoreCache && state.usersMapFetched) {
      return state.usersMap
    }

    const [{ data: users }, shared] = await getUsers()
    const usersMap = arrayToMap(users, 'id')
    if (!shared) {
      commit.setUsersMap(usersMap)
      entityMitt.emit('setUsers')
    }
    return usersMap
  },
  deleteUser(context, userId: UserId) {
    const { commit } = entitiesActionContext(context)
    commit.deleteUser(userId)
    entityMitt.emit('deleteUser')
  },

  async fetchUserGroup(
    context,
    {
      userGroupId,
      cacheStrategy = 'waitForAllFetch'
    }: { userGroupId: UserGroupId; cacheStrategy?: CacheStrategy }
  ): Promise<UserGroup | undefined> {
    const { state, commit } = entitiesActionContext(context)
    const userGroup = await fetchWithCacheStrategy(
      cacheStrategy,
      'userGroupsMap',
      userGroupId,
      state.userGroupsMapFetched,
      userGroupsMapInitialFetchPromise,
      getUserGroup,
      userGroup => {
        commit.setUserGroup(userGroup)

        entityMitt.emit('setUserGroup')
      }
    )
    return userGroup
  },
  async fetchUserGroups(
    context,
    { ignoreCache = false }: { ignoreCache?: boolean } = {}
  ): Promise<Map<UserGroupId, UserGroup>> {
    const { state, commit } = entitiesActionContext(context)
    if (!ignoreCache && state.userGroupsMapFetched) {
      return state.userGroupsMap
    }

    const [{ data: userGroups }, shared] = await getUserGroups()
    const userGroupsMap = arrayToMap(userGroups, 'id')
    if (!shared) {
      commit.setUserGroupsMap(userGroupsMap)
      entityMitt.emit('setUserGroups')
    }
    return userGroupsMap
  },
  deleteUserGroup(context, userId: UserId) {
    const { commit } = entitiesActionContext(context)
    commit.deleteUserGroup(userId)
    entityMitt.emit('deleteUserGroup')
  },

  async fetchUserDMChannel(context, userId: UserId): Promise<DMChannelId> {
    const { commit } = entitiesActionContext(context)
    const [{ data: dmChannel }, shared] = await getUserDMChannel(userId)
    if (!shared) {
      commit.setDmChannel(dmChannel)
    }
    return dmChannel.id
  },
  async fetchChannels(
    context,
    { ignoreCache = false }: { ignoreCache?: boolean } = {}
  ): Promise<[Map<ChannelId, Channel>, Map<DMChannelId, DMChannel>]> {
    const { state, commit } = entitiesActionContext(context)
    if (!ignoreCache && state.bothChannelsMapFetched) {
      return [state.channelsMap, state.dmChannelsMap]
    }

    const [{ data: channels }, shared] = await getChannels(true)
    const channelsMap = arrayToMap(channels.public, 'id')
    const dmChannelsMap = arrayToMap(channels.dm, 'id')
    if (!shared) {
      commit.setBothChannelsMap([channelsMap, dmChannelsMap])
      entityMitt.emit('setChannels')
    }
    return [channelsMap, dmChannelsMap]
  },
  deleteChannel(context, channelId: ChannelId) {
    const { commit } = entitiesActionContext(context)
    commit.deleteChannel(channelId)
  },
  async addChannel(context, channelId: ChannelId | DMChannelId) {
    const { state, commit, dispatch } = entitiesActionContext(context)
    if (
      state.channelsMap.has(channelId) ||
      state.dmChannelsMap.has(channelId)
    ) {
      return
    }

    const [{ data: channel }, shared] = await getChannel(channelId)
    if (shared) return

    // DMのとき
    if (channel.parentId === dmParentUuid) {
      // channelIdからuserIdが辿れないので全取得
      await dispatch.fetchChannels()
      return
    }

    // ルート直下でないチャンネル
    if (channel.parentId) {
      // 親チャンネルの`children`が不整合になるので再取得
      const { data: parentChannel } = await apis.getChannel(channel.parentId)
      // 注:下のsetChannelとの間にawaitがないようにする
      commit.setChannel(parentChannel)
    }

    commit.setChannel(channel)

    entityMitt.emit('addChannel', channel)
  },
  async updateChannel(context, channelId: ChannelId | DMChannelId) {
    const { state, commit, dispatch } = entitiesActionContext(context)

    const old = state.channelsMap.get(channelId)
    // 元々存在していなかったものが来たら追加として処理する
    if (!old) {
      await dispatch.addChannel(channelId)
      return
    }

    const oldPath = channelIdToPathString(channelId, state.channelsMap)

    const [{ data: channel }, shared] = await getChannel(channelId)
    if (shared) return

    // DMのときは変化しないはずなので処理しない
    if (channel.parentId === dmParentUuid) return

    // 親チャンネルが変わったときは`children`が不整合にならないように親チャンネルの情報を更新する
    if (old.parentId !== channel.parentId) {
      const oldParentRes = old.parentId
        ? await getChannel(old.parentId)
        : undefined
      const newParentRes = channel.parentId
        ? await getChannel(channel.parentId)
        : undefined

      // 注:下のsetChannelとの間にawaitがないようにする
      if (oldParentRes) {
        commit.setChannel(oldParentRes[0].data)
      }
      if (newParentRes) {
        commit.setChannel(newParentRes[0].data)
      }
    }

    commit.setChannel(channel)

    entityMitt.emit('updateChannel', {
      oldChannel: old,
      newChannel: channel,
      oldPath
    })
  },

  async fetchClipFolder(
    context,
    {
      clipFolderId,
      cacheStrategy = 'waitForAllFetch'
    }: { clipFolderId: ClipFolderId; cacheStrategy?: CacheStrategy }
  ): Promise<ClipFolder | undefined> {
    const { state, commit } = entitiesActionContext(context)
    const clipFolder = await fetchWithCacheStrategy(
      cacheStrategy,
      'clipFoldersMap',
      clipFolderId,
      state.clipFoldersMapFetched,
      clipFoldersMapInitialFetchPromise,
      getClipFolder,
      clipFolder => {
        commit.setClipFolder(clipFolder)
      }
    )
    return clipFolder
  },
  async fetchClipFolders(
    context,
    { ignoreCache = false }: { ignoreCache?: boolean } = {}
  ): Promise<Map<ClipFolderId, ClipFolder>> {
    const { state, commit } = entitiesActionContext(context)
    if (!ignoreCache && state.clipFoldersMapFetched) {
      return state.clipFoldersMap
    }

    const [{ data: clipFolders }, shared] = await getClipFolders()
    const clipFoldersMap = arrayToMap(clipFolders, 'id')
    if (!shared) {
      commit.setClipFoldersMap(clipFoldersMap)
    }
    return clipFoldersMap
  },
  async deleteClipFolders(context, clipFolderId: ClipFolderId) {
    const { commit } = entitiesActionContext(context)
    commit.deleteClipFolder(clipFolderId)
  },

  /**
   * unicodeスタンプが更新されたときの考慮は存在しない
   */
  async fetchStamp(
    context,
    {
      stampId,
      cacheStrategy = 'waitForAllFetch'
    }: { stampId: StampId; cacheStrategy?: CacheStrategy }
  ): Promise<Stamp | undefined> {
    const { state, commit } = entitiesActionContext(context)
    const stamp = await fetchWithCacheStrategy(
      cacheStrategy,
      'stampsMap',
      stampId,
      state.stampsMapFetched,
      stampsMapInitialFetchPromise,
      getStamp,
      stamp => {
        commit.setStamp(stamp)

        entityMitt.emit('setStamp', stamp)
      }
    )
    return stamp
  },
  /**
   * unicodeスタンプが更新されたときは手動で設定からキャッシュの削除をする必要がある
   */
  async fetchStamps(
    context,
    { ignoreCache = false }: { ignoreCache?: boolean } = {}
  ): Promise<Map<StampId, Stamp>> {
    const { state, commit } = entitiesActionContext(context)
    if (!ignoreCache && state.stampsMapFetched) {
      return state.stampsMap
    }

    const unicodeStamps = await getUnicodeStamps()
    // unicodeスタンプがIndexedDBに存在しないときは含めて取得する
    const [{ data: stamps }, shared] = await getStamps(!unicodeStamps)

    const stampsWithUnicodeStamps = unicodeStamps
      ? [...unicodeStamps, ...stamps]
      : stamps
    const stampsMap = arrayToMap(stampsWithUnicodeStamps, 'id')
    if (!shared) {
      commit.setStampsMap(stampsMap)
      // 新しくunicodeスタンプが取得されたときはIndexedDBに保存する
      if (!unicodeStamps) {
        setUnicodeStamps(stamps.filter(stamp => stamp.isUnicode))
      }

      entityMitt.emit('setStamps')
    }
    return stampsMap
  },
  deleteStamp(context, stampId: StampId) {
    const { commit } = entitiesActionContext(context)
    commit.deleteStamp(stampId)

    entityMitt.emit('deleteStamp', stampId)
  },

  async fetchStampPalette(
    context,
    {
      stampPaletteId,
      cacheStrategy = 'waitForAllFetch'
    }: { stampPaletteId: StampPaletteId; cacheStrategy?: CacheStrategy }
  ): Promise<StampPalette | undefined> {
    const { state, commit } = entitiesActionContext(context)
    const stampPalette = await fetchWithCacheStrategy(
      cacheStrategy,
      'stampPalettesMap',
      stampPaletteId,
      state.stampPalettesMapFetched,
      stampPalettesMapInitialFetchPromise,
      getStampPlalette,
      stampPalette => {
        commit.setStampPalette(stampPalette)
      }
    )
    return stampPalette
  },
  async fetchStampPalettes(
    context,
    { ignoreCache = false }: { ignoreCache?: boolean } = {}
  ): Promise<Map<StampPaletteId, StampPalette>> {
    const { state, commit } = entitiesActionContext(context)
    if (!ignoreCache && state.stampPalettesMapFetched) {
      return state.stampPalettesMap
    }

    const [{ data: stampPalettes }, shared] = await getStampPlalettes()
    const stampPalettesMap = arrayToMap(stampPalettes, 'id')
    if (!shared) {
      commit.setStampPalettesMap(stampPalettesMap)
    }
    return stampPalettesMap
  },
  async deleteStampPalette(context, stampPaletteId: StampPaletteId) {
    const { commit } = entitiesActionContext(context)
    commit.deleteStampPalette(stampPaletteId)
  }
})
