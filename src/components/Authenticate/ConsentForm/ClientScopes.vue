<template>
  <div>
    <p :class="$style.title">許可される項目:</p>
    <ul :class="$style.list">
      <ClientScope
        v-for="scope in scopes"
        :key="scope"
        :class="$style.item"
        :scope="scope"
      />
    </ul>
  </div>
</template>

<script lang="ts" setup>
import type { KnownScope } from '/@/lib/clientScope'

import ClientScope from './ClientScope.vue'

withDefaults(
  defineProps<{
    scopes?: KnownScope[]
  }>(),
  {
    scopes: () => []
  }
)
</script>

<style lang="scss" module>
.title {
  font-weight: bold;
}
.list {
  margin: 8px 16px;
}
.item {
  margin: 16px 0;
  &:first-child {
    margin-top: 8px;
  }
  &:last-child {
    margin-bottom: 8px;
  }
}
</style>
