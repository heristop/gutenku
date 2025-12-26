<template>
  <v-card class="gutenku-card footer-card mx-auto order-4 mb-6">
    <v-btn
      color="primary"
      size="small"
      variant="text"
      href="https://heristop.vercel.app"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Visit heristop on his page"
      class="footer-button"
    >
      heristop © 2023-{{ new Date().getFullYear() }}
    </v-btn>
  </v-card>
</template>

<style scoped lang="scss">
// ====================================
// FOOTER COMPONENT - DARK MODE FIXES
// ====================================

.footer-card {
  // Footer card specific styling
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem !important;
}

.footer-button {
  // Button styling
  font-family: 'JMH Typewriter', monospace !important;
  letter-spacing: 0.5px;

  // Light mode button styling
  color: rgb(var(--v-theme-primary)) !important;

  &:hover {
    color: var(--gutenku-text-primary) !important;
    background: rgba(var(--v-theme-primary), 0.1) !important;
  }
}

// Dark mode button overrides
[data-theme='dark'] .footer-card {
  .footer-button {
    // Override all button text with high contrast
    color: var(--gutenku-text-primary) !important;

    // Fix button content specifically
    :deep(.v-btn__content) {
      color: var(--gutenku-text-primary) !important;
    }

    // Hover state for dark mode
    &:hover {
      color: var(--gutenku-zen-accent) !important;
      background: rgba(var(--v-theme-primary), 0.15) !important;

      :deep(.v-btn__content) {
        color: var(--gutenku-zen-accent) !important;
      }
    }

    // Active state
    &:active {
      color: var(--gutenku-text-primary) !important;

      :deep(.v-btn__content) {
        color: var(--gutenku-text-primary) !important;
      }
    }

    // Focus state for accessibility
    &:focus-visible {
      color: var(--gutenku-text-primary) !important;
      outline: 2px solid var(--gutenku-zen-accent);
      outline-offset: 2px;

      :deep(.v-btn__content) {
        color: var(--gutenku-text-primary) !important;
      }
    }
  }

  // Force text visibility in footer
  * {
    &:not(.v-icon):not(.mdi):not([class*='mdi-']) {
      color: var(--gutenku-text-primary) !important;
    }
  }

  // Specific targeting for any nested elements
  span,
  div,
  p,
  a {
    &:not(.v-icon):not(.mdi):not([class*='mdi-']) {
      color: var(--gutenku-text-primary) !important;
    }
  }
}

// Responsive footer adjustments
@media (max-width: 768px) {
  .footer-card {
    padding: 1rem !important;
    margin-bottom: 1.5rem !important;
  }

  .footer-button {
    font-size: 0.85rem;
    min-height: 44px; // Touch target size
  }
}
</style>
