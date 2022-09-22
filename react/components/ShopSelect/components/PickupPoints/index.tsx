import React, { useCallback, useState } from 'react'
import { useMutation, useQuery } from 'react-apollo'
import { OrderForm } from 'vtex.order-manager'
import { useCssHandles } from 'vtex.css-handles'
import axios from 'axios'
import { Spinner } from 'vtex.styleguide'
// import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api'
import { useLoadScript } from '@react-google-maps/api'

import { useRuntime } from 'vtex.render-runtime'

import Logistics from '../../../../graphql/Logistics.gql'
import updateOrderFormShipping from '../../../../graphql/UpdateSelectedShipping.gql'
import { useShopSelect } from '../../context/ShopSelectContext'
import { pickupPoints } from '../../stores'

const CSS_HANDLES = [
  'pickup',
  'pickup__wrapper',
  'pickup__title',
  'pickup__paragraph',
  'nav__header',
  'nav__returnButton',
  'nav__returnIcon',
  'nav__button--active',
  'pickup__selectWrapper',
  'pickup__select',
  'pickup__submit',
  'pickup__small',
  'pickup__mapWrapper',
  'pickup__map',
] as const

const PickupPoints = () => {
  const [selectedStore, setSelectedStore] = useState<string>()
  const [isLoading, setIsLoading] = useState(false)

  const { data: logisticsData } = useQuery(Logistics, { ssr: false })

  const { patchSession } = useRuntime()

  const { setCurrentStep, user } = useShopSelect()
  const { useOrderForm } = OrderForm
  const { orderForm } = useOrderForm()
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: logisticsData.logistics?.googleMapsKey || '',
  })

  const [updateSelectedAddress] = useMutation(updateOrderFormShipping)

  const { handles } = useCssHandles(CSS_HANDLES)

  const handleSelectPickupOption = useCallback(async () => {
    setIsLoading(true)

    let tempOF = localStorage.getItem("tempOF") ? JSON.parse(localStorage.getItem("tempOF") || '') : null
    const storeInfo = pickupPoints.find((point) => point.id === selectedStore)
    const formattedGeoCoordinates = storeInfo?.geoCoordinates
      .split(',')
      .map((item) => parseFloat(item))

    const requisitionBody = {
      public: {
        country: {
          value: 'PE',
        },
        geoCoordinates: {
          value: storeInfo?.geoCoordinates,
        },
      },
    }
    await updateSelectedAddress({
      variables: {
        address: {
          addressType: 'residential',
          street: storeInfo?.street,
          city: storeInfo?.city,
          postalCode: storeInfo?.postalCode,
          receiverName: `${user?.firstName || ''} ${user?.lastName || ''}`,
          state: storeInfo?.state,
          country: storeInfo?.country,
          geoCoordinates: formattedGeoCoordinates,
          neighborhood: storeInfo?.neighborhood,
          complement: storeInfo?.complement,
          number: storeInfo?.number,
          isDisposable: true,
        },
        orderFormId: tempOF ? tempOF.orderFormId : orderForm.id
      },
    })
    const { data: checkoutOrderform } = await axios.get(
      `/api/checkout/pub/orderForm/${tempOF ? tempOF.orderFormId : orderForm.id}`
    )

    const { logisticsInfo } = checkoutOrderform?.shippingData || {}

    if (logisticsInfo && logisticsInfo.length) {
      for (let index = 0; index < logisticsInfo.length; index++) {
        checkoutOrderform.shippingData.logisticsInfo[
          index
        ].selectedDeliveryChannel = 'pickup-in-point'
        checkoutOrderform.shippingData.logisticsInfo[index].selectedSla =
          storeInfo?.id
      }

      await axios.post(
        `/api/checkout/pub/orderForm/${tempOF ? tempOF.orderFormId : orderForm.id}/attachments/shippingData`,
        checkoutOrderform.shippingData
      )
    }

    try {
      const { response: responseSession } = await patchSession(requisitionBody)
      console.log('responseSession: ', responseSession)
    } catch (err) {
      console.error(err)
      return
    }

    localStorage.setItem(
      'shippingData',
      JSON.stringify({
        selectedDeliveryChannel: 'pickup-in-point',
        address: storeInfo?.street,
        addressId: null,
        geoCoordinates: storeInfo?.geoCoordinates,
        selectedSla: storeInfo?.id,
        storeName: storeInfo?.store
      })
    )

    localStorage.removeItem("tempOF")
    setTimeout(function () {
      //setIsLoading(false)
      window.location.reload()
    }, 800)
  }, [selectedStore, orderForm, isLoading, updateSelectedAddress])

  // const handleGetGoogleGeoCoordinates = useCallback(() => {
  //   const storeInfo = pickupPoints.find((point) => point.id === selectedStore)

  //   if (!storeInfo) {
  //     return {
  //       lng: -76.99102,
  //       lat: -12.11166,
  //     }
  //   }

  //   const [lng, lat] = storeInfo?.geoCoordinates.split(',')

  //   return {
  //     lat: parseFloat(lat),
  //     lng: parseFloat(lng),
  //   }
  // }, [selectedStore])

  const handleGetImage = useCallback(() => {
    const storeInfo = pickupPoints.find((point) => point.id === selectedStore)
    console.log('storeInfo', storeInfo)
    if (!storeInfo) {
      return '/arquivos/metro-aramburu.png'
    }
    return storeInfo.image
  }, [selectedStore])



  // const options = {
  //   disableDefaultUI: true,
  //   zoomControl: true,
  // }

  // const mapContainerStyle = {
  //   maxWidth: '748px',
  //   width: '100%',
  //   height: '171px',
  // }

  return (
    <section className={handles.pickup}>
      <header className={handles.nav__header}>
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
      </header>
      <div className={handles.pickup__wrapper}>
        <h2 className={handles.pickup__title}>Retiro en Tienda</h2>
        <p className={handles.pickup__paragraph}>
          Por favor indicanos dónde le gustaría retirar su pedido:
        </p>
        <div className={handles.pickup__selectWrapper}>
          <select
            name=""
            id=""
            onChange={(evt) => setSelectedStore(evt.target.value)}
            value={selectedStore}
            className={handles.pickup__select}
          >
            <option value="" selected disabled hidden>
              Seleccione la Tienda
            </option>
            {pickupPoints.map((pickup) => {
              return (
                <option key={pickup.store} value={pickup.id}>
                  {pickup.store}
                </option>
              )
            })}
          </select>
        </div>
        <div className={handles.pickup__mapWrapper}>
          {loadError && 'loadError'}
          {isLoaded ? (
            // <GoogleMap
            //   mapContainerStyle={mapContainerStyle}
            //   options={options}
            //   zoom={15}
            //   center={handleGetGoogleGeoCoordinates()}
            // >
            //   <Marker position={handleGetGoogleGeoCoordinates()} />
            // </GoogleMap>
            <img src={handleGetImage()} />
          ) : (
            'Loading...'
          )}
        </div>
        <button
          onClick={handleSelectPickupOption}
          className={handles.pickup__submit}
          disabled={!selectedStore}
        >
          {isLoading ? <Spinner /> : 'Recojo aqui'}
        </button>
        {/* <p className={handles.pickup__small}>
          Las promociones no son acumulables con los reintegros bancarios o con
          los de tarjetas no bancarizadas.
        </p> */}
      </div>
    </section>
  )
}

export default PickupPoints
