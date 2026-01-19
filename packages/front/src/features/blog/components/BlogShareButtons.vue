<script lang="ts" setup>
import { Linkedin, Link } from 'lucide-vue-next';
import { useToast } from '@/core/composables/toast';

const props = defineProps<{
  title: string;
}>();

const { success: showSuccess, error: showError } = useToast();

const hashtags = '#AI #Haiku #Poetry #Literature #GutenKu';

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
  const text = encodeURIComponent(`${props.title}\n\n${hashtags}`);
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

function shareOnBluesky() {
  const url = globalThis.location.href;
  const text = `${props.title}\n\n${hashtags}`;
  globalThis.open(
    `https://bsky.app/intent/compose?text=${encodeURIComponent(`${text}\n\n${url}`)}`,
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
        aria-label="Share on X"
        @click="shareOnTwitter"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path
            d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
          />
        </svg>
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
        aria-label="Share on Bluesky"
        @click="shareOnBluesky"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path
            d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z"
          />
        </svg>
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
