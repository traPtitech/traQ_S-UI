<template>
  <div :class="$style.container">
    <div :class="$style.title">
      <span :class="$style.stampName">{{ ':' + stampName + ': ' }}</span>
      <span>from</span>
    </div>
    <div v-for="user in stamp.users" :key="user.id" :class="$style.contents">
      <StampDetailElementContent :user-id="user.id" :count="user.count">
        <span v-if="!isLastUser(user)" :class="$style.delimiter"> / </span>
      </StampDetailElementContent>
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
  () => stampsMap.value.get(props.stamp.id)?.name ?? 'unknown stamp'
)

const isLastUser = (user: StampUser) => user === props.stamp.users.at(-1)
</script>

<style lang="scss" module>
.container {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  min-width: 0;
}
.title {
  min-width: 0;
}
.stampName {
  word-break: break-all;
}
.contents {
  display: flex;
  flex-wrap: wrap;
  margin-left: 0.2em;
}
.delimiter {
  @include color-ui-secondary-inactive;
  display: inline-flex;
  margin-left: 0.2em;
}
</style>
