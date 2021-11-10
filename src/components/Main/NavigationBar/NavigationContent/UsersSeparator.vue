<template>
  <div :class="$style.container" :data-is-open="$boolAttr(isOpen)">
    <div :class="$style.name">
      {{ name }}
      <div v-if="hasNotification" :class="$style.indicator">
        <notification-indicator :size="6" />
      </div>
    </div>
    <div :class="$style.line" />
    <a-icon name="rounded-triangle" :class="$style.icon" :size="20" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import AIcon from '/@/components/UI/AIcon.vue'
import NotificationIndicator from '/@/components/UI/NotificationIndicator.vue'

export default defineComponent({
  name: 'UsersSeparator',
  components: {
    AIcon,
    NotificationIndicator
  },
  props: {
    name: { type: String, default: '' },
    isOpen: { type: Boolean, default: false },
    hasNotification: {
      type: Boolean,
      default: false
    }
  },
  setup() {
    return {}
  }
})
</script>

<style lang="scss" module>
.container {
  @include color-ui-secondary;
  @include size-body2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: bold;
}
.name {
  position: relative;
}
.indicator {
  position: absolute;
  top: 0;
  right: -6px;
}
.line {
  margin: 0 8px;
  width: 100%;
  border-bottom: {
    style: solid;
    width: 2px;
    color: $theme-ui-tertiary;
  }
}
.icon {
  @include color-ui-tertiary;
  transition: transform 0.1s cubic-bezier(1, 0, 0, 1);
  flex-shrink: 0;
  transform: rotate(0turn);
  .container[data-is-open] & {
    transform: rotate(0.5turn);
  }
}
</style>
