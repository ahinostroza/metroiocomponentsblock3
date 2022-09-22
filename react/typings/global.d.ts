import { FunctionComponent } from 'react'

declare global {
  // interface StorefrontFunctionComponent<P = {}> extends FunctionComponent<P> {
  //   schema?: object
  //   getSchema?(props?: P): object
  // }

  interface AddressFormFields {
    [key: string]: {
      value: null | string | number | number[]
      valid?: boolean
      geolocationAutoCompleted?: boolean
      postalCodeAutoCompleted?: boolean
    }
  }

  interface AppSettingsData {
    appSettings: SettingsData
  }

  interface SettingsData {
    message: string
  }
  interface Settings {
    geolocationApiKey: string
    redirects: Redirect[]
    automaticRedirect: boolean
  }

  interface Redirect {
    country: string
    url: string
  }

  interface ToastRenderProps {
    showToast: (params: ShowToastParams) => void
  }

  type QuantityDisplayType = 'always' | 'never' | 'not-empty'

  type MinicartTotalItemsType =
    | 'total'
    | 'distinct'
    | 'totalAvailable'
    | 'distinctAvailable'

  type SlideDirectionType =
    | 'horizontal'
    | 'vertical'
    | 'rightToLeft'
    | 'leftToRight'

  type MinicartVariationType = 'popup' | 'drawer' | 'link' | 'popupWithLink'

}
