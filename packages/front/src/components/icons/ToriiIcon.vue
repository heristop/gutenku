<script setup lang="ts">
defineProps<{
  size?: number | string;
}>();
</script>

<template>
  <!-- Torii gate icon - line art style matching lucide icons -->
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :width="size || 24"
    :height="size || 24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="torii-icon"
  >
    <!-- Kasagi (top roof beam) - extends beyond pillars -->
    <path d="M1 5h22" />
    <!-- Nuki (crossbeam) -->
    <path d="M3 9h18" />
    <!-- Left hashira (pillar) -->
    <path d="M6 5v17" />
    <!-- Right hashira (pillar) -->
    <path d="M18 5v17" />
  </svg>
</template>
