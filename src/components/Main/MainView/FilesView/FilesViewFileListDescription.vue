<template>
  <div :class="$style.container">
    <div
      :class="$style.fileName"
      :data-is-ellipsis="$boolAttr(isEllipsis)"
      :title="name"
    >
      {{ name }}
    </div>
    <div :class="$style.info">
      <span :class="$style.fileDate">
        {{ createdAt }}
      </span>
      <span :class="$style.fileSize">
        {{ fileSize }}
      </span>
    </div>
    <div :class="$style.user">
      <user-icon :class="$style.userIcon" :user-id="user" :size="24" />
      <div :class="$style.userId">
        {{ user }}
      </div>
    </div>
    <icon
      mdi
      name="download"
      :size="24"
      :class="$style.dl"
      @click="onFileDownloadLinkClick"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import useFileMeta from '@/use/fileMeta'
import Icon from '@/components/UI/Icon.vue'
import store from '@/store'
import { getCreatedDate } from '@/lib/date'
import UserIcon from '@/components/UI/UserIcon.vue'
export default defineComponent({
  name: 'FilesFileListDescription',
  components: {
    Icon,
    UserIcon
  },
  props: {
    fileId: {
      type: String,
      required: true
    }
    // isWhite: {
    //   type: Boolean,
    //   default: false
    // },
    // isEllipsis: {
    //   type: Boolean,
    //   default: false
    // }
  },
  setup(props, context) {
    const { fileMeta, fileSize, onFileDownloadLinkClick } = useFileMeta(
      props,
      context
    )
    const name = computed(() => fileMeta.value?.name ?? 'unknown')
    const createdAt = computed(() =>
      getCreatedDate(fileMeta.value?.createdAt ?? '')
    )
    return {
      fileMeta,
      fileSize,
      name,
      onFileDownloadLinkClick,
      createdAt
    //   user
    }
  }
})
</script>

<style lang="scss" module>
.container {
  padding: 8px 16px;
  @include background-primary;
  display: grid;
  width: 100%;
  grid-template:
    'name ..' minmax(min-content, 20px)
    'info dl' minmax(min-content, 20px)
    'user ..' minmax(min-content, 20px)
    / auto 24px;
}
.fileName {
  @include color-ui-primary;
  @include size-h3;
}
.info,
.user {
  margin-top: 4px;
}
.info {
  grid-area: info;
  .fileDate,
  .fileSize {
    @include color-ui-secondary;
    @include size-caption;
  }
  .fileDate {
  }
  .fileSize {
    margin-left: 8px;
  }
}
.user {
  grid-area: user;
  .userIcon {
    display: inline-flex;
    vertical-align: middle;
  }
  .userId {
    @include size-caption;
    @include color-ui-secondary;
    display: inline-flex;
    margin-left: 8px;
  }
}
.dl {
  grid-area: dl;
  @include color-ui-primary;
}
</style>
