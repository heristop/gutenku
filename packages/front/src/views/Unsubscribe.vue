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
    message.value = t('unsubscribe.invalidLink');
    return;
  }

  try {
    const result = await urqlClient
      .query(
        gql`
          query UnsubscribeEmail($token: String!) {
            unsubscribeEmail(token: $token) {
              success
              message
            }
          }
        `,
        { token },
      )
      .toPromise();

    if (result.data?.unsubscribeEmail.success) {
      status.value = 'success';
      message.value = t('unsubscribe.success');

      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }

      return;
    }

    status.value = 'error';
    message.value =
      result.data?.unsubscribeEmail.message || t('unsubscribe.failed');
  } catch {
    status.value = 'error';
    message.value = t('unsubscribe.failed');
  }
});

function goHome() {
  router.push('/');
}
</script>

<template>
  <div class="unsubscribe">
    <div class="unsubscribe-card">
      <div v-if="status === 'loading'" class="unsubscribe-loading">
        <Loader2 :size="48" class="spin" />
        <p>{{ t('unsubscribe.processing') }}</p>
      </div>

      <div v-else-if="status === 'success'" class="unsubscribe-success">
        <CheckCircle :size="64" class="success-icon" />
        <h1>{{ t('unsubscribe.done') }}</h1>
        <p>{{ message }}</p>
        <ZenButton variant="ghost" @click="goHome">
          {{ t('unsubscribe.backHome') }}
        </ZenButton>
      </div>

      <div v-else class="unsubscribe-error">
        <XCircle :size="64" class="error-icon" />
        <h1>{{ t('unsubscribe.oops') }}</h1>
        <p>{{ message }}</p>
        <ZenButton variant="ghost" @click="goHome">
          {{ t('unsubscribe.backHome') }}
        </ZenButton>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.unsubscribe {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 2rem;
}

.unsubscribe-card {
  max-width: 400px;
  padding: 2rem;
  text-align: center;
  background: var(--gutenku-paper-bg);
  border: 1px solid var(--gutenku-paper-border);
  border-radius: var(--gutenku-radius-lg);
  box-shadow: 0 4px 16px oklch(0 0 0 / 0.08);
}

.unsubscribe-loading,
.unsubscribe-success,
.unsubscribe-error {
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
</style>
