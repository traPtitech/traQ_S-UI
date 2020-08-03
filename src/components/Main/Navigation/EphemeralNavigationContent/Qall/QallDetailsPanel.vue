<template>
  <div :class="$style.container">
    <div
      :class="$style.expandButton"
      :data-is-expanded="isExpanded"
      @click="toggleExpanded"
    >
      <icon :class="$style.expandIcon" name="chevron-up" mdi />
    </div>
    <div :class="$style.list" :data-is-expanded="isExpanded">
      <qall-details-panel-user
        v-if="me"
        :class="$style.slider"
        :key="me"
        :user-id="me"
        :mic-muted="mutedUsers.includes(me)"
        :show-tune-button="!showVolumeTune"
        :show-tune-done-button="showVolumeTune"
        @tune="toggleVolumeTune(true)"
        @tune-done="toggleVolumeTune(false)"
        disabled
      />
      <qall-details-panel-user
        v-for="id in users"
        :class="$style.slider"
        :key="id"
        :user-id="id"
        :mic-muted="mutedUsers.includes(id)"
        :show-volume-control="showVolumeTune"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue'
import store from '@/store'
import QallDetailsPanelUser from './QallDetailsPanelUser.vue'
import Icon from '@/components/UI/Icon.vue'

const useExpanded = () => {
  const isExpanded = ref(false)
  const toggleExpanded = () => {
    isExpanded.value = !isExpanded.value
  }
  return { isExpanded, toggleExpanded }
}

export default defineComponent({
  name: 'QallDetailsPanel',
  components: {
    Icon,
    QallDetailsPanelUser
  },
  setup() {
    const { isExpanded, toggleExpanded } = useExpanded()

    const showVolumeTune = ref(false)
    const toggleVolumeTune = (show: boolean) => {
      showVolumeTune.value = show
    }

    const me = computed(() => store.state.domain.me.detail?.id)
    const users = computed(() =>
      store.getters.app.rtc.currentSessionUsers.filter(id => id !== me.value)
    )
    const mutedUsers = computed(() => store.getters.app.rtc.currentMutedUsers)

    return {
      isExpanded,
      toggleExpanded,
      users,
      me,
      mutedUsers,
      showVolumeTune,
      toggleVolumeTune
    }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  flex-direction: column;
  flex: 1 1;
  min-height: 0;
}
.expandButton {
  display: flex;
  justify-content: center;
  cursor: pointer;
}
.expandIcon {
  transform: rotate(0);
  transition: transform 0.5s;
  .expandButton[data-is-expanded] & {
    transform: rotate(0.5turn);
  }
}
.list {
  padding: 0 12px 8px 12px;
  max-height: 120px;
  overflow: scroll;
  transition: 0.5s max-height ease-out;
  &[data-is-expanded] {
    max-height: 600px;
  }
}
.slider {
  margin: 12px 0;
  &:first-child {
    margin-top: 0;
  }
  &:last-child {
    margin-bottom: 0;
  }
}
</style>
