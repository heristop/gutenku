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
  },
];

const handleClick = (url: string) => {
  window.open(url, '_blank', 'noopener,noreferrer');
};
</script>

<template>
  <v-card
    class="gutenku-card about-card pa-4 mb-sm-6 mb-0"
    role="complementary"
    aria-label="About GutenKu"
  >
    <!-- Classic Solid Bookmark -->
    <div class="bookmark-3d" aria-hidden="true">
      <div class="bookmark-ribbon"></div>
    </div>

    <v-card-title class="about-card__header ma-2">
      <v-img
        height="56"
        alt="GutenKu Logo"
        src="@/assets/img/logo/gutenku-logo.png"
        class="about-card__logo"
      />
    </v-card-title>

    <div class="about-card__text text-primary" role="article">
      <p>
        <strong>GutenKu</strong> is a Haiku generator based on a selection of
        books from <span class="visually-hidden">the</span> Project Gutenberg, a
        vast online library of free eBooks, and then process this data to
        extract quotes and generate unique haiku
        <strong>5</strong>-<strong>7</strong>-<strong>5</strong>
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
            :variant="'text'"
            :aria-label="link.label"
            @click="handleClick(link.url)"
          />
        </template>
      </v-tooltip>
    </v-card-actions>
  </v-card>
</template>

<style lang="scss" scoped>
// Classic Solid Bookmark - simple and clearly visible
.bookmark-3d {
  position: absolute;
  top: -15px;
  right: 20px;
  pointer-events: none;
  z-index: 15;

  .bookmark-ribbon {
    position: relative;
    width: 24px;
    height: 45px;
    background: #8b4513; // Solid brown color
    border-radius: 3px 3px 0 0;
    box-shadow:
      0 2px 8px rgba(0, 0, 0, 0.3),
      inset 1px 1px 2px rgba(255, 255, 255, 0.2),
      inset -1px -1px 2px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;

    // Classic bookmark V-notch at bottom
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-left: 12px solid #8b4513;
      border-right: 12px solid #8b4513;
      border-bottom: 8px solid transparent;
    }

    // Bookmark hole for string (optional detail)
    &::before {
      content: '';
      position: absolute;
      top: 8px;
      left: 50%;
      transform: translateX(-50%);
      width: 4px;
      height: 4px;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 50%;
      box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.5);
    }

    // Hover effect
    &:hover {
      background: #a0522d; // Slightly lighter brown on hover
      transform: translateY(-2px);
      box-shadow:
        0 4px 12px rgba(0, 0, 0, 0.4),
        inset 1px 1px 2px rgba(255, 255, 255, 0.3),
        inset -1px -1px 2px rgba(0, 0, 0, 0.1);
    }
  }
}

// Component-specific styles only (shadow handled by global .gutenku-card)
.about-card {
  // Ensure the card has relative positioning for the bookmark and allows overflow
  position: relative;
  overflow: visible; // Allow 3D bookmark to extend beyond card boundaries

  &__header {
    display: flex;
    justify-content: center;
  }

  &__logo {
    transition: var(--gutenku-transition-fast);

    &:hover {
      opacity: 0.8;
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

// Responsive bookmark sizing
@media (max-width: 768px) {
  .bookmark-3d {
    top: -12px;
    right: 16px;

    .bookmark-ribbon {
      width: 20px;
      height: 38px;

      &::after {
        border-left: 10px solid #8b4513;
        border-right: 10px solid #8b4513;
        border-bottom: 6px solid transparent;
      }
    }
  }
}

@media (max-width: 480px) {
  .bookmark-3d {
    top: -10px;
    right: 12px;

    .bookmark-ribbon {
      width: 18px;
      height: 32px;

      &::after {
        border-left: 9px solid #8b4513;
        border-right: 9px solid #8b4513;
        border-bottom: 5px solid transparent;
      }

      &::before {
        top: 6px;
        width: 3px;
        height: 3px;
      }
    }
  }
}
</style>
