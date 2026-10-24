<script lang="ts" setup>
import type { Component } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  Bluesky,
  Link,
  Linkedin,
  WhatsApp,
  XLogo,
} from '@/core/components/icons/ink';
import { useToast } from '@/core/composables/toast';

const props = defineProps<{
  title: string;
}>();

const { t } = useI18n();
const { success: showSuccess, error: showError } = useToast();

const hashtags = '#AI #Haiku #Poetry #Literature #GutenKu';

interface ShareTarget {
  network: string;
  icon: Component;
  intent: (url: string, text: string) => string;
}

const targets: ShareTarget[] = [
  {
    network: 'X',
    icon: XLogo,
    intent: (url, text) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
  {
    network: 'LinkedIn',
    icon: Linkedin,
    intent: (url) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    network: 'Bluesky',
    icon: Bluesky,
    intent: (url, text) =>
      `https://bsky.app/intent/compose?text=${encodeURIComponent(`${text}\n\n${url}`)}`,
  },
  {
    network: 'WhatsApp',
    icon: WhatsApp,
    intent: (url, text) =>
      `https://wa.me/?text=${encodeURIComponent(`${text}\n\n${url}`)}`,
  },
];

function share(target: ShareTarget) {
  const url = globalThis.location.href;
  const text = `${props.title}\n\n${hashtags}`;

  globalThis.open(target.intent(url, text), '_blank', 'noopener,noreferrer');
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(globalThis.location.href);
    showSuccess(t('blog.linkCopied'));
  } catch {
    showError(t('blog.copyFailed'));
  }
}
</script>

<template>
  <div class="blog-share">
    <p class="blog-share__label">{{ t('blog.shareLabel') }}</p>
    <div class="blog-share__buttons">
      <button
        v-for="target in targets"
        :key="target.network"
        type="button"
        class="blog-share__btn"
        :aria-label="t('blog.shareOn', { network: target.network })"
        :title="t('blog.shareOn', { network: target.network })"
        @click="share(target)"
      >
        <component :is="target.icon" :size="20" aria-hidden="true" />
      </button>
      <button
        type="button"
        class="blog-share__btn"
        :aria-label="t('blog.copyLink')"
        :title="t('blog.copyLink')"
        @click="copyLink"
      >
        <Link :size="20" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.blog-share {
  max-width: 62ch;
  margin: 2.5rem auto 0;
  padding-top: 1.5rem;
  border-top: var(--gk-rule-faint);
  text-align: left;

  &__label {
    margin: 0 0 0.875rem;
    font-size: 0.875rem;
    color: var(--gk-ink-soft);
  }

  &__buttons {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    gap: 0.75rem;
  }

  &__btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.75rem;
    height: 2.75rem;
    padding: 0;
    border: 0;
    border-radius: var(--gk-radius-control);
    background: transparent;
    box-shadow: inset 0 0 0 1.5px var(--gk-ink);
    color: var(--gk-indigo);
    cursor: pointer;
    transition:
      background-color var(--gk-dur-fast) var(--gk-ease-out),
      transform var(--gk-dur-press) var(--gk-ease-out);

    @media (hover: hover) {
      &:hover {
        background: var(--gk-ink-faint);
      }
    }

    &:active {
      transform: scale(0.97);
    }

    &:focus-visible {
      outline: 2px solid var(--gk-indigo);
      outline-offset: 2px;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .blog-share__btn {
    transition: none;

    &:active {
      transform: none;
    }
  }
}
</style>
