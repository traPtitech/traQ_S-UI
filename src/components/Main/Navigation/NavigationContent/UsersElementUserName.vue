<template>
  <div :class="$style.container">
    <div :class="$style.displayName" :style="styles.displayName">
      {{ user.displayName }}
    </div>
    <div :class="$style.name" :style="styles.name">@{{ user.name }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, PropType } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import { User } from '@traptitech/traq'

const useStyles = () =>
  reactive({
    displayName: makeStyles(theme => ({
      color: theme.ui.primary
    })),
    name: makeStyles(theme => ({
      color: theme.ui.secondary
    }))
  })

export default defineComponent({
  name: 'UsersElementUserName',
  props: {
    user: {
      type: Object as PropType<User>,
      required: true
    }
  },
  setup() {
    const styles = useStyles()
    return { styles }
  }
})
</script>

<style lang="scss" module>
.container {
  min-width: 0;
}
.displayName {
  font-size: 1rem;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}
.name {
  font-size: 0.875rem;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}
</style>
