<template>
  <navigation-content-container
    v-if="usersWithNotification.length > 0"
    subtitle="未読ダイレクトメッセージ"
  >
    <div :class="$style.dmActivity">
      <d-m-activity-element
        v-for="user in usersWithNotification"
        :key="user"
        :user-id="user"
        :class="$style.dmActivityElement"
      />
    </div>
  </navigation-content-container>
</template>

<script lang="ts">
import { computed } from 'vue';
import { isDefined } from '/@/lib/basic/array'
import { useMeStore } from '/@/store/domain/me'
import { useChannelsStore } from '/@/store/entities/channels'

const useUsersWithNotification = () => {
  const { unreadChannelsMap } = useMeStore()
  const { dmChannelsMap } = useChannelsStore()
  const usersWithNotification = computed(() =>
    [...unreadChannelsMap.value.values()]
      .sort((a, b) =>
        Date.parse(a.updatedAt) > Date.parse(b.updatedAt) ? -1 : 1
      )
      .map(unread => dmChannelsMap.value.get(unread.channelId ?? ''))
      .filter(isDefined)
      .map(({ userId }) => userId)
  )
  return usersWithNotification
}
</script>

<script lang="ts" setup>
import NavigationContentContainer from '/@/components/Main/NavigationBar/NavigationContentContainer.vue';
import DMActivityElement from './DMActivityElement.vue';

const usersWithNotification = useUsersWithNotification()
</script>

<style lang="scss" module>
.dmActivity {
  margin-bottom: 8px;
}
.dmActivityElement {
  margin: 8px 0;
  &:first-child {
    margin-top: 0;
  }
  &:last-child {
    margin-bottom: 0;
  }
}
</style>
