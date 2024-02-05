<template>
  <div
    :class="$style.body"
    :title="tooltip"
    :data-include-me="$boolAttr(includeMe)"
    @click="onClick"
  >
    <transition name="stamp-pressed" mode="out-in">
      <a-stamp
        :key="pressAnimationKey"
        :stamp-id="stamp.id"
        :size="20"
        without-title
      />
    </transition>
    <spin-number :value="stamp.sum" :class="$style.count" />
  </div>
</template>

<script lang="ts" setup>
import SpinNumber from '/@/components/UI/SpinNumber.vue'
import AStamp from '/@/components/UI/AStamp.vue'
import { ref, computed, watch, onMounted } from 'vue'
import { useStampsStore } from '/@/store/entities/stamps'
import { useUsersStore } from '/@/store/entities/users'
import type { MessageStampById } from '/@/lib/messageStampList'

const props = defineProps<{
  stamp: MessageStampById
}>()

const emit = defineEmits<{
  (e: 'addStamp', _stampId: string): void
  (e: 'removeStamp', _stampId: string): void
}>()

const { stampsMap } = useStampsStore()
const { usersMap } = useUsersStore()

const stampName = computed(
  () => stampsMap.value.get(props.stamp.id)?.name ?? ''
)

const tooltip = computed(() =>
  [
    `:${stampName.value}:`,
    ...props.stamp.users.map(
      u => `${usersMap.value.get(u.id)?.displayName ?? ''}(${u.count})`
    )
  ].join(' ')
)

const includeMe = computed(() => props.stamp.myCount > 0)

// この値が変わったときにアニメーションする
const pressAnimationKey = ref(0)
onMounted(() => {
  if (props.stamp.myCount > 0) {
    pressAnimationKey.value++
  }
})
watch(
  () => props.stamp.myCount,
  (newVal, oldVal) => {
    if (oldVal < newVal) {
      pressAnimationKey.value++
    }
  }
)

const isProgress = ref(false)

const onClick = () => {
  if (isProgress.value) return
  if (includeMe.value) {
    emit('removeStamp', props.stamp.id)
  } else {
    emit('addStamp', props.stamp.id)
  }
  isProgress.value = true
}
watch(
  () => props.stamp,
  () => {
    isProgress.value = false
  }
)
</script>

<style lang="scss" module>
.body {
  @include background-tertiary;
  &[data-include-me] {
    background: var(--specific-stamp-include-me-background);
  }
  display: inline-flex;
  flex-shrink: 0;
  height: 1.5rem;
  align-items: center;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  cursor: pointer;
  user-select: none;
  overflow: hidden;
  contain: content;
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
