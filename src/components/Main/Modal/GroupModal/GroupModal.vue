<template>
  <modal-frame title="グループ" :subtitle="tagName" icon-name="group">
  </modal-frame>
</template>

<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import store from '@/store'
import ModalFrame from '../Common/ModalFrame.vue'

export default defineComponent({
  name: 'GroupModal',
  components: {
    ModalFrame
  },
  setup() {
    const tagName = computed(() => 'グループぐるぐる')
    return { tagName }
  }
})
</script>
