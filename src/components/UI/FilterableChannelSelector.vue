<template>
  <div>
    <filter-input v-model="query" disable-ime :class="$style.form" />
    <form-selector
      v-model="value"
      :options="channelOptions"
      :class="$style.form"
    />
  </div>
</template>

<script lang="ts" setup>
import FilterInput from '/@/components/UI/FilterInput.vue'
import { useChannelsStore } from '/@/store/entities/channels'
import useChannelFilter from '/@/components/Main/NavigationBar/NavigationContent/composables/useChannelFilter'
import FormSelector from '/@/components/UI/FormSelector.vue'
import { computed, watchEffect } from 'vue'
import useChannelPath from '/@/composables/useChannelPath'
import { compareStringInsensitive } from '/@/lib/basic/string'
import { useModelValueSyncer } from '/@/composables/useModelSyncer'
import { nullUuid } from '/@/lib/basic/uuid'

const props = withDefaults(
  defineProps<{
    modelValue?: string | null
    nullKeyName?: string
  }>(),
  { modelValue: '' }
)

const emit = defineEmits<{
  (e: 'update:modelValue', _val: string | null): void
}>()

const value = useModelValueSyncer(props, emit)

const { channelsMap } = useChannelsStore()

const channelListForFilter = computed(() =>
  [...channelsMap.value.values()].filter(channel => !channel.archived)
)
const { query, filteredChannels } = useChannelFilter(channelListForFilter)
const { channelIdToPathString } = useChannelPath()

const nullVal = props.nullKeyName
  ? {
      key: props.nullKeyName,
      value: nullUuid
    }
  : undefined

const channelOptions = computed(() => {
  const channels = filteredChannels.value
    .map(channel => ({
      key: channelIdToPathString(channel.id, true),
      value: channel.id
    }))
    .sort((a, b) => compareStringInsensitive(a.key, b.key))
  return nullVal ? [nullVal, ...channels] : channels
})

watchEffect(() => {
  value.value = (query.value && filteredChannels.value[0]?.id) || value.value
})
</script>

<style lang="scss" module>
.form {
  margin-left: 12px;
  margin-bottom: 4px;
}
</style>
