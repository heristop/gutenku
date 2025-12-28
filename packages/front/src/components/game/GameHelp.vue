<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { X } from 'lucide-vue-next';

const modelValue = defineModel<boolean>({ default: false });

const { t } = useI18n();

function close() {
  modelValue.value = false;
}
</script>

<template>
  <v-dialog
    v-model="modelValue"
    max-width="500"
    :fullscreen="false"
    transition="dialog-bottom-transition"
  >
    <div class="game-help gutenku-paper pa-6 modal-appear">
      <div class="help-header d-flex justify-space-between align-center mb-4">
        <h2 class="help-title gutenku-text-primary">
          {{ t('game.help.title') }}
        </h2>
        <v-btn
          icon
          variant="text"
          size="small"
          :aria-label="t('common.close')"
          @click="close"
        >
          <X :size="20" />
        </v-btn>
      </div>

      <div class="help-content">
        <p class="help-intro gutenku-text-secondary mb-4">
          {{ t('game.help.intro') }}
        </p>

        <div class="help-section mb-4">
          <h3 class="help-section-title gutenku-text-primary mb-2">
            {{ t('game.help.rulesTitle') }}
          </h3>
          <ul class="help-list">
            <li>{{ t('game.help.rule1') }}</li>
            <li>{{ t('game.help.rule2') }}</li>
            <li>{{ t('game.help.rule3') }}</li>
          </ul>
        </div>

        <div class="help-section mb-4">
          <h3 class="help-section-title gutenku-text-primary mb-2">
            {{ t('game.help.hintsTitle') }}
          </h3>
          <ul class="help-hints-list">
            <li>
              <span class="hint-round">1</span>
              <div class="hint-info">
                <span class="hint-type">{{ t('game.hints.emoticons') }}</span>
                <span
                  class="hint-example"
                  >{{ t('game.help.examples.emoticons') }}</span
                >
              </div>
            </li>
            <li>
              <span class="hint-round">2</span>
              <div class="hint-info">
                <span class="hint-type">{{ t('game.hints.haiku') }}</span>
                <span
                  class="hint-example"
                  >{{ t('game.help.examples.haiku') }}</span
                >
              </div>
            </li>
            <li>
              <span class="hint-round">3</span>
              <div class="hint-info">
                <span class="hint-type">{{ t('game.hints.genreEra') }}</span>
                <span
                  class="hint-example"
                  >{{ t('game.help.examples.genreEra') }}</span
                >
              </div>
            </li>
            <li>
              <span class="hint-round">4</span>
              <div class="hint-info">
                <span class="hint-type">{{ t('game.hints.quote') }}</span>
                <span
                  class="hint-example"
                  >{{ t('game.help.examples.quote') }}</span
                >
              </div>
            </li>
            <li>
              <span class="hint-round">5</span>
              <div class="hint-info">
                <span
                  class="hint-type"
                  >{{ t('game.hints.letterAuthor') }}</span
                >
                <span
                  class="hint-example"
                  >{{ t('game.help.examples.letterAuthor') }}</span
                >
              </div>
            </li>
            <li>
              <span class="hint-round">6</span>
              <div class="hint-info">
                <span class="hint-type">{{ t('game.hints.authorName') }}</span>
                <span
                  class="hint-example"
                  >{{ t('game.help.examples.authorName') }}</span
                >
              </div>
            </li>
          </ul>
        </div>

        <p class="help-footer gutenku-text-muted text-center">
          {{ t('game.help.footer') }}
        </p>
      </div>
    </div>
  </v-dialog>
</template>

<style lang="scss" scoped>
.game-help {
  border-radius: var(--gutenku-radius-md);
  background: var(--gutenku-paper-bg);

  &.modal-appear {
    animation: modal-slide-up 0.35s cubic-bezier(0.22, 1, 0.36, 1);
  }
}

@keyframes modal-slide-up {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.96);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .game-help.modal-appear {
    animation: none;
  }
}

.help-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.help-intro {
  line-height: 1.6;
}

.help-section-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
}

.help-list {
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    position: relative;
    padding-left: 1.5rem;
    margin-bottom: 0.5rem;
    color: var(--gutenku-text-secondary);
    line-height: 1.5;

    &::before {
      content: '•';
      position: absolute;
      left: 0.5rem;
      color: var(--gutenku-zen-accent);
    }
  }
}

.help-hints-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  li {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    color: var(--gutenku-text-secondary);
  }
}

.hint-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.hint-type {
  font-weight: 500;
  color: var(--gutenku-text-primary);
}

.hint-example {
  font-size: 0.8rem;
  font-style: italic;
  color: var(--gutenku-text-muted);
}

.hint-round {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  background: var(--gutenku-zen-water);
  border: 1px solid var(--gutenku-paper-border);
  border-radius: var(--gutenku-radius-full);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--gutenku-zen-primary);
  flex-shrink: 0;
}

.help-footer {
  font-size: 0.875rem;
  font-style: italic;
}
</style>
