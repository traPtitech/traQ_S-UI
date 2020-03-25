<template>
  <section :class="$style.feature">
    <button :class="$style.close" @click="onClickClear">X</button>
    <h1>{{ props.user.displayName }}</h1>
    <p>
      <span :class="$style.onlineIndicator" :data-is-online="isOnline" />
      @{{ props.user.name }}
    </p>
    <div>
      <feature-link-button title="DM" iconName="email" iconMdi />
      <div
        v-if="homeChannelId !== undefined"
        @click="onHomeChannelClick"
        :style="{ display: 'inline-block' }"
      >
        <feature-link-button title="ホーム" iconName="home" iconMdi />
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, computed, reactive, ref } from '@vue/composition-api'
import store from '@/store'
import useHomeChannelPath from '@/use/homeChannelPath'
import { makeStyles } from '@/lib/styles'
import { UserId, ChannelId } from '@/types/entity-ids'
import FeatureLinkButton from '@/components/Main/Modal/UserModal/FeatureLinkButton.vue'
import { User } from '@traptitech/traq'

const useStyles = (iconSize: number) =>
  reactive({
    icon: makeStyles(theme => ({
      marginTop: `${-iconSize / 2}px`,
      borderColor: theme.background.secondary
    }))
  })

interface Props {
  user: User
}

export default defineComponent({
  name: 'Feature',
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  setup(props: Props) {
    const iconSize = 72
    const styles = useStyles(iconSize)

    const isOnline = computed(() =>
      store.getters.domain.isUserOnline(props.user.id)
    )
    const onClickClear = () => store.dispatch.ui.modal.clearModal()

    const { homeChannelFromUsername } = useHomeChannelPath()

    let homeChannelId = ref<ChannelId>()
    try {
      homeChannelId.value = homeChannelFromUsername(
        props.user.name,
        store.state.domain.channelTree.channelTree
      )
    } catch (e) {}
    const onHomeChannelClick = () => {
      if (homeChannelId.value === undefined) return
      store.dispatch.domain.messagesView.changeCurrentChannel(
        homeChannelId.value
      )
    }

    return {
      styles,
      iconSize,
      props,
      isOnline,
      onClickClear,
      homeChannelId,
      onHomeChannelClick
    }
  },
  components: {
    FeatureLinkButton
  }
})
</script>

<style lang="scss" module>
.feature {
  grid-column: 1/3;
  text-align: center;
}

.close {
  position: absolute;
  top: 0;
  right: 0;
}

.onlineIndicator {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid;

  &[data-is-online] {
    background-color: #18fcfc;
    border-color: white;
  }
  &:not([data-is-online]) {
    background-color: red;
    border-color: lightgray;
  }
}
</style>
