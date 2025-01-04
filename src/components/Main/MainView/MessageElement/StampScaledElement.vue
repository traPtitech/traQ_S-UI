<template>
  <div
  v-show="show"
  :class="$style.scaleReaction"
  >
    <transition name="scale-reaction">
      <!-- sizeを46より大きくすると見切れる -->
        <a-stamp
            :key="stamp.id"
            :stamp-id="stamp.id"
            :size="46"
            :class="$style.stamp"
            without-title
        />
    </transition>
    <stamp-detail-element
    :class="$style.detail"
    :stamp="stamp"
  />
  </div>
  </template>
  
  <script lang="ts" setup>
  import AStamp from '/@/components/UI/AStamp.vue'
  import type { MessageStampById } from '/@/lib/messageStampList'
  import StampDetailElement from './StampDetailElement.vue'

const props = defineProps<{
  stamp: MessageStampById
  show: boolean
}>()
</script>

<style lang="scss" module>
.scaleReaction {
    @include color-ui-tertiary;
    @include background-primary;
    display: flex;
    border-radius: 4px;
    contain: none;
    flex-wrap: wrap;
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
  color: var(--specific-count-text);
  @include color-ui-primary;
  max-width : 500px;
  min-width: 0;
  overflow: hidden;
  overflow: clip;
  margin: {
    left: 6px;
    right: 4px;
  }
}
</style>
  