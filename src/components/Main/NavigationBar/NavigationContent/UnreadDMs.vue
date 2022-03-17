<template>
  <navigation-content-container
    v-if="dmChannelsWithNotification.length > 0"
    subtitle="未読ダイレクトメッセージ"
  >
    <div :class="$style.dmActivity">
      <d-m-activity-element
        v-for="dmChannel in dmChannelsWithNotification"
        :key="dmChannel.userId"
        :user-id="dmChannel.userId"
        :class="$style.dmActivityElement"
      />
    </div>
  </navigation-content-container>
</template>

<script lang="ts" setup>
import NavigationContentContainer from '/@/components/Main/NavigationBar/NavigationContentContainer.vue'
import DMActivityElement from './DMActivityElement.vue'
import useChannelsWithNotification from '/@/composables/unreads/useChannelsWithNotification'

const { dmChannelsWithNotification } = useChannelsWithNotification()
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
