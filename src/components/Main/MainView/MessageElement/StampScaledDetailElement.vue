<template>
  <div :class="$style.container">
    {{ detailContents }}
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useStampsStore } from '/@/store/entities/stamps'
import type { StampUser, MessageStampById } from '/@/lib/messageStampList'
import { useUsersStore } from '/@/store/entities/users'

const props = defineProps<{
  stamp: MessageStampById
}>()

const { stampsMap } = useStampsStore()

const limitedUsers = computed(() => props.stamp.users.slice(0, 3))
const { usersMap } = useUsersStore()

const stampName = computed(
  () => stampsMap.value.get(props.stamp.id)?.name ?? ''
)

const isLastUser = (user: StampUser) =>
  user === props.stamp.users[Math.min(props.stamp.users.length - 1, 2)]

const isSecondLastUser = (user: StampUser) =>
  user === props.stamp.users[Math.min(props.stamp.users.length - 2, 1)]

const isOverLimitUser = (user: StampUser) =>
  user === props.stamp.users[2] && props.stamp.users.length > 3

const isOverLimitSecondUser = (user: StampUser) =>
  user === props.stamp.users[1] && props.stamp.users.length > 3

const detailContents = computed(() => {
  let message = `:${stampName.value}: が `
  limitedUsers.value.forEach((user, index) => {
    message += `${usersMap.value.get(user.id)?.displayName ?? 'unknown'}`
    message += user.count > 1 ? `(${user.count})` : ''
    if (!isLastUser(user) && !isSecondLastUser(user)) {
      message += '、'
    } else if (isSecondLastUser(user) && !isOverLimitSecondUser(user)) {
      message += 'と'
    } else if (isOverLimitUser(user)) {
      message += `と他${props.stamp.users.length - 3}人`
    }
    if (isLastUser(user)) {
      message += 'にリアクションされました'
    }
  })
  return message
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  flex-wrap: wrap;
}
.contents {
  display: flex;
}
.content {
  padding: 0 0.2rem;
}
</style>
