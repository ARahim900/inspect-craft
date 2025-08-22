/**
 * Extracts the first part of an email address (before the @ symbol)
 * @param email - The full email address
 * @returns The username part of the email
 */
export function getEmailUsername(email: string): string {
  return email.split('@')[0];
}

/**
 * Capitalizes the first letter of a string
 * @param str - The string to capitalize
 * @returns The capitalized string
 */
export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Gets a display name from an email address
 * @param email - The full email address
 * @returns A formatted display name
 */
export function getDisplayName(email: string): string {
  const username = getEmailUsername(email);
  return capitalizeFirst(username);
}