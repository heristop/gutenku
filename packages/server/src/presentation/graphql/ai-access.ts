import { timingSafeEqual } from 'node:crypto';
import { AI_IMAGE_THEMES } from '~/shared/themes/ai-image';

// Whether a visitor's request may spend on OpenAI, and on whose key.
// Production keeps the server's key for our own tools (INTERNAL_API_KEY);
// a visitor may bring their own OpenAI key, used for their request only.
// Internal jobs (the daily haiku) don't go through GraphQL and aren't gated.
export interface AIAccess {
  allowed: boolean;
  // The visitor's own key; absent when the server's key is used
  apiKey?: string;
}

// OpenAI keys: sk-…, sk-proj-…, sk-svcacct-… (letters, digits, - and _)
const OPENAI_KEY_PATTERN = /^sk-[\w-]{20,256}$/;

export function isPlausibleOpenAIKey(key: unknown): key is string {
  return typeof key === 'string' && OPENAI_KEY_PATTERN.test(key);
}

interface AIRequestArgs {
  useAI?: boolean;
  useImageAI?: boolean;
  theme?: string;
}

function matchesInternalKey(provided: string | undefined): boolean {
  // Read lazily: the environment is loaded after this module is imported
  const expected = process.env.INTERNAL_API_KEY;

  if (!expected || !provided) {
    return false;
  }

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);

  return a.length === b.length && timingSafeEqual(a, b);
}

export function resolveAIAccess(
  internalKey?: unknown,
  visitorKey?: unknown,
): AIAccess {
  if (isPlausibleOpenAIKey(visitorKey)) {
    return { allowed: true, apiKey: visitorKey };
  }

  if (!process.env.OPENAI_API_KEY) {
    return { allowed: false };
  }

  if (process.env.NODE_ENV !== 'production') {
    return { allowed: true };
  }

  return {
    allowed: matchesInternalKey(
      typeof internalKey === 'string' ? internalKey : undefined,
    ),
  };
}

// Strips what would call OpenAI rather than failing the request: the haiku
// is still crafted, with a classic theme and without AI text
export function withoutDisallowedAI<T extends AIRequestArgs>(
  args: T,
  access: AIAccess | undefined,
): T {
  if ((access ?? resolveAIAccess()).allowed) {
    return args;
  }

  const isAITheme = (AI_IMAGE_THEMES as readonly string[]).includes(
    args.theme ?? '',
  );

  return {
    ...args,
    useAI: false,
    useImageAI: false,
    theme: isAITheme ? 'random' : args.theme,
  };
}

/**
 * The OpenAI scope a request runs in: the visitor's own key, or the
 * server's only when access was granted on it. A denied request (or one with
 * no access decided) can never reach the server's key.
 */
export function openAIScopeFor(access: AIAccess | undefined): {
  apiKey?: string;
  allowServerKey: boolean;
} {
  const decided = access ?? resolveAIAccess();

  return {
    apiKey: decided.apiKey,
    allowServerKey: decided.allowed && !decided.apiKey,
  };
}
