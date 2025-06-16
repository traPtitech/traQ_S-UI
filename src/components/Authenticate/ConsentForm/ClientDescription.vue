<template>
  <div :class="$style.container">
    <div :class="$style.name">
      {{ client.name }}
    </div>
    <div :class="$style.desc">
      <div :class="$style.descTitle">開発者</div>
      <div :class="$style.descContent">
        <template v-if="developer">
          <user-icon
            :class="$style.developerIcon"
            :user-id="developer.id"
            :fallback-icon-file-id="developer.iconFileId"
            :size="24"
          />
          {{ developer.displayName }} (@{{ developer.name }})
        </template>
        <template v-else>
          <div>=====</div>
        </template>
      </div>
      <div :class="$style.descTitle">説明</div>
      <div :class="$style.descContent">
        {{ client.description }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import UserIcon from '/@/components/UI/UserIcon.vue'
import type { OAuth2Client, User } from '@traptitech/traq'

defineProps<{
  client: OAuth2Client
  developer?: User
}>()
</script>

<style lang="scss" module>
.container {
  @include background-secondary;
  @include color-ui-primary;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: fit-content;
  max-width: 100%;
  padding: 12px;
  border-radius: 12px;
}
.name {
  margin-bottom: 12px;
  font-weight: bold;
  text-align: center;
  word-break: normal;
  overflow-wrap: break-word; // for Safari
  overflow-wrap: anywhere;
}
.desc {
  display: grid;
  grid-template-columns: min-content auto;
  grid-template-rows: repeat(2, min-content);
  grid-column-gap: 12px;
  grid-row-gap: 8px;
}
.descTitle {
  @include color-ui-secondary;
  word-break: keep-all;
  padding: 4px 12px;
  margin: auto 0;
  border: solid 2px $theme-ui-secondary-default;
  border-radius: 18px;
  font-weight: bold;
  text-align: center;
}
.descContent {
  min-width: 0;
  word-break: normal;
  overflow-wrap: break-word; // for Safari
  overflow-wrap: anywhere;
  margin: auto 0;
}
.developerIcon {
  display: inline-block;
  margin-right: 4px;
  vertical-align: bottom;
}
</style>
