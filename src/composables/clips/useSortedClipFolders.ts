import { computed } from 'vue'
import { compareString } from '/@/lib/basic/string'
import { useClipFoldersStore } from '/@/store/entities/clipFolders'

const useSortedClipFolders = () => {
  const { clipFoldersMap } = useClipFoldersStore()

  const sortedClipFolders = computed(() => {
    const folders = [...clipFoldersMap.value.values()]
    folders.sort((a, b) => compareString(a.name, b.name))
    return folders
  })

  return sortedClipFolders
}

export default useSortedClipFolders
