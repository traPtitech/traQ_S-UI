<template>
  <div :class="$style.container">
    <div :class="$style.userIcon" :data-talking-level="talkingLevel">
      <user-icon :user-id="userId" :size="24" />
    </div>
    <div :class="$style.userDesc">
      <a-slider
        v-if="showVolumeControl"
        :value="volume"
        :min="0"
        :max="200"
        tooltip-formatter="{value}%"
        :disabled="disabled || volume === undefined"
        :tooltip="disabled ? 'none' : 'active'"
        @change-value="onChange"
      />
      <span v-else :class="$style.userName">{{ userName }}</span>
    </div>
    <button v-if="showTuneButton" :class="$style.button" @click="tune">
      <a-icon mdi name="tune" :size="16" />
    </button>
    <button
      v-else-if="showTuneDoneButton"
      :class="[$style.button, $style.tuneDone]"
      @click="tuneDone"
    >
      <a-icon mdi name="check" :size="16" />
    </button>
    <div v-else-if="micMuted" :class="$style.icon">
      <a-icon mdi name="microphone-off" :size="16" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { UserId } from '/@/types/entity-ids'
import { useAppRtcStore } from '/@/store/app/rtc'
import { useUsersStore } from '/@/store/entities/users'
import ASlider from '/@/components/UI/ASlider.vue'
import UserIcon from '/@/components/UI/UserIcon.vue'
import AIcon from '/@/components/UI/AIcon.vue'

const props = withDefaults(
  defineProps<{
    userId: UserId
    showVolumeControl?: boolean
    disabled?: boolean
    showTuneButton?: boolean
    showTuneDoneButton?: boolean
    micMuted?: boolean
  }>(),
  {
    showVolumeControl: false,
    disabled: false,
    showTuneButton: false,
    showTuneDoneButton: false,
    micMuted: false
  }
)

const emit = defineEmits<{
  (e: 'tune'): void
  (e: 'tuneDone'): void
}>()

const maxVolumeValue = 200

const { talkingUsersState, getUserVolume, setUserVolume } = useAppRtcStore()
const { usersMap } = useUsersStore()
const volume = computed(() =>
  Math.round(getUserVolume(props.userId) * maxVolumeValue)
)
const userName = computed(
  () => usersMap.value.get(props.userId)?.displayName ?? ''
)
const talkingLevel = computed(() => talkingUsersState.value.get(props.userId))
const onChange = (value: number) => {
  setUserVolume(props.userId, value / maxVolumeValue)
}

const tune = () => {
  emit('tune')
}
const tuneDone = () => {
  emit('tuneDone')
}
</script>

<style lang="scss" module>
.container {
  display: grid;
  grid-template-columns: min-content 1fr 16px;
  column-gap: 12px;
  align-items: center;
}
.userIcon {
  margin: 4px;
  border: {
    style: solid;
    color: $common-ui-qall;
    width: 0;
    radius: 50%;
  }
  &[data-talking-level='1'] {
    margin: 3px;
    border-width: 1px;
  }
  &[data-talking-level='2'] {
    margin: 2px;
    border-width: 2px;
  }
  &[data-talking-level='3'] {
    margin: 1px;
    border-width: 3px;
  }
  &[data-talking-level='4'] {
    margin: 0;
    border-width: 4px;
  }
}
.icon {
  @include color-ui-secondary-inactive;
  height: 20px;
}
.button {
  @include color-ui-secondary-inactive;
  height: 20px;
  cursor: pointer;
  &:hover {
    @include color-ui-secondary;
  }
}
.tuneDone {
  @include color-accent-primary;
}
.userDesc {
  min-width: 0;
}
.userName {
  @include color-ui-secondary;
  @include size-body2;
  display: inline-block;
  width: 100%;
  vertical-align: middle;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
