import { Address } from './IAddress'

export interface User {
  id?: string | null
  firstName?: string | null
  lastName?: string | null
  email: string
  addresses?: Address[]
  homePhone?:string|null
}
