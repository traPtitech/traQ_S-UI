<template>
  <div :class="$style.container">
    <div
      v-for="(item, i) in items"
      :key="i"
      :class="$style.messageItem"
      :style="{ animationDelay: `${(items.length - i) * 30}ms` }"
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
const props = withDefaults(defineProps<{ count?: number }>(), { count: 16 })

const generateRandomMessage = () => {
  const lines = []
  const lineCount = Math.floor(Math.random() * 3) + 1
  for (let i = 0; i < lineCount; i++) {
    lines.push(Math.floor(Math.random() * 40) + 40)
  }

  return {
    lines,
    hasQuote: Math.random() < 0.1,
    hasImage: Math.random() < 0.1,
    hasFile: Math.random() < 0.05,
    stamps: Math.random() < 0.3 ? Math.floor(Math.random() * 5) + 1 : 0
  }
}

const items = Array.from({ length: props.count }, generateRandomMessage)
</script>

<style lang="scss" module>
.container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 12px 16px;
  height: 100%;
  justify-content: flex-end;
  overflow: hidden;
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
