<script lang="ts" setup>
const GUTENBERG_URL = 'https://gutenberg.org';
const INSTAGRAM_URL = 'https://www.instagram.com/gutenku.poem';
const GITHUB_URL = 'https://github.com/heristop/gutenku';
</script>

<template>
  <v-card
    class="mx-auto pa-4 mb-6"
    title="🌸 🗻"
  >
    <p>
      <strong>GutenKu</strong> is a Haiku generator based on a selection of books from
      <br>
      Project Gutenberg
    </p>

    <v-card-actions class="justify-center">
      <v-tooltip
        text="Project Gutenberg"
        location="bottom"
      >
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            color="primary"
            class="ms-2"
            icon="mdi-book-open"
            :href="GUTENBERG_URL"
            target="_blank"
          />
        </template>
      </v-tooltip>

      <v-tooltip
        text="Instagram"
        location="bottom"
      >
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            color="primary"
            class="ms-2"
            icon="mdi-instagram"
            variant="text"
            :href="INSTAGRAM_URL"
            target="_blank"
          />
        </template>
      </v-tooltip>

      <v-tooltip
        text="GitHub"
        location="bottom"
      >
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            color="primary"
            class="ms-2"
            icon="mdi-github"
            :href="GITHUB_URL"
            target="_blank"
          />
        </template>
      </v-tooltip>
    </v-card-actions>
  </v-card>
</template>
