<script setup lang="ts">
import UserIcon from '/@/components/UI/UserIcon.vue'
import AIcon from '/@/components/UI/AIcon.vue'

interface Props {
  participant: {
    user: {
      id: string
      name: string
      displayName: string
    }
  }
  onMute: (participant: Props['participant']) => void
  onVolumeChange: (e: Event, participant: Props['participant']) => void
}

defineProps<Props>()
</script>

<template>
  <div :class="$style.container">
    <div :class="$style.leftSide">
      <user-icon :size="40" :user-id="participant.user.id" />
      <span :class="$style.userName">{{ participant.user.displayName }}</span>
      <button :class="$style.micIconButton">
        <a-icon name="microphone-off" mdi />
      </button>
    </div>
    <div :class="$style.rightSide">
      <button :class="$style.iconButton" @click="() => onMute(participant)">
        <!-- TODO: Qall 適切な条件分岐 -->
        <a-icon v-if="false" name="volume-high" :size="24" mdi />
        <a-icon v-else name="volume-off" mdi :size="24" />
      </button>
      <input
        :class="$style.volumeSlider"
        type="range"
        min="0"
        max="100"
        @input="e => onVolumeChange(e, participant)"
      />
      <button :class="$style.accountMinusButton">
        <a-icon name="account-minus" :size="24" mdi />
      </button>
    </div>
  </div>
</template>

<style lang="scss" module>
.container {
  padding: 8px;
  border-bottom: 1px solid rgba(206, 214, 219, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
  &:last-child {
    border-bottom: none;
  }
}

.leftSide {
  display: flex;
  align-items: center;
}

.userName {
  line-height: 24px;
  margin-left: 12px;
}

.micIconButton {
  margin-left: 4px;
  color: black;
  cursor: pointer;
}

.rightSide {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.iconButton {
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  cursor: pointer;
}

.volumeSlider {
  width: 100px;
}

.accountMinusButton {
  cursor: pointer;
  color: #f26451;
}
</style>
