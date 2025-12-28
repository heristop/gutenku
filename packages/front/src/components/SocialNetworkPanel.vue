<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Instagram, BookOpen, Github, type LucideIcon } from 'lucide-vue-next';
import ZenTooltip from '@/components/ui/ZenTooltip.vue';

const { t } = useI18n();

const INSTAGRAM_URL = 'https://instagram.com/gutenku.poem';
const GITHUB_URL = 'https://github.com/heristop/gutenku';
const GUTENBERG_URL = 'https://gutenberg.org';

interface SocialLinkDef {
  key: string;
  url: string;
  icon: LucideIcon;
}

const linkDefinitions: SocialLinkDef[] = [
  { key: 'instagram', url: INSTAGRAM_URL, icon: Instagram },
  { key: 'gutenberg', url: GUTENBERG_URL, icon: BookOpen },
  { key: 'github', url: GITHUB_URL, icon: Github },
];

const socialLinks = computed(() =>
  linkDefinitions.map((link) => ({
    name: t(`social.links.${link.key}.name`),
    url: link.url,
    icon: link.icon,
    label: `${t(`social.links.${link.key}.label`)} (${t('common.opensInNewTab')})`,
  })),
);

const handleClick = (url: string) => {
  globalThis.open(url, '_blank', 'noopener,noreferrer');
};
</script>

<template>
  <v-card
    class="gutenku-card about-card pa-4 mb-sm-6 mb-0"
    role="complementary"
    :aria-label="t('social.ariaLabel')"
  >
    <div class="bookmark-ribbon" aria-hidden="true" />

    <svg
      class="border-stretch"
      viewBox="0 0 100 10"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path class="border-path" d="M 0,1 L 100,1" />
    </svg>

    <v-card-title class="about-card__header ma-2">
      <v-img
        :style="{ viewTransitionName: 'gutenku-logo' }"
        height="56"
        alt="GutenKu Logo"
        src="@/assets/img/logo/gutenku-logo-300.png"
        class="about-card__logo"
      />
    </v-card-title>

    <div class="about-card__text text-primary" role="article">
      <!-- eslint-disable-next-line vue/no-v-html -->
      <p v-html="t('social.description')" />
    </div>

    <nav
      class="social-links"
      role="navigation"
      :aria-label="t('social.linksAriaLabel')"
    >
      <ZenTooltip
        v-for="(link, index) in socialLinks"
        :key="link.url"
        :text="link.name"
        position="bottom"
      >
        <button
          type="button"
          class="social-link"
          :class="`social-link--${linkDefinitions[index].key}`"
          :style="{ '--delay': `${index * 0.1}s` }"
          :aria-label="link.label"
          @click="handleClick(link.url)"
        >
          <span class="social-link__bg" aria-hidden="true" />
          <span class="social-link__icon">
            <component :is="link.icon" :size="20" :stroke-width="1.5" />
          </span>
          <span class="social-link__name">{{ link.name }}</span>
        </button>
      </ZenTooltip>
    </nav>
  </v-card>
</template>

<style lang="scss" scoped>
.bookmark-ribbon {
  animation: bookmark-entrance 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both;
}

@keyframes bookmark-entrance {
  0% {
    opacity: 0;
    transform: translateY(-100%) rotate(-8deg);
  }
  60% {
    opacity: 1;
    transform: translateY(0.25rem) rotate(2deg);
  }
  80% {
    transform: translateY(-0.125rem) rotate(-1deg);
  }
  100% {
    opacity: 1;
    transform: translateY(0) rotate(0deg);
  }
}

@keyframes border-dent {
  0%, 10% {
    transform: perspective(50rem) rotateX(0deg);
  }
  20% {
    transform: perspective(50rem) rotateX(1.5deg);
  }
  60% {
    transform: perspective(50rem) rotateX(0deg);
  }
  80% {
    transform: perspective(50rem) rotateX(-0.3deg);
  }
  100% {
    transform: perspective(50rem) rotateX(0deg);
  }
}

.border-stretch {
  position: absolute;
  top: -1px;
  left: 0;
  width: 100%;
  height: 0.75rem;
  z-index: 13;
  overflow: visible;
  pointer-events: none;
}

.border-path {
  fill: none;
  stroke: rgba(0, 0, 0, 0.15);
  stroke-width: 1;
  stroke-linecap: round;
  opacity: 0;
  animation: path-stretch 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both;
}

@keyframes path-stretch {
  0%, 10% {
    d: path("M 83,1 L 97,1");
    opacity: 0;
  }
  20%, 60% {
    d: path("M 83,1 Q 90,8 97,1");
    opacity: 1;
  }
  80%, 100% {
    d: path("M 83,1 L 97,1");
    opacity: 0;
  }
}

:deep(.v-theme--dark) .border-path {
  stroke: rgba(255, 255, 255, 0.08);
}

.about-card::before {
  content: '';
  position: absolute;
  top: -0.75rem;
  right: 0.5rem;
  left: auto;
  width: 2.25rem;
  height: 0;
  background: rgb(var(--v-theme-background));
  z-index: 12;
  pointer-events: none;
  animation: mask-stretch 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both;
}

@keyframes mask-stretch {
  0%, 10% {
    height: 0;
    opacity: 0;
  }
  15%, 65% {
    height: 1.25rem;
    opacity: 1;
  }
  75%, 100% {
    height: 0;
    opacity: 0;
  }
}

.about-card {
  position: relative;
  overflow: visible;
  animation: border-dent 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both;
  transform-origin: top center;

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

// Social Links
.social-links {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1.25rem;
  padding: 0.25rem 0;
}

.social-link {
  --link-color: var(--gutenku-zen-primary);
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
  padding: 0.625rem 0.5rem 0.5rem;
  flex: 1;
  max-width: 5.5rem;
  background: transparent;
  border: none;
  cursor: pointer;
  opacity: 0;
  animation: social-link-enter 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  animation-delay: calc(0.4s + var(--delay, 0s));

  &__bg {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse at center, oklch(0.55 0.08 170 / 0.03) 0%, transparent 70%),
      var(--gutenku-paper-bg-aged);
    border: 1px solid var(--gutenku-paper-border);
    border-radius: var(--gutenku-radius-sm);
    box-shadow:
      0 2px 4px oklch(0 0 0 / 0.04),
      inset 0 1px 0 oklch(1 0 0 / 0.5);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background:
        url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
      opacity: 0.02;
      border-radius: inherit;
      pointer-events: none;
    }
  }

  &__icon {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    color: var(--link-color);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    svg {
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
  }

  &__name {
    position: relative;
    font-family: 'JMH Typewriter', monospace;
    font-size: 0.6rem;
    color: var(--gutenku-text-muted);
    letter-spacing: 0.03em;
    text-transform: uppercase;
    white-space: nowrap;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  // Hover state
  &:hover {
    .social-link__bg {
      border-color: var(--link-color);
      box-shadow:
        0 4px 12px oklch(0.55 0.08 170 / 0.15),
        0 2px 4px oklch(0 0 0 / 0.06),
        inset 0 1px 0 oklch(1 0 0 / 0.6);
      transform: translateY(-2px);
    }

    .social-link__icon {
      color: var(--link-color);

      svg {
        transform: scale(1.1);
      }
    }

    .social-link__name {
      color: var(--link-color);
    }
  }

  // Focus state
  &:focus-visible {
    outline: none;

    .social-link__bg {
      outline: 2px solid var(--gutenku-zen-primary);
      outline-offset: 2px;
    }
  }

  // Active state
  &:active {
    .social-link__bg {
      transform: translateY(0);
      box-shadow:
        0 1px 2px oklch(0 0 0 / 0.08),
        inset 0 1px 0 oklch(1 0 0 / 0.4);
    }

    .social-link__icon svg {
      transform: scale(0.95);
    }
  }

  // Platform-specific colors
  &--instagram {
    --link-color: oklch(0.55 0.15 350);
  }

  &--gutenberg {
    --link-color: var(--gutenku-zen-primary);
  }

  &--github {
    --link-color: var(--gutenku-text-secondary);
  }
}

@keyframes social-link-enter {
  0% {
    opacity: 0;
    transform: translateY(12px) scale(0.9);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

// Dark theme
[data-theme='dark'] .social-link {
  &__bg {
    background:
      radial-gradient(ellipse at center, oklch(0.5 0.06 170 / 0.05) 0%, transparent 70%),
      var(--gutenku-paper-bg);
    box-shadow:
      0 2px 6px oklch(0 0 0 / 0.2),
      inset 0 1px 0 oklch(1 0 0 / 0.06);

    &::before {
      opacity: 0.03;
    }
  }

  &:hover .social-link__bg {
    box-shadow:
      0 6px 16px oklch(0.5 0.06 170 / 0.2),
      0 2px 6px oklch(0 0 0 / 0.15),
      inset 0 1px 0 oklch(1 0 0 / 0.08);
  }

  &--github {
    --link-color: var(--gutenku-text-primary);
  }
}

// Reduced motion
@media (prefers-reduced-motion: reduce) {
  .social-link {
    animation: none;
    opacity: 1;

    &__bg,
    &__icon,
    &__icon svg,
    &__name {
      transition: none;
    }
  }
}

// Mobile
@media (max-width: 480px) {
  .social-links {
    gap: 0.375rem;
  }

  .social-link {
    padding: 0.5rem 0.375rem 0.375rem;

    &__icon {
      width: 1.75rem;
      height: 1.75rem;
    }

    &__name {
      font-size: 0.55rem;
    }
  }
}
</style>
