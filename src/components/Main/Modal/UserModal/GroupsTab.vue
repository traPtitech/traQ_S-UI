<template>
  <div :class="$style.groups" :style="styles.groups">
    <template v-if="isLoading">Now loading...</template>
    <template v-else>
      <ul :class="$style.list">
        <li
          v-for="group in groups"
          :key="group.id"
          :class="$style.group"
          @click="onGroupClick"
        >
          <icon name="group" :class="$style.icon" :size="20" />
          {{ group.name }}
        </li>
      </ul>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, reactive } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import store from '@/store'
import { UserDetail } from '@traptitech/traq'
import Icon from '@/components/UI/Icon.vue'

const useStyles = () =>
  reactive({
    groups: makeStyles(theme => ({
      color: theme.ui.secondary
    }))
  })

interface Props {
  detail?: UserDetail
}

export default defineComponent({
  name: 'GroupsTab',
  props: {
    detail: Object
  },
  setup(props: Props) {
    const styles = useStyles()
    const isLoading = computed(() => props.detail === undefined)
    const groups = computed(
      () =>
        props.detail?.groups.map(
          groupId => store.state.entities.userGroups[groupId]
        ) ?? []
    )

    const onGroupClick = () => {
      // TODO: Open tag modal
    }

    return { styles, isLoading, groups, onGroupClick }
  },
  components: {
    Icon
  }
})
</script>

<style lang="scss" module>
.groups {
  height: 100%;
}

.list {
  overflow-y: scroll;
  min-height: 100%;
}

.group {
  margin: 16px 8px;
}

.icon {
  vertical-align: bottom;
  margin-right: 4px;
}
</style>
