<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import ZenButton from '@/core/components/ui/ZenButton.vue';
import { setThemeReveal, useTheme } from '@/core/composables/theme';
import { animateTypewriterReveal } from '@/core/composables/typewriter-reveal';
import {
  prefersReducedMotion,
  skipActiveViewTransition,
} from '@/core/composables/view-transition';

const { locale } = useI18n();
const route = useRoute();
const router = useRouter();
const { actualTheme, themePreference, setTheme } = useTheme();
const initialPreference = themePreference.value;
const busy = ref(false);
const typed = ref('');
const copy = computed(() => {
  if (locale.value.startsWith('fr')) {
    return {
      dark: 'La nuit, les histoires restent.',
      light: 'Un nouveau jour, une nouvelle page.',
      tryLight: 'Essayer en clair',
      tryDark: 'Essayer en sombre',
      close: 'Terminer le test',
      label: 'Essai de transition',
      title: 'Un ruban, deux ambiances.',
      placeholder: 'À vous de changer la page.',
    };
  }

  if (locale.value.startsWith('ja')) {
    return {
      dark: '夜も、物語は続く。',
      light: '新しい日、新しいページ。',
      tryLight: 'ライトを試す',
      tryDark: 'ダークを試す',
      close: 'テストを終了',
      label: 'トランジションテスト',
      title: 'ひとつのリボン、ふたつの雰囲気。',
      placeholder: 'ページを変えてみよう。',
    };
  }

  return {
    dark: 'After dark, stories stay.',
    light: 'A new day. A new page.',
    tryLight: 'Try light mode',
    tryDark: 'Try dark mode',
    close: 'Finish test',
    label: 'Transition experiment',
    title: 'One ribbon. Two moods.',
    placeholder: 'Give the page a new mood.',
  };
});
const phrase = computed(() => copy.value[actualTheme.value]);
const action = computed(() =>
  actualTheme.value === 'dark' ? copy.value.tryLight : copy.value.tryDark,
);
const visibleLine = computed(() => {
  if (typed.value || busy.value) {
    return typed.value;
  }

  return copy.value.placeholder;
});
let timer: ReturnType<typeof setTimeout> | undefined;
let cleanupTimer: ReturnType<typeof setTimeout> | undefined;

function clearReveal() {
  delete document.documentElement.dataset.gkVtTypewriter;
}

function typeLine() {
  const letters = [...phrase.value];
  let count = 0;
  const next = () => {
    typed.value = letters.slice(0, ++count).join('');

    if (count < letters.length) {
      timer = setTimeout(next, letters[count] === ' ' ? 28 : 32);

      return;
    }
    busy.value = false;
  };
  next();
}

function replay() {
  if (busy.value) {
    return;
  }
  busy.value = true;
  typed.value = '';
  clearTimeout(timer);
  clearTimeout(cleanupTimer);
  const reduced = prefersReducedMotion();

  if (!reduced) {
    document.documentElement.dataset.gkVtTypewriter = '';
    setThemeReveal(animateTypewriterReveal);
  }
  setTheme(actualTheme.value === 'dark' ? 'light' : 'dark');
  cleanupTimer = setTimeout(clearReveal, 620);
  timer = setTimeout(
    () => {
      if (reduced) {
        typed.value = phrase.value;
        busy.value = false;

        return;
      }
      typeLine();
    },
    reduced ? 220 : 580,
  );
}

function close() {
  const query = { ...route.query };
  delete query.motion;
  router.replace({ query });
}

onBeforeUnmount(() => {
  clearTimeout(timer);
  clearTimeout(cleanupTimer);
  clearReveal();
  setThemeReveal();
  skipActiveViewTransition();
  setTheme(initialPreference);
});
</script>

<template>
  <Teleport to="body">
    <aside
      class="theme-probe"
      data-cy="theme-typewriter-probe"
      :aria-label="copy.label"
    >
      <div class="theme-probe__copy">
        <strong>{{ copy.title }}</strong>
        <p
          class="theme-probe__line"
          :class="{ 'theme-probe__line--typing': busy }"
          aria-hidden="true"
        >
          {{ visibleLine }}<span v-if="busy" class="theme-probe__caret"></span>
        </p>
        <span class="theme-probe__status" role="status">{{
          busy ? '' : typed
        }}</span>
      </div>
      <div class="theme-probe__actions">
        <ZenButton
          :disabled="busy"
          size="sm"
          @click="replay"
          data-cy="theme-typewriter-replay"
          >{{ action }}</ZenButton
        >
        <ZenButton
          variant="text"
          size="sm"
          @click="close"
          data-cy="theme-typewriter-close"
          >{{ copy.close }}</ZenButton
        >
      </div>
    </aside>
  </Teleport>
</template>

<style lang="scss" scoped>
.theme-probe {
  position: fixed;
  z-index: 150;
  inset: auto 1rem max(1rem, env(safe-area-inset-bottom)) auto;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem 2rem;
  width: min(48rem, calc(100% - 2rem));
  padding: 1.25rem 1.5rem;
  background: var(--gk-paper-raised);
  border-radius: var(--gk-radius-paper);
  box-shadow: var(--gk-lift);
  color: var(--gk-ink);
  font-family: var(--gk-font);
  border-top: var(--gk-rule);

  &__copy {
    flex: 1 1 17rem;
    min-width: 0;
  }
  strong {
    font-size: 1.125rem;
  }
  &__line {
    min-height: 2.8em;
    margin: 0.375rem 0 0;
    font-size: 0.9375rem;
    line-height: 1.4;
    color: var(--gk-ink-soft);
  }
  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem 0.5rem;
  }
  &__caret {
    display: inline-block;
    width: 0.6em;
    height: 1em;
    margin-inline-start: 0.125rem;
    background: var(--gk-ink);
    vertical-align: -0.1em;
  }
  &__status {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  @media (max-width: 599px) {
    padding: 1rem;
    gap: 0.5rem;
    &__actions {
      width: 100%;
    }
  }
}
</style>

<style lang="scss">
html[data-gk-vt='theme'][data-gk-vt-typewriter] {
  &::view-transition-old(root),
  &::view-transition-new(root) {
    animation: none;
    mix-blend-mode: normal;
  }
  &::view-transition-new(root) {
    z-index: 1;
  }
}
</style>
