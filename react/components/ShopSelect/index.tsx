import React, { useEffect, useState } from 'react'
import { useModalDispatch, ModalContextProvider } from 'vtex.modal-layout/ModalContext'
import { useLazyQuery } from 'react-apollo'
import { useMutation } from 'react-apollo'
import { useCssHandles } from 'vtex.css-handles'
import { ShopSelectProvider, useShopSelect } from './context/ShopSelectContext'
import { useOrderForm } from 'vtex.order-manager/OrderForm';
import { compareTwoStrings } from 'string-similarity'
import { LocationContextProvider, initialLocationState } from './components/ShopperLocator/LocationContext'
import { pickupPoints } from './stores'
import { baseURL } from '../../config/ApiBaseURL'
import { IAccount } from './interfaces/IApiBaseURL'
import { useRuntime } from 'vtex.render-runtime'
import GET_PROFILE from '../../graphql/getProfile.gql'
import GET_ORDERFORM from '../../graphql/OrderForm.gql'
import UPDATE_ORDERFORM from '../../graphql/UpdateOrderFormClient.gql'
import axios from 'axios'
import Modal from './Modal'

const CSS_HANDLES = [
  'shopselect',
  'shopselect__button',
  'shopselect__close',
  'shopselect__header',
  'shopselect__email',
  'shopselect__logout',
  'shopselect__strong',
  'shopselect__strong',
  'shopselect__paragraph',
  'shopselect__wrapper',
] as const

const ShopSelect = (props: any) => {
  const dispatch = useModalDispatch()
  const [deliveryInfo, setDeliveryInfo] = useState<any>()
  const [address, setAddress] = useState<any>()
  const [getUsers, { data }] = useLazyQuery(GET_PROFILE)
  const [getOrderForm, { data: orderData }] = useLazyQuery(GET_ORDERFORM)
  const [updateOrderForm] = useMutation(UPDATE_ORDERFORM)
  const { setCurrentStep, setUser, user } = useShopSelect()
  const { handles } = useCssHandles(CSS_HANDLES)
  const { account } = useRuntime()
  const orderFormContext = useOrderForm()

  useEffect(() => {
    if (!orderData) {
      getOrderForm()
    }
  }, [orderData, deliveryInfo])

  useEffect(() => {
    selectContent()
  }, [user])

  useEffect(() => {
    (async () => {
      getUsers()
      const cachedUser = localStorage.getItem('user')
      let formattedUser = cachedUser && JSON.parse(cachedUser)
      const delivery = localStorage.getItem('shippingData')
      let formattedDeliveryInfo = delivery && JSON.parse(delivery)
  
      if(!formattedUser?.addresses && formattedUser?.email)
        formattedUser = await getItBackUserData(formattedUser)
      if(formattedUser?.addresses && formattedDeliveryInfo?.addressId && (formattedDeliveryInfo?.address.includes("*") || !formattedDeliveryInfo?.geoCoordinates.length))
        formattedDeliveryInfo = await getItBackShippingData(formattedUser, formattedDeliveryInfo)

      setDeliveryInfo(formattedDeliveryInfo)
      setAddress(formattedDeliveryInfo)
  
      if (data?.profile) {
        setCurrentStep('menu')
        localStorage.setItem("user", JSON.stringify(data?.profile))
        setUser(data.profile)
        updateOrderFormData()
      }
  
      if (formattedUser) {
        setCurrentStep('menu')
        setUser(formattedUser)
      }
    })()
  }, [data])

  async function getItBackUserData(formattedUser:any) {
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
    localStorage.setItem('user', JSON.stringify(userInfo))
    return userInfo
  }
  async function getItBackShippingData(formattedUser:any, formattedDeliveryInfo:any) {
    let resetAddress:any = null
    formattedUser.addresses.map( (item:any) => {
      if(item.addressName === formattedDeliveryInfo.addressId) resetAddress = item
    })
    if(resetAddress){
      formattedDeliveryInfo.address = `${resetAddress?.street}, ${resetAddress?.number}`
      formattedDeliveryInfo.geoCoordinates = resetAddress.geoCoordinate
      localStorage.setItem('shippingData', JSON.stringify(formattedDeliveryInfo))
    }
    return formattedDeliveryInfo
  }

  async function updateOrderFormData() {
    const orderFormElement = await orderFormContext
    if (orderFormElement?.orderForm?.clientProfileData?.email != data?.profile?.email) {
      updateOrderForm({
        variables: {
          orderFormId: orderFormElement?.orderForm.id,
          input: {
            email: data?.profile?.email
          }
        }
      })
    }
  }
  const getDistance = ({ lat1, lon1, lat2, lon2, unit }: any) => {
    var radlat1 = Math.PI * lat1 / 180
    var radlat2 = Math.PI * lat2 / 180
    var theta = lon1 - lon2
    var radtheta = Math.PI * theta / 180
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist)
    dist = dist * 180 / Math.PI
    dist = dist * 60 * 1.1515
    if (unit == "K") { dist = dist * 1.609344 }
    if (unit == "N") { dist = dist * 0.8684 }
    return dist
  }

  const selectContent = () => {
    if (!deliveryInfo) {
      return (
        <>
          <div className={handles.shopselect__wrapper}>
            <p className={handles.shopselect__paragraph}>
              ¿Cómo quieres recibir tu pedido?
            </p>
            <button
              className={handles.shopselect__button}
              onClick={handleOpenModal}
            >
              Elegir
            </button>
          </div>
          <Modal {...props} />
        </>
      )
    }

    const currentAddress = address.address
    const closestStore = {
      name: null,
      distance: -1
    }

    if (address) {
      pickupPoints?.forEach((store: any) => {
        if (!address.geoCoordinates) {
          const points = compareTwoStrings(store.store, address.selectedSla)

          if (closestStore.distance === -1 || closestStore.distance < points) {
            closestStore.name = store.store
            closestStore.distance = points
          }
        } else {
          const storeCoordinates = store.geoCoordinates.split(', ').sort()

          const latLon1 = typeof address.geoCoordinates === 'string' ? [parseFloat(address.geoCoordinates.split(', ')[0]), parseFloat(address.geoCoordinates.split(', ')[1])].sort() : address.geoCoordinates.sort()

          const locationsToCompare = {
            lat1: latLon1[0],
            lon1: latLon1[1],
            lat2: parseFloat(storeCoordinates[0]),
            lon2: parseFloat(storeCoordinates[1]),
            unit: 'K'
          }

          const currentDistance = getDistance(locationsToCompare)

          if (closestStore.distance === -1 || closestStore.distance > currentDistance) {
            closestStore.name = store.store
            closestStore.distance = currentDistance
          }
        }
      })
    }

    if (deliveryInfo.selectedDeliveryChannel === 'delivery') {

      return (
        <>
          <div className={handles.shopselect__wrapper}>
            <svg
              width="18"
              height="27"
              viewBox="0 0 18 27"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M8.60891 26.0774C9.05944 26.6646 9.33342 26.9943 9.33342 26.9943C9.33342 26.9943 9.60737 26.6645 10.0579 26.0774C12.1412 23.3618 18.0001 15.1406 18.0001 8.56612C18.0001 3.94232 14.1209 0.206421 9.33342 0.206421C4.54595 0.206421 0.666748 3.94064 0.666748 8.56612C0.666748 15.1419 6.52552 23.3622 8.60891 26.0774ZM9.33335 25.1447C9.46065 24.9765 9.59885 24.7917 9.74625 24.5916C10.5438 23.509 11.6063 21.9847 12.6674 20.2181C14.8206 16.6329 16.8445 12.2473 16.8445 8.56612C16.8445 4.56176 13.4854 1.32328 9.33342 1.32328C5.18128 1.32328 1.8223 4.56023 1.8223 8.56612C1.8223 12.2482 3.84626 16.6338 5.99945 20.2187C7.06046 21.9852 8.12304 23.5093 8.92054 24.5918C9.06791 24.7918 9.20608 24.9765 9.33335 25.1447ZM9.33342 14.3085C7.78573 14.3085 6.30143 13.7142 5.20705 12.6565C4.11267 11.5988 3.49786 10.1642 3.49786 8.66831C3.49786 7.17245 4.11268 5.73786 5.20705 4.68013C6.30143 3.62239 7.78573 3.02817 9.33342 3.02817C10.8811 3.02817 12.3654 3.62239 13.4598 4.68013C14.5542 5.73786 15.169 7.17245 15.169 8.66831C15.169 10.1642 14.5542 11.5988 13.4598 12.6565C12.3654 13.7142 10.8811 14.3085 9.33342 14.3085ZM6.02416 11.8668C6.90183 12.715 8.0922 13.1916 9.33342 13.1916C10.5746 13.1916 11.765 12.715 12.6427 11.8668C13.5203 11.0185 14.0134 9.86796 14.0134 8.66831C14.0134 7.46866 13.5203 6.31815 12.6427 5.46987C11.765 4.62159 10.5746 4.14503 9.33342 4.14503C8.0922 4.14503 6.90183 4.62159 6.02416 5.46987C5.14648 6.31815 4.65342 7.46866 4.65342 8.66831C4.65342 9.86796 5.14648 11.0185 6.02416 11.8668Z"
                fill="#EC1C24"
              />
              <path
                d="M16.7163 19.341C16.7163 20.75 15.4229 21.8922 13.8274 21.8922C12.2319 21.8922 10.9385 20.75 10.9385 19.341C10.9385 17.932 12.2319 16.7898 13.8274 16.7898C15.4229 16.7898 16.7163 17.932 16.7163 19.341Z"
                fill="white"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M13.8274 20.8718C14.7847 20.8718 15.5607 20.1864 15.5607 19.341C15.5607 18.4956 14.7847 17.8103 13.8274 17.8103C12.8701 17.8103 12.094 18.4956 12.094 19.341C12.094 20.1864 12.8701 20.8718 13.8274 20.8718ZM13.8274 21.8922C15.4229 21.8922 16.7163 20.75 16.7163 19.341C16.7163 17.932 15.4229 16.7898 13.8274 16.7898C12.2319 16.7898 10.9385 17.932 10.9385 19.341C10.9385 20.75 12.2319 21.8922 13.8274 21.8922Z"
                fill="#EC1C24"
              />
            </svg>

            <p className={handles.shopselect__paragraph}>
              Delivery: {currentAddress}
            </p>
            <button
              className={handles.shopselect__button}
              onClick={handleOpenModal}
            >
              Cambiar
            </button>
          </div>
          <Modal {...props} />
        </>
      )
    }

    return (
      <>
        <div className={handles.shopselect__wrapper}>
          <svg
            width="22"
            height="20"
            viewBox="0 0 22 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21.666 6.80764C21.6658 6.79869 21.6653 6.78976 21.6646 6.78083C21.6637 6.76726 21.6622 6.75382 21.6602 6.74052C21.6569 6.71733 21.652 6.69436 21.6458 6.67171C21.6446 6.66744 21.644 6.66307 21.6427 6.6588L20.143 1.6747C20.0546 1.38474 19.8697 1.12976 19.6159 0.947992C19.3621 0.766225 19.0531 0.667461 18.7352 0.666504H3.26516C2.94724 0.667461 2.63822 0.766225 2.38441 0.947992C2.13061 1.12976 1.94568 1.38474 1.85737 1.6747L0.357548 6.6589C0.356293 6.66307 0.355771 6.66744 0.35462 6.67171C0.348344 6.69435 0.34349 6.71733 0.340084 6.74052C0.33685 6.76274 0.334929 6.78511 0.334333 6.80754C0.334123 6.8125 0.333496 6.81747 0.333496 6.82253V8.41119C0.333736 9.01309 0.48576 9.6062 0.776855 10.1409C1.06795 10.6756 1.48965 11.1364 2.0067 11.4846V17.9431C2.00714 18.3116 2.16153 18.665 2.436 18.9256C2.71047 19.1862 3.0826 19.3328 3.47075 19.3332H18.5296C18.9177 19.3328 19.2899 19.1862 19.5643 18.9256C19.8388 18.665 19.9932 18.3116 19.9936 17.9431V11.4846C20.5107 11.1364 20.9324 10.6756 21.2235 10.1409C21.5146 9.6062 21.6666 9.01309 21.6668 8.41119V6.82253C21.6668 6.81757 21.6662 6.8126 21.666 6.80764ZM3.06416 2.00197C3.07676 1.96057 3.10314 1.92417 3.13936 1.89822C3.17557 1.87226 3.21968 1.85815 3.26505 1.85799H18.7351C18.7805 1.8581 18.8246 1.8722 18.8609 1.89816C18.8971 1.92412 18.9236 1.96054 18.9362 2.00197L20.2076 6.22679H1.79274L3.06416 2.00197ZM8.28121 7.41828H13.7191V8.41119C13.7191 9.09586 13.4327 9.75249 12.9228 10.2366C12.4129 10.7208 11.7213 10.9927 11.0002 10.9927C10.2791 10.9927 9.58747 10.7208 9.07757 10.2366C8.56767 9.75249 8.28121 9.09586 8.28121 8.41119V7.41828ZM1.5884 7.41828H7.02631V8.41119C7.02655 8.85653 6.90539 9.29435 6.67461 9.68206C6.44383 10.0698 6.11129 10.3942 5.70933 10.6237C5.30737 10.8532 4.84969 10.98 4.38082 10.9918C3.91194 11.0036 3.44782 10.9 3.03363 10.691C2.98171 10.6505 2.92327 10.6182 2.86055 10.5954C2.47131 10.3631 2.15045 10.0409 1.92797 9.65897C1.70549 9.27699 1.58866 8.84768 1.5884 8.41119V7.41828ZM18.7387 17.9431C18.7387 17.9958 18.7166 18.0462 18.6774 18.0835C18.6382 18.1207 18.585 18.1416 18.5296 18.1417H3.47075C3.4153 18.1416 3.36213 18.1207 3.32292 18.0835C3.28371 18.0462 3.26166 17.9958 3.2616 17.9431V12.0507C4.07865 12.2629 4.94581 12.2213 5.73614 11.9319C6.52646 11.6424 7.19846 11.1204 7.65376 10.4422C8.01243 10.9762 8.50707 11.4157 9.09196 11.7202C9.67684 12.0247 10.3331 12.1843 11.0002 12.1843C11.6672 12.1843 12.3235 12.0247 12.9084 11.7202C13.4933 11.4157 13.9879 10.9762 14.3466 10.4422C14.8019 11.1204 15.4739 11.6424 16.2642 11.9319C17.0545 12.2213 17.9217 12.2629 18.7387 12.0507V17.9431ZM19.1392 10.5957C19.0769 10.6185 19.0189 10.6506 18.9672 10.6908C18.553 10.8999 18.0889 11.0036 17.6199 10.9919C17.151 10.9802 16.6932 10.8534 16.2912 10.6239C15.8892 10.3944 15.5566 10.0699 15.3258 9.6822C15.0949 9.29446 14.9738 8.85658 14.974 8.41119V7.41828H20.4119V8.41119C20.4117 8.84778 20.2948 9.27718 20.0722 9.65921C19.8496 10.0413 19.5286 10.3635 19.1392 10.5957Z"
              fill="#EC1C24"
            />
          </svg>

          <p className={handles.shopselect__paragraph}>
            Retiro en {address?.storeName || closestStore && closestStore.name}
          </p>
          <button
            className={handles.shopselect__button}
            onClick={handleOpenModal}
          >
            Cambiar
          </button>
        </div>
        <Modal {...props} />
      </>
    )
  }

  const handleOpenModal = (
    evt: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    evt.stopPropagation()
    evt.preventDefault()
    dispatch?.({ type: 'OPEN_MODAL' })

  }

  return selectContent()
}

const WithContext = (props: any) => (
  <LocationContextProvider {...initialLocationState}>
    <ShopSelectProvider>
      <ModalContextProvider>
        <ShopSelect {...props} />
      </ModalContextProvider>
    </ShopSelectProvider>
  </LocationContextProvider>
)

export default WithContext
