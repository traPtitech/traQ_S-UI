<template>
  <li :key="token.id" :class="$style.wrap">
    <div :class="$style.title">{{ token.clientName ?? '---' }}</div>
    <div :class="$style.description">{{ token.clientDesc }}</div>
    <div :class="$style.details">
      <div :class="$style.developer">
        <template v-if="token.clientDeveloper">
          <user-icon
            :class="$style.developerIcon"
            :user-id="token.clientDeveloper.id"
            :size="24"
            prevent-modal
            aria-label=""
          />
          @{{ token.clientDeveloper.name }}
        </template>
        <template v-else>unknown</template>
      </div>
      <time :datetime="issuedAtISO">{{ issuedAt }}</time>
      <div :class="$style.scopes">
        <div v-for="scope in scopes" :key="scope" :class="$style.scope">
          {{ scope }}
        </div>
      </div>
    </div>
    <div :class="$style.revoke">
      <button
        :class="$style.revokeButton"
        title="トークンを無効化"
        @click="emit('revoke')"
      >
        <a-icon name="close" mdi />
      </button>
    </div>
  </li>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import type { ActiveOAuth2Token, User } from '@traptitech/traq'
import { getFullDayString, getISOFullDayString } from '/@/lib/basic/date'
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

const issuedAtISO = computed(() => {
  const date = new Date(props.token.issuedAt)
  if (Number.isNaN(date.getTime())) return ''

  return getISOFullDayString(date)
})
const issuedAt = computed(() => {
  const date = new Date(props.token.issuedAt)
  if (Number.isNaN(date.getTime())) return 'Invalid Date'

  return getFullDayString(new Date(props.token.issuedAt))
})

const scopes = computed(() =>
  props.token.scopes.map(scope => scopeInfoMap[scope].name)
)
</script>

<style lang="scss" module>
.wrap {
  display: grid;
  grid-template:
    'title       revoke' auto
    'description revoke' auto
    'details     revoke' auto / 1fr min-content;
  word-break: normal;
  overflow-wrap: break-word; // for Safari
  overflow-wrap: anywhere;

  padding: 12px 0;
  gap: 4px 24px;
}
.revoke {
  grid-area: revoke;

  display: flex;
  align-items: center;
  margin-right: 4px;
}
.title {
  grid-area: title;

  @include color-ui-primary;
  font-weight: bold;
}
.description {
  grid-area: description;
}

.details {
  grid-area: details;

  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 16px;
  font-size: 0.875rem;
}

.developer {
  display: flex;
  align-items: center;
}

.developerIcon {
  display: inline-block;
  vertical-align: middle;

  margin-right: 4px;
}

.scopes {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 8px;
}

.scope {
  color: var(--theme-background-primary-default);
  background: var(--theme-ui-secondary-default);
  padding: 0.125rem 1rem;
  font-size: 0.75rem;
  border-radius: 9999px;
}
.revokeButton {
  @include color-ui-tertiary;
  cursor: pointer;
  display: grid;
  padding: 4px;
  border-radius: 4px;

  &:hover {
    @include color-ui-secondary;
    @include background-secondary;
  }
}
</style>
