<template>
  <router-link v-if="to" :to="to" :class="block ? $style.block : $style.inline">
    <slot />
  </router-link>
  <div v-else :class="block ? $style.block : $style.inline">
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { RouteLocationRaw } from 'vue-router'

export default defineComponent({
  name: 'OptionalRouterLink',
  props: {
    // とりあえずこれだけ。必要になったら追加する
    to: {
      type: [String, Object] as PropType<RouteLocationRaw>,
      default: undefined
    },
    // ここからは独自のもの
    block: {
      type: Boolean,
      default: false
    }
  }
})
</script>

<style lang="scss" module>
.block {
  display: block;
}
.inline {
  display: inline;
}
</style>
