<template>
  <div :class="$style.container">
    <stamp-element :stamp-id="stampId" :size="24" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import StampElement from '@/components/UI/Stamp.vue'

export default defineComponent({
  name: 'DropdownSuggesterUserIcon',
  components: {
    StampElement
  },
  props: {
    stampId: {
      type: String,
      required: true
    }
  },
  setup() {
    return {}
  }
})
</script>

<style lang="scss" module>
.container {
}
</style>
