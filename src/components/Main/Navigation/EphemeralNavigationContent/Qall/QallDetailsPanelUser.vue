<template>
  <div :class="$style.container">
    <user-icon :user-id="userId" :size="24" />
    <div>
      <slider
        v-if="showVolumeControl"
        :value="volume"
        @change="onChange"
        :min="0"
        :max="200"
        tooltip-formatter="{value}%"
        :disabled="disabled || volume === undefined"
        :tooltip="disabled ? 'none' : 'active'"
      />
      <span v-else :style="styles.userName" :class="$style.userName">{{
        userName
      }}</span>
    </div>
    <div v-if="showTuneButton" @click="$emit('tune')" :class="$style.button">
      <icon mdi name="tune" :size="16" />
    </div>
    <div
      v-else-if="showTuneDoneButton"
      @click="$emit('tune-done')"
      :class="$style.button"
      :style="styles.tuneDone"
    >
      <icon mdi name="check" :size="16" />
    </div>
    <div v-else-if="micMuted" :class="$style.icon">
      <icon mdi name="microphone-off" :size="16" />
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
  computed,
  reactive
} from '@vue/composition-api'
import Slider from '@/components/UI/Slider.vue'
import UserIcon from '@/components/UI/UserIcon.vue'
import Icon from '@/components/UI/Icon.vue'
import { UserId } from '@/types/entity-ids'
import store from '@/store'
import { makeStyles } from '@/lib/styles'

const maxVolumeValue = 200

const useStyles = () =>
  reactive({
    userName: makeStyles(theme => ({ color: theme.ui.secondary })),
    tuneDone: makeStyles(theme => ({ color: theme.accent.primary }))
  })

export default defineComponent({
  name: 'QallDetailsPanelUser',
  components: {
    Slider,
    Icon,
    UserIcon
  },
  props: {
    userId: { type: String as PropType<UserId>, required: true },
    showVolumeControl: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    showTuneButton: { type: Boolean, default: false },
    showTuneDoneButton: { type: Boolean, default: false },
    micMuted: { type: Boolean, default: false }
  },
  setup(props) {
    const volume = computed(
      () =>
        (store.state.app.rtc.userVolumeMap[props.userId] ?? 0) * maxVolumeValue
    )
    const userName = computed(
      () => store.state.entities.users[props.userId]?.displayName ?? ''
    )
    const onChange = (value: number) => {
      store.commit.app.rtc.setUserVolume({
        userId: props.userId,
        volume: value / maxVolumeValue
      })
    }
    const styles = useStyles()
    return {
      styles,
      volume,
      userName,
      maxVolumeValue,
      onChange
    }
  }
})
</script>

<style lang="scss" module>
.container {
  display: grid;
  grid-template-columns: 24px 1fr 16px;
  column-gap: 12px;
  align-items: center;
}
.icon {
  height: 20px;
  opacity: 0.5;
}
.button {
  height: 20px;
  opacity: 0.5;
  cursor: pointer;
  &:hover {
    opacity: 1;
  }
}
.userName {
  font-size: 0.875rem;
  display: flex;
  align-items: center;
}
</style>
