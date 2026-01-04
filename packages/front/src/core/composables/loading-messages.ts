import { ref, onMounted, onUnmounted, type Ref } from 'vue';
import {
  Search,
  BookOpen,
  Drama,
  Sparkles,
  Palette,
  Frame,
  PenLine,
  Flower2,
  Orbit,
  Coffee,
  BookMarked,
  Flame,
  Scissors,
  Calculator,
  Disc3,
  Feather,
  Castle,
  Wind,
  Compass,
  Moon,
  Paperclip,
  Puzzle,
  Music,
  Brain,
  Bookmark,
  ScanEye,
  Map,
  Leaf,
  Ruler,
  Scroll,
  Bird,
  Target,
  Snowflake,
  Lightbulb,
  Gem,
  Brush,
  type LucideIcon,
} from 'lucide-vue-next';

export interface LoadingMessage {
  icon: LucideIcon;
  text: string;
}

const DEFAULT_MESSAGES: LoadingMessage[] = [
  {
    icon: Search,
    text: 'Our poetic robots are diving into classic literature...',
  },
  {
    icon: BookOpen,
    text: 'Scanning through the greatest works ever written...',
  },
  {
    icon: Drama,
    text: 'Absorbing the emotional essence of timeless stories...',
  },
  { icon: Sparkles, text: 'Weaving seventeen syllables of pure magic...' },
  {
    icon: Palette,
    text: 'Selecting the perfect aesthetic theme for your poem...',
  },
  { icon: Frame, text: 'Crafting a visual masterpiece for your haiku...' },
  { icon: PenLine, text: 'Adding the final touches to your literary art...' },
  { icon: Flower2, text: 'Shuffling cherry blossoms for seasonal vibes...' },
  { icon: Orbit, text: 'Zen mode: in 5, out 7, in 5...' },
  { icon: Coffee, text: 'Brewing green tea for the muse...' },
  { icon: BookMarked, text: "Borrowing metaphors from Gutenberg's stacks..." },
  { icon: Flame, text: 'Waiting for the page to whisper back...' },
  { icon: Brush, text: 'Stitching syllables with tiny needles...' },
  { icon: Scissors, text: 'Trimming adjectives with bonsai scissors...' },
  { icon: Calculator, text: 'Counting syllables with monk-like patience...' },
  { icon: Disc3, text: 'Polishing a pause until it shines...' },
  { icon: Feather, text: 'Asking Bashō for a quick peer review...' },
  { icon: Castle, text: 'Raking the sand garden for line breaks...' },
  { icon: Wind, text: 'Listening for the wind to turn the page...' },
  { icon: Compass, text: 'Navigating by the North Star of nouns...' },
  { icon: Moon, text: 'Aligning moonlight for a perfect kireji...' },
  { icon: Paperclip, text: 'Binding a tiny book in your browser...' },
  { icon: Puzzle, text: 'Fitting quiet between two thoughts...' },
  { icon: Music, text: 'Lo‑fi beats to write haiku to...' },
  { icon: Brain, text: 'Running a vibe check on verbs...' },
  { icon: Bookmark, text: 'Dusting off a public‑domain masterpiece...' },
  { icon: ScanEye, text: 'Finding the right reflection in a puddle...' },
  { icon: Map, text: 'Leafing through a century in a second...' },
  { icon: Leaf, text: 'Watering the bonsai of language...' },
  { icon: Ruler, text: 'Teaching commas to bow politely...' },
  { icon: Scroll, text: 'Unfolding origami stanzas...' },
  { icon: Bird, text: 'Turning silence into syllables...' },
  { icon: Target, text: 'Choosing the one precise word...' },
  { icon: Snowflake, text: 'Cooling hot metaphors to room temperature...' },
  { icon: Lightbulb, text: 'Catching a small idea with gentle hands...' },
];

const CRAFT_MESSAGES: LoadingMessage[] = [
  { icon: Sparkles, text: 'Your haiku is being crafted in real-time...' },
  { icon: Brush, text: 'Weaving syllables into poetry...' },
  { icon: Palette, text: 'Blending imagery and emotion...' },
  { icon: BookMarked, text: 'Sourcing inspiration from timeless pages...' },
  { icon: Gem, text: 'Shaping verses with subtle rhythm...' },
  { icon: Leaf, text: 'Finding calm between the lines...' },
  { icon: Flower2, text: 'Placing a single petal in the right place...' },
  { icon: Orbit, text: 'Breathing a pause into the poem...' },
  { icon: Coffee, text: 'Serving the first line warm, the last line cool...' },
  { icon: Bird, text: 'Letting silence land between words...' },
  { icon: Castle, text: 'Raking line breaks into the sand...' },
  { icon: PenLine, text: 'Folding a thought into seventeen beats...' },
  { icon: Feather, text: 'Testing the weight of a whisper...' },
  { icon: Bookmark, text: "Borrowing a page from Bashō's notebook..." },
  { icon: Moon, text: 'Balancing moonlight on a comma...' },
  { icon: Leaf, text: 'Training the verse like bamboo: straight and calm...' },
];

const MESSAGE_POOLS = {
  default: DEFAULT_MESSAGES,
  craft: CRAFT_MESSAGES,
};

type MessagePoolKey = keyof typeof MESSAGE_POOLS;

export interface UseLoadingMessagesOptions {
  messages?: LoadingMessage[];
  intervalMs?: number;
  context?: MessagePoolKey;
}

export function useLoadingMessages(options: UseLoadingMessagesOptions = {}): {
  message: Ref<LoadingMessage>;
} {
  const poolSource = (() => {
    if (options.messages && options.messages.length) {
      return options.messages;
    }
    if (options.context && MESSAGE_POOLS[options.context]) {
      return MESSAGE_POOLS[options.context];
    }
    return MESSAGE_POOLS.default;
  })();

  const pool = [...poolSource];

  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  const intervalMs = options.intervalMs ?? 2500;
  const message = ref<LoadingMessage>(pool[0] ?? { icon: Sparkles, text: '' });
  let idx = 0;
  let timer: ReturnType<typeof setInterval> | null = null;

  const next = () => {
    idx = (idx + 1) % pool.length;
    message.value = pool[idx];
  };

  const start = () => {
    stop();

    if (pool.length <= 1) {
      return;
    }

    timer = globalThis.setInterval(next, intervalMs);
  };

  const stop = () => {
    if (timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  };

  onMounted(start);
  onUnmounted(stop);

  return { message };
}
