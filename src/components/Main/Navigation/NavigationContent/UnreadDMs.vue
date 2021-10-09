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
import { defineComponent, computed } from 'vue'
import store from '/@/store'
import NavigationContentContainer from '/@/components/Main/Navigation/NavigationContentContainer.vue'
import { isDefined } from '/@/lib/basic/array'
import DMActivityElement from './DMActivityElement.vue'

const useUsersWithNotification = () => {
  const usersWithNotification = computed(() =>
    [...store.state.domain.me.unreadChannelsMap.values()]
      .sort((a, b) =>
        Date.parse(a.updatedAt) > Date.parse(b.updatedAt) ? -1 : 1
      )
      .map(unread =>
        store.state.entities.dmChannelsMap.get(unread.channelId ?? '')
      )
      .filter(isDefined)
      .map(({ userId }) => userId)
  )
  return usersWithNotification
}

export default defineComponent({
  name: 'UnreadDMs',
  components: {
    DMActivityElement,
    NavigationContentContainer
  },
  setup() {
    const usersWithNotification = useUsersWithNotification()
    return { usersWithNotification }
  }
})
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
