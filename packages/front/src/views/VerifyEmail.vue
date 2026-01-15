<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { gql } from '@urql/vue';
import { urqlClient } from '@/client';
import { CheckCircle, XCircle, Loader2 } from 'lucide-vue-next';
import ZenButton from '@/core/components/ui/ZenButton.vue';

const STORAGE_KEY = 'gutenguess-subscribed';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const status = ref<'loading' | 'success' | 'error'>('loading');
const message = ref('');

onMounted(async () => {
  const token = route.query.token as string;

  if (!token) {
    status.value = 'error';
    message.value = t('verifyEmail.invalidLink');
    return;
  }

  try {
    const result = await urqlClient
      .query(
        gql`
          query VerifyEmail($token: String!) {
            verifyEmail(token: $token) {
              success
              message
            }
          }
        `,
        { token },
      )
      .toPromise();

    if (result.data?.verifyEmail.success) {
      status.value = 'success';
      message.value = t('verifyEmail.success');

      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, 'true');
      }

      return;
    }

    status.value = 'error';
    message.value = result.data?.verifyEmail.message || t('verifyEmail.failed');
  } catch {
    status.value = 'error';
    message.value = t('verifyEmail.failed');
  }
});

function goToGame() {
  router.push('/game');
}
</script>

<template>
  <div class="verify-email">
    <div class="verify-card">
      <div v-if="status === 'loading'" class="verify-loading">
        <Loader2 :size="48" class="spin" />
        <p>{{ t('verifyEmail.verifying') }}</p>
      </div>

      <div v-else-if="status === 'success'" class="verify-success">
        <CheckCircle :size="64" class="success-icon" />
        <h1>{{ t('verifyEmail.confirmed') }}</h1>
        <p>{{ message }}</p>
        <ZenButton class="play-btn" @click="goToGame">
          {{ t('verifyEmail.playNow') }}
        </ZenButton>
      </div>

      <div v-else class="verify-error">
        <XCircle :size="64" class="error-icon" />
        <h1>{{ t('verifyEmail.oops') }}</h1>
        <p>{{ message }}</p>
        <ZenButton variant="ghost" @click="goToGame">
          {{ t('verifyEmail.backToGame') }}
        </ZenButton>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.verify-email {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 2rem;
}

.verify-card {
  max-width: 400px;
  padding: 2rem;
  text-align: center;
  background: var(--gutenku-paper-bg);
  border: 1px solid var(--gutenku-paper-border);
  border-radius: var(--gutenku-radius-lg);
  box-shadow: 0 4px 16px oklch(0 0 0 / 0.08);
}

.verify-loading,
.verify-success,
.verify-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spin {
  animation: spin 1s linear infinite;
  color: var(--gutenku-zen-primary);
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.success-icon {
  color: oklch(0.55 0.15 145);
}

.error-icon {
  color: oklch(0.55 0.15 25);
}

h1 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--gutenku-text-primary);
}

p {
  margin: 0;
  color: var(--gutenku-text-secondary);
  line-height: 1.5;
}

.play-btn {
  margin-top: 1rem;
}
</style>
