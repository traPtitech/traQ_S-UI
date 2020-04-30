<template>
  <div :class="$style.container" :style="style.container">
    <h1>
      Not Found
    </h1>
    <div v-if="routeName && routeParam">
      {{ routeName }} {{ routeParam }} is not found on traQ!
    </div>
    <div v-else>Path {{ $route.path }} is not found on traQ!</div>
    <router-link to="/">back</router-link>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'

const useStyle = () =>
  reactive({
    container: makeStyles(theme => ({
      color: theme.ui.primary,
      background: theme.background.primary
    }))
  })

export default defineComponent({
  name: 'NotFound',
  props: {
    routeName: String,
    routeParam: String
  },
  setup() {
    return {
      style: useStyle()
    }
  }
})
</script>

<style lang="scss" module>
.container {
  height: 100%;
  padding: 1rem;
}
</style>
