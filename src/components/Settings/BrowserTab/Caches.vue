<template>
  <div>
    <h3>キャッシュの削除</h3>
    <div :class="$style.content">
      <form-button
        :class="$style.button"
        label="traQ本体"
        @click="clearMainCache"
      />
      <form-button
        :class="$style.button"
        label="ファイルの本体一覧"
        @click="clearMainCache"
      />
      <form-button
        :class="$style.button"
        label="ファイルのサムネイル一覧"
        @click="clearMainCache"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import FormButton from '@/components/UI/FormButton.vue'
import useToastStore from '@/providers/toastStore'

const confirmClear = () => window.confirm('本当に削除しますか？')

/* CacheStorageのnameはsw.jsを参照 */
const clearCacheStorage = (cacheName: string) => {
  window.caches.delete(cacheName)
}

export default defineComponent({
  name: 'Caches',
  components: { FormButton },
  setup() {
    const { addSuccessToast } = useToastStore()
    const showToast = () => {
      addSuccessToast('削除に成功しました')
    }

    const clearMainCache = async () => {
      if (!confirmClear()) return

      const names = await window.caches.keys()
      names
        .filter(name => name.startsWith('traQ_S-precache'))
        .forEach(name => {
          clearCacheStorage(name)
        })
      showToast()
    }
    const clearFileCache = async () => {
      if (!confirmClear()) return
      clearCacheStorage('files-cache')
      showToast()
    }
    const clearThumbnailCache = async () => {
      if (!confirmClear()) return
      clearCacheStorage('thumbnail-cache')
      showToast()
    }

    return { clearMainCache, clearFileCache, clearThumbnailCache }
  }
})
</script>

<style lang="scss" module>
.content {
  margin-left: 12px;
}
.button {
  margin-right: 8px;
}
</style>
