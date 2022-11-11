export interface IBaseURL {
  metroqaio: {
    url: string
    key: string
  }
  metroio: {
    url: string
    key: string
  }
}

export type IAccount = keyof IBaseURL