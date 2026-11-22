<template>
  <div class="empty-state">
    <p class="empty-state__title">{{ title }}</p>
    <p v-if="description" class="empty-state__description">{{ description }}</p>
    <div v-if="$slots.default" class="empty-state__actions">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<style lang="scss" scoped>
.empty-state {
  padding: 48px 16px;
  text-align: center;
  background: var(--color-surface);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius);

  &__title {
    margin: 0 0 4px;
    font-size: 18px;
    font-weight: 600;
  }

  &__description {
    margin: 0;
    color: var(--color-muted);
  }

  &__actions {
    margin-top: 16px;
  }
}
</style>
