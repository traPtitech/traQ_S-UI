<template>
  <div
  v-show="show"
  :class="$style.scaleReaction"
  >
    <transition name="scale-reaction">
        <a-stamp
            :key="stamp.id"
            :stamp-id="stamp.id"
            :size="46"
            :class="$style.stamp"
            without-title
        />
    </transition>
    <div :class="$style.detail">{{ value }}</div>
  </div>
  </template>
  
  <script lang="ts" setup>
  import AStamp from '/@/components/UI/AStamp.vue'
  import { computed } from 'vue'
  import { useStampsStore } from '/@/store/entities/stamps'
  import type { MessageStampById } from '/@/lib/messageStampList'

const props = defineProps<{
  stamp: MessageStampById
  show: boolean
}>()

const { stampsMap } = useStampsStore()

const stampName = computed(
  () => stampsMap.value.get(props.stamp.id)?.name ?? ''
)
</script>

<style lang="scss" module>
.scaleReaction {
    @include color-ui-tertiary;
    @include background-primary;
    display: flex;
    border-radius: 4px;
    contain: none;
    border: solid 2px $theme-ui-tertiary-default;
}
.stamp {
    margin: {
        right: 0.2rem;
        bottom: 0.2rem;
    }

    display: flex;
}

.detail {
  display: flex;
}
</style>
  