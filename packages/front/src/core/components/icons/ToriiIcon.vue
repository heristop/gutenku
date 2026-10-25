<script setup lang="ts">
// Kept under its old name so existing imports keep working. Draws the
// Ex Libris "home" (an open book laid as a roof over a doorway) from the ink set.
import { BookHome } from '@/core/components/icons/ink';

defineProps<{
  size?: number | string;
}>();
</script>

<template>
  <BookHome :size="size || 24" class="torii-icon" />
</template>
