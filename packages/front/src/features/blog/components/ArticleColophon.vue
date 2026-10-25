<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import InkStamp from '@/core/components/ink/InkStamp.vue';
import { toRomanNumeral } from '@/features/blog/composables/article-figures';

// The okuzuke: a book ends on a rule, a seal and one line of its making
const props = defineProps<{ issue: number; date: Date }>();

const { t, locale } = useI18n();

const line = computed(() =>
  t('blog.colophon', {
    number: toRomanNumeral(props.issue),
    // British English keeps the "day month year" order
    date: props.date.toLocaleDateString(
      locale.value === 'en' ? 'en-GB' : locale.value,
      { day: 'numeric', month: 'long', year: 'numeric' },
    ),
  }),
);

// Set down once, when the reader reaches it. Without script or an observer
// it is simply there.
const root = ref<HTMLElement | null>(null);
const armed = ref(false);
const seen = ref(false);

let observer: IntersectionObserver | null = null;

onMounted(() => {
  try {
    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          seen.value = true;
          observer?.disconnect();
        }
      },
      { threshold: 0.6 },
    );
  } catch {
    return;
  }

  if (root.value) {
    armed.value = true;
    observer.observe(root.value);
  }
});

onUnmounted(() => observer?.disconnect());
</script>

<template>
  <footer
    ref="root"
    class="article-colophon"
    :class="{ 'is-armed': armed, 'is-seen': seen }"
  >
    <span class="article-colophon__rule" aria-hidden="true" />
    <InkStamp
      class="article-colophon__seal"
      label="GK"
      tone="ink"
      :size="30"
      :tilt="-4"
      :stamp="armed && seen"
    />
    <p class="article-colophon__line">{{ line }}</p>
  </footer>
</template>

<style lang="scss" scoped>
.article-colophon {
  display: grid;
  justify-items: center;
  gap: 0.875rem;
  margin: 3rem 0 2rem;
  color: var(--gk-ink-soft);
  font-size: 0.8125rem;
  letter-spacing: 0.04em;
  text-align: center;

  &__rule {
    width: 6rem;
    height: 1px;
    background: var(--gk-ink-soft);
    transform-origin: center;
  }

  &__line {
    margin: 0;
  }

  // Waiting below the fold: nothing set yet
  &.is-armed:not(.is-seen) {
    .article-colophon__rule {
      transform: scaleX(0);
    }

    .article-colophon__seal,
    .article-colophon__line {
      opacity: 0;
    }
  }

  // The rule is drawn, the seal pressed (InkStamp, from 300ms), then the line
  &.is-armed.is-seen {
    .article-colophon__rule {
      animation: colophon-rule 360ms var(--gk-ease-out) both;
    }

    .article-colophon__seal {
      animation-delay: 300ms;
    }

    .article-colophon__line {
      animation: colophon-line var(--gk-dur-base) var(--gk-ease-out) 620ms both;
    }
  }
}

@keyframes colophon-rule {
  from {
    transform: scaleX(0);
  }
}

@keyframes colophon-line {
  from {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .article-colophon.is-armed.is-seen .article-colophon__rule {
    animation: colophon-line 150ms ease both;
  }

  .article-colophon.is-armed.is-seen .article-colophon__line {
    animation-duration: 150ms;
    animation-delay: 0s;
  }
}
</style>
