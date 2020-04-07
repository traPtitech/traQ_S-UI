<template>
  <div>
    <div @click="onDMClick" :style="{ display: 'inline-block' }">
      <link-button
        :title="`${showTitle ? 'DM' : ''}`"
        icon-name="email"
        icon-mdi
      />
    </div>
    <div
      v-if="homeChannelId"
      @click="onHomeChannelClick"
      :style="{ display: 'inline-block' }"
    >
      <link-button
        :title="`${showTitle ? 'ホーム' : ''}`"
        icon-name="home"
        icon-mdi
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import store from '@/store'
import LinkButton from './LinkButton.vue'
import useChannelPath from '@/use/channelPath'

export default defineComponent({
  name: 'Buttons',
  props: {
    homeChannelId: String as PropType<string | null>,
    showTitle: {
      type: Boolean,
      required: true
    }
  },
  setup(props) {
    // TODO: https://github.com/vuejs/composition-api/issues/291
    const propst = props as { homeChannelId?: string | null }

    const onDMClick = () => {
      // TODO: DM対応
      //store.dispatch.domain.messagesView.changeCurrentChannel(/* DM Channel */)
    }

    const { channelIdToPath } = useChannelPath()
    const homeChannelPath = computed(() =>
      propst.homeChannelId
        ? channelIdToPath(propst.homeChannelId).join('/')
        : ''
    )

    const onHomeChannelClick = () => {
      if (!props.homeChannelId) return
      store.dispatch.domain.messagesView.changeCurrentChannel(
        homeChannelPath.value
      )
    }

    return {
      onDMClick,
      onHomeChannelClick
    }
  },
  components: {
    LinkButton
  }
})
</script>
