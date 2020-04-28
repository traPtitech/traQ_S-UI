<template>
  <div
    @click.stop="onClick"
    :class="$style.container"
    :style="styles.container"
  >
    <!-- TODO: Badge -->
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  computed,
  PropType
} from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import { buildUserIconPath } from '@/lib/apis'
import { UserId, FileId } from '@/types/entity-ids'
import store from '@/store'

type IconSize = 160 | 64 | 48 | 44 | 40 | 36 | 32 | 28 | 24 | 20

export default defineComponent({
  name: 'UserIcon',
  props: {
    userId: {
      type: String as PropType<UserId>,
      required: true
    },
    fallbackIconFileId: String as PropType<FileId>,
    size: {
      type: Number as PropType<IconSize>,
      default: 36
    },
    preventModal: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    // TODO: https://github.com/vuejs/composition-api/issues/291
    const propst = props as { fallbackIconFileId?: FileId }

    const user = computed(() => store.state.entities.users[props.userId])
    const userIconFileId = computed(
      () => user.value?.iconFileId ?? propst.fallbackIconFileId ?? ''
    )
    const styles = reactive({
      container: makeStyles(theme => ({
        color: theme.ui.secondary,
        width: `${props.size}px`,
        height: `${props.size}px`,
        backgroundImage: userIconFileId.value
          ? `url(${buildUserIconPath(userIconFileId.value)})`
          : undefined
      }))
    })
    const onClick = () => {
      if (!props.preventModal) {
        if (user.value?.bot && user.value.name.startsWith('Webhook#')) {
          return
        }
        store.dispatch.ui.modal.pushModal({
          type: 'user',
          id: props.userId
        })
      }
    }
    return {
      styles,
      onClick
    }
  }
})
</script>

<style lang="scss" module>
.container {
  border-radius: 100vw;
  flex: {
    shrink: 0;
    grow: 0;
  }
  background: {
    position: center;
    repeat: no-repeat;
    size: cover;
  }
}
</style>
