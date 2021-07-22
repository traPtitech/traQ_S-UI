<template>
  <div :class="$style.container">
    <div :class="$style.input">
      <filter-input v-model="value" on-secondary disable-ime />
    </div>
    <button
      :class="$style.star"
      :aria-selected="isStared"
      @click="$emit('toggleStarFilter')"
    >
      <icon :class="$style.icon" name="star" :width="22" :height="22" mdi />
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import FilterInput from '/@/components/UI/FilterInput.vue'
import Icon from '/@/components/UI/Icon.vue'
import { useModelValueSyncer } from '/@/use/modelSyncer'

export default defineComponent({
  name: 'ChannelFilter',
  components: {
    Icon,
    FilterInput
  },
  props: {
    modelValue: {
      type: String,
      required: true
    },
    isStared: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { emit }) {
    const value = useModelValueSyncer(props, emit)
    return { value }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  align-items: center;
}
.input {
  margin-right: 16px;
}
.star {
  @include background-primary;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  border-radius: 4px;
  margin-right: 16px;
  cursor: pointer;
}
.icon {
  @include color-ui-secondary;
  opacity: 0.5;
  .star[aria-selected='true'] & {
    @include color-accent-primary;
    opacity: 1;
  }
}
</style>
