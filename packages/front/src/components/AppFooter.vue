<script lang="ts" setup>
import { ref } from 'vue';

const legalNoticeDialog = ref(false);
</script>

<template>
  <v-card class="mx-auto order-4 mb-6" elevation="1">
    <v-img
      lazy-src="@/assets/img/zazen.webp"
      src="@/assets/img/zazen.webp"
      alt="Footer Image Scribe"
      cover
    />

    <v-footer class="justify-right" color="accent">
      <v-dialog v-model="legalNoticeDialog" activator="parent" width="auto">
        <v-sheet
          border="md"
          class="pa-6 text-white mx-auto"
          color="secondary"
          max-width="400"
        >
          <v-img
            class="logo mb-8"
            src="@/assets/img/logo/gutenku_white.png"
            alt="GutenKu Logo"
            height="42"
          />

          <v-divider thickness="3" color="primary" />

          <h5 class="text-h5 font-weight-bold my-4">Legal Notice</h5>

          <p class="mb-8">
            <b>GutenKu</b> is owned and operated by Alexandre Mederic Mogère (<a
              class="text-primary"
              href="https://heristop.vercel.app"
              target="_blank"
              >heristop</a
            >).<br />
            <br />
            Some of the content on this website is used under license from
            third-party sources. All such content is used in accordance with the
            terms of the applicable license agreements.<br />
            <br />
            🌸 Thank you for visiting! 🗻
          </p>

          <v-btn
            @click="legalNoticeDialog = false"
            prepend-icon="mdi-close"
            block
            color="primary"
            size="large"
            variant="text"
          >
            Close
          </v-btn>
        </v-sheet>
      </v-dialog>

      <v-btn
        @click="legalNoticeDialog"
        color="primary"
        size="small"
        variant="text"
      >
        {{ new Date().getFullYear() }} —&nbsp;<strong>heristop</strong>
      </v-btn>
    </v-footer>
  </v-card>
</template>
