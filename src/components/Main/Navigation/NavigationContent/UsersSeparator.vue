<template>
  <div :class="$style.container" :style="containerStyle">
    <div :class="$style.name">
      {{ name }}
      <div v-if="hasNotification" :class="$style.indicator">
        <notification-indicator :size="6" />
      </div>
    </div>
    <div :class="$style.line"></div>
    <icon
      name="rounded-triangle"
      :class="$style.icon"
      :style="iconStyle"
      :size="20"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import Icon from '@/components/UI/Icon.vue'
import NotificationIndicator from '@/components/UI/NotificationIndicator.vue'

export default defineComponent({
  name: 'UsersSeparator',
  components: {
    Icon,
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
  setup(props) {
    return {
      containerStyle: makeStyles(theme => ({
        borderColor: theme.ui.tertiary,
        color: theme.ui.secondary
      })),
      iconStyle: makeStyles(theme => ({
        color: theme.ui.tertiary,
        transform: props.isOpen ? `rotate(0.5turn)` : `rotate(0turn)`
      }))
    }
  }
})
</script>

<style lang="scss" module>
.container {
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
    color: inherit;
  }
}
.icon {
  transition: transform 0.1s cubic-bezier(1, 0, 0, 1);
  flex-shrink: 0;
}
</style>
