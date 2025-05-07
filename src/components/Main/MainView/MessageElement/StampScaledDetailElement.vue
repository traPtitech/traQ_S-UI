<template>
  <inline-markdown :content="detailContents" />
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import type { MessageStampById } from '/@/lib/messageStampList'
import { useUsersStore } from '/@/store/entities/users'
import InlineMarkdown from '/@/components/UI/InlineMarkdown.vue'

const props = defineProps<{ stamp: MessageStampById }>()

// 最大表示人数
const maxUserCount = 100
const limitedUsers = computed(() => props.stamp.users.slice(0, maxUserCount))
const { usersMap } = useUsersStore()

const detailContents = computed(() => {
  let message = ''
  let userCount = 0
  limitedUsers.value.forEach(user => {
    for (let i = 0; i < user.count && userCount < maxUserCount; i++) {
      message += `:@${usersMap.value.get(user.id)?.name ?? 'unknown'}: `
      userCount++
    }
    if (userCount === maxUserCount && props.stamp.sum - maxUserCount > 0) {
      message += `と他${props.stamp.sum - maxUserCount}人`
    }
    if (userCount === Math.min(props.stamp.sum, maxUserCount)) {
      message += 'がリアクションしました'
      userCount++
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
