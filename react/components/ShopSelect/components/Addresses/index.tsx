import React, { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import GET_PROFILE from '../../../../graphql/getProfile.gql'
import SET_REGION_ID from '../../../../graphql/SetRegionId.gql'
import UPDATE_ORDERFORM from '../../../../graphql/UpdateOrderFormClient.gql'
import updateOrderFormShipping from '../../../../graphql/UpdateSelectedShipping.gql'
import address from '../../../../graphql/GetOrderForm.gql'
import Logistics from '../../../../graphql/Logistics.gql'
import { useMutation, useLazyQuery, useQuery } from 'react-apollo'
import { useModalDispatch } from 'vtex.modal-layout/ModalContext'
import { useCssHandles } from 'vtex.css-handles'
import { Spinner } from 'vtex.styleguide'
import { useShopSelect } from '../../context/ShopSelectContext'
import { Address } from '../../interfaces/IAddress'
import { useRuntime } from 'vtex.render-runtime'
import { useOrderForm } from 'vtex.order-manager/OrderForm';
import { IAccount } from '../../interfaces/IApiBaseURL'
import { baseURL } from '../../../../config/ApiBaseURL'
//import { handleize } from '../../../../helpers/getFunctions'

const CSS_HANDLES = [
  'address',
  'address__wrapper',
  'address__list',
  'nav__header',
  'nav__returnButton',
  'nav__returnIcon',
  'nav__button--active',
  'address__button',
  'address__button--active',
  'address__submit',
  'address__title',
  'address__newAddress',
  'address__button-active',
] as const

const Addresses = () => {
  const [selectedAddress, setSelectedAddress] = useState<Address>()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const { user, setUser, setCurrentStep } = useShopSelect()
  const { account, patchSession } = useRuntime()
  const arrayDirecciones: string[] = []
  const [getUsers, { data }] = useLazyQuery(GET_PROFILE)
  const { handles } = useCssHandles(CSS_HANDLES)
  const dispatch = useModalDispatch()
  const [updateSelectedAddress] = useMutation(updateOrderFormShipping)
  const { data: { orderForm } }: any = useQuery(address, { ssr: false })
  const { data: logisticsData } = useQuery(Logistics, { ssr: false })
  const [updateOrderForm] = useMutation(UPDATE_ORDERFORM)
  const orderFormContext = useOrderForm();
  const [
    setRegionId,
    { },
  ] = useMutation(SET_REGION_ID)

  const handleUserAddress = useCallback(async () => {
    const cachedUser = localStorage.getItem('user')
    const formattedUser = cachedUser && JSON.parse(cachedUser)
    if (data?.profile) {
      setUser(data.profile)
      setIsLoggedIn(true)
    } else if (formattedUser) {
      const { data: userData } = await axios.get(
        `${baseURL[account as IAccount].url}/search?dataId=CL&email=${formattedUser.email}&_fields=id,firstName,lastName&store=${account}`, {
          headers: {
            'x-apikey': baseURL[account as IAccount].key
          }
        }
      )
      const [{ id, firstName, lastName }] = userData
      const { data: address } = await axios.get(
        `${baseURL[account as IAccount].url}/search?dataId=AD&userId=${id}&_fields=id,addressName,street,number,neighborhood,city,state,geoCoordinate,postalCode,complement,country&store=${account}`, {
          headers: {
            'x-apikey': baseURL[account as IAccount].key
          }
        }
      )
      const userInfo = {
        id,
        firstName,
        lastName,
        email: formattedUser.email,
        addresses: address,
      }
      setUser(userInfo)
      setTimeout(() => {
        if (orderFormContext && data && data.profile) {
          if (orderFormContext?.orderForm.clientProfileData.email != data?.profile?.email) {
            updateOrderForm({
              variables: {
                orderFormId: orderFormContext?.orderForm.id,
                input: {
                  email: data?.profile.email
                }
              }
            })
          }
        }
      }, 4000)
      localStorage.setItem('user', JSON.stringify(userInfo))
    }
  }, [data])

  useEffect(() => {
    getUsers()
    handleUserAddress()
  }, [data])

  const updateRegionID = async ({ country, postalCode, salesChannel }: any) => {
    setRegionId({
      variables: {
        country,
        postalCode: postalCode,
        salesChannel,
      },
    })
  }

  const getPostalCode6 = async (postalcode: any) => {
    try {
      const { data: [document] } = await axios.get(
        `/api/dataentities/PC/search?_fields=VCHDEPARTAMENTO,VCHDISTRITO,VCHPROVINCIA&_where=VCHCODIGOPOSTAL=${postalcode}`
      )
      if (document) {
        const { VCHDEPARTAMENTO, VCHDISTRITO, VCHPROVINCIA }: any = document

        return `${formatNumber(VCHDEPARTAMENTO)}${formatNumber(VCHPROVINCIA)}${formatNumber(VCHDISTRITO)}`
      } else {
        return postalcode
      }

    } catch (error) {
      return postalcode
    }
  }

  const getGeolocation = async (key: string, address: any) => {
    const query = encodeURIComponent(
      String(
        `${address?.number || ''} ${address?.street || ''} ${address?.postalCode || ''
        } ${address?.city || ''} ${address?.state || ''}`
      ).trim()
    )

    if (!query) return
    let results: any = []
    let geolocation: any = {
      postalCode: address?.postalCode
    }

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${key}`
      )

      results = await response.json()
      if (results.results.length) {
        const {
          results: [result],
        } = results

        // get postal code from google request
        const postalCode: any = result?.address_components.find((item: any) => item?.types?.includes('postal_code'))

        if (postalCode?.long_name) {
          // equivalencia
          if (postalCode.long_name.length <= 5) {
            const postalcode: any = await getPostalCode6(postalCode.long_name) // postalCodes.find((item: any) => item.code === postalCode.long_name)

            if (postalcode) {
              geolocation.postalCode = postalcode
            } else {
              geolocation.postalCode = postalCode.long_name
            }
          } else {
            geolocation.postalCode = postalCode.long_name
          }
        }
      }
    } catch (err) {
      return geolocation
    }

    return geolocation
  }

  const formatNumber = (num: any) => {
    return parseInt(num) <= 9 ? `0${num}` : num
  }

  const handleSubmitAddress = async () => {
    if (!selectedAddress) {
      return
    }
    setIsLoading(true)

    let tempOF = localStorage.getItem("tempOF") ? JSON.parse(localStorage.getItem("tempOF") || '') : null
    const requisitionBody = {
      public: {
        country: {
          value: 'PE',
        },
        geoCoordinates: {
          value: `${selectedAddress?.geoCoordinate ? selectedAddress?.geoCoordinate[0] : selectedAddress?.geoCoordinates[0]},${selectedAddress?.geoCoordinate ? selectedAddress?.geoCoordinate[1] : selectedAddress?.geoCoordinates[1]}`,
        },
      },
    }

    let postalcode: any = selectedAddress?.postalCode;

    if (postalcode) {
      postalcode = await getPostalCode6(postalcode)
    } else {
      const geolocation = await getGeolocation(logisticsData.logistics?.googleMapsKey || '', selectedAddress)
      if (geolocation?.postalCode) {
        postalcode = geolocation?.postalCode
      }
    }

    updateRegionID({
      country: selectedAddress?.country,
      postalCode: postalcode || selectedAddress?.postalCode || '',
      salesChannel: tempOF ? tempOF.salesChannel : orderForm.salesChannel
    })

    const _receiverName = user ? (`${user?.firstName || ''} ${user?.lastName || ''}`) : '';
    await updateSelectedAddress({
      variables: {
        address: {
          addressId: selectedAddress?.addressName,
          addressType: 'residential',
          street: selectedAddress?.street,
          city: selectedAddress?.city,
          postalCode: postalcode,
          receiverName: _receiverName,
          state: selectedAddress?.state,
          country: selectedAddress?.country,
          geoCoordinates: selectedAddress?.geoCoordinate ? selectedAddress.geoCoordinate : selectedAddress.geoCoordinates,
          neighborhood: selectedAddress?.neighborhood,
          complement: selectedAddress?.complement,
          number: selectedAddress?.number,
          isDisposable: true,
        },
      },
    })
    const { data: checkoutOrderform } = await axios.get(
      `/api/checkout/pub/orderForm/${tempOF ? tempOF.orderFormId : orderForm.orderFormId}`
    )
    const { logisticsInfo } = checkoutOrderform.shippingData || {}

    if (logisticsInfo && logisticsInfo.length) {
      for (let index = 0; index < logisticsInfo.length; index++) {
        checkoutOrderform.shippingData.logisticsInfo[
          index
        ].selectedDeliveryChannel = 'delivery'
        checkoutOrderform.shippingData.logisticsInfo[index].selectedSla = 'Despacho desde tienda'
      }

      await axios.post(
        `/api/checkout/pub/orderForm/${tempOF ? tempOF.orderFormId : orderForm.orderFormId}/attachments/shippingData`,
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
        selectedDeliveryChannel: 'delivery',
        address: `${selectedAddress.street}, ${selectedAddress.number}`,
        addressId: selectedAddress?.addressName,
        geoCoordinates: selectedAddress.geoCoordinate,
        selectedSla: 'Despacho desde tienda'
      })
    )

    localStorage.removeItem("tempOF")
    setTimeout(function(){
      setIsLoading(false)
      dispatch?.({ type: 'CLOSE_MODAL' })

      window.location.reload()
    }, 800)
  }

  const checkAddressList = (address:any) => {
    let tempAdd = address;
    if(address && address.geoCoordinate)
      tempAdd.geoCoordinate = typeof(address.geoCoordinate) === 'string' ? JSON.parse(address.geoCoordinate) : address.geoCoordinate
    else if(address && address.geoCoordinates)
      tempAdd.geoCoordinates = typeof(address.geoCoordinates) === 'string' ? JSON.parse(address.geoCoordinates) : address.geoCoordinates

    setSelectedAddress(tempAdd)
  }

  const resolveSelectedAddress = (address: any) => {
    const selectedAddress = orderFormContext?.orderForm?.shipping?.selectedAddress
    if(selectedAddress && address?.addressName)
      return address.addressName === selectedAddress.addressId

    return false
  }

  return (
    <section className={handles.address}>
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
      <div className={handles.address__wrapper}>
        <h2 className={handles.address__title}>Mis Direcciones</h2>
        <div className={handles.address__list}>
          {user?.addresses ? (
            user?.addresses.map((address, index) => {
              let complementAddress = address.complement
              if(complementAddress == null){
                complementAddress = ""
              }
              const callenumber = address.street + " " + address.number + " " + complementAddress
              const { id, addressName, street, number, neighborhood, city } = address
              const isSelected = selectedAddress && typeof(selectedAddress.position)!=="undefined" ? (selectedAddress.position == index) : resolveSelectedAddress(address) || false
              const censoredStreet = `${String(street).substr(
                0,
                4
              )}${'*'.repeat(Math.max(0, String(street).length - 4) + 1)}`

              const censoredNumber = `${String(number).substr(
                0,
                1
              )}${'*'.repeat(Math.max(0, String(number).length - 1) + 1)}`

              const censoredNeighborhood = `${String(neighborhood).substr(
                0,
                2
              )}${'*'.repeat(Math.max(0, String(neighborhood).length - 2) + 1)}`

              const censoredCity = `${String(city).substr(0, 2)}${'*'.repeat(
                Math.max(0, String(city).length - 2) + 1
              )}`
              if (arrayDirecciones.indexOf(callenumber) == -1 ) {
                arrayDirecciones.push(callenumber)
                return (
                  <button 
                    className={
                      isSelected
                        ? `${handles.address__button} ${handles['address__button--active']}`
                        : handles.address__button
                    }
                    key={`${index}--${street}`}
                    onClick={() => checkAddressList({...address, position:index})}
                    data-id={id}
                    data-name={addressName}
                  >
                    {isLoggedIn
                      ? `${street} ${number}, ${neighborhood}, ${city}`
                      : `${censoredStreet} ${censoredNumber}, ${censoredNeighborhood}, ${censoredCity}`}
                  </button>
                )
              } else {
                return  <></>
              }
            })
          ) : (
            <></>
          )}
        </div>
        <button
          className={handles.address__newAddress}
          onClick={() => setCurrentStep('newAddress')}
        >
          Enviar a otra dirección
        </button>
        <button
          className={handles.address__submit}
          onClick={handleSubmitAddress}
          disabled={!selectedAddress}
        >
          {isLoading ? <Spinner clas /> : 'Enviar aquí'}
        </button>
      </div>
    </section>
  )
}

export default Addresses
