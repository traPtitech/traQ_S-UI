<template>
  <div :class="$style.container">
    <div v-for="userId in userIds" :key="userId" :class="$style.contents">
      <user-icon
        :user-id="userId"
        :size="24"
        :class="$style.content"
        @click.capture="emit('click-user')"
      />
    </div>
    <div v-if="overflowCount[0]" :class="$style.overflowcount">
      +{{ overflowCount[1] }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import type { MessageStampById } from '/@/lib/messageStampList'
import UserIcon from '/@/components/UI/UserIcon.vue'

const props = defineProps<{ stamp: MessageStampById }>()

const emit = defineEmits<{
  (e: 'click-user'): void
}>()

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
    if (userCount > maxUserCount) {
      userIds.splice(maxUserCount - 2)
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
      overflow[1] = props.stamp.sum - maxUserCount + 2
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
  padding-left: 0.2rem;
}
</style>
