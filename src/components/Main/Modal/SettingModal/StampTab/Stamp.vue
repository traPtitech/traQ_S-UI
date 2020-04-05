<template>
  <div :class="$style.container">
    <img :src="url" :class="$style.stamp" />
    <span>:{{ stamp.name }}:</span>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from '@vue/composition-api'
import apis, { buildFilePath, Stamp } from '@/lib/api'
import store from '@/store'

export default defineComponent({
  name: 'Stamp',
  props: {
    stamp: {
      type: Object as PropType<Stamp>,
      required: true
    }
  },
  setup(prop) {
    const url = computed(() => buildFilePath(prop.stamp.fileId))

    return { url }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  align-items: center;
}

.stamp {
  height: 40px;
  width: 40px;
}
</style>
