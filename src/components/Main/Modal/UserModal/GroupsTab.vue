<template>
  <div :class="$style.groups">
    <p>groups</p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'

export default defineComponent({
  name: 'ProfileTab',
  props: {},
  setup() {
    return {}
  }
})
</script>

<style lang="scss" module>
.groups {
}
</style>
