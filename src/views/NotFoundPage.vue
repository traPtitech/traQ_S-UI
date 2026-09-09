<template>
  <div :class="$style.container">
    <h1>Not Found</h1>
    <div v-if="routeName && routeParam">
      {{ routeName }} <bdi dir="ltr">{{ routeParam }}</bdi> is not found on
      traQ!
    </div>
    <div v-else>
      Path <bdi dir="ltr">{{ route.path }}</bdi> is not found on traQ!
    </div>
    <router-link to="/"> back </router-link>
  </div>
</template>

<script lang="ts" setup>
import { useRoute } from 'vue-router'

defineProps<{
  routeName?: string | symbol
  routeParam?: string
}>()

const route = useRoute()
</script>

<style lang="scss" module>
.container {
  @include color-ui-primary;
  @include background-primary;
  height: 100%;
  padding: 1rem;
}
</style>
