<template>
  <div :class="$style.container">
    <div :class="$style.descriptionContainer">
      <div :class="$style.fileName">image.png</div>
      <div :class="$style.info">
        <div :class="$style.fileDate">2020/10/10</div>
        <div :class="$style.fileSize">34KB</div>
      </div>
      <div :class="$style.user">
        <img
          :class="$style.userIcon"
          src="https://q.trap.jp/api/v3/public/icon/tararira"
        />
        <div :class="$style.userId">tararira</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'FilesFileListDescription',
  components: {}
})
</script>

<style lang="scss" module>
.container {
  padding: {
    top: 8px;
    left: 16px;
    bottom: 8px;
  }
  @include background-primary;
  .descriptionContainer {
    .fileName {
      @include color-ui-primary;
      @include size-h3;
    }
    .info,
    .user {
      margin-top: 4px;
    }
    .info {
      display: flex;
      align-items: center;
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
      display: flex;
      align-items: center;

      .userIcon {
        width: 24px;
        height: 24px;
        border-radius: 100vw;
      }
      .userId {
        @include size-caption;
        @include color-ui-secondary;
        margin-left: 4px;
      }
    }
  }
}
</style>
