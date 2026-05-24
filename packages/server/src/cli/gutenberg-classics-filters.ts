// Non-English language indicators in Gutenberg titles
const NON_ENGLISH_PATTERNS = [
  /\(spanish\)/i,
  /\(french\)/i,
  /\(german\)/i,
  /\(italian\)/i,
  /\(dutch\)/i,
  /\(portuguese\)/i,
  /\(finnish\)/i,
  /\(swedish\)/i,
  /\(danish\)/i,
  /\(norwegian\)/i,
  /\(polish\)/i,
  /\(russian\)/i,
  /\(greek\)/i,
  /\(modern greek[^)]*\)/i,
  /\(ancient greek[^)]*\)/i,
  /\(latin\)/i,
  /\(chinese\)/i,
  /\(japanese\)/i,
  /\(korean\)/i,
  /\(arabic\)/i,
  /\(hebrew\)/i,
  /\(esperanto\)/i,
  /\(catalan\)/i,
  /\(tagalog\)/i,
  /\(welsh\)/i,
  /\(hungarian\)/i,
  /\(czech\)/i,
  /\(romanian\)/i,
];

function hasNonAsciiChars(text: string): boolean {
  // Check for characters outside common Latin ranges (avoiding control characters \u0000-\u001F)
  return /[^\u0020-\u024F\u1E00-\u1EFF]/.test(text);
}

export function isEnglish(title: string): boolean {
  for (const pattern of NON_ENGLISH_PATTERNS) {
    if (pattern.test(title)) {
      return false;
    }
  }

  if (hasNonAsciiChars(title)) {
    return false;
  }

  return true;
}

export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[:;].*$/, '')
    .replaceAll(/\([^)]*\)/g, '')
    .replace(/\btranslated?\b.*$/i, '')
    .replace(/^(the|a|an)\s+/i, '')
    .replaceAll(/[''""".,!?]/g, '')
    .replaceAll(/\s+/g, ' ')
    .trim();
}
