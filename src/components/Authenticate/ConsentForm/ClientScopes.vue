<template>
  <div>
    <p :class="$style.title">許可される項目:</p>
    <ul>
      <li v-for="scope in scopes" :key="scope">{{ getScopeName(scope) }}</li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@vue/composition-api'
import { OAuth2Scope } from '@traptitech/traq'

const scopeMap: Record<OAuth2Scope, string> = {
  [OAuth2Scope.Read]: 'データの読み取り',
  [OAuth2Scope.Write]: 'データの書き込み',
  [OAuth2Scope.ManageBot]: 'BOTの管理'
}

export default defineComponent({
  name: 'ClientPermissions',
  props: {
    scopes: {
      type: Array as PropType<OAuth2Scope[]>,
      default: []
    }
  },
  setup() {
    const getScopeName = (scope: OAuth2Scope) => scopeMap[scope]
    return { getScopeName }
  }
})
</script>

<style lang="scss" module>
.title {
  font-weight: bold;
}
</style>
