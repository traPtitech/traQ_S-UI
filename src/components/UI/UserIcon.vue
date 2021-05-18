<template>
  <div
    :role="isClickable ? 'button' : 'img'"
    :class="$style.container"
    :style="styles.container"
    @click.stop="openModal"
  >
    <div v-if="hasNotification" :class="$style.indicator">
      <notification-indicator :size="indicatorSize" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, computed, PropType, watch } from 'vue'
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
    indicatorSize: {
      type: Number,
      default: 10
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
    watch(
      () => props.userId,
      userId => {
        store.dispatch.entities.fetchUser({ userId })
      },
      { immediate: true }
    )

    const user = computed(() =>
      props.userId === store.getters.domain.me.myId
        ? store.state.domain.me.detail
        : store.state.entities.usersMap.get(props.userId)
    )
    const userIconFileId = computed(
      () => user.value?.iconFileId ?? props.fallbackIconFileId ?? ''
    )
    const styles = reactive({
      container: computed(() => ({
        width: `${props.size}px`,
        height: `${props.size}px`,
        backgroundImage: userIconFileId.value
          ? `url(${buildUserIconPath(userIconFileId.value)})`
          : undefined,
        pointerEvents: props.preventModal ? 'none' : undefined
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
  @include color-ui-secondary;
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
  top: 0;
  right: 0;
}
</style>
