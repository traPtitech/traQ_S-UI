<template>
  <span :class="$style.indicator" :style="styles.indicator" :title="tooltip" />
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  reactive,
  Ref,
  PropType
} from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import store from '@/store'
import { UserId } from '@/types/entity-ids'
import { getFullDayWithTimeString } from '@/lib/date'

const useStyles = (isOnline: Ref<boolean>) =>
  reactive({
    indicator: makeStyles(theme => ({
      background: isOnline.value ? theme.accent.online : theme.ui.tertiary,
      borderColor: theme.background.primary
    }))
  })

export default defineComponent({
  name: 'OnlineIndicator',
  props: {
    userId: {
      type: String as PropType<UserId>,
      required: true
    },
    lastOnline: String
  },
  setup(props) {
    const isOnline = computed(() =>
      store.getters.domain.isUserOnline(props.userId)
    )

    const tooltip = computed(() =>
      props.lastOnline
        ? `Last Online: ${getFullDayWithTimeString(new Date(props.lastOnline))}`
        : undefined
    )

    const styles = useStyles(isOnline)

    return { styles, tooltip }
  }
})
</script>

<style lang="scss" module>
.indicator {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid;
}
</style>
