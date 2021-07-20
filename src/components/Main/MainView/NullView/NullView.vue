<template>
  <div :class="$style.container">
    <icon :class="$style.logo" name="traQ" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Icon from '/@/components/UI/Icon.vue'

export default defineComponent({
  name: 'NullView',
  components: {
    Icon
  },
  setup() {
    return {}
  }
})
</script>

<style lang="scss" module>
.container {
  @include background-primary;
  @include color-ui-primary;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.logo {
  @include color-accent-primary;
  height: min(20vmin, 100px);
  width: min(20vmin, 100px);
}
</style>
