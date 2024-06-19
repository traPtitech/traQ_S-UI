<template>
  <div :class="$style.container">
    <div>
      {{ ':' + stampName + ': from' }}
    </div>
    <stamp-detail-element-content
      v-for="user in stamp.users"
      :key="user.id"
      :user-id="user.id"
      :count="user.count"
      :is-last="user === stamp.users[stamp.users.length - 1]"
      :class="$style.content"
    />
  </div>
</template>

<script lang="ts" setup>
import StampDetailElementContent from './StampDetailElementContent.vue'
import { computed } from 'vue'
import { useStampsStore } from '/@/store/entities/stamps'
import type { MessageStampById } from '/@/lib/messageStampList'

const props = defineProps<{
  stamp: MessageStampById
}>()

const { stampsMap } = useStampsStore()

const stampName = computed(
  () => stampsMap.value.get(props.stamp.id)?.name ?? ''
)
</script>

<style lang="scss" module>
.container {
  display: flex;
  flex-wrap: wrap;
}
.content {
  &::before {
    white-space: pre;
    content: ' ';
  }
}
</style>
