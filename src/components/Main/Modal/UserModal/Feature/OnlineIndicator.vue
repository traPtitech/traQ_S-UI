<template>
  <span :class="$style.indicator" :style="styles.indicator" />
</template>

<script lang="ts">
import { defineComponent, computed, reactive, Ref } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import store from '@/store'
import { UserId } from '@/types/entity-ids'

const useStyles = (isOnline: Ref<boolean>) =>
  reactive({
    indicator: makeStyles(theme => ({
      background: isOnline.value ? '#18fcfc' : theme.ui.tertiary,
      borderColor: theme.background.primary
    }))
  })

interface Props {
  userId: UserId
}

export default defineComponent({
  name: 'OnlineIndicator',
  props: {
    userId: {
      type: String,
      required: true
    }
  },
  setup(props: Props) {
    const isOnline = computed(() =>
      store.getters.domain.isUserOnline(props.userId)
    )

    const styles = useStyles(isOnline)

    return {
      props,
      styles
    }
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
