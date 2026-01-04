<template>
  <div :class="[$style.container, props.reversed && $style.reversed]">
    <div
      v-for="(item, i) in items"
      :key="i"
      :class="$style.messageItem"
      :style="{
        animationDelay: props.instant ? '0' : `${i * 30}ms`
      }"
    >
      <div :class="$style.avatar" />
      <div :class="$style.content">
        <div :class="$style.header">
          <div :class="[$style.skeleton, $style.name]" />
          <div :class="[$style.skeleton, $style.badge]" />
          <div :class="[$style.skeleton, $style.id]" />
          <div :class="[$style.skeleton, $style.time]" />
        </div>
        <div :class="$style.body">
          <div
            v-for="(width, j) in item.lines"
            :key="j"
            :class="[$style.skeleton, $style.text]"
            :style="{ width: `${width}%` }"
          />
        </div>
        <div v-if="item.hasQuote" :class="$style.quote">
          <div :class="[$style.skeleton, $style.text]" style="width: 30%" />
          <div :class="[$style.skeleton, $style.text]" style="width: 60%" />
        </div>
        <div v-if="item.hasImage" :class="[$style.skeleton, $style.image]" />
        <div v-if="item.hasFile" :class="[$style.skeleton, $style.file]" />
        <div v-if="item.stamps > 0" :class="$style.stamps">
          <div
            v-for="j in item.stamps"
            :key="j"
            :class="[$style.skeleton, $style.stampItem]"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    count?: number
    simple?: boolean
    reversed?: boolean
    instant?: boolean
  }>(),
  {
    count: 16,
    simple: false,
    reversed: false,
    instant: false
  }
)

const generateRandomMessage = () => {
  const lines = []
  const lineCount = props.simple ? 2 : Math.floor(Math.random() * 3) + 1
  for (let i = 0; i < lineCount; i++) {
    lines.push(Math.floor(Math.random() * 40) + 40)
  }

  const stampCount = Math.random() < 0.3 ? Math.floor(Math.random() * 5) + 1 : 0

  return {
    lines,
    hasQuote: props.simple ? false : Math.random() < 0.1,
    hasImage: props.simple ? false : Math.random() < 0.1,
    hasFile: props.simple ? false : Math.random() < 0.05,
    stamps: props.simple ? 3 : stampCount
  }
}

const items = Array.from({ length: props.count }, generateRandomMessage)
</script>

<style lang="scss" module>
.container {
  display: flex;
  gap: 16px;
  padding: 12px 16px;
  overflow: hidden;

  flex-direction: column-reverse;
  justify-content: flex-start;

  &.reversed {
    flex-direction: column;
    justify-content: flex-end;
  }
}

.messageItem {
  display: flex;
  padding-block: 4px;
  gap: 16px;
  animation: fadeIn 0.3s ease-in-out forwards;
  opacity: 0;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--specific-skeleton-background, rgba(128, 128, 128, 0.15));
  flex-shrink: 0;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.body {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.quote {
  border-left: 3px solid
    var(--specific-skeleton-background, rgba(128, 128, 128, 0.15));
  padding-left: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-block: 4px;
}

.image {
  width: min(80%, 300px);
  aspect-ratio: 16/9;
  margin-block: 4px;
}

.file {
  width: min(100%, 360px);
  height: 48px;
  margin-block: 4px;
}

.stamps {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 4px;
}

.stampItem {
  width: 48px;
  height: 24px;
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--specific-skeleton-background, rgba(128, 128, 128, 0.15)) 25%,
    var(--specific-skeleton-highlight, rgba(128, 128, 128, 0.25)) 50%,
    var(--specific-skeleton-background, rgba(128, 128, 128, 0.15)) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

.name {
  width: 120px;
  height: 18px;
}

.badge {
  width: 28px;
  height: 18px;
  border-radius: 4px;
}

.id {
  width: 60px;
  height: 14px;
}

.time {
  width: 50px;
  height: 14px;
}

.text {
  height: 14px;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
