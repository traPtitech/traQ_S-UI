<template>
  <section>
    <profile-header text="ホームチャンネル" />
    <p>
      <icon name="home" mdi :class="$style.icon" />
      <span v-if="isLoading" :class="$style.text" aria-busy="true">
        [Now loading...]
      </span>
      <span v-else-if="isEmpty" :class="$style.text" data-is-empty>
        [未設定]
      </span>
      <span v-else :class="[$style.text, $style.channel]" @click="onClick">
        #{{ channelPath }}
      </span>
    </p>
  </section>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from '@vue/composition-api'
import store from '@/store'
import ProfileHeader from './ProfileHeader.vue'
import Icon from '@/components/UI/Icon.vue'
import useChannelPath from '@/use/channelPath'
import { changeChannelByPath } from '@/router/channel'

export default defineComponent({
  name: 'HomeChannel',
  props: {
    id: String as PropType<string | null>
  },
  setup(props, context) {
    // TODO: https://github.com/vuejs/composition-api/issues/291
    const propst = props as { id?: string | null }
    const isLoading = computed(() => propst.id === undefined)
    const isEmpty = computed(() =>
      props.id === undefined ? false : propst.id === null
    )

    const { channelIdToPathString } = useChannelPath()
    const channelPath = computed(() =>
      propst.id ? channelIdToPathString(propst.id) : ''
    )

    const onClick = async () => {
      if (!propst.id) return
      // モーダル削除時に消えちゃうため、実体を退避
      const pathCache = channelPath.value
      await store.dispatch.ui.modal.clearModal()
      changeChannelByPath(pathCache)
    }

    return {
      isLoading,
      isEmpty,
      channelPath,
      onClick
    }
  },
  components: {
    ProfileHeader,
    Icon
  }
})
</script>

<style lang="scss" module>
.icon {
  display: inline-block;
  margin-right: 4px;
  vertical-align: bottom;
}

.channel {
  cursor: pointer;
}

.text {
  @include color-ui-primary;
  &[aria-busy='true'],
  &[data-is-empty] {
    @include color-ui-tertiary;
  }
}
</style>
