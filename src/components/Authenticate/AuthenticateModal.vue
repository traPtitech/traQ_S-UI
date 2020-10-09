<template>
  <div :class="$style.container"><slot /></div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'AuthenticateModal'
})
</script>

<style lang="scss" module>
.container {
  @include background-primary;
  border-radius: 4px;
  width: 100%;
  max-width: 480px;
  padding: 48px;
  margin: auto;
}
</style>
