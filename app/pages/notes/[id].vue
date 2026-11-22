<template>
  <section>
    <h1>Редактирование заметки</h1>
    <p>id: {{ noteId }}</p>
    <NuxtLink to="/">К списку</NuxtLink>
  </section>
</template>

<script setup lang="ts">
const route = useRoute()
const noteId = computed(() => String(route.params.id))
</script>
