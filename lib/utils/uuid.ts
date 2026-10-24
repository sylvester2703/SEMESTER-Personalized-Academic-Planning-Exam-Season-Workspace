/**
 * UUID utility for SEMESTER
 * Ensures valid RFC 4122 v4 UUIDs for Supabase PostgreSQL compatibility.
 */

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Checks if a string is already a valid UUID
 */
export function isUuid(str?: string | null): boolean {
  if (!str) return false;
  return UUID_REGEX.test(str.trim());
}

/**
 * Generates a new random RFC 4122 v4 UUID
 */
export function generateUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch {
      // Fallback if randomUUID fails in certain environments
    }
  }

  // RFC 4122 v4 compliant fallback
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Deterministically converts any string into a valid RFC 4122 v4 UUID.
 * If the string is already a valid UUID, returns it in lowercase.
 * If the string is non-UUID (e.g. 'subj-172938472', 'plan-gen-123'),
 * hashes it deterministically into a valid UUID format so relations remain intact.
 */
export function toUuid(input?: string | null): string {
  if (!input || typeof input !== 'string') {
    return generateUuid();
  }

  const trimmed = input.trim();
  if (isUuid(trimmed)) {
    return trimmed.toLowerCase();
  }

  // Deterministically hash the string to 16 bytes (32 hex characters)
  let h1 = 0xdeadbeef,
    h2 = 0x41c6ce57,
    h3 = 0x67452301,
    h4 = 0xefcdab89;

  for (let i = 0; i < trimmed.length; i++) {
    const ch = trimmed.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ (ch << 5), 1597334677);
    h3 = Math.imul(h3 ^ (ch << 11), 3801415697);
    h4 = Math.imul(h4 ^ (ch << 17), 2862933555);
  }

  const hex = [
    (h1 >>> 0).toString(16).padStart(8, '0'),
    (h2 >>> 0).toString(16).padStart(8, '0'),
    (h3 >>> 0).toString(16).padStart(8, '0'),
    (h4 >>> 0).toString(16).padStart(8, '0'),
  ].join('');

  const part1 = hex.substring(0, 8);
  const part2 = hex.substring(8, 12);
  const part3 = '4' + hex.substring(13, 16); // Version 4
  const variantNibble = ((parseInt(hex.substring(16, 17), 16) & 0x3) | 0x8).toString(16); // RFC 4122 variant
  const part4 = variantNibble + hex.substring(17, 20);
  const part5 = hex.substring(20, 32);

  return `${part1}-${part2}-${part3}-${part4}-${part5}`.toLowerCase();
}
