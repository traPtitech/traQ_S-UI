<template>
  <section>
    <profile-header text="ホームチャンネル" />
    <p :style="styles.text">
      <icon name="home" mdi :class="$style.icon" />
      <span v-if="isLoading">[Now loading...]</span>
      <span v-else-if="isEmpty">[未設定]</span>
      <span v-else :class="$style.channel" @click="onClick">
        #{{ channelPath }}
      </span>
    </p>
  </section>
</template>

<script lang="ts">
import {
  defineComponent,
  Ref,
  reactive,
  computed,
  PropType
} from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import store from '@/store'
import ProfileHeader from './ProfileHeader.vue'
import Icon from '@/components/UI/Icon.vue'
import useChannelPath from '@/use/channelPath'

const useStyles = (lowPriority: Ref<boolean>) =>
  reactive({
    text: makeStyles(theme => ({
      color: lowPriority.value ? theme.ui.tertiary : theme.ui.primary
    }))
  })

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
    const lowPriority = computed(() => isLoading.value || isEmpty.value)
    const styles = useStyles(lowPriority)

    const { channelIdToPathString } = useChannelPath()
    const channelPath = computed(() =>
      propst.id ? channelIdToPathString(propst.id) : ''
    )

    const onClick = async () => {
      if (!propst.id) return
      // モーダル削除時に消えちゃうため、実体を退避
      const pathCache = channelPath.value
      await store.dispatch.ui.modal.clearModal()
      // 同じ場所に移動しようとした際のエラーを消す
      context.root.$router.push(`/channels/${pathCache}`).catch(() => {})
    }

    return {
      styles,
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
</style>
