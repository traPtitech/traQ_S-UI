<template>
  <div>
    <template v-if="isPathStampPalette">
      <section
        v-if="isRecommendationEnabled"
        :class="$style.quickReaction"
        :aria-labelledby="quickReactionHeadingId"
      >
        <h3 :id="quickReactionHeadingId">ホバーメニューのスタンプ</h3>
        <FormSelectorFilterable
          v-model="quickReactionSource"
          :labelled-by="quickReactionHeadingId"
          :options="quickReactionOptions"
        >
          <template #option="{ key, stampSet }">
            <div :class="$style.quickReactionOption">
              <StampSetIcon
                :stamp-set="stampSet"
                :size="20"
                aria-hidden="true"
              />
              <span :class="$style.quickReactionLabel" :title="key">{{
                key
              }}</span>
            </div>
          </template>
        </FormSelectorFilterable>
      </section>
      <StampPaletteList />
    </template>
    <router-view />
  </div>
</template>

<script lang="ts" setup>
import { computed, useId } from 'vue'
import { useRoute } from 'vue-router'

import StampPaletteList from '/@/components/Settings/StampPaletteTab/StampPaletteList.vue'
import FormSelectorFilterable from '/@/components/UI/FormSelectorFilterable.vue'
import StampSetIcon from '/@/components/UI/StampSetIcon.vue'
import { settingsStampPaletteRouteName } from '/@/router/settings'
import { useChannelsStore } from '/@/store/entities/channels'
import { useGroupsStore } from '/@/store/entities/groups'
import { useStampPalettesStore } from '/@/store/entities/stampPalettes'
import { useStampsStore } from '/@/store/entities/stamps'
import { useUsersStore } from '/@/store/entities/users'
import {
  getStampSetKey,
  useStampPickerSettings
} from '/@/store/ui/stampPickerSettings'

const route = useRoute()
const isPathStampPalette = computed(
  () => route.name === settingsStampPaletteRouteName
)

const { isRecommendationEnabled, personalTabs, quickReactionSource } =
  useStampPickerSettings()
const quickReactionHeadingId = useId()
const quickReactionOptions = computed(() =>
  personalTabs.value.map(tab => ({
    key: tab.label,
    value: getStampSetKey(tab),
    stampSet: tab
  }))
)

const { fetchStamps } = useStampsStore()
fetchStamps()
const { fetchStampPalettes } = useStampPalettesStore()
fetchStampPalettes()
// 説明のレンダリングに必要
const { fetchChannels } = useChannelsStore()
fetchChannels()
const { fetchUsers } = useUsersStore()
fetchUsers()
const { fetchUserGroups } = useGroupsStore()
fetchUserGroups()
</script>

<style lang="scss" module>
.quickReaction {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 1.5rem;
}
.quickReactionOption {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;

  > :first-child {
    flex-shrink: 0;
  }
}
.quickReactionLabel {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
