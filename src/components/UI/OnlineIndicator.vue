<template>
  <indicator
    :class="$style.container"
    :data-is-online="isOnline"
    :size="size"
    :border-width="borderWidth"
  />
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from '@vue/composition-api'
import store from '@/store'
import { UserId } from '@/types/entity-ids'
import Indicator from './Indicator.vue'

export default defineComponent({
  name: 'OnlineIndicator',
  components: {
    Indicator
  },
  props: {
    userId: {
      type: String as PropType<UserId>,
      required: true
    },
    size: {
      type: Number,
      default: 14
    },
    borderWidth: {
      type: Number,
      default: 2
    }
  },
  setup(props) {
    const isOnline = computed(() =>
      store.getters.domain.isUserOnline(props.userId)
    )

    return { isOnline }
  }
})
</script>

<style lang="scss" module>
.container {
  @include background-tertiary;
  display: inline-block;
  border-color: $theme-background-primary;
  vertical-align: middle;

  &[data-is-online] {
    background: $theme-accent-online;
  }
}
</style>
