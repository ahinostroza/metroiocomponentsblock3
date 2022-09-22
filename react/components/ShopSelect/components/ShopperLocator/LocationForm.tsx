/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FunctionComponent, useEffect, useRef, useState } from 'react'
import axios from 'axios'
import AddressInput from './AddressInput'
import MapContainer from './Map'
import updateOrderFormShipping from '../../../../graphql/UpdateSelectedShipping.gql'
import GET_PROFILE from '../../../../graphql/getProfile.gql'
import SET_REGION_ID from '../../../../graphql/SetRegionId.gql'
import NEW_ADDRESS from '../../../../graphql/newAddress.gql'
import { useLazyQuery, useMutation } from 'react-apollo'
import { WrappedComponentProps, FormattedMessage } from 'react-intl'
import { useRuntime } from 'vtex.render-runtime'
import { useModalDispatch } from 'vtex.modal-layout/ModalContext'
import { CountrySelector, helpers, inputs } from 'vtex.address-form'
import { Button, ButtonWithIcon, IconLocation } from 'vtex.styleguide'
import { useCssHandles } from 'vtex.css-handles'
import { useDevice } from 'vtex.device-detector'
import { useLocationState, useLocationDispatch } from './LocationContext'
import { getParsedAddress } from '../../../../helpers/getParsedAddress'
import { countries } from '../../../../messages/countries'
import { useShopSelect } from '../../context/ShopSelectContext'
import { IAccount } from '../../interfaces/IApiBaseURL'
import { baseURL } from '../../../../config/ApiBaseURL'
import { getPEZipCodes, handleize, validAddressContext, JWTDecode } from '../../../../helpers/getFunctions'

const { StyleguideInput } = inputs

const {
  addValidation,
  removeValidation,
  injectRules,
  isValidAddress,
  validateAddress,
} = helpers

let geoTimeout: any = null
let loadingTimeout: any = null

interface AddressProps {
  rules: any
  currentAddress: AddressFormFields
  shipsTo: string[]
  googleMapsKey: string
  orderForm: any
  autofill?: string[]
  autocomplete?: boolean
  postalCode?: string
  hideFields?: string[]
  notRequired?: string[]
  isnewLocation?: boolean
}

const CSS_HANDLES = [
  'changeLocationContainer',
  'changeLocationFormContainer',
  'changeLocationTitle',
  'changeLocationAddressContainer',
  'changeLocationGeoContainer',
  'changeLocationMapContainer',
  'changeLocationGeoErrorContainer',
  'changeLocationSubmitContainer',
  'changeLocationSubmitButton',
  'changeLocationGeolocationButton',
] as const

const geolocationOptions = {
  enableHighAccuracy: true,
  maximumAge: 30000,
  timeout: 10000,
}

const getGeolocation = async (key: string, address: any) => {
  const query = encodeURIComponent(
    String(
      `${address.number?.value || ''} ${address.street?.value || ''} ${address.postalCode?.value || ''
      } ${address.neighborhood?.value || ''} ${address.city?.value || ''} ${address.state?.value || ''}`
    ).trim()
  )

  if (!query) return
  let results: any = []
  let geolocation: any = []

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

      const {
        geometry: {
          location: { lat, lng },
        },
      } = result

      geolocation.location = [lng, lat]
    }
  } catch (err) {
    return geolocation
  }

  return geolocation
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

const formatNumber = (num: any) => {
  return parseInt(num) <= 9 ? `0${num}` : num
}

const getFulllocation = async (key: string, address: any) => {
  const query = encodeURIComponent(
    String(`${address.postalCode?.value || ''}`).trim()
  )

  if (!query) return
  let results: any = []
  const result: any = {}

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${key}`
    )

    results = await response.json()
    const {
      results: [result],
    } = results

    return result
  } catch (err) {
    return result
  }
}

const LocationForm: FunctionComponent<WrappedComponentProps & AddressProps> = (
  props
) => {
  const {
    intl,
    rules,
    currentAddress,
    shipsTo,
    googleMapsKey,
    autofill,
    autocomplete,
    postalCode,
    hideFields,
    notRequired,
    orderForm,
    isnewLocation
  } = props

  const dispatch: any = useModalDispatch()
  const { location } = useLocationState()
  const locationDispatch = useLocationDispatch()
  const [countryError, setCountryError] = useState(false)
  const [geoError, setGeoError] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [geoLoading, setGeoLoading] = useState(false)
  const [hasLocalAddr, setHasLocalAddr] = useState(false)
  const isMountedRef = useRef(false)
  const { handles } = useCssHandles(CSS_HANDLES)
  const { isMobile } = useDevice()
  const { culture, account, patchSession } = useRuntime()
  const [addAddress] = useMutation(NEW_ADDRESS)
  const { setCurrentStep, user } = useShopSelect()
  const [getUsers, { data }] = useLazyQuery(GET_PROFILE)
  const [isEditing, setIsEditing] = useState(false)
  const [currentAddrForm, setCurrentAddrForm] = useState({
    addressQuery: { value: '' },
    addressType: { value: 'residential' },
    city: { value: '' }, 
    complement: { value: '' }, 
    country: { value: 'PER' }, 
    geoCoordinates: { value: [] }, 
    neighborhood: { value: '' }, 
    number: { value: '' }, 
    postalCode: { value: '' }, 
    receiverName: { value: ' ' }, 
    reference: { value: '' }, 
    state: { value: 'Lima' }, 
    street: { value: '' }
  })

  useEffect(() => {
    getUsers()

    if (data?.profile) {
      setIsLoggedIn(true)
    }
  }, [data])

  const [ updateAddress, { called: updateAddressCalled, loading: updateAddressLoading } ] = useMutation(updateOrderFormShipping)

  const [
    setRegionId,
    { called: setRegionIdCalled, loading: setRegionIdLoading, data: regionData, },
  ] = useMutation(SET_REGION_ID)

  const mutationsPending = () => {
    return !updateAddressCalled || updateAddressLoading
  }

  if (location?.country?.value === '') {
    location.country.value = culture.country
  }

  useEffect(() => {
    isMountedRef.current = true
    currentAddress.receiverName = currentAddress.receiverName || { value: ' ' }
    const addressWithValidation = addValidation(currentAddress)
    if(!isnewLocation) setCurrentAddrForm(addressWithValidation)
    if(!localStorage.getItem("PE-ZipCodes")) getPEZipCodes()
    if (isMountedRef.current) {
      locationDispatch({
        type: 'SET_LOCATION',
        args: {
          address: addressWithValidation,
        },
      })
    }
    setIsEditing(true)
    return () => {
      isMountedRef.current = false
    }
  }, [])
  const fieldsNotRequired = ['complement', 'receiverName', 'reference']

  if (notRequired && notRequired.length) {
    notRequired.forEach((field: string) => {
      fieldsNotRequired.push(field)
    })
  }

  const customRules = rules

  customRules.fields = customRules.fields
    .map((field: any) => {
      return {
        ...field,
        hidden:
          hideFields && hideFields.indexOf(field.name) !== -1
            ? true
            : field.hidden && field.hidden === true,
      }
    })
    .map((field: any) => {
      return {
        ...field,
        required:
          fieldsNotRequired.indexOf(field.name) !== -1
            ? false
            : field.hidden !== true,
      }
    })

  useEffect(() => {
    if (mutationsPending()) {
      return
    }
    if (regionData?.setRegionId.updated) {
      window.location.reload()
    } else {
      const event = new Event('locationUpdated')

      window.dispatchEvent(event)
      dispatch?.({ type: 'CLOSE_MODAL' })
      setCurrentStep('menu')
    }
  }, [
    updateAddressCalled,
    setRegionIdCalled,
    updateAddressLoading,
    setRegionIdLoading,
  ])

  const requestGoogleMapsApi = async (params: {
    lat: number
    long: number
  }) => {
    const { lat, long } = params
    const baseUrl = `https://maps.googleapis.com/maps/api/geocode/json?key=${googleMapsKey}&`
    let suffix = ''

    if (lat && long) {
      suffix = `latlng=${lat},${long}`
    }

    try {
      const response = await fetch(baseUrl + suffix)

      return await response.json()
    } catch (err) {
      return { results: [] }
    }
  }

  const handleSuccess = async (position: Position) => {
    // call Google Maps API to get location details from returned coordinates
    const { latitude, longitude } = position.coords
    const parsedResponse = await requestGoogleMapsApi({
      lat: latitude,
      long: longitude,
    })

    if (!parsedResponse.results.length) {
      setGeoLoading(false)
      clearTimeout(loadingTimeout)
      return
    }

    // save geolocation to state
    const addressFields = getParsedAddress(parsedResponse.results[0], autofill)

    if (!shipsTo.includes(addressFields.country)) {
      setCountryError(true)
      setGeoLoading(false)
      clearTimeout(loadingTimeout)
      return
    }

    const geolocatedAddress = validAddressContext({
      addressQuery: null,
      neighborhood: addressFields.neighborhood || '',
      complement: '',
      number: addressFields.number || '',
      street: addressFields.street || '',
      postalCode: addressFields.postalCode || '',
      city: addressFields.city || '',
      addressType: addressFields.addressType || '',
      geoCoordinates: addressFields.geoCoordinates ?? [],
      state: addressFields.state || '',
      receiverName: location.receiverName.value ?? ' ',
      reference: '',
      country: addressFields.country || '',
    })
    const fieldsWithValidation = addValidation(geolocatedAddress)
    const validatedFields = validateAddress(fieldsWithValidation, customRules)
    setHasLocalAddr(geolocatedAddress?.country==="PER")
    setCurrentAddrForm(fieldsWithValidation)
    locationDispatch({
      type: 'SET_LOCATION',
      args: {
        address: validatedFields,
      },
    })
    setGeoLoading(false)
    clearTimeout(loadingTimeout)
    document.getElementById("street")?.focus()
  }

  const handleError = () => {
    setGeoError(true)
    setGeoLoading(false)
    clearTimeout(loadingTimeout)
  }

  const handleGeolocation = () => {
    loadingTimeout = setTimeout(() => {
      setGeoLoading(true)
    }, 500)
    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      handleError,
      geolocationOptions
    )
  }

  const updateRegionID = async ({ country, postalCode, salesChannel }: any) => {
    setRegionId({
      variables: {
        country,
        postalCode: postalCode,
        salesChannel,
      },
    })
  }

  const validZipCodeAddr = async (newAddress:any) => {
    let postalcode: any = newAddress?.postalCode;
    if ((postalcode && (postalcode !== '' && postalcode.length < 6)) || !postalcode) {
      const zipCodes = await getPEZipCodes()
      Object.entries(zipCodes).forEach( (state:any) => {
        if(state && state.length>0){
          if(handleize(state[0]) === handleize(newAddress.state)){
            Object.entries(state[1]).forEach( (city:any) => {
              if(city && city.length>0){
                if(handleize(city[0]) === handleize(newAddress.city)){
                  Object.entries(city[1]).forEach( (neighborhood:any) => {
                    if(neighborhood && neighborhood.length){
                      if(handleize(neighborhood[0]) === handleize(newAddress.neighborhood)){
                        postalcode = neighborhood[1]
                      }
                    }
                  })
                }
              }
            })
          }
        }
      })
    }
    return postalcode
  }
  const getCurrentOFProps = (filter:string = '') => {
    const tempOF = localStorage.getItem("tempOF") ? JSON.parse(localStorage.getItem("tempOF") || '') : null
    const currOF = tempOF ? tempOF : orderForm

    if(filter === '') return currOF

    return currOF[filter] ? currOF[filter] : ''
  }
  const handleUpdateAddress = async () => {
    setLocationLoading(true)
    //Variables iniciales: address
    const newAddress:any = removeValidation(currentAddrForm)
    //Validación: La dirección debe llegar con geoocordenadas para poder incluírla en el proceso
    if(!newAddress || (newAddress && !newAddress.geoCoordinates) || (newAddress && newAddress.geoCoordinates && newAddress.geoCoordinates.length === 0)){
      execModalInvalidSegment(`Geocoordinates is empty: ${JSON.stringify(newAddress)}`)
      return
    }
    //Formato de dirección + código zip válido
    newAddress.postalCode = await validZipCodeAddr(newAddress)
    const addrFormatted = {
      addressType: 'residential',
      street: newAddress.street,
      city: newAddress.city,
      postalCode: newAddress.postalCode,
      receiverName: `${user?.firstName || ''} ${user?.lastName || ''}`,
      state: newAddress.state,
      country: newAddress.country.substr(0, 3).toUpperCase(),
      geoCoordinates: newAddress.geoCoordinates,
      neighborhood: newAddress.neighborhood,
      complement: newAddress.complement,
      reference: newAddress.reference,
      number: newAddress.number,
      isDisposable: true,
      userId: user?.id,
      addressName: `residential - ${newAddress.street}, ${newAddress.number}`, 
      salesChannel: getCurrentOFProps('salesChannel')
    }
    //Actualizando la región
    updateRegionID({
      country: addrFormatted?.country,
      postalCode: addrFormatted?.postalCode,
      salesChannel: addrFormatted?.salesChannel
    })
    //Actualizando selected address en orderForm
    await updateAddress({
      variables: {
        address: {
          addressType: addrFormatted.addressType,
          street: addrFormatted.street,
          city: addrFormatted.city,
          postalCode: addrFormatted.postalCode,
          receiverName: addrFormatted.receiverName,
          state: addrFormatted.state,
          country: addrFormatted.country,
          geoCoordinates: addrFormatted.geoCoordinates,
          neighborhood: addrFormatted.neighborhood,
          complement: addrFormatted.complement,
          number: addrFormatted.number,
          isDisposable: addrFormatted.isDisposable, 
          addressId: addrFormatted.addressName
        }
      }
    })
    setCurrentStep('loading')
    dispatch?.({ type: 'OPEN_MODAL' })

    //Actualizando la sesión
    const requisitionBody = {
      public: {
        country: {
          value: 'PE',
        },
        geoCoordinates: {
          value: `${addrFormatted?.geoCoordinates[0]},${addrFormatted?.geoCoordinates[1]}`,
        },
      },
    }
    try {
      const { response: responseSession } = await patchSession(requisitionBody)
      if(!responseSession || (responseSession && !responseSession.segmentToken)){
        execModalInvalidSegment(`Invalid response in PATCH session: ${JSON.stringify(responseSession)}`, getCurrentOFProps())
        return
      }
      const isValidSegment = await validAddrSegment(responseSession.segmentToken, addrFormatted?.salesChannel)
      if(!isValidSegment){
        execModalInvalidSegment(`Is invalid segment in session: ${JSON.stringify(responseSession)}`, getCurrentOFProps())
        return
      }

      //Seteando dirección en orderForm
      await sendAddressToOrderForm(getCurrentOFProps('orderFormId'), addrFormatted)

    } catch (err) {
      console.error(err)
      return
    }

    localStorage.removeItem("tempOF")
    setTimeout(function(){
      window.location.reload()
    }, 300)
  }
  const sendAddressToOrderForm = async (orderFormId:any = '', addrFormatted:any = {}) => {
    //Insert - Update dirección en MD
    if (isLoggedIn) {
      await addAddress({
        variables: {
          address: {
            country: addrFormatted?.country,
            state: addrFormatted?.state,
            city: addrFormatted?.city,
            street: addrFormatted?.street,
            neighborhood: addrFormatted?.neighborhood,
            postalCode: addrFormatted?.postalCode,
            geoCoordinates: addrFormatted?.geoCoordinates,
            reference: addrFormatted?.reference,
            number: addrFormatted?.number,
            addressType: addrFormatted?.addressType,
            receiverName: addrFormatted?.receiverName,
            addressName: addrFormatted?.addressName
          }
        }
      })
    } else {
      await axios.patch(`${baseURL[account as IAccount].url}/update/partial?dataId=AD&store=${account}`, {
          userId: addrFormatted?.userId,
          country: addrFormatted?.country,
          state: addrFormatted?.state,
          city: addrFormatted?.city,
          street: addrFormatted?.street,
          neighborhood: addrFormatted?.neighborhood,
          postalCode: addrFormatted?.postalCode,
          geoCoordinate: addrFormatted?.geoCoordinates,
          reference: addrFormatted?.reference,
          number: addrFormatted?.number,
          addressType: addrFormatted?.addressType,
          addressName: addrFormatted?.addressName,
          receiverName: addrFormatted?.receiverName
        }, {
          headers: {
            'x-apikey': baseURL[account as IAccount].key
          }
        }
      )
    }

    //Actualizando selected address en orderForm
    await updateAddress({
      variables: {
        address: {
          addressType: addrFormatted?.addressType,
          street: addrFormatted?.street,
          city: addrFormatted?.city,
          postalCode: addrFormatted?.postalCode,
          receiverName: addrFormatted?.receiverName,
          state: addrFormatted?.state,
          country: addrFormatted?.country,
          geoCoordinates: addrFormatted?.geoCoordinates,
          neighborhood: addrFormatted?.neighborhood,
          complement: addrFormatted?.complement,
          number: addrFormatted?.number,
          isDisposable: addrFormatted?.isDisposable, 
          addressId: addrFormatted?.addressName
        }
      }
    })
    //Recuperando orderForm
    const { data: checkoutOrderform } = await axios.get(`/api/checkout/pub/orderForm/${orderFormId}`)
    const { selectedAddresses } = checkoutOrderform.shippingData || {}
    const { logisticsInfo } = checkoutOrderform.shippingData || {}
    let selAddrId = null
    if (selectedAddresses && selectedAddresses.length) selAddrId = selectedAddresses[0]?.addressId
    if (logisticsInfo && logisticsInfo.length) {
      for (let index = 0; index < logisticsInfo.length; index++) {
        checkoutOrderform.shippingData.logisticsInfo[index].selectedDeliveryChannel = 'delivery'
        checkoutOrderform.shippingData.logisticsInfo[index].selectedSla = 'Despacho desde tienda'
      }
      await axios.post(`/api/checkout/pub/orderForm/${orderFormId}/attachments/shippingData`, checkoutOrderform.shippingData)
    }
    //Actualizando storage
    localStorage.setItem(
      'shippingData',
      JSON.stringify({
        selectedDeliveryChannel: 'delivery',
        address: `${addrFormatted.street}, ${addrFormatted.number}`,
        addressId: selAddrId, 
        geoCoordinates: addrFormatted.geoCoordinates, 
        selectedSla: 'Despacho desde tienda'
      })
    )

    //Actualizando la sesión
    const requisitionBody = {
      public: {
        country: {
          value: 'PE',
        },
        geoCoordinates: {
          value: `${addrFormatted?.geoCoordinates[0]},${addrFormatted?.geoCoordinates[1]}`,
        },
      },
    }
    try {
      await patchSession(requisitionBody)
    } catch (err) {
      console.error(err)
    }
  }
  const validAddrSegment = async (segmentToken:string = '', salesChannel:string = '') => {
    if(!localStorage.getItem("testingSegmentAddr")) return true
    const segmentDecode = JWTDecode(segmentToken)

    if(!segmentDecode || (segmentDecode && !segmentDecode.regionId) || (segmentDecode && segmentDecode.regionId === '') || salesChannel === '')
      return false
    
    const { data: [validSegment] } = await axios.get(`/api/checkout/pub/regions/${segmentDecode.regionId}?sc=${salesChannel}`)
    console.log("segmentDecode: ", segmentDecode, ", validSegment: ", validSegment);
    if(!validSegment || (validSegment && !validSegment.sellers) || (validSegment && validSegment.sellers && validSegment.sellers.length === 0))
      return false
    
    return true
  }
  const execModalInvalidSegment = async (messageError:string, _of:any = {}) => {
    console.error(messageError)
    if((_of && (!_of.orderFormId || !_of.salesChannel)) || !localStorage.getItem('orderform')){
      setCurrentStep('dontDelivery')
      dispatch?.({ type: 'OPEN_MODAL' })
      return
    }
    const lastOrderForm = JSON.parse(localStorage.getItem('orderform') || '{}')
    if(lastOrderForm?.id !== _of?.orderFormId) return
    const lastSelectedAddr = lastOrderForm?.shipping?.selectedAddress

    //Actualizando la región
    updateRegionID({
      country: lastSelectedAddr?.country ? lastSelectedAddr?.country : '',
      postalCode: lastSelectedAddr?.postalCode ? lastSelectedAddr?.postalCode : '',
      salesChannel: _of?.salesChannel
    })
    //Actualizando selected address en orderForm
    await updateAddress({
      variables: {
        address: {
          addressType: lastSelectedAddr?.addressType,
          street: lastSelectedAddr?.street,
          city: lastSelectedAddr?.city,
          postalCode: lastSelectedAddr?.postalCode,
          receiverName: lastSelectedAddr?.receiverName,
          state: lastSelectedAddr?.state,
          country: lastSelectedAddr?.country,
          geoCoordinates: lastSelectedAddr?.geoCoordinates,
          neighborhood: lastSelectedAddr?.neighborhood,
          complement: lastSelectedAddr?.complement,
          number: lastSelectedAddr?.number,
          isDisposable: lastSelectedAddr?.isDisposable, 
          addressId: lastSelectedAddr?.addressId
        }
      }
    })

    //Actualizando la sesión
    const requisitionBody = {
      public: {
        country: {
          value: 'PE',
        },
        geoCoordinates: {
          value: `${lastSelectedAddr?.geoCoordinates[0]},${lastSelectedAddr?.geoCoordinates[1]}`,
        },
      },
    }
    try {
      await patchSession(requisitionBody)
    } catch (err) {
      console.error(err)
    }

    setCurrentStep('dontDelivery')
    dispatch?.({ type: 'OPEN_MODAL' })
  }

  function resetAddressRules() {
    const hiddenFields = customRules.fields
      .filter(
        (f: any) =>
          f.hidden === true &&
          f.name !== 'postalCode' &&
          f.name !== 'country' &&
          f.name !== 'receiverName'
      )
      .map((i: any) => i.name)

    const addressFields = Object.keys(location)
      .filter((key: any) => !hiddenFields.includes(key))
      .reduce((obj: any, key: any) => {
        obj[key] = location[key]

        return obj
      }, {})

    const address = addValidation(addressFields, customRules)

    locationDispatch({
      type: 'SET_LOCATION',
      args: {
        address,
      },
    })
  }

  function handleCountryChange(newAddress: any) {
    const curAddress = location
    const combinedAddress = { ...curAddress, ...newAddress }
    setHasLocalAddr(combinedAddress?.country?.value==="PER")

    resetAddressRules()
    locationDispatch({
      type: 'SET_LOCATION',
      args: {
        address: combinedAddress,
      },
    })
  }

  const handleAddrForm = (newAddress: any, forceReload: boolean = false) => {
    const tempCombinedAddress = { ...currentAddrForm, ...newAddress }
    setHasLocalAddr(tempCombinedAddress?.country?.value==="PER")
    setCurrentAddrForm(tempCombinedAddress)
    if(!isEditing) return
    setLocationLoading(true)
    const validatedAddress = validateAddress(tempCombinedAddress, customRules)
    if (isMountedRef.current) {
      getGeolocation(googleMapsKey, validatedAddress).then((res: any) => {
        setLocationLoading(false)
        if (res && isMountedRef.current) {
          const formattedAddr2 = validAddressContext({
            ...validatedAddress,
            postalCode: { value: res.postalCode || '' },
            geoCoordinates: { value: res.location }
          }, true)
          if(forceReload) setCurrentAddrForm({ ...currentAddrForm, ...formattedAddr2 })
          locationDispatch({
            type: 'SET_LOCATION',
            args: {
              address: formattedAddr2,
            },
          })
        }
      })
    }
  }

  function handleAddressChange(newAddress: any) {
    clearTimeout(geoTimeout)
    const curAddress = location
    const combinedAddress = { ...curAddress, ...newAddress }
    const validatedAddress = validateAddress(combinedAddress, customRules)
    setHasLocalAddr(combinedAddress?.country?.value==="PER")
    setLocationLoading(true)
    geoTimeout = setTimeout(() => {
      if (
        newAddress?.postalCode?.value &&
        postalCode === 'first' &&
        autocomplete === true
      ) {
        getFulllocation(googleMapsKey, validatedAddress).then((res: any) => {
          const responseAddress = addValidation(
            getParsedAddress(res, autofill),
            customRules
          )
          const address = validateAddress(responseAddress, customRules)
          const formattedAddr1 = validAddressContext(address, true)
          if (res && isMountedRef.current) {
            locationDispatch({
              type: 'SET_LOCATION',
              args: {
                address: formattedAddr1,
              },
            })
          }
        })
      } else {
        getGeolocation(googleMapsKey, validatedAddress).then((res: any) => {
          setLocationLoading(false)
          if (res && isMountedRef.current) {
            const formattedAddr2 = validAddressContext({
              ...validatedAddress,
              postalCode: { value: res.postalCode || '' },
              geoCoordinates: { value: res.location }
            }, true)
            locationDispatch({
              type: 'SET_LOCATION',
              args: {
                address: formattedAddr2,
              },
            })
          }
        })
      }
    }, 2500)

    if (isMountedRef.current) {
      locationDispatch({
        type: 'SET_LOCATION',
        args: {
          address: validatedAddress,
        },
      })
    }
  }

  function translateCountries() {
    if (
      location?.country?.value &&
      !shipsTo.includes(location.country.value as string)
    ) {
      shipsTo.push(location.country.value as string)
    }

    return shipsTo.map((code: string) => {
      const countryCode = countries[code as keyof typeof countries]

      return {
        label: countryCode ? intl.formatMessage(countryCode) : code,
        value: code,
      }
    })
  }

  const shipCountries = translateCountries()
  const sortFields = (_a: any, b: any) => {
    if (!props.postalCode || props?.postalCode?.toLowerCase() !== 'first') {
      return b.name === 'postalCode' ? -1 : 1
    }

    return 0
  }
  const fields = customRules.fields.sort(sortFields)

  return (
    <div
      className={`${handles.changeLocationContainer} w-100`}
      style={!isMobile ? { width: 800 } : {}}
    >
      <div className="flex flex-auto">
        <div className={`${handles.changeLocationFormContainer} pa6 w-100`}>
          <section className={handles.changeLocationGeoContainer}>
            {countryError ? (
              <div
                className={`${handles.changeLocationGeoErrorContainer} mt2 red`}
                style={{ maxWidth: 300 }}
              >
                <FormattedMessage id="store/shopper-location.change-location.error-country" />
              </div>
            ) : geoError ? (
              <div
                className={`${handles.changeLocationGeoErrorContainer} mt2 red`}
                style={{ maxWidth: 300 }}
              >
                <FormattedMessage id="store/shopper-location.change-location.error-permission" />
              </div>
            ) : (
              <>
                <ButtonWithIcon
                  variation="primary"
                  icon={<IconLocation />}
                  onClick={() => handleGeolocation()}
                  class={handles.changeLocationGeolocationButton}
                  isLoading={geoLoading}
                >
                  <FormattedMessage id="store/shopper-location.change-location.trigger-geolocation" />
                </ButtonWithIcon>
              </>
            )}
          </section>
          <section className={`${handles.changeLocationAddressContainer} mt7`}>
            <div
              className={` ${shipCountries.length === 1 ? 'dn' : ''
                } shopper-location-ship-country`}
            >
              <CountrySelector
                Input={StyleguideInput}
                address={location}
                shipsTo={shipCountries}
                onChangeAddress={(newAddress: AddressFormFields) => handleCountryChange({
                    country: { value: newAddress.country.value },
                    city: { value: '' },
                    state: { value: '' },
                    neighborhood: { value: '' },
                    postalCode: { value: '' },
                  })
                }
              />
            </div>
            <div className="flex flex-wrap fields-container">
              {fields.map((field: any) => {
                return (
                  <AddressInput
                    key={field.name}
                    intl={intl}
                    field={field}
                    currentAddrForm={currentAddrForm}
                    handleAddressChange={handleAddressChange}
                    handleAddrForm={handleAddrForm}
                    disabled={locationLoading}
                  />
                )
              })}
            </div>
          </section>
          <section className={`${handles.changeLocationSubmitContainer} mt7`}>
            <Button
              variation="primary"
              disabled={
                !location || !isValidAddress(location, customRules).valid || !hasLocalAddr
              }
              onClick={() => handleUpdateAddress()}
              class={handles.changeLocationSubmitButton}
              isLoading={locationLoading}
            >
              <FormattedMessage id="store/shopper-location.change-location.submit" />
            </Button>
          </section>
        </div>
        {!isMobile && (
          <div
            className={`flex-grow-1 relative w-100 ${handles.changeLocationMapContainer}`}
          >
            <MapContainer
              geoCoordinates={location.geoCoordinates.value}
              googleMapsApiKey={googleMapsKey}
              intl={intl}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default injectRules(LocationForm)
