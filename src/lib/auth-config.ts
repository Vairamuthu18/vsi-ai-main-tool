export const AUTHORIZED_EMAIL = "valgrowlabs444@gmail.com";

/**
 * Checks if the given email matches the single authorized account for ValGrow Labs.
 */
export function isAuthorizedEmail(email?: string | null): boolean {
  if (!email) return false;
  let cleaned = email.trim().toLowerCase();
  if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
    cleaned = cleaned.slice(1, -1);
  }
  if (cleaned.startsWith("'") && cleaned.endsWith("'")) {
    cleaned = cleaned.slice(1, -1);
  }
  return cleaned.trim() === AUTHORIZED_EMAIL.toLowerCase();
}
