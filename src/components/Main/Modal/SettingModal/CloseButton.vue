<template>
  <div :class="$style.container" :style="styles.container">
    <div @click="onClickClear" :class="$style.circle" :style="styles.circle">
      <icon name="close" mdi />
    </div>
    閉じる
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import store from '@/store'
import Icon from '@/components/UI/Icon.vue'

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      color: theme.ui.secondary
    })),
    circle: makeStyles(theme => ({
      borderColor: theme.ui.tertiary
    }))
  })

export default defineComponent({
  name: 'CloseButton',
  setup() {
    const styles = useStyles()

    const onClickClear = () => store.dispatch.ui.modal.clearModal()

    return { styles, onClickClear }
  },
  components: {
    Icon
  }
})
</script>

<style lang="scss" module>
.container {
  position: absolute;
  top: 60px;
  right: 90px;
  text-align: center;
  font-weight: bold;
  font-size: 0.8rem;
}

.circle {
  display: flex;
  height: 52px;
  width: 52px;
  margin-bottom: 8px;
  justify-content: center;
  align-items: center;
  border: solid 3px;
  border-radius: 50%;
  cursor: pointer;
}
</style>
