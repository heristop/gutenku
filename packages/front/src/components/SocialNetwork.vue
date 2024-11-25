<script lang="ts" setup>
const INSTAGRAM_URL = 'https://instagram.com/gutenku.poem';
const GITHUB_URL = 'https://github.com/heristop/gutenku';
const GUTENBERG_URL = 'https://gutenberg.org';

const socialLinks = [
  {
    name: 'Instagram',
    url: INSTAGRAM_URL,
    icon: 'mdi-instagram',
    label: 'See published haikus on Instagram',
    variant: 'text',
  },
  {
    name: 'Project Gutenberg',
    url: GUTENBERG_URL,
    icon: 'mdi-book-open',
    label: 'Visit Project Gutenberg website',
  },
  {
    name: 'GitHub',
    url: GITHUB_URL,
    icon: 'mdi-github',
    label: 'View source code on GitHub',
    variant: 'text',
  },
];

const handleClick = (url: string) => {
  window.open(url, '_blank', 'noopener,noreferrer');
};
</script>

<template>
  <v-card
    class="about-card pa-4 mb-sm-6 mb-0"
    role="complementary"
    aria-label="About GutenKu"
    elevation="1"
  >
    <v-card-title class="about-card__header ma-2">
      <v-img
        height="56"
        alt="GutenKu Logo"
        src="@/assets/img/logo/gutenku_rounded.png"
        class="about-card__logo"
      />
    </v-card-title>

    <div class="about-card__text text-primary" role="article">
      <p>
        <strong>GutenKu</strong> is a Haiku generator based on a selection of
        books from <span class="visually-hidden">the</span> Project Gutenberg, a
        vast online library of free eBooks, and then process this data to
        extract quotes and generate unique haiku.
      </p>
    </div>

    <v-card-actions
      class="about-card__actions justify-center"
      role="navigation"
      aria-label="Social links"
    >
      <v-tooltip
        v-for="link in socialLinks"
        :key="link.url"
        :text="link.name"
        location="bottom"
        :aria-label="link.name"
      >
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            color="accent"
            class="ms-2"
            :icon="link.icon"
            :variant="link.variant"
            :aria-label="link.label"
            @click="handleClick(link.url)"
          />
        </template>
      </v-tooltip>
    </v-card-actions>
  </v-card>
</template>

<style lang="scss" scoped>
.about-card {
  &__header {
    display: flex;
    justify-content: center;
  }

  &__logo {
    transition: transform 0.2s ease;

    &:hover {
      transform: scale(1.05);
    }
  }

  &__text {
    text-align: center;

    p {
      margin: 0;
    }
  }

  &__actions {
    margin-top: 1rem;
  }
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
