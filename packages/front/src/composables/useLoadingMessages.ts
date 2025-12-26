import { ref, onMounted, onUnmounted } from 'vue';

export interface UseLoadingMessagesOptions {
  messages?: string[];
  intervalMs?: number;
  context?: keyof typeof MESSAGE_POOLS | string;
}

const DEFAULT_MESSAGES: string[] = [
  '🔍 Our poetic robots are diving into classic literature...',
  '📚 Scanning through the greatest works ever written...',
  '🎭 Absorbing the emotional essence of timeless stories...',
  '✨ Weaving seventeen syllables of pure magic...',
  '🎨 Selecting the perfect artistic theme for your poem...',
  '🖼️ Creating a visual masterpiece for your haiku...',
  '📝 Adding the final touches to your literary art...',
  '🌸 Shuffling cherry blossoms for seasonal vibes...',
  '🧘 Zen mode: in 5, out 7, in 5...',
  '🍵 Brewing green tea for the muse...',
  '📖 Borrowing metaphors from Gutenberg’s stacks...',
  '🕯️ Waiting for the page to whisper back...',
  '🧵 Stitching syllables with tiny needles...',
  '✂️ Trimming adjectives with bonsai scissors...',
  '🧮 Counting syllables with monk-like patience...',
  '🌀 Polishing a pause until it shines...',
  '🪶 Asking Bashō for a quick peer review...',
  '🏯 Raking the sand garden for line breaks...',
  '🌬️ Listening for the wind to turn the page...',
  '🧭 Navigating by the North Star of nouns...',
  '🌙 Aligning moonlight for a perfect kireji...',
  '📎 Binding a tiny book in your browser...',
  '🧩 Fitting quiet between two thoughts...',
  '🎶 Lo‑fi beats to write haiku to...',
  '🧠 Running a vibe check on verbs...',
  '🔖 Dusting off a public‑domain masterpiece...',
  '🪞 Finding the right reflection in a puddle...',
  '🗺️ Leafing through a century in a second...',
  '🌿 Watering the bonsai of language...',
  '📐 Teaching commas to bow politely...',
  '📜 Unfolding origami stanzas...',
  '🕊️ Turning silence into syllables...',
  '🎯 Choosing the one precise word...',
  '🧊 Cooling hot metaphors to room temperature...',
  '💡 Catching a small idea with gentle hands...',
];

const CRAFT_MESSAGES: string[] = [
  '✨ Your haiku is being crafted in real-time...',
  '🧵 Weaving syllables into poetry...',
  '🎨 Blending imagery and emotion...',
  '📖 Sourcing inspiration from timeless pages...',
  '🔮 Shaping verses with subtle rhythm...',
  '🌿 Finding calm between the lines...',
  '🌸 Placing a single petal in the right place...',
  '🧘 Breathing a pause into the poem...',
  '🍵 Serving the first line warm, the last line cool...',
  '🕊️ Letting silence land between words...',
  '🏯 Raking line breaks into the sand...',
  '📝 Folding a thought into seventeen beats...',
  '🪶 Testing the weight of a whisper...',
  "🔖 Borrowing a page from Bashō's notebook...",
  '🌙 Balancing moonlight on a comma...',
  '🎋 Training the verse like bamboo: straight and calm...',
];

const MESSAGE_POOLS = {
  default: DEFAULT_MESSAGES,
  craft: CRAFT_MESSAGES,
};

export function useLoadingMessages(options: UseLoadingMessagesOptions = {}) {
  const poolSource = (() => {
    if (options.messages && options.messages.length) {
      return options.messages;
    }
    const ctx = options.context as keyof typeof MESSAGE_POOLS | undefined;
    if (ctx && MESSAGE_POOLS[ctx]) {
      return MESSAGE_POOLS[ctx];
    }
    return MESSAGE_POOLS.default;
  })();

  const pool = [...poolSource];

  // Shuffle for non-repeating pleasant rotation
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  const intervalMs = options.intervalMs ?? 2500;
  const message = ref<string>(pool[0] ?? '');
  let idx = 0;
  let timer: number | null = null;

  const next = () => {
    idx = (idx + 1) % pool.length;
    message.value = pool[idx];
  };

  const start = () => {
    stop();

    if (pool.length <= 1) {
      return;
    }

    timer = window.setInterval(next, intervalMs);
  };

  const stop = () => {
    if (timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  };

  onMounted(start);
  onUnmounted(stop);

  return { message, next, start, stop };
}
