<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { BookOpenText, Feather, Palette, ChevronRight, type LucideIcon } from 'lucide-vue-next';

const { t } = useI18n();

interface ProcessStep {
  icon: LucideIcon;
  titleKey: string;
  descriptionKey: string;
}

const stepDefinitions: ProcessStep[] = [
  {
    icon: BookOpenText,
    titleKey: 'haikuProcess.steps.literature.title',
    descriptionKey: 'haikuProcess.steps.literature.description',
  },
  {
    icon: Feather,
    titleKey: 'haikuProcess.steps.haiku.title',
    descriptionKey: 'haikuProcess.steps.haiku.description',
  },
  {
    icon: Palette,
    titleKey: 'haikuProcess.steps.visual.title',
    descriptionKey: 'haikuProcess.steps.visual.description',
  },
];

const steps = computed(() =>
  stepDefinitions.map((step) => ({
    icon: step.icon,
    title: t(step.titleKey),
    description: t(step.descriptionKey),
  })),
);
</script>

<template>
  <section class="haiku-process" aria-label="Haiku creation process">
    <ol class="haiku-process__container" role="list">
      <li
        v-for="(step, index) in steps"
        :key="index"
        v-motion
        class="haiku-process__step"
        role="listitem"
        :initial="{ opacity: 0, y: 40, scale: 0.9 }"
        :visible-once="{
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            delay: index * 150,
            duration: 600,
            ease: [0.25, 0.8, 0.25, 1],
          },
        }"
      >
        <div class="haiku-process__icon-wrapper" aria-hidden="true">
          <component :is="step.icon" :size="28" class="haiku-process__icon" />
        </div>
        <h3 class="haiku-process__title">
          {{ step.title }}
        </h3>
        <p class="haiku-process__description">
          {{ step.description }}
        </p>

        <div
          v-if="index < steps.length - 1"
          class="haiku-process__connector"
          aria-hidden="true"
        >
          <ChevronRight
            :size="28"
            :stroke-width="2.5"
            class="haiku-process__arrow"
          />
        </div>
      </li>
    </ol>
  </section>
</template>

<style lang="scss" scoped>
.haiku-process {
  padding: 1.5rem 0;
  margin: 1rem 0;

  &__container {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    gap: 1rem;
    list-style: none;
    padding: 0;
    margin: 0;

    @media (max-width: 600px) {
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
    }
  }

  &__step {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 1rem;
    flex: 1;
    max-width: 11.25rem;

    @media (max-width: 600px) {
      max-width: 17.5rem;
    }
  }

  &__icon-wrapper {
    width: 4rem;
    height: 4rem;
    border-radius: 50%;
    background: linear-gradient(
      135deg,
      var(--gutenku-zen-accent) 0%,
      var(--gutenku-zen-secondary) 100%
    );
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 0.75rem;
    box-shadow: 0 4px 12px oklch(0 0 0 / 0.1);
    transition: var(--gutenku-transition-zen);

    [data-theme='dark'] & {
      background: linear-gradient(135deg, #8fbcb5 0%, #5a9a96 100%);
      box-shadow:
        0 4px 12px oklch(0 0 0 / 0.3),
        0 0 20px oklch(0.7 0.08 180 / 0.2);
    }

    .haiku-process__step:hover & {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px oklch(0 0 0 / 0.15);
    }
  }

  &__icon {
    color: var(--gutenku-paper-bg);

    [data-theme='dark'] & {
      color: #1a1a18;
    }
  }

  &__title {
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--gutenku-text-primary);
    margin-bottom: 0.4rem;
    letter-spacing: 0.02em;
  }

  &__description {
    font-size: 0.8rem;
    color: var(--gutenku-text-muted);
    line-height: 1.4;
    margin: 0;
  }

  &__connector {
    position: absolute;
    right: -0.75rem;
    top: calc(1rem + 2rem); // padding-top + half icon height
    transform: translateY(-50%);

    @media (max-width: 600px) {
      display: none;
    }
  }

  &__arrow {
    color: var(--gutenku-zen-secondary);
    opacity: 0.6;

    [data-theme='dark'] & {
      color: #9ac5c0;
      opacity: 0.9;
    }
  }
}
</style>
