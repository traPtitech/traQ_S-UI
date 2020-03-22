<template>
  <div :class="$style.container" :style="style.container">
    <h1>
      Not Found
    </h1>
    <div v-if="props.routeName && props.routeParam">
      {{ props.routeName }} {{ props.routeParam }} is not found on traQ!
    </div>
    <div v-else>Path {{ $route.path }} is not found on traQ!</div>
    <router-link to="/">back</router-link>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'

type Props = {
  routeName?: string
  routeParam?: string
}

const useStyle = () =>
  reactive({
    container: makeStyles(theme => ({
      color: theme.ui.primary
    }))
  })

export default defineComponent({
  name: 'NotFound',
  props: {
    routeName: {
      type: String,
      required: false
    },
    routeParam: {
      type: String,
      required: false
    }
  },
  setup(props: Props) {
    return {
      props,
      style: useStyle()
    }
  }
})
</script>

<style lang="scss" module>
.container {
  padding: 1rem;
}
</style>
