<template>
  <div :class="$style.container">
    <h1>Not Found</h1>
    <div v-if="routeName && routeParam">
      {{ routeName }} {{ routeParam }} is not found on traQ!
    </div>
    <div v-else>Path {{ route.path }} is not found on traQ!</div>
    <router-link to="/">back</router-link>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useRoute } from 'vue-router'

export default defineComponent({
  name: 'NotFound',
  props: {
    routeName: {
      type: [String, Symbol],
      required: true
    },
    routeParam: {
      type: String,
      required: true
    }
  },
  setup() {
    const route = useRoute()
    return { route }
  }
})
</script>

<style lang="scss" module>
.container {
  @include color-ui-primary;
  @include background-primary;
  height: 100%;
  padding: 1rem;
}
</style>
