<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useHead, useSeoMeta } from '@unhead/vue';
import BrushRule from '@/core/components/ink/BrushRule.vue';
import FilmPlate from '@/core/components/ink/FilmPlate.vue';
import ZenButton from '@/core/components/ui/ZenButton.vue';
import { SITE_URL } from '@/locales/config';

// How to play GutenGuess, as a film on a page of its own so it can be found, indexed and
// shared. The page carries the film's whole story as text (the shot list), so
// search engines and screen readers get what the picture says.

type Shot = { time: string; title: string; text: string };

const { t, tm, rt } = useI18n();

const shots = computed<Shot[]>(() =>
  (tm('film.shots') as unknown as Record<string, string>[]).map((shot) => ({
    time: rt(shot.time),
    title: rt(shot.title),
    text: rt(shot.text),
  })),
);

const VIDEO = `${SITE_URL}/media/gutenguess-promo.mp4`;
const THUMBNAIL = `${SITE_URL}/media/gutenguess-promo.jpg`;
const PAGE = `${SITE_URL}/how-to-play`;

useSeoMeta({
  title: () => t('film.metaTitle'),
  description: () => t('film.metaDescription'),
  ogTitle: () => t('film.metaTitle'),
  ogDescription: () => t('film.metaDescription'),
  ogType: 'video.other',
  ogImage: THUMBNAIL,
  ogVideo: VIDEO,
  twitterCard: 'summary_large_image',
  twitterImage: THUMBNAIL,
});

useHead({
  link: [{ rel: 'canonical', href: PAGE }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: computed(() =>
        JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'VideoObject',
          name: t('film.metaTitle'),
          description: t('film.metaDescription'),
          thumbnailUrl: THUMBNAIL,
          contentUrl: VIDEO,
          uploadDate: '2026-11-01',
          duration: 'PT32S',
          encodingFormat: 'video/mp4',
          isFamilyFriendly: true,
          publisher: {
            '@type': 'Organization',
            name: 'GutenKu',
            logo: {
              '@type': 'ImageObject',
              url: `${SITE_URL}/android-chrome-512x512.png`,
            },
          },
          mainEntityOfPage: { '@type': 'WebPage', '@id': PAGE },
        }),
      ),
    },
  ],
});
</script>

<template>
  <article class="film">
    <header class="film__header">
      <h1 class="film__title">{{ t('film.title') }}</h1>
      <p class="film__lede">{{ t('film.lede') }}</p>
    </header>

    <FilmPlate
      class="film__player"
      src="/media/gutenguess-promo.mp4"
      poster="/media/gutenguess-promo.webp"
      :alt="t('film.alt')"
      :play-label="t('film.play')"
      :caption="t('film.caption')"
      duration="0:32"
    />

    <section class="film__shots" aria-labelledby="film-shots">
      <BrushRule as="h2" id="film-shots" :label="t('film.shotsTitle')" />

      <ol class="film__list">
        <li v-for="shot in shots" :key="shot.time" class="film__shot">
          <time class="film__time">{{ shot.time }}</time>
          <div class="film__shot-text">
            <h3 class="film__shot-title">{{ shot.title }}</h3>
            <p class="film__shot-body">{{ shot.text }}</p>
          </div>
        </li>
      </ol>
    </section>

    <footer class="film__actions">
      <ZenButton to="/game" size="lg" data-cy="how-to-play-play">
        {{ t('film.cta') }}
      </ZenButton>
      <RouterLink to="/haiku" class="film__link">
        {{ t('film.haikuLink') }}
      </RouterLink>
    </footer>
  </article>
</template>

<style lang="scss" scoped>
.film {
  display: grid;
  gap: 2rem;
  // A fixed measure: the sheet never takes its width from its content (the
  // blackout and the reveals change what is inside while the page scrolls)
  box-sizing: border-box;
  width: min(100%, 820px);
  max-width: 820px;
  // Every page starts the same distance below the header's rule
  margin: var(--gk-page-top) auto 3rem;
  padding: 1.5rem 1.25rem 1.75rem;
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
    padding: 2.5rem 2.5rem 2rem;
    gap: 2.5rem;
  }

  &__header {
    display: grid;
    justify-items: start;
    gap: 0.875rem;
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

  &__shots {
    display: grid;
    gap: 0.5rem;
  }

  &__list {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  // Each shot is a line of a contents page: the running time at the margin,
  // the title and one sentence beside it, a faint rule between
  &__shot {
    display: grid;
    grid-template-columns: 3.25rem minmax(0, 1fr);
    gap: 0.5rem 1rem;
    padding: 1.125rem 0;
    border-bottom: var(--gk-rule-faint);

    &:last-child {
      border-bottom: 0;
    }

    @media (min-width: 600px) {
      grid-template-columns: 4.5rem minmax(0, 1fr);
      gap: 0 1.5rem;
    }
  }

  &__time {
    padding-top: 0.2rem;
    font-size: 0.8125rem;
    letter-spacing: 0.08em;
    color: var(--gk-ink-soft);
    font-variant-numeric: tabular-nums;
  }

  &__shot-title {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 700;
    line-height: 1.3;
  }

  &__shot-body {
    max-width: 56ch;
    margin: 0.25rem 0 0;
    font-size: 0.9375rem;
    line-height: 1.6;
    color: var(--gk-ink-soft);
    text-wrap: pretty;
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem 1.5rem;
    padding-top: 0.5rem;
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

    &:focus-visible {
      outline: 2px solid var(--gk-indigo);
      outline-offset: 2px;
    }
  }
}
</style>
