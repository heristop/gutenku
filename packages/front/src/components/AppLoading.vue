<script lang="ts" setup>
import { 
    ref, 
    computed, 
    onBeforeMount, 
    onMounted,
    onUnmounted,
} from 'vue';

const props = defineProps({
    splash: {
        type: Boolean,
        required: false,
        default: false
    },
    text: {
        type: String,
        required: false,
        default: ''
    },
    color: {
        type: String,
        required: false,
        default: 'primary'
    },
    error: {
        type: Boolean,
        required: false,
        default: false
    }
});

const icons = ref<string[]>([]);

const flipIcons = computed(() => {
    return false === props.error && icons.value.length > 0;
});

let iconInterval: NodeJS.Timeout | null = null;

onBeforeMount(() => {
    icons.value.push('mdi-robot-outline');
    icons.value.push('mdi-robot-happy-outline');
    icons.value.push('mdi-robot-excited-outline');
    icons.value.push('mdi-robot-love-outline');
});

onMounted(() => {
    const iconsElements = document.querySelectorAll('.loading i.flip');
    let index = 0;

    if (iconsElements.length > 0) {
        iconsElements[index].classList.add('active');

        iconInterval = setInterval(() => {
            iconsElements[index].classList.remove('active');
            index = (index + 1) % iconsElements.length;
            iconsElements[index].classList.add('active');
        }, 500);
    }
});

onUnmounted(() => {
    if (null !== iconInterval) {
        clearInterval(iconInterval);
    }
});
</script>

<template>
  <div class="loading">
    <div
      v-if="false === splash"
      class="robot"
    >
      <v-icon
        v-show="error"
        :color="color"
        :class="['icon', 'active']"
      >
        mdi-robot-dead-outline
      </v-icon>

      <div>
        <v-icon
          v-for="(icon, index) in icons"
          :key="index"
          :class="['flip', 'icon']"
          :color="color"
        >
          {{ icon }}
        </v-icon>
      </div>
    </div>

    <div v-if="text">
      <v-img
        src="@/assets/img/logo/gutenku_rounded.png"
        alt="Logo"
        height="60"
      />

      <v-spacer class="pa-10" />

      <v-sheet
        class="loading-text px-4 py-1"
        color="primary"
      >
        {{ text }}
      </v-sheet>

      <v-progress-linear
        :indeterminate="flipIcons"
        color="primary"
        class="mb-0"
      />
    </div>
  </div>
</template>


<style lang="scss" scoped>
.loading {
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;

  .icon.active {
    opacity: 0.75;
  }

  .icon {
    position: absolute;
    transform: translate(-50%, -50%);
    font-size: 48px;
    margin: 0 auto;
    animation: slide-in 1s ease-out infinite;
    opacity: 0;
  }

  .loading-text {
    font-size: 18px;
    opacity: 0.9;
  }
}
</style>
