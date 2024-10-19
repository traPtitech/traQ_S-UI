<template>
  <modal-frame
    title="キャッシュの削除"
    subtitle="キャッシュを削除する項目を選んで下さい。"
  >
    <div :class="$style.content">
      <div :class="$style.checkboxContainer">
        <form-checkbox
          v-for="name in cacheCategories"
          :key="name"
          v-model="cacheCategoryToIsSelected[name]"
          :class="$style.checkbox"
        >
          <div :class="$style.label">
            {{ cacheLabel(name) }}
            <!-- TODO: キャッシュサイズを表示する -->
          </div>
        </form-checkbox>
      </div>
      <div :class="$style.buttonContainer">
        <form-button label="キャンセル" type="tertiary" @click="clearModal" />
        <form-button
          label="削除する"
          type="secondary"
          :disabled="!anyCacheSelected"
          is-danger
          @click="clearCache"
        />
      </div>
    </div>
  </modal-frame>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useToastStore } from '/@/store/ui/toast'
import { wait } from '/@/lib/basic/timer'
import ModalFrame from '../Common/ModalFrame.vue'
import FormButton from '/@/components/UI/FormButton.vue'
import { useModalStore } from '/@/store/ui/modal'
import FormCheckbox from '/@/components/UI/FormCheckbox.vue'

declare global {
  interface StorageEstimate {
    usageDetails: Record<CacheCategory, number>
  }
}

const confirmClear = () => window.confirm('本当に削除しますか？')

/* CacheStorageのnameはsw.jsを参照 */
const clearCacheStorage = (cacheCategory: string) =>
  window.caches.delete(cacheCategory)

const { addSuccessToast } = useToastStore()
const showToast = (extraMessage?: string) => {
  addSuccessToast(
    `削除に成功しました${extraMessage ? `: ${extraMessage}` : ''}`
  )
}

const cacheCategories = [
  'traQ_S-precache',
  'files-cache',
  'thumbnail-cache'
] as const
type CacheCategory = (typeof cacheCategories)[number]

const cacheCategoryToIsSelected = ref(
  Object.fromEntries(cacheCategories.map(name => [name, false]))
)
const anyCacheSelected = computed(() => {
  return Object.values(cacheCategoryToIsSelected).includes(true)
})

const cacheNames = async (category: CacheCategory) => {
  if (!(category === 'traQ_S-precache')) {
    return [category]
  }
  const allNames = await window.caches.keys()
  return allNames.filter(name => name.startsWith(category))
}

const cacheLabel = (cacheCategory: CacheCategory) => {
  switch (cacheCategory) {
    case 'traQ_S-precache':
      return 'traQ本体'
    case 'files-cache':
      return 'ファイルの本体一覧'
    case 'thumbnail-cache':
      return 'ファイルのサムネイル一覧'
    default:
      throw new Error(
        `Unknown cache name: ${cacheCategory satisfies CacheCategory}`
      )
  }
}

const { clearModal } = useModalStore()

const isClearingCache = ref(false)

const clearMainCachePromises = async () => {
  const names = await cacheNames('traQ_S-precache')
  return names.map(name => {
    clearCacheStorage(name)
  })
}

const clearCache = async () => {
  if (isClearingCache.value || !confirmClear()) return
  isClearingCache.value = true
  const promises = []
  if (cacheCategoryToIsSelected.value['traQ_S-precache']) {
    promises.push(clearMainCachePromises())
  }
  if (cacheCategoryToIsSelected.value['files-cache']) {
    promises.push(clearCacheStorage('files-cache'))
  }
  if (cacheCategoryToIsSelected.value['thumbnail-cache']) {
    promises.push(clearCacheStorage('thumbnail-cache'))
  }
  await Promise.all(promises.flat())
  if (!cacheCategoryToIsSelected.value['traQ_S-precache']) {
    isClearingCache.value = false
    clearModal()
    showToast()
    return
  }
  const registration = await navigator.serviceWorker?.getRegistration()
  if (!registration) {
    isClearingCache.value = false
    clearModal()
    showToast()
    return
  }
  registration.unregister()
  isClearingCache.value = false
  showToast('1秒後にリロードします')
  await wait(1000)
  clearModal()
  window.location.reload()
}
</script>

<style lang="scss" module>
.content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}
.checkboxContainer {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.checkbox {
  @include color-ui-secondary;
  &:has(:checked) {
    @include color-ui-primary;
  }
  display: flex;
  justify-content: space-between;
  gap: 4px;
  padding: 8px;
  align-items: center;
  cursor: pointer;
  border: solid 2px transparent;
  border-radius: 4px;
  &:focus-within {
    border-color: $theme-accent-focus-default;
  }
}
.label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 8px 16px;
}
.buttonContainer {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
}
</style>
