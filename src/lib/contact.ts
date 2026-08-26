// mailto-based submission flow — zero backend for the pilot. Swap for a real
// form + R2 photo storage + transactional email once submission volume justifies it.

export const CONTACT_EMAIL = "idosender1@gmail.com";

export function buildMailto(subject: string, body: string) {
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
