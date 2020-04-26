<template>
  <icon
    :size="24"
    mdi
    name="chevron-left"
    @click="onClickPop"
    :class="$style.button"
  />
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import store from '@/store'
import Icon from '@/components/UI/Icon.vue'

export default defineComponent({
  name: 'ModalReturnButton',
  components: {
    Icon
  },
  setup() {
    const onClickPop = () => {
      if (store.state.ui.modal.isOnInitialModalRoute) {
        store.dispatch.ui.modal.closeModal()
      } else {
        store.dispatch.ui.modal.popModal()
      }
    }
    return { onClickPop }
  }
})
</script>

<style lang="scss" module>
.button {
  cursor: pointer;
}
</style>
