<script lang="ts" setup>
import { ref } from 'vue';

const legalNoticeDialog = ref(false);
</script>

<template>
  <v-card class="mx-auto order-4">
    <v-img
      lazy-src="@/assets/img/zazen.jpg"
      src="@/assets/img/zazen.jpg"
      alt="Footer image Zazen"
      cover
    />

    <v-footer
      class="justify-right"
      color="third"
    >
      <v-dialog
        v-model="legalNoticeDialog"
        activator="parent"
        width="auto"
      >
        <v-sheet
          border="md"
          class="pa-6 text-white mx-auto"
          color="primary"
          max-width="400"
        >
          <h4 class="text-h5 font-weight-bold mb-4">
            Legal Notice
          </h4>

          <p class="mb-8">
            <b>Gutenku.xyz</b> is owned and operated by Alexandre Mogère. Some of the content on this website is used
            under license from third-party sources. All such content is used in accordance with the terms of the
            applicable
            license agreements.
            <br>
            <br>
            Thank you for visiting.
          </p>

          <v-btn
            @click="legalNoticeDialog = false"
            block
            class="text-none text-black mb-4"
            color="third"
            size="large"
            variant="flat"
          >
            Close
          </v-btn>
        </v-sheet>
      </v-dialog>

      <v-btn
        @click="legalNoticeDialog"
        color="primary"
        size="x-small"
        variant="text"
      >
        {{ new Date().getFullYear() }} —&nbsp;<strong>heristop</strong>
      </v-btn>
    </v-footer>
  </v-card>
</template>
