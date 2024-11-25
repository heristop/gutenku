<script setup lang="ts">
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useHaikuStore } from '@/store/haiku';
import AppLoading from '@/components/AppLoading.vue';

// Store setup
const haikuStore = useHaikuStore();
const { fetchNewHaiku } = haikuStore;
const { haiku, loading, networkError, notificationError, optionUseCache } =
  storeToRefs(haikuStore);

// Typage explicite des propriétés dérivées
const buttonLabel = computed<string>(() => {
  if (loading.value) {
    return optionUseCache.value ? 'Extracting' : 'Generating';
  }
  return optionUseCache.value ? 'Extract' : 'Generate';
});

const hasError = computed<boolean>(
  () => !!(networkError.value || notificationError.value),
);

// Typage de l'état de copie
const copyStatus = ref<{ copied: boolean; error: string | null }>({
  copied: false,
  error: null,
});

// Fonction de copie avec gestion d'erreurs
const copyHaiku = async () => {
  if (!haiku.value?.verses) return;

  try {
    await navigator.clipboard.writeText(haiku.value.verses.join('\n'));
    copyStatus.value = { copied: true, error: null };
    setTimeout(() => {
      copyStatus.value.copied = false;
    }, 2000);
  } catch (err) {
    copyStatus.value = {
      copied: false,
      error: err instanceof Error ? err.message : 'Failed to copy',
    };
  }
};

// Fonction d'animation avec typage
const animateVerse = (event: Event) => {
  const target = event.target as HTMLElement | null;
  if (!target) return;

  target.classList.add('verse--animate');
  setTimeout(() => target.classList.remove('verse--animate'), 500);
};
</script>

<template>
  <v-card
    :loading="loading"
    class="haiku-card"
    color="primary"
    image="@/assets/img/haiku_card.webp"
    elevation="4"
    ripple
  >
    <div class="haiku-card__overlay" />

    <v-card-title
      class="haiku-card__title font-weight-light text-white d-flex align-center"
    >
      <v-icon class="mr-2" color="white">mdi-feather</v-icon>
      Haiku Card
    </v-card-title>

    <v-card-text v-if="haiku?.verses" class="haiku-card__content">
      <transition-group name="verse-transition">
        <p
          v-for="(verse, index) in haiku.verses"
          :key="index"
          class="verse"
          @click="animateVerse($event)"
        >
          <mark class="verse__text">{{ verse }}</mark>
        </p>
      </transition-group>
    </v-card-text>

    <div v-else-if="hasError" class="haiku-card__error">
      <v-icon color="accent" class="error-icon">
        mdi-robot-dead-outline
      </v-icon>
      <span class="text-accent mt-2">Something went wrong</span>
    </div>

    <app-loading v-if="loading" color="accent" class="haiku-card__loader" />

    <v-card-actions class="haiku-card__actions">
      <v-tooltip :disabled="loading" location="top">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            :disabled="loading"
            :loading="loading"
            color="accent"
            data-cy="fetch-btn"
            class="action-btn"
            variant="elevated"
            min-width="120"
            @click="fetchNewHaiku"
          >
            <template #prepend>
              <v-icon :icon="loading ? 'mdi-loading mdi-spin' : 'mdi-reload'" />
            </template>
            {{ buttonLabel }}
          </v-btn>
        </template>
        <span>Generate a new Haiku</span>
      </v-tooltip>

      <v-tooltip location="top">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            :disabled="!haiku?.verses"
            color="accent"
            data-cy="copy-btn"
            class="action-btn"
            variant="text"
            @click="copyHaiku"
          >
            <template #prepend>
              <v-icon icon="mdi-content-copy" />
            </template>
            Copy
          </v-btn>
        </template>
        <span>Copy to clipboard</span>
      </v-tooltip>
    </v-card-actions>

    <v-scale-transition>
      <div v-if="loading" class="haiku-card__loading-overlay" />
    </v-scale-transition>
  </v-card>

  <v-snackbar
    v-model="copyStatus.copied"
    color="primary"
    location="top"
    class="elevation-24"
    timeout="2000"
  >
    <template #default>
      <div class="d-flex align-center">
        <v-icon data-cy="copy-success-icon" class="mr-2">
          mdi-check-circle
        </v-icon>
        <span>Haiku copied to clipboard!</span>
      </div>
    </template>

    <template #actions="{ isActive }">
      <v-btn
        :active="isActive.value"
        icon="mdi-close"
        size="small"
        variant="text"
        @click="copyStatus.copied = false"
      />
    </template>
  </v-snackbar>
</template>

<style lang="scss" scoped>
.haiku-card {
  position: relative;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  overflow: hidden;
  transition: transform 0.3s ease;

  &__overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.1));
    z-index: 1;
  }

  &__title {
    position: relative;
    z-index: 5;
    font-size: 1.2em;
  }

  &__content {
    position: relative;
    z-index: 2;
    min-height: 200px;
  }

  &__error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    z-index: 5;
  }

  &__loader {
    z-index: 5;
  }

  &__actions {
    position: relative;
    z-index: 4;
    justify-content: flex-end;
    gap: 0.5rem;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(3px);
    margin: 0 -1.5rem -1.5rem;
    padding: 1rem 1.5rem;

    transition: background-color 0.3s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.08);
    }
  }

  &__loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(4px);
    z-index: 3;
  }
}

.verse {
  margin: 1.5rem 0;
  cursor: pointer;
  transition: transform 0.2s ease;
  line-height: 2em;

  &:hover {
    transform: translateX(8px);
  }

  &--animate {
    animation: pulse 0.5s ease;
  }

  &__text {
    color: #fff;
    padding: 0.5rem 1rem;
    background-color: rgba(255, 255, 255, 0.12);
    font-size: 1.2em;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: background-color 0.2s ease;

    &:hover {
      background-color: rgba(255, 255, 255, 0.18);
    }
  }
}

.action-btn {
  transition: all 0.2s ease;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.verse-transition {
  &-enter-active,
  &-leave-active {
    transition: all 0.3s ease;
  }

  &-enter-from {
    opacity: 0;
    transform: translateX(-20px);
  }

  &-leave-to {
    opacity: 0;
    transform: translateX(20px);
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

@media (max-width: 400px) {
  .haiku-card {
    padding: 1rem;

    &__title {
      font-size: 1em;
    }

    &__content {
      min-height: 150px;
    }

    &__actions {
      margin: 0 -1rem -1rem;
      padding: 1rem;
    }
  }

  .verse {
    margin: 1rem 0;

    &__text {
      font-size: 1em;
      padding: 0.4rem 0.8rem;
    }
  }

  .error-icon {
    font-size: 2rem;
  }
}
</style>
