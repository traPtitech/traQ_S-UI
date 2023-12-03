<template>
  <section :class="$style.element">
    <h3 :class="$style.header">スタンプ管理</h3>
    <div
      v-if="hasChannelEditPermission"
      role="tablist"
      :class="$style.tablist"
      @keydown.left="onKeydown"
      @keydown.right="onKeydown"
    >
      <a-tab
        :id="myStampTabId"
        ref="myStampTab"
        :aria-selected="currentTab === 'myStamp'"
        :aria-controls="myStampPanelId"
        :tabindex="currentTab === 'myStamp' ? 0 : -1"
        label="所有スタンプ"
        @click="currentTab = 'myStamp'"
      />
      <a-tab
        :id="otherStampTabId"
        ref="otherStampTab"
        :aria-selected="currentTab === 'otherStamp'"
        :aria-controls="otherStampPanelId"
        :tabindex="currentTab === 'otherStamp' ? 0 : -1"
        label="その他のスタンプ"
        @click="currentTab = 'otherStamp'"
      />
    </div>
    <div
      v-if="currentTab === 'myStamp'"
      :id="myStampPanelId"
      :class="$style.content"
      role="tabpanel"
    >
      <p v-if="myStamps.length === 0">所有しているスタンプはありません</p>
      <stamp-item
        v-for="stamp in myStamps"
        v-else
        :key="stamp.id"
        :stamp="stamp"
      />
    </div>
    <div
      v-if="hasChannelEditPermission && currentTab === 'otherStamp'"
      :id="otherStampPanelId"
      :class="$style.content"
      role="tabpanel"
    >
      <stamp-item
        v-for="stamp in otherStamps"
        :key="stamp.id"
        :stamp="stamp"
        show-creator
      />
    </div>
  </section>
</template>

<script lang="ts" setup>
import StampItem from './StampItem.vue'
import { computed, ref, type Ref } from 'vue'
import { useMeStore } from '/@/store/domain/me'
import { useStampsStore } from '/@/store/entities/stamps'
import { randomString } from '/@/lib/basic/randomString'
import ATab from '/@/components/UI/ATab.vue'
import { UserPermission } from '@traptitech/traq'
import { compareString } from '/@/lib/basic/string'

const { myId } = useMeStore()
const { stampsMap } = useStampsStore()

const myStamps = computed(() =>
  [...stampsMap.value.values()]
    .filter(stamp => stamp.creatorId === myId.value)
    .sort((a, b) => compareString(a.name, b.name))
)
const otherStamps = computed(() =>
  [...stampsMap.value.values()]
    .filter(stamp => stamp.creatorId !== myId.value)
    .sort((a, b) => compareString(a.name, b.name))
)

const { detail } = useMeStore()
const hasChannelEditPermission = computed(() =>
  detail.value?.permissions.includes(UserPermission.EditStampCreatedByOthers)
)

const myStampTab = ref<InstanceType<typeof ATab> | null>(null)
const otherStampTab = ref<InstanceType<typeof ATab> | null>(null)

const myStampTabId = randomString()
const otherStampTabId = randomString()

const myStampPanelId = randomString()
const otherStampPanelId = randomString()

const tabNames = ['myStamp', 'otherStamp'] as const
const tabNameRefs: Record<
  (typeof tabNames)[number],
  Ref<InstanceType<typeof ATab> | null>
> = {
  myStamp: myStampTab,
  otherStamp: otherStampTab
}
const currentTab = ref<(typeof tabNames)[number]>('myStamp')
const onKeydown = (e: KeyboardEvent) => {
  const index = tabNames.indexOf(currentTab.value)
  if (index === -1) return

  let nextIndex: number
  if (e.key === 'ArrowLeft') {
    nextIndex = index - 1
  } else if (e.key === 'ArrowRight') {
    nextIndex = index + 1
  } else {
    return
  }

  nextIndex = (nextIndex + tabNames.length) % tabNames.length

  currentTab.value = tabNames[nextIndex] ?? currentTab.value
  tabNameRefs[currentTab.value].value?.focus()
}
</script>

<style lang="scss" module>
.header {
  margin-bottom: 8px;
}
.element {
  margin: 24px 0;
}
.content {
  margin-left: 12px;
}

.tablist {
  display: flex;
  gap: 8px;
  margin-bottom: 4px;
}
</style>
