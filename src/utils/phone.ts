import { onlyDigits } from './cep'

export function formatPhone(value: string): string {
  const digits = onlyDigits(value).slice(0, 11)
  if (digits.length <= 2) return digits
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

export function isValidPhone(value: string): boolean {
  const digits = onlyDigits(value)
  return digits.length === 10 || digits.length === 11
}

/** Normalizes a Brazilian phone number to E.164-ish digits with country code, for WhatsApp links. */
export function toWhatsAppDigits(value: string): string {
  const digits = onlyDigits(value)
  if (digits.startsWith('55')) return digits
  return `55${digits}`
}
