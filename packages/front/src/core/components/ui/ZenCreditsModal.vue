<script lang="ts" setup>
import { ExternalLink } from '@/core/components/icons/ink';
import {
  Bluesky,
  Github,
  Instagram,
  Linkedin,
  XLogo,
} from '@/core/components/ui/icons/BrandIcons';
import { useI18n } from 'vue-i18n';
import ZenModal from '@/core/components/ui/ZenModal.vue';
import ZenButton from '@/core/components/ui/ZenButton.vue';
import ZenHaiku from '@/core/components/ui/ZenHaiku.vue';

const modelValue = defineModel<boolean>({ default: false });

const { t } = useI18n();
const currentYear = new Date().getFullYear();

const haikuLines = [
  'Code flows like water',
  'heristop crafts each pixel',
  'Haiku born from books',
];

const socialLinks = [
  {
    url: 'https://instagram.com/heristop',
    label: 'footer.social.instagram',
    icon: Instagram,
  },
  {
    url: 'https://github.com/heristop',
    label: 'footer.social.github',
    icon: Github,
  },
  {
    url: 'https://www.linkedin.com/in/heristop',
    label: 'footer.social.linkedin',
    icon: Linkedin,
  },
  { url: 'https://x.com/heristop', label: 'footer.social.x', icon: XLogo },
  {
    url: 'https://bsky.app/profile/heristop.bsky.social',
    label: 'footer.social.bluesky',
    icon: Bluesky,
  },
];
</script>

<template>
  <ZenModal
    v-model="modelValue"
    :max-width="380"
    variant="scroll"
    content-class="zen-credits-modal"
    :title="t('footer.credits.ariaLabel')"
    :description="t('footer.credits.description')"
  >
    <ZenHaiku :lines="haikuLines" class="zen-credits-modal__haiku" />

    <div class="zen-credits-modal__body">
      <dl class="zen-credits-modal__colophon">
        <div class="zen-credits-modal__row">
          <dt>{{ t('footer.credits.craftedBy') }}</dt>
          <dd><strong>heristop</strong></dd>
        </div>
        <div class="zen-credits-modal__row">
          <dt>©</dt>
          <dd class="zen-credits-modal__year">
            {{ t('footer.credits.years', { year: currentYear }) }}
          </dd>
        </div>
        <div class="zen-credits-modal__row">
          <dt>{{ t('footer.credits.inspiredBy') }}</dt>
          <dd>
            <a
              href="https://www.instagram.com/haiku_mariniere/"
              target="_blank"
              rel="noopener noreferrer"
              class="zen-credits-modal__inline-link"
            >
              Haiku Marinière<span class="sr-only">
                ({{ t('common.opensInNewTab') }})</span
              >
            </a>
          </dd>
        </div>
      </dl>

      <ZenButton
        href="https://heristop.vercel.app"
        target="_blank"
        class="zen-credits-modal__portfolio"
        data-autofocus
        :aria-label="t('footer.credits.portfolioLabel')"
      >
        <template #icon-left>
          <ExternalLink :size="18" aria-hidden="true" />
        </template>
        {{ t('footer.credits.portfolio') }}
      </ZenButton>

      <ul class="zen-credits-modal__social">
        <li v-for="link in socialLinks" :key="link.url">
          <a
            :href="link.url"
            target="_blank"
            rel="noopener noreferrer"
            class="zen-credits-modal__social-link"
            :aria-label="t(link.label)"
            :title="t(link.label)"
          >
            <component :is="link.icon" :size="20" aria-hidden="true" />
          </a>
        </li>
      </ul>

      <p class="zen-credits-modal__feedback">
        {{ t('footer.credits.feedback') }}
      </p>
    </div>
  </ZenModal>
</template>

<style scoped lang="scss">
// Ex Libris: the credits leaf. A short poem, a ruled colophon, then the
// press-able links. One quiet fade, no staggered cascade.
:deep(.zen-credits-modal) {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  font-family: var(--gk-font);
}

.zen-credits-modal {
  &__haiku {
    margin-bottom: 1.25rem;
  }

  &__body {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    animation: credits-fade var(--gk-dur-reward) var(--gk-ease-out) 200ms both;
  }

  &__colophon {
    width: 100%;
    margin: 0 0 1.25rem;
    border-top: var(--gk-rule);
    border-bottom: var(--gk-rule);
  }

  &__row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    align-items: center;
    min-height: 2.75rem;
    padding: 0.25rem 0;
    text-align: left;
    font-size: 0.875rem;

    & + & {
      border-top: var(--gk-rule-faint);
    }

    dt {
      color: var(--gk-ink-soft);
    }

    dd {
      margin: 0;
      color: var(--gk-ink);
    }

    strong {
      font-weight: 700;
    }
  }

  &__year {
    font-variant-numeric: tabular-nums;
  }

  &__inline-link {
    display: inline-flex;
    align-items: center;
    min-height: 2.75rem;
    color: var(--gk-indigo);
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 0.2em;
    transition: text-decoration-thickness var(--gk-dur-fast) var(--gk-ease-out);

    &:focus-visible {
      outline: 2px solid var(--gk-indigo);
      outline-offset: 2px;
      border-radius: var(--gk-radius-control);
    }
  }

  &__social {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    margin: 1rem 0 0;
    padding: 0;
    list-style: none;
  }

  &__social-link {
    display: grid;
    place-items: center;
    width: 2.75rem;
    height: 2.75rem;
    color: var(--gk-ink);
    background: transparent;
    border: 1.5px solid var(--gk-ink-faint);
    border-radius: var(--gk-radius-control);
    text-decoration: none;
    transition:
      border-color var(--gk-dur-fast) var(--gk-ease-out),
      color var(--gk-dur-fast) var(--gk-ease-out),
      transform var(--gk-dur-press) var(--gk-ease-out);

    &:active {
      transform: scale(0.96);
    }

    &:focus-visible {
      outline: 2px solid var(--gk-indigo);
      outline-offset: 2px;
    }
  }

  &__feedback {
    margin: 1rem 0 0;
    font-size: 0.875rem;
    line-height: 1.5;
    color: var(--gk-ink-soft);
    text-align: center;
    text-wrap: balance;
  }
}

@media (hover: hover) {
  .zen-credits-modal__inline-link:hover {
    text-decoration-thickness: 2px;
  }

  .zen-credits-modal__social-link:hover {
    color: var(--gk-indigo);
    border-color: var(--gk-indigo);
  }
}

@keyframes credits-fade {
  from {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .zen-credits-modal__body {
    animation: none;
  }

  .zen-credits-modal__social-link,
  .zen-credits-modal__inline-link {
    transition: none;
  }

  .zen-credits-modal__social-link:active {
    transform: none;
  }
}
</style>
