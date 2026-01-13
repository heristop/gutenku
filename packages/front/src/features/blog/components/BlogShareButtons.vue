<script lang="ts" setup>
import { Twitter, Linkedin, Link } from 'lucide-vue-next';
import { useToast } from '@/core/composables/toast';

const { success: showSuccess, error: showError } = useToast();

async function copyLink() {
  try {
    await navigator.clipboard.writeText(globalThis.location.href);
    showSuccess('Link copied!');
  } catch {
    showError('Failed to copy');
  }
}

function shareOnTwitter() {
  const url = encodeURIComponent(globalThis.location.href);
  const text = encodeURIComponent(
    'GutenKu - AI Haiku Generator from Classic Literature',
  );
  globalThis.open(
    `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
    '_blank',
  );
}

function shareOnLinkedIn() {
  const url = encodeURIComponent(globalThis.location.href);
  globalThis.open(
    `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    '_blank',
  );
}
</script>

<template>
  <footer class="blog-share">
    <p class="blog-share__label">Share this article</p>
    <div class="blog-share__buttons">
      <button
        type="button"
        class="blog-share__btn"
        aria-label="Share on Twitter"
        @click="shareOnTwitter"
      >
        <Twitter :size="18" />
      </button>
      <button
        type="button"
        class="blog-share__btn"
        aria-label="Share on LinkedIn"
        @click="shareOnLinkedIn"
      >
        <Linkedin :size="18" />
      </button>
      <button
        type="button"
        class="blog-share__btn"
        aria-label="Copy link"
        @click="copyLink"
      >
        <Link :size="18" />
      </button>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
.blog-share {
  margin-top: 1.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--gutenku-paper-border);
  text-align: center;

  @media (min-width: 375px) {
    margin-top: 1.75rem;
    padding-top: 1.375rem;
  }

  @media (min-width: 600px) {
    margin-top: 2rem;
    padding-top: 1.5rem;
  }

  &__label {
    font-size: 0.8rem;
    color: var(--gutenku-text-muted);
    margin: 0 0 0.75rem;

    @media (min-width: 375px) {
      font-size: 0.85rem;
      margin: 0 0 0.875rem;
    }

    @media (min-width: 600px) {
      font-size: 0.875rem;
      margin: 0 0 1rem;
    }
  }

  &__buttons {
    display: flex;
    justify-content: center;
    gap: 0.625rem;

    @media (min-width: 375px) {
      gap: 0.75rem;
    }
  }

  &__btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.25rem;
    height: 2.25rem;
    padding: 0;
    border: 1px solid var(--gutenku-paper-border);
    border-radius: var(--gutenku-radius-full);
    background: transparent;
    color: var(--gutenku-text-muted);
    cursor: pointer;
    transition: all 0.2s ease;

    @media (min-width: 375px) {
      width: 2.5rem;
      height: 2.5rem;
    }

    &:hover {
      color: var(--gutenku-zen-primary);
      border-color: var(--gutenku-zen-primary);
      background: oklch(0.45 0.1 195 / 0.1);
      transform: translateY(-2px);
    }

    &:focus-visible {
      outline: 2px solid var(--gutenku-zen-primary);
      outline-offset: 2px;
    }
  }
}

[data-theme='dark'] .blog-share {
  &__btn {
    &:hover {
      background: oklch(0.6 0.1 195 / 0.2);
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .blog-share__btn {
    transition: none;

    &:hover {
      transform: none;
    }
  }
}
</style>
