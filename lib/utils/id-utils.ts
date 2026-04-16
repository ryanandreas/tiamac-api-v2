import { randomUUID } from "crypto"

/**
 * Generates a standard UUID for order IDs.
 */
export function generateOrderId(): string {
  return randomUUID()
}
