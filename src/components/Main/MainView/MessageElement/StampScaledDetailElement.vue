<template>
  <div :class="$style.container">
    <div>
      {{ ':' + stampName + ': が ' }}
    </div>
    <div v-for="user in limitedUsers" :key="user.id" :class="$style.contents">
      <stamp-detail-element-content
        :user-id="user.id"
        :count="user.count"
        :class="$style.content"
      />
      <span
        v-if="
          (!isLastUser(user) && !isSecondLastUser(user)) ||
          isOverLimitSecondUser(user)
        "
        :class="$style.contents"
      >
        、
      </span>
      <span
        v-if="isSecondLastUser(user) && !isOverLimitSecondUser(user)"
        :class="$style.contents"
        >と</span
      >
      <span v-if="isOverLimitUser(user)" :class="$style.contents"
        >と他{{ props.stamp.users.length - 3 }}人</span
      >
      <span v-if="isLastUser(user)" :class="$style.contents">
        にリアクションされました
      </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import StampDetailElementContent from './StampDetailElementContent.vue'
import { computed } from 'vue'
import { useStampsStore } from '/@/store/entities/stamps'
import type { StampUser, MessageStampById } from '/@/lib/messageStampList'

const props = defineProps<{
  stamp: MessageStampById
}>()

const { stampsMap } = useStampsStore()

const limitedUsers = computed(() => props.stamp.users.slice(0, 3))

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
