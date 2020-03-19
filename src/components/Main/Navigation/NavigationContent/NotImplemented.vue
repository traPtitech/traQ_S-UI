<template>
  <empty-state>Not Implemented</empty-state>
</template>

<script lang="ts">
import { defineComponent, SetupContext } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import EmptyState from '@/components/UI/EmptyState.vue'

type Props = {}

export default defineComponent({
  name: 'NotImplemented',
  components: {
    EmptyState
  },
  setup(props: Props, context: SetupContext) {
    return {
      containerStyle: makeStyles(theme => ({
        color: theme.ui.tertiary
      }))
    }
  }
})
</script>
