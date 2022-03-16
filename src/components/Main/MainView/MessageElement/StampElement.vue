<template>
  <div
    :class="$style.body"
    :title="state.tooltip"
    :data-include-me="$boolAttr(state.includeMe)"
    :data-my-count-has-incremented="$boolAttr(state.myCountHasIncremented)"
    @click="onClick"
  >
    <a-stamp
      :stamp-id="stamp.id"
      :size="20"
      without-title
      :class="$style.icon"
      @animationend="unsetMyCountHasIncremented"
    />
    <spin-number :value="stamp.sum" :class="$style.count" />
  </div>
</template>

<script lang="ts" setup>
import SpinNumber from '/@/components/UI/SpinNumber.vue';
import AStamp from '/@/components/UI/AStamp.vue';
import { reactive, computed, watch, onMounted } from 'vue';
import { MessageStampById } from './MessageStampList.vue'
import { useStampsStore } from '/@/store/entities/stamps'
import { useUsersStore } from '/@/store/entities/users'

const props = defineProps<{
    stamp: MessageStampById
}>();

const emit = defineEmits<{
    (e: "addStamp", _stampId: string): void,
    (e: "removeStamp", _stampId: string): void
}>();

const { stampsMap } = useStampsStore()
const { usersMap } = useUsersStore()

const stampName = computed(
  () => stampsMap.value.get(props.stamp.id)?.name ?? ''
)

const state = reactive({
  includeMe: computed(() => props.stamp.myCount > 0),
  tooltip: computed(() =>
    [
      `:${stampName.value}:`,
      ...props.stamp.users.map(
        u => `${usersMap.value.get(u.id)?.displayName ?? ''}(${u.count})`
      )
    ].join(' ')
  ),
  isProgress: false,
  myCountHasIncremented: false
})

const onClick = () => {
  if (state.isProgress) return
  if (state.includeMe) {
    emit('removeStamp', props.stamp.id)
  } else {
    emit('addStamp', props.stamp.id)
  }
  state.isProgress = true
}
watch(
  () => props.stamp,
  () => {
    state.isProgress = false
  }
)

onMounted(() => {
  if (props.stamp.myCount > 0) {
    state.myCountHasIncremented = true
  }
})
watch(
  () => props.stamp.myCount,
  (newVal, oldVal) => {
    if (oldVal < newVal) {
      state.myCountHasIncremented = true
    }
  }
)
const unsetMyCountHasIncremented = () => {
  state.myCountHasIncremented = false
}
</script>

<style lang="scss" module>
.body {
  @include background-tertiary;
  &[data-include-me] {
    background: var(--specific-stamp-include-me-background);
  }
  display: inline-flex;
  flex-shrink: 0;
  height: 24px;
  align-items: center;
  padding: 2px 4px;
  border-radius: 4px;
  cursor: pointer;
  user-select: none;
  overflow: hidden;
  contain: content;
}

.icon {
  .body[data-my-count-has-incremented] & {
    animation: stamp-pressed 0.5s ease;
  }
}

@keyframes stamp-pressed {
  0% {
    transform: scale(0.7);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.count {
  color: var(--specific-count-text);
  .body[data-include-me] &,
  .body:hover & {
    @include color-ui-primary;
  }
  @include size-body2;
  font-weight: bold;
  margin: {
    left: 6px;
    right: 4px;
  }
}
</style>
