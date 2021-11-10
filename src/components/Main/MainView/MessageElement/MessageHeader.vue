<template>
  <div :class="$style.header">
    <span :class="$style.displayName">{{ state.displayName }}</span>
    <grade-badge :class="$style.badge" :user-id="userId" :is-bot="state.bot" />
    <span :class="$style.name">@{{ state.name }}</span>
    <span
      :class="$style.date"
      :title="createdAt !== updatedAt ? state.createdDate : undefined"
    >
      {{ state.date }}
    </span>
    <a-icon
      v-if="createdAt !== updatedAt"
      :class="$style.editIcon"
      :size="16"
      name="pencil-outline"
      mdi
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, computed, PropType } from 'vue'
import { UserId } from '/@/types/entity-ids'
import store from '/@/store'
import { getDisplayDate, getFullDayWithTimeString } from '/@/lib/basic/date'
import GradeBadge from './GradeBadge.vue'
import AIcon from '/@/components/UI/AIcon.vue'

export default defineComponent({
  name: 'MessageHeader',
  components: { GradeBadge, AIcon },
  props: {
    userId: {
      type: String as PropType<UserId>,
      required: true
    },
    createdAt: {
      type: String,
      required: true
    },
    updatedAt: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const state = reactive({
      user: computed(() => store.state.entities.usersMap.get(props.userId)),
      displayName: computed((): string => state.user?.displayName ?? 'unknown'),
      name: computed((): string => state.user?.name ?? 'unknown'),
      bot: computed((): boolean => state.user?.bot ?? false),
      createdDate: computed(() =>
        getFullDayWithTimeString(new Date(props.createdAt))
      ),
      date: computed(() => getDisplayDate(props.createdAt, props.updatedAt))
    })
    if (state.user === undefined) {
      store.dispatch.entities.fetchUser({ userId: props.userId })
    }
    return { state }
  }
})
</script>

<style lang="scss" module>
.header {
  display: inline-flex;
  align-items: baseline;
  min-width: 0;
}

.displayName {
  font-weight: bold;
  flex: 2;
  max-width: min-content;

  word-break: keep-all;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.badge {
  margin-left: 4px;
}

.name {
  @include color-ui-secondary;
  @include size-body2;
  margin-left: 4px;
  flex: 1;
  max-width: min-content;

  word-break: keep-all;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.date {
  @include color-ui-secondary;
  @include size-caption;
  margin-left: 4px;
}

.editIcon {
  @include color-ui-secondary;
  margin-left: 4px;
  flex-shrink: 0;
}
</style>
