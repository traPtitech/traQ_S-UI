import { createTestingPinia } from '@pinia/testing'
import type { ClipFolder } from '@traptitech/traq'
import useSortedClipFolders from '/@/composables/clips/useSortedClipFolders'
import { useClipFoldersStore } from '/@/store/entities/clipFolders'

describe('useSortedClipFolders', () => {
  beforeEach(() => {
    createTestingPinia()
  })

  it('should work', () => {
    const { clipFoldersMap } = useClipFoldersStore()
    clipFoldersMap.value = new Map([
      ['b', clipFolderB],
      ['a', clipFolderA]
    ])

    const sortedClipFolders = useSortedClipFolders()
    expect(sortedClipFolders.value).toStrictEqual([clipFolderA, clipFolderB])
  })
})

const clipFolderA: ClipFolder = {
  id: 'a',
  name: 'a',
  createdAt: '2020-03-18T04:17:10.177846Z',
  description: 'a',
  ownerId: '099eed74-3ab3-4655-ac37-bc7df1139b3d'
}
const clipFolderB: ClipFolder = {
  id: 'b',
  name: 'b',
  createdAt: '2020-03-18T04:17:10.177846Z',
  description: 'b',
  ownerId: '099eed74-3ab3-4655-ac37-bc7df1139b3d'
}
