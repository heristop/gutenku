<script lang="ts" setup>
import { computed, useTemplateRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { useHead, useSeoMeta } from '@unhead/vue';
import { ExternalLink } from '@/core/components/icons/ink';
import {
  Bluesky,
  Github,
  Instagram,
  Linkedin,
  XLogo,
} from '@/core/components/ui/icons/BrandIcons';
import BrushRule from '@/core/components/ink/BrushRule.vue';
import InkStamp from '@/core/components/ink/InkStamp.vue';
import { useScrollReveal } from '@/core/composables/scroll-reveal';
import BlackoutFigure from '@/features/haiku/components/BlackoutFigure.vue';
import ZenButton from '@/core/components/ui/ZenButton.vue';
import { GAME_ENABLED } from '@/features/game/config';
import { SITE_URL } from '@/locales/config';

// About GutenKu: what the site is, how a haiku is made, who makes it. A page
// of its own (it replaces the credits dialog) so it can be found and indexed.

type Step = { title: string; text: string };

const { t, tm, rt } = useI18n();

// Every `[data-reveal]` below comes in as it is scrolled to, and goes back out as it
// is scrolled away, in both directions; `--read` feeds the ribbon down the margin
const page = useTemplateRef<HTMLElement>('page');

useScrollReveal(page);

// A real page of Dracula (Project Gutenberg #345, public domain) and the haiku
// the marker leaves standing in it
const PASSAGE =
  '3 May. Bistritz.—Left Munich at 8:35 P.M., on 1st May, arriving at Vienna early next morning; should have arrived at 6:46, but train was an hour late. Buda-Pesth seems a wonderful place, from the glimpse which I got of it from the train and the little I could walk through the streets. I feared to go very far from the station, as we had arrived late and would start as near the correct time as possible.';
// The steps are numbered like the pages of the book
const NUMERALS = ['i', 'ii', 'iii', 'iv', 'v'];
const VERSES = [
  'a wonderful place',
  'I feared to go very far',
  'and would start as near',
];

const steps = computed<Step[]>(() =>
  (tm('about.steps') as unknown as Record<string, string>[]).map((step) => ({
    title: rt(step.title),
    text: rt(step.text),
  })),
);

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

const PAGE = `${SITE_URL}/about`;

useSeoMeta({
  title: () => t('about.metaTitle'),
  description: () => t('about.metaDescription'),
  ogTitle: () => t('about.metaTitle'),
  ogDescription: () => t('about.metaDescription'),
  ogType: 'website',
  ogImage: `${SITE_URL}/og-image.png`,
  twitterCard: 'summary_large_image',
  twitterImage: `${SITE_URL}/og-image.png`,
});

useHead({
  link: [{ rel: 'canonical', href: PAGE }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: computed(() =>
        JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          name: t('about.metaTitle'),
          description: t('about.metaDescription'),
          url: PAGE,
          mainEntity: {
            '@type': 'Organization',
            name: 'GutenKu',
            url: SITE_URL,
            logo: `${SITE_URL}/android-chrome-512x512.png`,
            founder: {
              '@type': 'Person',
              name: 'heristop',
              url: 'https://heristop.vercel.app',
              sameAs: socialLinks.map((link) => link.url),
            },
            sameAs: [
              'https://github.com/heristop/gutenku',
              'https://instagram.com/gutenku.poem',
            ],
          },
        }),
      ),
    },
  ],
});
</script>

<template>
  <article ref="page" class="about">
    <!-- A ribbon down the margin: the page as far as it has been read -->
    <span class="about__ribbon" aria-hidden="true" />
    <InkStamp label="GK" :size="52" :tilt="-8" stamp class="about__stamp" />

    <header class="about__header">
      <h1 class="about__title" data-reveal="title">{{ t('about.title') }}</h1>
      <p class="about__lede" data-reveal style="--i: 1">
        {{ t('about.lede') }}
      </p>
    </header>

    <div class="about__figure" data-reveal="page" style="--i: 2">
      <BlackoutFigure
        :text="PASSAGE"
        :verses="VERSES"
        :caption="t('about.demoCaption')"
        :show-label="t('about.demoShow')"
        :cut-label="t('about.demoCut')"
      />
    </div>

    <section class="about__section" aria-labelledby="about-what">
      <BrushRule
        as="h2"
        id="about-what"
        class="about__rule"
        data-reveal="rule"
        :label="t('about.whatTitle')"
      />
      <p class="about__text" data-reveal style="--i: 1">
        {{ t('about.what1') }}
      </p>
      <p class="about__text" data-reveal style="--i: 2">
        {{ t('about.what2') }}
      </p>
    </section>

    <section class="about__section" aria-labelledby="about-how">
      <BrushRule
        as="h2"
        id="about-how"
        class="about__rule"
        data-reveal="rule"
        :label="t('about.howTitle')"
      />
      <ol class="about__steps">
        <li
          v-for="(step, index) in steps"
          :key="step.title"
          class="about__step"
          data-reveal="slide"
          :style="{ '--i': index }"
        >
          <span class="about__step-ix" aria-hidden="true">{{
            NUMERALS[index] ?? index + 1
          }}</span>
          <div>
            <h3 class="about__step-title">{{ step.title }}</h3>
            <p class="about__step-text">{{ step.text }}</p>
          </div>
        </li>
      </ol>
    </section>

    <section
      v-if="GAME_ENABLED"
      class="about__section"
      aria-labelledby="about-game"
    >
      <BrushRule
        as="h2"
        id="about-game"
        class="about__rule"
        data-reveal="rule"
        label="GutenGuess"
      />
      <p class="about__text" data-reveal style="--i: 1">
        {{ t('about.game') }}
      </p>
      <p class="about__links" data-reveal style="--i: 2">
        <RouterLink to="/game" class="about__link">{{
          t('about.gameLink')
        }}</RouterLink>
        <RouterLink to="/how-to-play" class="about__link">{{
          t('footer.howToPlay')
        }}</RouterLink>
      </p>
    </section>

    <section class="about__section" aria-labelledby="about-who">
      <BrushRule
        as="h2"
        id="about-who"
        class="about__rule"
        data-reveal="rule"
        :label="t('about.whoTitle')"
      />
      <dl class="about__colophon">
        <div class="about__row" data-reveal="slide" style="--i: 0">
          <dt>{{ t('footer.credits.craftedBy') }}</dt>
          <dd>
            <strong>heristop</strong>
            <span class="about__years">{{
              t('footer.credits.years', { year: new Date().getFullYear() })
            }}</span>
          </dd>
        </div>
        <div class="about__row" data-reveal="slide" style="--i: 1">
          <dt>{{ t('footer.credits.inspiredBy') }}</dt>
          <dd>
            <a
              href="https://www.instagram.com/haiku_mariniere/"
              target="_blank"
              rel="noopener noreferrer"
              class="about__link"
            >
              Haiku Marinière<span class="sr-only">
                ({{ t('common.opensInNewTab') }})</span
              >
            </a>
          </dd>
        </div>
        <div class="about__row" data-reveal="slide" style="--i: 2">
          <dt>{{ t('about.openSource') }}</dt>
          <dd>
            <a
              href="https://github.com/heristop/gutenku"
              target="_blank"
              rel="noopener noreferrer"
              class="about__link"
            >
              GitHub · GPL-3.0<span class="sr-only">
                ({{ t('common.opensInNewTab') }})</span
              >
            </a>
          </dd>
        </div>
      </dl>

      <div class="about__contact" data-reveal>
        <ZenButton
          href="https://heristop.vercel.app"
          target="_blank"
          :aria-label="t('footer.credits.portfolioLabel')"
        >
          <template #icon-left>
            <ExternalLink :size="18" aria-hidden="true" />
          </template>
          {{ t('footer.credits.portfolio') }}
        </ZenButton>

        <ul class="about__social">
          <li
            v-for="(link, index) in socialLinks"
            :key="link.url"
            data-reveal="pop"
            :style="{ '--i': index }"
          >
            <a
              :href="link.url"
              target="_blank"
              rel="noopener noreferrer"
              class="about__social-link"
              :aria-label="t(link.label)"
              :title="t(link.label)"
            >
              <component :is="link.icon" :size="20" aria-hidden="true" />
            </a>
          </li>
        </ul>
      </div>

      <p class="about__feedback" data-reveal>
        {{ t('footer.credits.feedback') }}
      </p>
    </section>
  </article>
</template>

<style lang="scss" scoped>
.about {
  display: grid;
  gap: 2.25rem;
  // A fixed measure: the sheet never takes its width from its content (the
  // blackout and the reveals change what is inside while the page scrolls)
  box-sizing: border-box;
  width: min(100%, 820px);
  max-width: 820px;
  // Every page starts the same distance below the header's rule
  margin: var(--gk-page-top) auto 3rem;
  padding: 1.5rem 1.25rem 2rem;
  background: var(--gk-paper-raised);
  border-radius: var(--gk-radius-paper);
  box-shadow: var(--gk-lift);
  color: var(--gk-ink);
  font-family: var(--gk-font);

  @media (max-width: 599px) {
    width: calc(100% - 2 * var(--gk-gutter));
    margin-inline: auto;
  }

  @media (min-width: 600px) {
    padding: 2.5rem 2.5rem 2.5rem;
    gap: 2.75rem;
  }

  position: relative;

  &__header {
    display: grid;
    justify-items: start;
    gap: 0.875rem;
    // Room for the stamp on a phone, where the title can run the full width
    padding-right: 3.5rem;

    @media (min-width: 600px) {
      padding-right: 5rem;
    }
  }

  &__title {
    margin: 0;
    font-size: clamp(2.5rem, 7vw, 4rem);
    font-weight: 400;
    line-height: 0.92;
    letter-spacing: -0.04em;
    text-wrap: balance;
  }

  &__lede {
    max-width: 52ch;
    margin: 0;
    font-size: 1rem;
    line-height: 1.65;
    color: var(--gk-ink-soft);
    text-wrap: pretty;
  }

  // The stamp presses once, top right, as the page opens
  &__stamp {
    position: absolute;
    top: 1.25rem;
    right: 1.25rem;
    --ink-stamp-size: 2.75rem;

    @media (min-width: 600px) {
      top: 2rem;
      right: 2.5rem;
      --ink-stamp-size: 3.5rem;
    }
  }

  // A vermilion ribbon on the sheet's left edge, drawn down as the page is read
  &__ribbon {
    position: absolute;
    inset: 0 auto 0 0;
    width: 3px;
    overflow: hidden;
    border-radius: var(--gk-radius-paper) 0 0 var(--gk-radius-paper);
    background: var(--gk-ink-faint);
    pointer-events: none;

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background: var(--gk-stamp);
      transform: scaleY(var(--read, 0));
      transform-origin: 50% 0;
    }
  }

  &__section {
    display: grid;
    gap: 0.75rem;
  }

  &__text {
    max-width: 62ch;
    margin: 0;
    font-size: 0.9375rem;
    line-height: 1.65;
    text-wrap: pretty;
  }

  &__steps {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  &__step {
    display: grid;
    grid-template-columns: 2.75rem minmax(0, 1fr);
    gap: 0.5rem 1rem;
    padding: 1rem 0;
    border-bottom: var(--gk-rule-faint);

    &:last-child {
      border-bottom: 0;
    }
  }

  // The numeral turns vermilion once the step is reached, ink again when it is not
  &__step-ix {
    font-size: 1.5rem;
    line-height: 1;
    letter-spacing: -0.04em;
    color: var(--gk-ink-faint);
    transition: color 420ms var(--gk-ease-out) calc(var(--i, 0) * 70ms + 160ms);
  }

  &__step[data-reveal-state='in'] &__step-ix {
    color: var(--gk-stamp);
  }

  &__step-title {
    margin: 0;
    font-size: 1.0625rem;
    font-weight: 700;
    line-height: 1.3;
  }

  &__step-text {
    max-width: 58ch;
    margin: 0.25rem 0 0;
    font-size: 0.9375rem;
    line-height: 1.6;
    color: var(--gk-ink-soft);
    text-wrap: pretty;
  }

  &__links {
    display: flex;
    flex-wrap: wrap;
    gap: 0 1.5rem;
    margin: 0;
  }

  &__link {
    display: inline-flex;
    align-items: center;
    min-height: 2.75rem;
    font-size: 0.875rem;
    font-weight: 700;
    color: var(--gk-indigo);
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 0.25em;
    transition: text-decoration-thickness var(--gk-dur-fast) var(--gk-ease-out);

    &:active {
      text-decoration-thickness: 2px;
    }

    &:focus-visible {
      outline: 2px solid var(--gk-indigo);
      outline-offset: 2px;
      border-radius: var(--gk-radius-control);
    }
  }

  // The colophon: label and value, set on the page with no rules of their own
  // (the brush rule above is the only line this section needs)
  &__colophon {
    display: grid;
    gap: 0.25rem;
    margin: 0;
  }

  // Every row is one 44px line, label and value on its centre: the gaps are
  // equal whether the value is text or a link
  &__row {
    display: grid;
    grid-template-columns: 7rem minmax(0, 1fr);
    gap: 1rem;
    align-items: stretch;
    min-height: 2.75rem;
    font-size: 0.9375rem;

    @media (min-width: 600px) {
      grid-template-columns: 8.5rem minmax(0, 1fr);
    }

    dt,
    dd {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      margin: 0;
    }

    dt {
      color: var(--gk-ink-soft);
    }

    dd {
      color: var(--gk-ink);
    }

    .about__link {
      font-size: inherit;
      font-weight: 400;
    }
  }

  &__years {
    margin-left: 0.5rem;
    color: var(--gk-ink-soft);
    font-variant-numeric: tabular-nums;
  }

  &__contact {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 1rem 1.5rem;
    margin-top: 0.5rem;
  }

  &__social {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  &__social-link {
    display: grid;
    place-items: center;
    width: 2.75rem;
    height: 2.75rem;
    color: var(--gk-ink);
    border: 1.5px solid var(--gk-ink-faint);
    border-radius: var(--gk-radius-control);
    transition:
      border-color var(--gk-dur-fast) var(--gk-ease-out),
      color var(--gk-dur-fast) var(--gk-ease-out),
      transform var(--gk-dur-press) var(--gk-ease-out);

    &:active {
      transform: scale(0.96);
      color: var(--gk-indigo);
      border-color: var(--gk-indigo);
    }

    &:focus-visible {
      outline: 2px solid var(--gk-indigo);
      outline-offset: 2px;
    }
  }

  &__feedback {
    max-width: 52ch;
    margin: 0;
    font-size: 0.875rem;
    line-height: 1.5;
    color: var(--gk-ink-soft);
    text-wrap: balance;
  }
}

// Scroll choreography, both ways. Armed only once the page is mounted, so the
// prerendered text is never hidden. Each kind of element has its own entrance;
// all of them end at rest and run backwards when scrolled away: not yet reached
// ("below") or already read ("above"). `--i` staggers siblings by 70ms.
//   (default)  prose and keys: a soft rise
//   title      settles out of a blur, like ink taking
//   page       the figure is laid down from its top edge, like a leaf
//   rule       the brush rule extends from its label outwards
//   slide      steps and rows come in from the left margin
//   pop        the icons, one after another, with a small overshoot
.about[data-reveal-armed] [data-reveal] {
  --delay: calc(var(--i, 0) * 70ms);

  transition:
    opacity 560ms var(--gk-ease-out) var(--delay),
    translate 560ms var(--gk-ease-out) var(--delay),
    scale 560ms var(--gk-ease-out) var(--delay),
    filter 560ms var(--gk-ease-out) var(--delay),
    clip-path 720ms var(--gk-ease-out) var(--delay);

  &[data-reveal-state='below'] {
    opacity: 0;
    translate: 0 14px;
  }

  &[data-reveal-state='above'] {
    opacity: 0.35;
    translate: 0 -8px;
  }

  &[data-reveal='title'] {
    transition-duration: 760ms;

    &[data-reveal-state='below'] {
      filter: blur(8px);
      translate: 0 10px;
    }

    &[data-reveal-state='above'] {
      filter: blur(3px);
    }
  }

  // The clip is spelled out at rest too (never `none`): CSS cannot animate
  // between `none` and an inset. The 12px of slack keeps shadows and strokes whole.
  &[data-reveal='page'] {
    clip-path: inset(-12px -12px -12px -12px);
    transition-duration: 760ms;

    &[data-reveal-state='below'] {
      opacity: 1;
      translate: 0 0;
      clip-path: inset(-12px -12px 100% -12px);
    }

    &[data-reveal-state='above'] {
      opacity: 0.5;
      translate: 0;
    }
  }

  &[data-reveal='rule'] {
    clip-path: inset(-12px 0 -12px 0);

    &[data-reveal-state='below'] {
      opacity: 1;
      translate: 0 0;
      clip-path: inset(-12px 50% -12px 50%);
    }

    &[data-reveal-state='above'] {
      opacity: 0.5;
      translate: 0;
    }
  }

  &[data-reveal='slide'] {
    &[data-reveal-state='below'] {
      translate: -14px 0;
    }

    &[data-reveal-state='above'] {
      translate: 0 -8px;
    }
  }

  &[data-reveal='pop'] {
    transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);

    &[data-reveal-state='below'] {
      translate: 0 6px;
      scale: 0.82;
    }

    &[data-reveal-state='above'] {
      opacity: 0.5;
      translate: 0;
      scale: 0.94;
    }
  }
}

@media (hover: hover) {
  .about__link:hover {
    text-decoration-thickness: 2px;
  }

  .about__social-link:hover {
    color: var(--gk-indigo);
    border-color: var(--gk-indigo);
  }
}

.sr-only {
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

@media (prefers-reduced-motion: reduce) {
  .about__link,
  .about__social-link {
    transition: none;
  }

  .about__ribbon::after,
  .about__step-ix {
    transition: none;
  }

  .about__social-link:active {
    transform: none;
  }
}
</style>
