<script lang="ts" setup>
import { computed, nextTick, ref, useTemplateRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import {
  Eye,
  EyeOff,
  Image as ImageIcon,
  Sparkles,
} from '@/core/components/icons/ink';
import ZenExpandTransition from '@/core/components/ui/ZenExpandTransition.vue';
import ZenSwitch from '@/core/components/ui/ZenSwitch.vue';
import { urqlClient } from '@/client';
import {
  isPlausibleOpenAIKey,
  useOpenAIKey,
} from '@/core/composables/openai-key';
import { useHaikuStore } from '@/features/haiku/store/haiku';
import { CHECK_OPENAI_KEY_MUTATION } from '@/features/haiku/store/queries';

type KeyStatus = 'VALID' | 'INVALID' | 'UNAVAILABLE';

// AI is never on the house: in production it runs only on the visitor's
// own OpenAI key. The key is asked for only once AI is switched on.
const ACCEPTED_NOTICE_MS = 4000;

const { t } = useI18n();
const { optionUseAI, optionImageAI } = storeToRefs(useHaikuStore());
const { hasKey, maskedKey, save, forget } = useOpenAIKey();

const draft = ref('');
const revealed = ref(false);
const checking = ref(false);
const status = ref<KeyStatus | 'MALFORMED' | null>(null);
const accepted = ref(false);
const inputRef = useTemplateRef<HTMLInputElement>('inputRef');

const wantsAI = computed(() => optionUseAI.value || optionImageAI.value);
const asksForKey = computed(() => wantsAI.value && !hasKey.value);

const statusMessage = computed(() => {
  switch (status.value) {
    case 'MALFORMED':
      return t('aiKey.status.malformed');
    case 'INVALID':
      return t('aiKey.status.invalid');
    case 'UNAVAILABLE':
      return t('aiKey.status.unavailable');
    default:
      return '';
  }
});

// Switching AI on is the moment the key is needed: the field arrives and
// takes the caret, so a paste is all that's left
watch(asksForKey, async (asking) => {
  if (asking) {
    await nextTick();
    inputRef.value?.focus({ preventScroll: true });
  }
});

let acceptedTimer: ReturnType<typeof setTimeout> | undefined;

async function checkKey(): Promise<void> {
  const key = draft.value.trim();

  if (checking.value) {
    return;
  }

  if (!isPlausibleOpenAIKey(key)) {
    status.value = 'MALFORMED';

    return;
  }

  checking.value = true;
  status.value = null;

  try {
    const result = await urqlClient
      .mutation<{ checkOpenAIKey: KeyStatus }>(CHECK_OPENAI_KEY_MUTATION, {
        key,
      })
      .toPromise();
    const verdict = result.data?.checkOpenAIKey ?? 'UNAVAILABLE';

    if (verdict !== 'VALID') {
      status.value = verdict;

      return;
    }

    save(key);
    draft.value = '';
    revealed.value = false;
    accepted.value = true;
    clearTimeout(acceptedTimer);
    acceptedTimer = setTimeout(() => {
      accepted.value = false;
    }, ACCEPTED_NOTICE_MS);
  } finally {
    checking.value = false;
  }
}

// A pasted key is checked at once: pasting is the whole gesture
function onPaste(event: ClipboardEvent): void {
  const pasted = event.clipboardData?.getData('text').trim() ?? '';

  if (isPlausibleOpenAIKey(pasted)) {
    event.preventDefault();
    draft.value = pasted;
    checkKey();
  }
}

function forgetKey(): void {
  forget();
  status.value = null;
  accepted.value = false;
  optionUseAI.value = false;
  optionImageAI.value = false;
}
</script>

<template>
  <div class="ai-key">
    <div class="ai-key__content">
      <div class="ai-key__row ai-key__switch">
        <Sparkles :size="14" class="ai-key__icon" aria-hidden="true" />
        <ZenSwitch
          v-model="optionUseAI"
          :label="t('toolbar.aiText')"
          size="sm"
          label-first
        />
      </div>
      <div class="ai-key__row ai-key__switch">
        <ImageIcon :size="14" class="ai-key__icon" aria-hidden="true" />
        <ZenSwitch
          v-model="optionImageAI"
          :label="t('toolbar.aiImage')"
          size="sm"
          label-first
        />
      </div>

      <!-- The key, asked for only once AI is on -->
      <ZenExpandTransition>
        <form v-if="asksForKey" class="ai-key__form" @submit.prevent="checkKey">
          <label class="ai-key__label" for="ai-key-input">
            {{ t('aiKey.label') }}
          </label>
          <div
            class="ai-key__field"
            :class="{
              'ai-key__field--invalid': status !== null,
              'ai-key__field--checking': checking,
            }"
          >
            <input
              id="ai-key-input"
              ref="inputRef"
              v-model="draft"
              class="ai-key__input"
              :type="revealed ? 'text' : 'password'"
              name="openai-key"
              autocomplete="off"
              autocapitalize="off"
              spellcheck="false"
              placeholder="sk-…"
              :readonly="checking"
              :aria-invalid="status !== null || undefined"
              aria-describedby="ai-key-status ai-key-note"
              @input="status = null"
              @paste="onPaste"
            />
            <button
              type="button"
              class="ai-key__reveal"
              :aria-label="revealed ? t('aiKey.hide') : t('aiKey.show')"
              :aria-pressed="revealed"
              @click="revealed = !revealed"
            >
              <EyeOff v-if="revealed" :size="16" aria-hidden="true" />
              <Eye v-else :size="16" aria-hidden="true" />
            </button>
            <button
              type="submit"
              class="ai-key__check"
              :disabled="checking || draft.trim() === ''"
              :aria-busy="checking || undefined"
            >
              <!-- Both words set one over the other: the key keeps the
                     longer one's width, only the current one shows -->
              <span
                class="ai-key__check-label"
                :class="{ 'ai-key__check-label--current': !checking }"
                >{{ t('aiKey.check') }}</span
              >
              <span
                class="ai-key__check-label"
                :class="{ 'ai-key__check-label--current': checking }"
                >{{ t('aiKey.checking') }}</span
              >
            </button>
          </div>
          <p
            id="ai-key-status"
            class="ai-key__status"
            role="status"
            aria-live="polite"
          >
            {{ statusMessage }}
          </p>
          <p id="ai-key-note" class="ai-key__note">
            {{ t('aiKey.note') }}
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              >{{ t('aiKey.getKey') }}</a
            >
            ·
            <a
              href="https://openai.com/api/pricing/"
              target="_blank"
              rel="noopener noreferrer"
              >{{ t('aiKey.pricing') }}</a
            >
          </p>
        </form>
      </ZenExpandTransition>

      <!-- The key in use: recognisable, never readable -->
      <div v-if="hasKey" class="ai-key__row ai-key__current">
        <span class="ai-key__label">{{ t('aiKey.yourKey') }}</span>
        <code class="ai-key__masked">{{ maskedKey }}</code>
        <button type="button" class="ai-key__link" @click="forgetKey">
          {{ t('aiKey.forget') }}
        </button>
      </div>

      <p class="ai-key__accepted" role="status" aria-live="polite">
        <Transition name="ai-key-notice">
          <span v-if="accepted">{{ t('aiKey.accepted') }}</span>
        </Transition>
      </p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ai-key {
  display: flex;
  flex-direction: column;
  overflow: hidden;

  // Set inside the crafting panel's Options, which draws the rule above
  &__content {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  &__row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  // Each switch is one settings row: icon, label, then the switch at the end
  &__switch {
    min-height: 2.75rem;

    :deep(.zen-switch) {
      flex: 1;
    }
  }

  &__icon {
    flex-shrink: 0;
    color: var(--gk-ink-soft);
  }

  &__label {
    font-size: 0.8125rem;
    color: var(--gk-ink);
  }

  // The key belongs to the switches above it: set apart by space, not a rule
  &__form {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding-top: 0.75rem;
  }

  // One ruled line to write on, carrying its own actions at the end
  &__field {
    position: relative;
    display: flex;
    align-items: center;
    border-bottom: 1px solid var(--gk-ink-soft);
    transition: border-color var(--gk-dur-fast) var(--gk-ease-out);

    &:focus-within {
      border-bottom-color: var(--gk-indigo);
      box-shadow: 0 1px 0 var(--gk-indigo);
    }

    &--invalid,
    &--invalid:focus-within {
      border-bottom-color: var(--gk-stamp-ink);
      box-shadow: 0 1px 0 var(--gk-stamp-ink);
    }

    // While OpenAI is asked, a short ink stroke travels the line
    &--checking::after {
      content: '';
      position: absolute;
      left: 0;
      bottom: -2px;
      width: 28%;
      height: 2px;
      background: var(--gk-indigo);
      animation: ai-key-ink 1100ms var(--gk-ease-out) infinite;
    }
  }

  &__input {
    flex: 1;
    min-width: 0;
    min-height: 2.75rem;
    padding: 0 0.125rem;
    font-family: var(--gk-font);
    font-size: 1rem; // no zoom on iOS
    letter-spacing: 0.02em;
    color: var(--gk-ink);
    caret-color: var(--gk-indigo);
    background: transparent;
    border: none;
    outline: none;

    &::placeholder {
      color: var(--gk-ink-soft);
    }

    &::selection {
      background: color-mix(in srgb, var(--gk-indigo) 22%, transparent);
    }

    &[readonly] {
      color: var(--gk-ink-soft);
    }
  }

  // Quiet keys on the line: the eye, then the action that checks
  &__reveal,
  &__check {
    display: inline-grid;
    place-items: center;
    flex-shrink: 0;
    min-width: 2.75rem;
    min-height: 2.75rem;
    font-family: inherit;
    background: none;
    border: none;
    border-radius: var(--gk-radius-control);
    cursor: pointer;

    &:focus-visible {
      outline: 2px solid var(--gk-indigo);
      outline-offset: -2px;
    }
  }

  &__reveal {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--gk-ink-soft);
    transition: color var(--gk-dur-fast) var(--gk-ease-out);

    @media (hover: hover) and (pointer: fine) {
      &:hover {
        color: var(--gk-ink);
      }
    }
  }

  &__check {
    padding: 0 0.25rem 0 0.5rem;
    font-size: 0.8125rem;
    font-weight: 700;
    color: var(--gk-indigo);
    transition:
      color var(--gk-dur-fast) var(--gk-ease-out),
      transform var(--gk-dur-fast) var(--gk-ease-out);

    @media (hover: hover) and (pointer: fine) {
      &:hover:not(:disabled) {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }
    }

    &:active:not(:disabled) {
      transform: scale(0.97);
    }

    &:disabled {
      color: var(--gk-ink-soft);
      cursor: default;
    }

    &[aria-busy='true'] {
      color: var(--gk-indigo);
    }
  }

  &__check-label {
    grid-area: 1 / 1;
    visibility: hidden;

    &--current {
      visibility: visible;
    }
  }

  // A line kept for the verdict, empty or not: the form never jumps as it
  // appears, clears while checking, or changes. Messages fit one phone line.
  &__status {
    min-height: calc(0.75rem * 1.5 + 0.25rem);
    margin: 0;
    padding-top: 0.25rem;
    font-size: 0.75rem;
    line-height: 1.5;
    color: var(--gk-stamp-ink);
  }

  &__note {
    margin: 0.375rem 0 0;
    font-size: 0.75rem;
    line-height: 1.6;
    color: var(--gk-ink-soft);
    text-wrap: pretty;

    a {
      color: var(--gk-indigo);
      text-underline-offset: 0.2em;
    }
  }

  &__current {
    min-height: 2.75rem;
    flex-wrap: wrap;
    margin-top: 0.5rem;
  }

  &__masked {
    flex: 1;
    font-family: var(--gk-font);
    font-size: 0.8125rem;
    letter-spacing: 0.04em;
    color: var(--gk-ink-soft);
  }

  // A text action: indigo because it acts, underlined on hover
  &__link {
    min-height: 2.75rem;
    padding: 0 0.25rem;
    font-family: inherit;
    font-size: 0.8125rem;
    color: var(--gk-indigo);
    background: none;
    border: none;
    cursor: pointer;
    text-underline-offset: 0.2em;

    @media (hover: hover) and (pointer: fine) {
      &:hover {
        text-decoration: underline;
      }
    }

    &:focus-visible {
      outline: 2px solid var(--gk-indigo);
      outline-offset: 2px;
      border-radius: var(--gk-radius-control);
    }
  }

  // The key was taken: said once, then gone
  &__accepted {
    margin: 0;
    font-size: 0.75rem;
    color: var(--gk-indigo);

    &:empty {
      display: none;
    }
  }
}

.ai-key-notice-enter-active {
  transition:
    opacity var(--gk-dur-fast) var(--gk-ease-out),
    translate var(--gk-dur-fast) var(--gk-ease-out);
}

.ai-key-notice-leave-active {
  transition: opacity var(--gk-dur-fast) var(--gk-ease-out);
}

.ai-key-notice-enter-from {
  opacity: 0;
  translate: 0 0.25rem;
}

.ai-key-notice-leave-to {
  opacity: 0;
}

@keyframes ai-key-ink {
  0% {
    translate: -100% 0;
    opacity: 0;
  }

  30% {
    opacity: 1;
  }

  100% {
    translate: 360% 0;
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ai-key__header,
  .ai-key__chevron,
  .ai-key__field,
  .ai-key__reveal,
  .ai-key__check,
  .ai-key-notice-enter-active,
  .ai-key-notice-leave-active {
    transition: none;
  }

  // Still says it's busy, without the travel
  .ai-key__field--checking::after {
    width: 100%;
    animation: none;
    opacity: 0.5;
  }
}
</style>
