<template>
  <router-link :to="clipFolderPath" :class="$style.container">
    <a-icon name="bookmark" mdi :class="$style.icon" />
    <span :class="$style.name">
      {{ clipFolder.name }}
    </span>
  </router-link>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue'
import { ClipFolder } from '@traptitech/traq'
import AIcon from '/@/components/UI/AIcon.vue'
import { constructClipFoldersPath } from '/@/router'

export default defineComponent({
  name: 'ClipFoldersElement',
  components: {
    AIcon
  },
  props: {
    clipFolder: {
      type: Object as PropType<ClipFolder>,
      required: true
    }
  },
  setup(props) {
    const clipFolderPath = computed(() =>
      constructClipFoldersPath(props.clipFolder.id)
    )
    return { clipFolderPath }
  }
})
</script>

<style lang="scss" module>
.container {
  @include color-ui-primary;
  @include size-body1;
  display: flex;
  padding: 2px;
  cursor: pointer;
}
.icon {
  flex-shrink: 0;
  margin-right: 16px;
}
.name {
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
