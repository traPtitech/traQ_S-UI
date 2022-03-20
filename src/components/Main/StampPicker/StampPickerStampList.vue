<template>
  <div :class="$style.container">
    <!--
      templateのkeyはstamp.idにしてv-forでそれぞれのスタンプの要素が使いまわされるように
      a-stampのkeyはkeyにしてアニメーションが動くようにしている

      durationをcss側ではなくてこっちで調節しているのは、
    -->
    <template v-for="{ stamp, key } in stampsWithAnimationKey" :key="stamp.id">
      <transition name="stamp-pressed" mode="out-in">
        <a-stamp
          :key="key"
          :stamp-id="stamp.id"
          :size="32"
          :class="$style.stampListItem"
          @click="onClickStamp(stamp.id)"
          @mouseenter="onStampHover(stamp.name)"
          @mouseleave="onStampUnhover"
        />
      </transition>
    </template>
  </div>
</template>

<script lang="ts" setup>
import AStamp from '/@/components/UI/AStamp.vue'
import { StampId } from '/@/types/entity-ids'
import { Stamp } from '@traptitech/traq'
import { computed } from 'vue'

const props = defineProps<{
  stamps: readonly Stamp[]
  animationKeys: Map<StampId, number>
}>()

const emit = defineEmits<{
  (e: 'inputStamp', id: StampId): void
  (e: 'hoverStamp', name?: string): void
}>()

const stampsWithAnimationKey = computed(() =>
  props.stamps.map(stamp => ({
    stamp,
    key: `${stamp.id}-${props.animationKeys.get(stamp.id) ?? 0}`
  }))
)

const onClickStamp = (id: StampId) => {
  emit('inputStamp', id)
}
const onStampHover = (name: string) => {
  emit('hoverStamp', name)
}
const onStampUnhover = () => {
  emit('hoverStamp')
}
</script>

<style lang="scss" module>
.container {
  display: flex;
  flex-flow: row wrap;
  height: 100%;
  overflow-y: scroll;
  align-content: flex-start;
  backface-visibility: hidden;
  contain: content;
}

.stampListItem {
  padding: 4px;
  cursor: pointer;
  user-select: none;
  content-visibility: auto;
  contain-intrinsic-size: 32px 32px;
  &:hover {
    @include background-secondary;
  }
}
</style>
