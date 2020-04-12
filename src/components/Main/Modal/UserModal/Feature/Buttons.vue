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
  setup(props, context) {
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

    const onHomeChannelClick = async () => {
      if (!propst.homeChannelId) return
      // モーダル削除時に消えちゃうため、実体を退避
      const pathCache = homeChannelPath.value
      await store.dispatch.ui.modal.clearModal()
      context.root.$router.push(`/channels/${pathCache}`)
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
