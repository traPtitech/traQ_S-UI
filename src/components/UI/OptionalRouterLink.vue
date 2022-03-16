<template>
  <router-link v-if="to" :to="to" :class="block ? $style.block : $style.inline">
    <slot />
  </router-link>
  <div v-else :class="block ? $style.block : $style.inline">
    <slot />
  </div>
</template>

<script lang="ts" setup>
import { RouteLocationRaw } from 'vue-router'

withDefaults(defineProps<{
    to?: RouteLocationRaw,
    block?: boolean
}>(), {
    block: false
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
