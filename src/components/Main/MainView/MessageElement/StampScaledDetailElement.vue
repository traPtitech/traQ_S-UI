<template>
  <div :class="$style.container">
    <div v-for="userId in userIds" :key="userId" :class="$style.contents">
      <user-icon :user-id="userId" :size="24" :class="$style.content" />
    </div>
    <div v-if="overflowCount[0]" :class="$style.overflowcount">
      と他{{ overflowCount[1] }}人
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import type { MessageStampById } from '/@/lib/messageStampList'
import UserIcon from '/@/components/UI/UserIcon.vue'

const props = defineProps<{ stamp: MessageStampById }>()

// 最大表示人数
const maxUserCount = 30

const userIds = computed(() => {
  const userIds: string[] = []
  let userCount = 0
  for (const user of props.stamp.users) {
    for (let i = 0; i < user.count && userCount < maxUserCount + 1; i++) {
      userIds.push(user.id)
      userCount++
    }
    if (userCount >= maxUserCount + 1) {
      userIds.pop()
      userIds.pop()
      userIds.pop()
      break
    }
  }
  return userIds
})

const overflowCount = computed(() => {
  const overflow: [boolean, number] = [false, 0]
  let userCount = 0
  for (const user of props.stamp.users) {
    userCount += user.count
    if (userCount > maxUserCount) {
      overflow[0] = true
      overflow[1] = props.stamp.sum - maxUserCount
      break
    }
  }
  return overflow
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
  margin: 0.1rem;
}
.overflowcount {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0.5rem;
}
</style>
