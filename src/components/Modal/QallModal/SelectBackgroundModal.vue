<template>
  <modal-frame :title="title">
    <div>
      <h3>背景を選択してください</h3>
      <div>
        <input
          id="original"
          v-model="backgroundType"
          type="radio"
          value="original"
        />
        <label for="original">Original</label>
      </div>
      <div>
        <input id="blur" v-model="backgroundType" type="radio" value="blur" />
        <label for="blur">Blur</label>
      </div>
      <div>
        <input id="file" v-model="backgroundType" type="radio" value="file" />
        <label for="file">File</label>
      </div>
      <div>
        <input
          id="screen"
          v-model="backgroundType"
          type="radio"
          value="screen"
        />
        <label for="screen">Screen</label>
      </div>
      <button @click="applyBackground">適用</button>
    </div>
  </modal-frame>
</template>

<script setup lang="ts">
import { ref, defineProps } from 'vue'
import ModalFrame from '../Common/ModalFrame.vue'
import { useModalStore } from '/@/store/ui/modal'

const props = defineProps<{
  onSelect: (
    selectedBackgroundType: 'original' | 'blur' | 'file' | 'screen'
  ) => void
}>()

const title = ref('背景の選択')
const backgroundType = ref<'original' | 'blur' | 'file' | 'screen'>('original')

const { closeModal } = useModalStore()

const applyBackground = () => {
  props.onSelect(backgroundType.value)
  closeModal()
}
</script>
