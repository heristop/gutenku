<script lang="ts" setup>
const INSTAGRAM_URL = 'https://instagram.com/gutenku.poem';
const GITHUB_URL = 'https://github.com/heristop/gutenku';
const GUTENBERG_URL = 'https://gutenberg.org';
</script>

<template>
  <v-card class="mx-auto pa-4 mb-sm-6 mb-0">
    <v-card-title class="ma-2">
      <v-img
        height="56"
        alt="GutenKu Logo"
        src="@/assets/img/logo/gutenku_rounded.png"
      />
    </v-card-title>

    <p class="text-primary">
      <strong>GutenKu</strong> is a Haiku generator based on a selection of books from Project Gutenberg, a vast online
      library of free eBooks, and then process this data to extract quotes and generate unique haiku.
    </p>

    <v-card-actions class="justify-center">
      <v-tooltip
        text="Instagram"
        location="bottom"
        aria-label="Instagram"
      >
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            :href="INSTAGRAM_URL"
            color="accent"
            class="ms-2"
            icon="mdi-instagram"
            variant="text"
            target="_blank"
            aria-label="See published haikus"
          />
        </template>
      </v-tooltip>

      <v-tooltip
        text="Project Gutenberg"
        location="bottom"
        aria-label="Project Gutenberg"
      >
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            :href="GUTENBERG_URL"
            color="accent"
            class="ms-2"
            icon="mdi-book-open"
            target="_blank"
            aria-label="See Project Gutenberg website"
          />
        </template>
      </v-tooltip>

      <v-tooltip
        text="GitHub"
        location="bottom"
        aria-label="GitHub"
      >
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            :href="GITHUB_URL"
            color="accent"
            class="ms-2"
            icon="mdi-github"
            variant="text"
            target="_blank"
            aria-label="See GitHub repository"
          />
        </template>
      </v-tooltip>
    </v-card-actions>
  </v-card>
</template>
