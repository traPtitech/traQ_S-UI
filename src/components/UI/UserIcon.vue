<template>
  <div
    @click.stop="openModal"
    :role="isClickable ? 'button' : 'img'"
    :class="$style.container"
    :style="styles.container"
  >
    <div v-if="hasNotification" :class="$style.indicator">
      <notification-indicator />
    </div>
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
import { useUserModalOpener } from '@/use/modalOpener'
import NotificationIndicator from '@/components/UI/NotificationIndicator.vue'

type IconSize = 160 | 64 | 48 | 44 | 40 | 36 | 32 | 28 | 24 | 20

export default defineComponent({
  name: 'UserIcon',
  components: {
    NotificationIndicator
  },
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
    },
    hasNotification: {
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

    const { isClickable, openModal } = useUserModalOpener(props, user)

    return {
      styles,
      isClickable,
      openModal
    }
  }
})
</script>

<style lang="scss" module>
.container {
  position: relative;
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
  &[role='button'] {
    cursor: pointer;
  }
}
.indicator {
  position: absolute;
  top: 1px;
  right: 1px;
}
</style>
