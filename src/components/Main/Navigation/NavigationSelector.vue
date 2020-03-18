<template>
  <div class="navigation-selector">
    <icon name="hash" />
    <icon mdi name="home" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import Icon from '@/components/UI/Icon.vue'

export default defineComponent({
  name: 'NavigationSelector',
  components: { Icon },
  setup() {
    return {}
  }
})
</script>
