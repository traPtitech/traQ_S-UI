<script setup lang="ts">
import { onMounted, ref } from 'vue'
import SoundBoardElement from './SoundBoardElement.vue'
import FormInput from '/@/components/UI/FormInput.vue'
import { useToastStore } from '/@/store/ui/toast'
import { useQall, type SoundboardItem } from '/@/composables/qall/useQall'

const searchQuery = ref('')

const { addErrorToast, addSuccessToast } = useToastStore()

const { getSoundboardList, postSoundboardPlay, callingChannel } = useQall()
const soundboardList = ref<SoundboardItem[]>([])
/**
 * サウンド一覧を読み込み
 */
const loadSoundboardList = async () => {
  try {
    const list = await getSoundboardList()
    soundboardList.value = list
  } catch (e) {
    addErrorToast(`サウンド一覧の取得に失敗しました: ${String(e)}`)
  }
}

/**
 * 指定サウンドを再生
 */
const handlePlaySound = async (soundId: string) => {
  if (!callingChannel.value) {
    addErrorToast('再生するには通話中である必要があります')
    return
  }
  try {
    const result = await postSoundboardPlay(soundId, callingChannel.value)
    // resultには ingressId 等が返る
    addSuccessToast(`サウンドを再生中 (IngressID: ${result.ingressId})`)
  } catch (e) {
    addErrorToast(`サウンド再生に失敗しました: ${String(e)}`)
  }
}

onMounted(() => {
  loadSoundboardList()
})
</script>

<template>
  <div :class="$style.soundBoard">
    <div><FormInput v-model="searchQuery" placeholder="検索" /></div>
    <div :class="$style.elementContainer">
      <SoundBoardElement
        v-for="item in soundboardList"
        :key="item.soundId"
        :sound-name="item.soundName"
        :stamp-id="item.stampId"
        @click="handlePlaySound(item.soundId)"
      />
    </div>
  </div>
</template>

<style lang="scss" module>
.soundBoard {
  position: absolute;
  margin: 0.5rem;
  padding: 0.5rem;
  bottom: 48px;
  left: 0;
  height: 32rem;
  overflow-y: scroll;
  border-radius: 0.5rem;
  @include background-primary;
  overflow: scroll;
}
.elementContainer {
  width: 30.5rem;
  max-width: 100%;

  margin: 0.5rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
  gap: 0.25rem;
}
</style>
