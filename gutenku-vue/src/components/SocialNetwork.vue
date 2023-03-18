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
        text="Twitter"
        location="bottom"
      >
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            color="primary"
            class="ms-2"
            icon="mdi-twitter"
            variant="text"
            :href="TWITTER_URL"
            target="_blank"
          />
        </template>
      </v-tooltip>

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
    </v-card-actions>
  </v-card>
</template>
