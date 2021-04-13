<template>
  <div>
    <p :class="$style.title">許可される項目:</p>
    <ul :class="$style.list">
      <client-scope
        v-for="scope in scopes"
        :key="scope"
        :class="$style.item"
        :scope="scope"
      />
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { OAuth2Scope } from '@traptitech/traq'
import ClientScope from './ClientScope.vue'

export default defineComponent({
  name: 'ClientScopes',
  components: {
    ClientScope
  },
  props: {
    scopes: {
      type: Array as PropType<OAuth2Scope[]>,
      default: () => []
    }
  },
  setup() {
    return {}
  }
})
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
