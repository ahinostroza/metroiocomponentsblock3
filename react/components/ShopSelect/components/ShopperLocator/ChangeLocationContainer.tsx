import React from 'react'
import { useQuery } from 'react-apollo'
import { injectIntl, WrappedComponentProps } from 'react-intl'
import { AddressRules } from 'vtex.address-form'
import { Spinner } from 'vtex.styleguide'
import { useCssHandles } from 'vtex.css-handles'

import address from '../../../../graphql/GetOrderForm.gql'
import Logistics from '../../../../graphql/Logistics.gql'
import LocationForm from './LocationForm'
import { useLocationState } from './LocationContext'
import { useShopSelect } from '../../context/ShopSelectContext'

const CSS_HANDLES = [
  'changeLocationContainer',
  'nav__returnButton',
  'nav__returnIcon',
] as const

const ChangeLocation: StorefrontFunctionComponent<
  WrappedComponentProps & never
> = (props: never) => {
  const {
    intl,
    postalCode,
    autocomplete,
    autofill,
    notRequired,
    hideFields,
    isnew
  } = props

  const { loading, data } = useQuery(address, { ssr: false })
  const { data: logisticsData } = useQuery(Logistics, { ssr: false })
  const { location } = useLocationState()
  const { handles } = useCssHandles(CSS_HANDLES)
  const { setCurrentStep } = useShopSelect()

  if (loading)
    return (
      <div
        className={handles.changeLocationContainer}
        style={{ minWidth: 800 }}
      >
        <Spinner />
      </div>
    )
  if ((!loading && !data) || !logisticsData) return null

  const { address: queriedAddress } = data?.orderForm?.shippingData || {}

  const currentAddress = {
    addressQuery: '',
    neighborhood: queriedAddress?.neighborhood || '',
    complement: queriedAddress?.complement || '',
    number: queriedAddress?.number || '',
    street: queriedAddress?.street || '',
    postalCode: queriedAddress?.postalCode || '',
    city: queriedAddress?.city || '',
    addressType: queriedAddress?.addressType || 'residential',
    geoCoordinates: queriedAddress?.geoCoordinates || [],
    state: queriedAddress?.state || '',
    receiverName: queriedAddress?.receiverName || '',
    reference: queriedAddress?.reference || '',
    country: queriedAddress?.country || '',
  }

  return (
    <>
      <button
        className={handles.nav__returnButton}
        onClick={() => setCurrentStep('menu')}
      >
        <svg
          className={handles.nav__returnIcon}
          width="13"
          height="24"
          viewBox="0 0 13 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12.0002 1.33331L1.3335 12L12.0002 22.6666"
            stroke="#535353"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Volver
      </button>
      <AddressRules
        country={
          (location.country?.value ??
            data?.orderForm?.shippingData?.address?.country) ||
          logisticsData.logistics?.shipsTo[0]
        }
        shouldUseIOFetching
        useGeolocation={false}
      >
        <LocationForm
          orderForm={data?.orderForm || null}
          currentAddress={currentAddress}
          shipsTo={logisticsData.logistics?.shipsTo || []}
          googleMapsKey={logisticsData.logistics?.googleMapsKey || ''}
          intl={intl}
          postalCode={postalCode}
          autocomplete={autocomplete}
          hideFields={hideFields}
          notRequired={notRequired}
          autofill={autofill}
          isnewLocation={isnew}
        />
      </AddressRules>
    </>
  )
}

export default injectIntl(ChangeLocation)
