<template>
  <div :class="$style.container">
    <div :class="$style.userIcon" :data-talking-level="talkingLevel">
      <user-icon :user-id="userId" :size="24" />
    </div>
    <div :class="$style.userDesc">
      <slider
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
      <icon mdi name="tune" :size="16" />
    </button>
    <button
      v-else-if="showTuneDoneButton"
      :class="[$style.button, $style.tuneDone]"
      @click="tuneDone"
    >
      <icon mdi name="check" :size="16" />
    </button>
    <div v-else-if="micMuted" :class="$style.icon">
      <icon mdi name="microphone-off" :size="16" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue'
import Slider from '/@/components/UI/Slider.vue'
import UserIcon from '/@/components/UI/UserIcon.vue'
import Icon from '/@/components/UI/Icon.vue'
import { UserId } from '/@/types/entity-ids'
import store from '/@/store'

const maxVolumeValue = 200

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
  emits: {
    tune: () => true,
    tuneDone: () => true
  },
  setup(props, { emit }) {
    const volume = computed(() =>
      Math.round(
        (store.state.app.rtc.userVolumeMap.get(props.userId) ?? 0) *
          maxVolumeValue
      )
    )
    const userName = computed(
      () => store.state.entities.usersMap.get(props.userId)?.displayName ?? ''
    )
    const talkingLevel = computed(() =>
      store.state.app.rtc.talkingUsersState.get(props.userId)
    )
    const onChange = (value: number) => {
      store.commit.app.rtc.setUserVolume({
        userId: props.userId,
        volume: value / maxVolumeValue
      })
    }

    const tune = () => {
      emit('tune')
    }
    const tuneDone = () => {
      emit('tuneDone')
    }

    return {
      volume,
      userName,
      talkingLevel,
      maxVolumeValue,
      onChange,
      tune,
      tuneDone
    }
  }
})
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
  @include color-ui-secondary;
  height: 20px;
  opacity: 0.5;
}
.button {
  @include color-ui-secondary;
  height: 20px;
  opacity: 0.5;
  cursor: pointer;
  &:hover {
    opacity: 1;
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
