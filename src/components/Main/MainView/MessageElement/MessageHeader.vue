<template>
  <div :class="$style.header">
    <span :class="$style.displayName">{{ state.displayName }}</span>
    <grade-badge :class="$style.badge" :user-id="userId" :is-bot="state.bot" />
    <span :class="$style.name">@{{ state.name }}</span>
    <span :class="$style.date">{{ state.date }}</span>
    <icon
      v-if="createdAt !== updatedAt"
      :class="$style.editIcon"
      :width="16"
      :height="16"
      name="pencil"
      mdi
    />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  computed,
  PropType
} from '@vue/composition-api'
import { UserId } from '@/types/entity-ids'
import store from '@/store'
import { getDisplayDate } from '@/lib/date'
import GradeBadge from './GradeBadge.vue'
import Icon from '@/components/UI/Icon.vue'

export default defineComponent({
  name: 'MessageHeader',
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
  components: { GradeBadge, Icon },
  setup(props) {
    const state = reactive({
      user: computed(() => store.state.entities.users[props.userId]),
      displayName: computed((): string => state.user?.displayName ?? 'unknown'),
      name: computed((): string => state.user?.name ?? 'unknown'),
      bot: computed((): boolean => state.user?.bot ?? false),
      date: computed(() => getDisplayDate(props.createdAt, props.updatedAt))
    })
    if (state.user === undefined) {
      store.dispatch.entities.fetchUser(props.userId)
    }
    return { state }
  }
})
</script>

<style lang="scss" module>
.header {
  display: inline-flex;
  align-items: center;
  min-width: 0;
}

.displayName {
  font-weight: bold;
  word-break: keep-all;
  white-space: nowrap;
}

.badge {
  margin-left: 4px;
}

.name {
  @include size-body2;
  margin-left: 4px;

  word-break: keep-all;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  color: $theme-ui-secondary;
}

.date {
  @include size-caption;
  margin-left: 4px;
  font-size: 0.8rem;
  color: $theme-ui-secondary;
}

.editicon {
  color: $theme-ui-secondary;
  margin-left: 4px;
}
</style>
