import { IBaseURL } from "../components/ShopSelect/interfaces/IApiBaseURL"

const baseURL: IBaseURL = {
  metroqaio: {
    url: 'https://api.test.smdigital.pe/qa/v1/pe/wm/service-mdw-masterdata/',
    key: 'smsOXtQukjSQogz2iu7foMoCiip7cEVa'
  },
  metroio: {
    url: 'https://api.smdigital.pe/v1/pe/wm/service-mdw-masterdata/',
    key: 'f9ImhJN3dSv0KZTaJzVngIMfJ0pDpmZq'
  }
}

export { baseURL }