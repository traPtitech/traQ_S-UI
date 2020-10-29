<template>
  <a
    :class="$style.container"
    :href="appLink"
    target="_blank"
    rel="noopener noreferrer"
  >
    <icon :class="$style.icon" :name="iconName" :mdi="iconMdi" :size="32" />
    <span :class="$style.label">{{ label }}</span>
  </a>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Icon from '@/components/UI/Icon.vue'

export default defineComponent({
  name: 'AppListItem',
  components: {
    Icon
  },
  props: {
    iconName: { type: String, required: true },
    iconMdi: { type: Boolean, default: false },
    label: { type: String, default: '' },
    appLink: { type: String, default: '' }
  },
  setup() {
    return {}
  }
})
</script>

<style lang="scss" module>
.container {
  @include color-ui-secondary;
  @include background-secondary;
  margin: 8px;
  padding: 16px 8px;
  border-radius: 8px;
  flex: 1 0;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  min-width: 120px;
  &:hover {
    @include color-ui-primary;
    @include background-tertiary;
  }
  max-width: calc(100% / 3 - 16px);
}
.icon {
  margin: 4px;
}
.label {
  @include size-body1;
  text-align: center;
}
</style>
