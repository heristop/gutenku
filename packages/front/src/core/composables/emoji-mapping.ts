const EMOJI_MAP: Record<string, string> = {
  extracting: '🔍',
  reading: '📖',
  analyzing: '🎭',
  generating: '✨',
  creating: '🎨',
  crafting: '📝',
  processing: '⚙️',
  searching: '🔍',
  loading: '📚',
  found: '✨',
  quote: '📝',
  selecting: '🎯',
  evaluating: '🧠',
  weaving: '🕸️',
  finalizing: '🏁',
};

const DEFAULT_EMOJI = '✨';

export function useEmojiMapping() {
  const getEmoji = (text: string): string => {
    const textLower = text.toLowerCase();
    const matchedKey = Object.keys(EMOJI_MAP).find((key) =>
      textLower.includes(key),
    );
    return matchedKey ? EMOJI_MAP[matchedKey] : DEFAULT_EMOJI;
  };

  const formatWithEmoji = (text: string): string => {
    return `${getEmoji(text)} ${text}`;
  };

  return {
    getEmoji,
    formatWithEmoji,
  };
}
