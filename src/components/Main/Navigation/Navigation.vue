<template>
  <div class="navigation">
    <NavigationSelector />
    <NavigationContent />
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import NavigationContent from '@/components/Main/Navigation/NavigationContent.vue'
import NavigationSelector from '@/components/Main/Navigation/NavigationSelector.vue'

export default defineComponent({
  name: 'Navigation',
  components: { NavigationContent, NavigationSelector },
  setup() {
    return {}
  }
})
</script>
