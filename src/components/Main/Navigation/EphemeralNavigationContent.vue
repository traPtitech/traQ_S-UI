<template>
  <div :class="$style.container">
    <not-implemented
      v-if="currentEphemeralNavigation === 'qall'"
      :class="$style.content"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@vue/composition-api'

import { EphemeralNavigationItemType } from '@/components/Main/Navigation/use/navigation'
import NotImplemented from './NavigationContent/NotImplemented.vue'

export default defineComponent({
  name: 'EphemeralNavigationContent',
  components: {
    NotImplemented
  },
  props: {
    currentEphemeralNavigation: String as PropType<EphemeralNavigationItemType>
  },
  setup() {
    return {}
  }
})
</script>

<style lang="scss" module>
.container {
  width: 100%;
  height: 100%;
  overflow: scroll;
  padding: {
    top: 24px;
    left: 24px;
  }
}
.content {
  margin: 24px 0;
}
</style>
