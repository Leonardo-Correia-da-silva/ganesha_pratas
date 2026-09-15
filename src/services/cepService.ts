import { isValidZipCodeFormat, onlyDigits } from '@/utils/cep'

export interface AddressLookupResult {
  zipCode: string
  street: string
  neighborhood: string
  city: string
  state: string
}

export class CepNotFoundError extends Error {
  constructor() {
    super('CEP não encontrado.')
    this.name = 'CepNotFoundError'
  }
}

export class CepInvalidError extends Error {
  constructor() {
    super('CEP inválido.')
    this.name = 'CepInvalidError'
  }
}

interface ViaCepResponse {
  cep: string
  logradouro: string
  bairro: string
  localidade: string
  uf: string
  erro?: boolean
}

export async function lookupAddressByZipCode(zipCode: string): Promise<AddressLookupResult> {
  if (!isValidZipCodeFormat(zipCode)) {
    throw new CepInvalidError()
  }

  const digits = onlyDigits(zipCode)

  let response: Response
  try {
    response = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
  } catch {
    throw new Error('Não foi possível consultar o CEP no momento. Tente novamente.')
  }

  if (!response.ok) {
    throw new Error('Não foi possível consultar o CEP no momento. Tente novamente.')
  }

  const data = (await response.json()) as ViaCepResponse

  if (data.erro) {
    throw new CepNotFoundError()
  }

  return {
    zipCode: digits,
    street: data.logradouro ?? '',
    neighborhood: data.bairro ?? '',
    city: data.localidade ?? '',
    state: data.uf ?? '',
  }
}
