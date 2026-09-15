export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '')
}

export function isValidZipCodeFormat(zipCode: string): boolean {
  return /^\d{8}$/.test(onlyDigits(zipCode))
}

export function formatZipCode(zipCode: string): string {
  const digits = onlyDigits(zipCode).slice(0, 8)
  if (digits.length <= 5) return digits
  return `${digits.slice(0, 5)}-${digits.slice(5)}`
}

/** Converts a CEP into a comparable 8-digit integer for range checks. */
export function zipCodeToNumber(zipCode: string): number {
  return Number.parseInt(onlyDigits(zipCode), 10)
}
