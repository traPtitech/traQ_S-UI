<template>
  <div>
    <link-button
      :title="`${showTitle ? 'DM' : ''}`"
      icon-name="email"
      icon-mdi
      @click.native="onDMClick"
    />
    <link-button
      v-if="homeChannelId"
      :title="`${showTitle ? 'ホーム' : ''}`"
      icon-name="home"
      icon-mdi
      @click.native="onHomeChannelClick"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import store from '@/store'
import { changeChannelByPath } from '@/router/channel'
import { constructUserPath, changeRouteByPath } from '@/router'
import useChannelPath from '@/use/channelPath'
import LinkButton from './LinkButton.vue'

export default defineComponent({
  name: 'Buttons',
  props: {
    homeChannelId: {
      type: String,
      required: false
    },
    userName: {
      type: String,
      required: true
    },
    showTitle: {
      type: Boolean,
      default: false
    }
  },
  setup(props, context) {
    const onDMClick = async () => {
      const nameCache = props.userName
      await store.dispatch.ui.modal.clearModal()
      changeRouteByPath(constructUserPath(nameCache))
    }

    const { channelIdToPathString } = useChannelPath()
    const homeChannelPath = computed(() =>
      props.homeChannelId ? channelIdToPathString(props.homeChannelId) : ''
    )

    const onHomeChannelClick = async () => {
      if (!props.homeChannelId) return
      // モーダル削除時に消えちゃうため、実体を退避
      const pathCache = homeChannelPath.value
      await store.dispatch.ui.modal.clearModal()
      changeChannelByPath(pathCache)
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
