<template>
  <div :key="token.id" :class="$style.token">
    <div :class="$style.revoke">
      <a-icon :class="$style.icon" name="close" mdi @click="revoke" />
    </div>
    <div :class="$style.title">{{ token.clientName ?? '---' }}</div>
    <div :class="$style.desc">{{ token.clientDesc }}</div>
    <div :class="$style.developer">
      開発者:
      <template v-if="token.clientDeveloper">
        <user-icon
          :class="$style.developerIcon"
          :user-id="token.clientDeveloper.id"
          :size="24"
          prevent-modal
        />
        @{{ token.clientDeveloper.name }}
      </template>
      <template v-else>---</template>
    </div>
    <div :class="$style.issuedAt">許可日時: {{ issuedAt }}</div>
    <div :class="$style.scopes">許可範囲: {{ scopes.join(', ') }}</div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { ActiveOAuth2Token, User } from '@traptitech/traq'
import { getFullDayWithTimeString } from '/@/lib/basic/date'
import { scopeInfoMap } from '/@/lib/clientScope'
import AIcon from '/@/components/UI/AIcon.vue'
import UserIcon from '/@/components/UI/UserIcon.vue'

interface TokenInfo extends ActiveOAuth2Token {
  clientName?: string
  clientDesc?: string
  clientDeveloper?: User
}

const props = defineProps<{
  token: TokenInfo
}>()

const emit = defineEmits<{
  (e: 'revoke'): void
}>()

const issuedAt = computed(() =>
  getFullDayWithTimeString(new Date(props.token.issuedAt))
)
const scopes = computed(() =>
  props.token.scopes.map(scope => scopeInfoMap[scope].name)
)

const revoke = () => {
  emit('revoke')
}
</script>

<style lang="scss" module>
.token {
  display: grid;
  grid-template:
    'revoke title' auto
    'revoke desc' auto
    'revoke developer' auto
    'revoke issuedAt' auto
    'revoke scopes' auto / min-content 1fr;
  word-break: normal;
  overflow-wrap: break-word; // for Safari
  overflow-wrap: anywhere;
}
.revoke {
  display: flex;
  align-items: center;
  grid-area: revoke;
  margin-right: 4px;
}
.title {
  @include color-ui-primary;
  grid-area: title;
}
.desc {
  grid-area: desc;
}
.developer {
  grid-area: developer;
}
.developerIcon {
  display: inline-block;
  vertical-align: middle;
}
.issuedAt {
  grid-area: issuedAt;
}
.scopes {
  grid-area: scopes;
}
.icon {
  cursor: pointer;
}
</style>
