<template>
  <div :class="$style.container">
    <div>
      {{ ':' + stampName + ': from ' }}
    </div>
    <div v-for="user in stamp.users" :key="user.id" :class="$style.contents">
      <stamp-detail-element-content
        :user-id="user.id"
        :count="user.count"
        :class="$style.content"
      />
      <span v-if="!isLastUser(user)" :class="$style.delimiter"> / </span>
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

const stampName = computed(
  () => stampsMap.value.get(props.stamp.id)?.name ?? ''
)

const isLastUser = (user: StampUser) =>
  user === props.stamp.users[props.stamp.users.length - 1]
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
.delimiter {
  @include color-ui-secondary-inactive;
}
</style>
