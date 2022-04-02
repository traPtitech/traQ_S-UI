import type { UserGroup } from '@traptitech/traq'
import { defineStore, acceptHMRUpdate } from 'pinia'
import { computed, ref } from 'vue'
import { useTrueChangedPromise } from '/@/store/utils/promise'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'
import type { UserGroupId, UserId } from '/@/types/entity-ids'
import { createSingleflight } from '/@/lib/basic/async'
import apis from '/@/lib/apis'
import type { CacheStrategy } from './utils'
import { fetchWithCacheStrategy } from './utils'
import { entityMitt } from './mitt'
import { arrayToMap } from '/@/lib/basic/map'
import { wsListener } from '/@/lib/websocket'

const getUserGroup = createSingleflight(apis.getUserGroup.bind(apis))
const getUserGroups = createSingleflight(apis.getUserGroups.bind(apis))

const useGroupsStorePinia = defineStore('entities/groups', () => {
  const userGroupsMap = ref(new Map<UserGroupId, UserGroup>())
  const userGroupsMapFetched = ref(false)
  const userGroupsMapInitialFetchPromise = ref(
    useTrueChangedPromise(userGroupsMapFetched)
  )

  const gradeGroups = computed(() =>
    [...userGroupsMap.value.values()].filter(group => group.type === 'grade')
  )

  const getGradeGroupsByUserId = (userId: UserId) =>
    gradeGroups.value.find(userGroup =>
      userGroup.members.some(member => member.id === userId)
    )
  const getUserGroupByName = (name: string) => {
    const loweredName = name.toLowerCase()
    return [...userGroupsMap.value.values()].find(
      userGroup => userGroup?.name.toLowerCase() === loweredName
    )
  }
  const deleteUserGroup = (userGroupId: UserGroupId) => {
    userGroupsMap.value.delete(userGroupId)
    entityMitt.emit('deleteUserGroup')
  }

  const fetchUserGroup = async ({
    userGroupId,
    cacheStrategy = 'waitForAllFetch'
  }: {
    userGroupId: UserGroupId
    cacheStrategy?: CacheStrategy
  }) => {
    const userGroup = await fetchWithCacheStrategy(
      cacheStrategy,
      userGroupsMap,
      userGroupId,
      userGroupsMapFetched.value,
      userGroupsMapInitialFetchPromise.value,
      getUserGroup,
      userGroup => {
        userGroupsMap.value.set(userGroup.id, userGroup)
        entityMitt.emit('setUserGroup')
      }
    )
    return userGroup
  }

  const fetchUserGroups = async ({
    ignoreCache = false
  }: { ignoreCache?: boolean } = {}) => {
    if (!ignoreCache && userGroupsMapFetched.value) {
      return userGroupsMap.value
    }

    const [{ data: userGroups }, shared] = await getUserGroups()
    const newUserGroupsMap = arrayToMap(userGroups, 'id')
    if (!shared) {
      userGroupsMap.value = newUserGroupsMap
      userGroupsMapFetched.value = true
      entityMitt.emit('setUserGroups')
    }
    return newUserGroupsMap
  }

  wsListener.on('USER_GROUP_CREATED', ({ id }) => {
    fetchUserGroup({ userGroupId: id })
  })
  wsListener.on('USER_GROUP_UPDATED', ({ id }) => {
    fetchUserGroup({ userGroupId: id, cacheStrategy: 'forceFetch' })
  })
  wsListener.on('USER_GROUP_DELETED', ({ id }) => {
    deleteUserGroup(id)
  })
  wsListener.on('reconnect', () => {
    fetchUserGroups({ ignoreCache: true })
  })

  return {
    userGroupsMap,
    userGroupsMapInitialFetchPromise,
    gradeGroups,
    getGradeGroupsByUserId,
    getUserGroupByName,
    fetchUserGroups
  }
})

export const useGroupsStore = convertToRefsStore(useGroupsStorePinia)

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useGroupsStorePinia, import.meta.hot))
}
