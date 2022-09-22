import React, { useCallback, useEffect, useState } from 'react'
import { useLazyQuery } from 'react-apollo'
import { useCssHandles } from 'vtex.css-handles'
import {
  ModalContextProvider,
  useModalDispatch,
} from 'vtex.modal-layout/ModalContext'
import { Modal, ModalContent } from 'vtex.modal-layout'
import { useProduct } from 'vtex.product-context'
import { OrderForm } from 'vtex.order-manager'
import axios from 'axios'
import noStickers from '../../../assets/images/no-stickers.png'
import Bonus from '../../../assets/images/bonus.png'


import { ShopSelectProvider } from '../ShopSelect/context/ShopSelectContext'
import AddToCartButton, { Props } from '../AddToCartButton'
import GET_PROFILE from '../../graphql/getProfile.gql'
import GET_PRODUCT from '../../graphql/GetProduct.gql'

import AddressModal from '../ShopSelect/Modal'

interface Promo {
  puntos: number
  stickers: number
}

interface UserPoints {
  saldo_puntos: string
  saldo_stickers: string
}

const CSS_HANDLES = [
  'buyButtonContainer',
  'modal__title',
  'modal_image',
  'img_nostick',
  'img_bonus',
  'modal_missing_points',
  'modal__paragraph',
  'modal__paragraph__nopoints',
  'modal__paragraph_missing_points',
  'modal__paragraph_points',
  'modal__button',
  'modal__button__nopoints'
] as const

const LoginModal = (props: Props) => {
  const [promo, setPromo] = useState<Promo>()
  const [checkoutOrderForm, setCheckoutOrderForm] = useState<any>()
  const [formattedUserPoints, setFormattedUserPoints] = useState<UserPoints>()
  const { handles } = useCssHandles(CSS_HANDLES)
  const [getUsers, { data }] = useLazyQuery(GET_PROFILE)
  const [getProduct, { data: productData }] = useLazyQuery(GET_PRODUCT)

  const { useOrderForm } = OrderForm
  const { orderForm } = useOrderForm()

  const productContext = useProduct()
  const dispatch = useModalDispatch()
  const product = productContext?.product
  const selectedQuantity = productContext?.selectedQuantity

  useEffect(() => {
    getUsers()
    localStorage.setItem('dataUserTemp', JSON.stringify(data))
  }, [data])

  useEffect(() => {
    getCheckoutOrderForm()
    const userPoints = localStorage?.getItem('megaCanjeUser')
    if (userPoints) {
      const formatted = JSON.parse(userPoints)

      formatted.saldo_puntos = formatted.saldo_puntos.replace(/\b0+/g, '').length === 0 ? 0 : formatted.saldo_puntos.replace(/\b0+/g, '')
      formatted.saldo_stickers = formatted.saldo_stickers.replace(/\b0+/g, '').length === 0 ? 0 : formatted.saldo_stickers.replace(/\b0+/g, '')

      setFormattedUserPoints(formatted)
    }
  }, [])

  useEffect(() => {
    if (product) {
      getProduct({
        variables: {
          identifier: {
            field: 'id',
            value: product.productId
          }
        }
      })
    }
  }, [product])

  useEffect(() => {
    if (productData?.product?.items[0]?.productSpecifications) {
      const specifications = productData?.product?.items[0]?.productSpecifications

      const megaPromoProperty = specifications.find(
        (item: any) => item.fieldName === 'mega-promo'
      )

      if (megaPromoProperty) {
        const promoItem: Promo =
          megaPromoProperty?.fieldValues[0] &&
          JSON.parse(megaPromoProperty.fieldValues[0])

        setPromo(promoItem)
      }
    }
  }, [productData])

  const getCheckoutOrderForm = async () => {
    const orderFormId = localStorage.getItem("orderFormId") ? localStorage.getItem("orderFormId") : (orderForm && orderForm?.id!=="default-order-form" ? orderForm.id : null)
    if(!orderFormId) return
    localStorage.setItem("orderFormId", orderFormId)
    const { data: orderData } = await axios.get(`/api/checkout/pub/orderForm/${orderFormId}`)
    setCheckoutOrderForm(orderData)
  }

  const handleCloseModal = useCallback((evt) => {
    evt.stopPropagation()
    evt.preventDefault()

    dispatch?.({ type: 'CLOSE_MODAL' })
  }, [])

  const selectModalContent = useCallback(
    (componentProps: any) => {
      if (!localStorage) {
        return
      }

      const selectedSla = localStorage.getItem('shippingData')

      if (!selectedSla) {
        return <AddressModal {...componentProps} />
      }

      if (!data || !data.profile) {
        return notLoggedIn
      }

      if (!data.profile.document) {
        return noDocumentRegistered
      }

      if(!formattedUserPoints){
        const userPoints = localStorage?.getItem('megaCanjeUser')

        if (userPoints) {
          const formatted = JSON.parse(userPoints)
    
          formatted.saldo_puntos = String(formatted.saldo_puntos).replace(/\b0+/g, '').length === 0 ? 0 : String(formatted.saldo_puntos).replace(/\b0+/g, '')
          formatted.saldo_stickers = String(formatted.saldo_stickers).replace(/\b0+/g, '').length === 0 ? 0 : String(formatted.saldo_stickers).replace(/\b0+/g, '')
    
          setFormattedUserPoints(formatted)
        }
      }


      return notEnoughPoints
    },
    [data, orderForm, checkoutOrderForm, formattedUserPoints, selectedQuantity]
  )

  const notEnoughPoints = (
    <>
     <div className={handles.modal_image}>
        <img className={handles.img_nostick} src={noStickers} alt="stickers" /> 
      </div>
      <p className={handles.modal__paragraph}>
      Sigue acumulando tus stickers virtuales y puntos <img className={handles.img_bonus} src={Bonus} alt="bonus" /> con tus compras en <strong>Metro.pe</strong>
      </p>
      <p className={handles.modal__paragraph__nopoints}>
       Aún no tienes los puntos y/o stickers suficientes.
      </p>
      <div className={handles.modal_missing_points}>
     <p className={handles.modal__paragraph_points}>
       <strong>Necesitas en total:</strong> <br></br>
       {(selectedQuantity && promo) && promo?.puntos * selectedQuantity} Puntos y {(selectedQuantity && promo) && promo?.stickers * selectedQuantity} Stickers
     </p>
     </div>
      <button
        className={handles.modal__button__nopoints}
        onClick={(evt) => handleCloseModal(evt)}
      >
        X
      </button>
    </>
  )

  const notLoggedIn = (
    <>
      <h1 className={handles.modal__title}>
        ¡Lo sentimos, no se puede agregar el producto!
      </h1>
      <p className={handles.modal__paragraph}>
        Debes estar logueado y tener tu DNI registrado.
      </p>
      <p className={handles.modal__paragraph}>¿Quieres loguearte ahora?</p>
      <a className={handles.modal__button} href="/account">
        ACEPTAR
      </a>
    </>
  )

  const noDocumentRegistered = (
    <>
      <h1 className={handles.modal__title}>
        ¡Lo sentimos, no se puede agregar el producto!
      </h1>
      <p className={handles.modal__paragraph}>
        Se necesita su documento de identidad.
      </p>
      <p className={handles.modal__paragraph}>¿Quiere actualizarlo ahora?</p>
      <a className={handles.modal__button} href="/account">
        ACEPTAR
      </a>
    </>
  )

  return (
    <>
      <Modal>
        <ModalContent>
          {window.localStorage && selectModalContent(props)}
        </ModalContent>
      </Modal>
      <AddToCartButton {...props} />
    </>
  )
}

const WithContext = (props: Props) => {
  return (
    <ModalContextProvider>
      <ShopSelectProvider>
        <LoginModal {...props} />
      </ShopSelectProvider>
    </ModalContextProvider>
  )
}

export default WithContext