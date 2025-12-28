/**
 * Simple XOR + Base64 obfuscation for book data.
 * NOT cryptographically secure - just prevents casual GitHub browsing.
 */

const DEFAULT_KEY = 'gutenku-puzzle-key';

function getKey(): string {
  return process.env.BOOKS_OBFUSCATION_KEY || DEFAULT_KEY;
}

/**
 * XOR text with key, then Base64 encode
 */
export function obfuscate(text: string): string {
  const key = getKey();
  const xored = [...text]
    .map((c, i) =>
      String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length)),
    )
    .join('');
  return Buffer.from(xored, 'utf8').toString('base64');
}

/**
 * Base64 decode, then XOR with key
 */
export function deobfuscate(encoded: string): string {
  const key = getKey();
  const xored = Buffer.from(encoded, 'base64').toString('utf8');
  return [...xored]
    .map((c, i) =>
      String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length)),
    )
    .join('');
}
