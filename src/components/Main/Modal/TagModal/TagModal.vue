<template>
  <modal-frame title="タグ" :subtitle="tagName" icon-mdi icon-name="tag">
  </modal-frame>
</template>

<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import store from '@/store'
import ModalFrame from '../Common/ModalFrame.vue'

export default defineComponent({
  name: 'TagModal',
  components: {
    ModalFrame
  },
  setup() {
    const tagName = computed(() => 'タグたぐたぐ')
    return { tagName }
  }
})
</script>
