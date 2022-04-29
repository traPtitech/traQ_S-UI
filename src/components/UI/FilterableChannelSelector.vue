<template>
  <div>
    <filter-input v-model="query" on-secondary disable-ime />
    <form-selector :options="channelOptions" :class="$style.form" />
  </div>
</template>

<script lang="ts" setup>
import FilterInput from '/@/components/UI/FilterInput.vue'
import { useChannelsStore } from '/@/store/entities/channels'
import useChannelFilter from '/@/components/Main/NavigationBar/NavigationContent/composables/useChannelFilter'
import FormSelector from '/@/components/UI/FormSelector.vue'
import { computed } from 'vue'
import useChannelPath from '/@/composables/useChannelPath'
import { compareStringInsensitive } from '/@/lib/basic/string'

const props = withDefaults(
  defineProps<{
    modelValue?: string | null
    label?: string
  }>(),
  { modelValue: '', onSecondary: false }
)

const emit = defineEmits<{
  (e: 'update:modelValue', _val: string | null): void
}>()

const { channelsMap } = useChannelsStore()

const channelListForFilter = computed(() =>
  [...channelsMap.value.values()].filter(channel => !channel.archived)
)
const { query, filteredChannels } = useChannelFilter(channelListForFilter)
const { channelIdToPathString } = useChannelPath()

const channelOptions = computed(() => {
  const channels = filteredChannels.value
    .map(channel => ({
      key: channelIdToPathString(channel.id, true),
      value: channel.id
    }))
    .sort((a, b) => compareStringInsensitive(a.key, b.key))
  return channels
})
</script>

<style lang="scss" module>
.form {
  margin-left: 12px;
}
</style>
