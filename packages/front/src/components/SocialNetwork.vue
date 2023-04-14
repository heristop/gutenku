<script lang="ts" setup>
const INSTAGRAM_URL = 'https://instagram.com/gutenku.poem';
const TWITTER_URL = 'https://twitter.com/heristop';
const GUTENBERG_URL = 'https://gutenberg.org';
</script>

<template>
  <v-card
    class="mx-auto pa-4 mb-sm-6 mb-0"
    title="🌸 🗻"
  >
    <p><strong>GutenKu</strong> is a Haiku generator based on a selection of books from</p>

    <p>Project Gutenberg</p>

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
            color="primary"
            class="ms-2"
            icon="mdi-instagram"
            variant="text"
            target="_blank"
            aria-label="See published haikus"
          />
        </template>
      </v-tooltip>

      <v-tooltip
        text="Twitter"
        location="bottom"
        aria-label="Twitter"
      >
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            :href="TWITTER_URL"
            color="primary"
            class="ms-2"
            icon="mdi-twitter"
            variant="text"
            target="_blank"
            aria-label="See creator Twitter account"
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
            color="primary"
            class="ms-2"
            icon="mdi-book-open"
            target="_blank"
            aria-label="See Project Gutenberg website"
          />
        </template>
      </v-tooltip>
    </v-card-actions>
  </v-card>
</template>
