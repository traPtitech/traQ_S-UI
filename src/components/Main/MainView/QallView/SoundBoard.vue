<script setup lang="ts">
import type { SoundboardItem } from '@traptitech/traq'

import { computed, onMounted, ref } from 'vue'

import FormInput from '/@/components/UI/FormInput.vue'
import { useQall } from '/@/composables/qall/useQall'
import apis from '/@/lib/apis'
import { useToastStore } from '/@/store/ui/toast'

import SoundBoardElement from './SoundBoardElement.vue'

const searchQuery = ref('')

const { addErrorToast } = useToastStore()

const { callingChannel } = useQall()
const soundboardList = ref<SoundboardItem[]>([])
const filteredSoundboardList = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return soundboardList.value
  return soundboardList.value.filter(item =>
    item.soundName.toLowerCase().includes(query)
  )
})

/**
 * サウンド一覧を読み込み
 */
const loadSoundboardList = async () => {
  try {
    const list = (await apis.getSoundboardList()).data
    soundboardList.value = list
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[Soundboard] failed to load the list', e)
    addErrorToast('サウンド一覧の取得に失敗しました')
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
    await apis.postSoundboardPlay({
      soundId: soundId,
      roomName: callingChannel.value
    })
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[Soundboard] failed to play', e)
    addErrorToast('サウンドの再生に失敗しました')
  }
}

onMounted(() => {
  loadSoundboardList()
})
</script>

<template>
  <div :class="$style.soundBoard">
    <div>
      <FormInput v-model="searchQuery" placeholder="検索" />
    </div>
    <div :class="$style.elementContainer">
      <SoundBoardElement
        v-for="item in filteredSoundboardList"
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
