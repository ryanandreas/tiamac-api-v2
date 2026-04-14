import { randomBytes } from "crypto"

/**
 * Generates a custom order ID in the format #XXXXXXXX (e.g., #7A6ABC29)
 * 8 random hexadecimal characters prepended with a hash.
 */
export function generateOrderId(): string {
  const hex = randomBytes(4).toString("hex").toUpperCase()
  return `#${hex}`
}
