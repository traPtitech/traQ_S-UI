<template>
  <div :class="$style.container">
    <icon :class="$style.icon" name="pencil" mdi />
    <div :class="$style.title">下書き</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Icon from '/@/components/UI/Icon.vue'

export default defineComponent({
  name: 'DraftsTitlePanel',
  components: {
    Icon
  }
})
</script>

<style lang="scss" module>
.container {
  @include color-ui-secondary;
  display: flex;
  width: 100%;
  padding: 12px;
  align-items: center;
  border-top: {
    style: solid;
    width: 2px;
    color: $theme-background-secondary;
  }
}
.icon {
  margin-right: 12px;
}
.title {
  font: {
    size: 0.875rem;
    weight: bold;
  }
  user-select: none;
}
</style>
