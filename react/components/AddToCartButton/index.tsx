import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useLazyQuery } from 'react-apollo'
import { useModalDispatch } from 'vtex.modal-layout/ModalContext'
import { useProduct, useProductDispatch } from 'vtex.product-context'
import { FormattedMessage, MessageDescriptor, useIntl, defineMessages } from 'react-intl'
import { Button, Tooltip } from 'vtex.styleguide'
import { Utils } from 'vtex.checkout-resources'
import { useCssHandles } from 'vtex.css-handles'
import { useRuntime } from 'vtex.render-runtime'
import { usePixel } from 'vtex.pixel-manager'
import { usePWA } from 'vtex.store-resources/PWAContext'
import { useOrderItems } from 'vtex.order-items/OrderItems'
import { CartItem } from '../../modules/catalogItemToCart'
import { OrderForm } from 'vtex.order-manager'
import { ProductContextState } from 'vtex.product-context/react/ProductTypes'
import useMarketingSessionParams from '../../hooks/useMarketingSessionParams'
import axios from 'axios'
import GET_PROFILE from '../../graphql/getProfile.gql'
import GET_PRODUCT from '../../graphql/GetProduct.gql'

interface User {
  name: string
  document: string
}

interface ProductLink {
  linkText?: string
  productId?: string
}

interface Points {
  apellido_paterno: string
  codigo_error: string
  descripcion_error: string
  estado_afiliado: string
  primer_nombre: string
  saldo_puntos: string
  saldo_stickers: string
}

export interface Props {
  isOneClickBuy: boolean
  available: boolean
  disabled: boolean
  multipleAvailableSKUs: boolean
  customToastUrl?: string
  customOneClickBuyLink?: string
  skuItems: CartItem[]
  showToast: Function
  allSkuVariationsSelected: boolean
  text?: string
  unavailableText?: string
  productLink: ProductLink
  onClickBehavior: 'add-to-cart' | 'go-to-product-page' | 'ensure-sku-selection'
  customPixelEventId?: string
  addToCartFeedback?: 'customEvent' | 'toast'
  onClickEventPropagation: 'disabled' | 'enabled'
}

// We apply a fake loading to accidental consecutive clicks on the button
const FAKE_LOADING_DURATION = 500

function getFakeLoadingDuration(isOneClickBuy: boolean) {
  return isOneClickBuy ? FAKE_LOADING_DURATION * 10 : FAKE_LOADING_DURATION
}

const CSS_HANDLES = [
  'buyButtonContainer',
  'buttonText',
  'buttonDataContainer',
  'tooltipLabelText',
] as const

const messages = defineMessages({
  success: { id: 'store/add-to-cart.success' },
  duplicate: { id: 'store/add-to-cart.duplicate' },
  error: { id: 'store/add-to-cart.failure' },
  seeCart: { id: 'store/add-to-cart.see-cart' },
  skuVariations: {
    id: 'store/add-to-cart.select-sku-variations',
  },
  schemaTitle: { id: 'admin/editor.add-to-cart.title' },
  schemaTextTitle: { id: 'admin/editor.add-to-cart.text.title' },
  schemaTextDescription: { id: 'admin/editor.add-to-cart.text.description' },
  schemaUnavailableTextTitle: {
    id: 'admin/editor.add-to-cart.text-unavailable.title',
  },
  schemaUnavailableTextDescription: {
    id: 'admin/editor.add-to-cart.text-unavailable.description',
  },
})

const options = {
  allowedOutdatedData: ['paymentData'],
}

const mapSkuItemForPixelEvent = (skuItem: CartItem) => {
  // Changes this `/Apparel & Accessories/Clothing/Tops/`
  // to this `Apparel & Accessories/Clothing/Tops`
  const category = skuItem.category ? skuItem.category.slice(1, -1) : ''

  return {
    skuId: skuItem.id,
    ean: skuItem.ean,
    variant: skuItem.variant,
    price: skuItem.price,
    sellingPrice: skuItem.sellingPrice,
    priceIsInt: true,
    name: skuItem.name,
    quantity: skuItem.quantity,
    productId: skuItem.productId,
    productRefId: skuItem.productRefId,
    brand: skuItem.brand,
    category,
    detailUrl: skuItem.detailUrl,
    imageUrl: skuItem.imageUrl,
    referenceId: skuItem?.referenceId?.[0]?.Value,
    seller: skuItem.seller,
    sellerName: skuItem.sellerName,
  }
}

function AddToCartButton(props: Props) {
  const {
    text,
    isOneClickBuy,
    available,
    disabled,
    skuItems,
    showToast,
    customToastUrl,
    unavailableText,
    customOneClickBuyLink,
    allSkuVariationsSelected = true,
    productLink,
    onClickBehavior,
    multipleAvailableSKUs,
    customPixelEventId,
    addToCartFeedback,
    onClickEventPropagation = 'disabled',
  } = props

  const [isMegapromo, setIsMegapromo] = useState<boolean>()
  const [megaProduct, setMegaProduct] = useState<any>()
  const [isSuccess, setIsSuccess] = useState<boolean>(false)
  const [user, setUser] = useState<User>()
  const [userPoints, setUserPoints] = useState<Points>()

  const { useOrderForm } = OrderForm
  const { orderForm } = useOrderForm()

  const intl = useIntl()
  const { handles } = useCssHandles(CSS_HANDLES)
  const { addItems } = useOrderItems()
  const productContextDispatch = useProductDispatch()
  const { rootPath = '', navigate } = useRuntime()
  const { url: checkoutURL, major } = Utils.useCheckoutURL()
  const { push } = usePixel()
  const { settings = {}, showInstallPrompt = undefined } = usePWA() || {}
  const { promptOnCustomEvent } = settings
  const { utmParams, utmiParams } = useMarketingSessionParams()
  const [isFakeLoading, setFakeLoading] = useState(false)
  const translateMessage = (message: MessageDescriptor) =>
    intl.formatMessage(message)

  const productContext = useProduct()
  const product = productContext?.product
  const selectedQuantity = productContext?.selectedQuantity
  const dispatch = useModalDispatch()
  const { account } = useRuntime()
  // collect toast and fake loading delay timers
  const timers = useRef<Record<string, number | undefined>>({})
  const { updateQuantity } = useOrderItems()

  const [getProduct, { data: productData }] = useLazyQuery(GET_PRODUCT)


  // prevent timers from doing something if the component was unmounted
  useEffect(function onUnmount() {
    return () => {
      // We disable the eslint rule because we just want to clear the current existing timers
      // eslint-disable-next-line react-hooks/exhaustive-deps
      Object.values(timers.current).forEach(clearTimeout)
    }
  }, [])

  useEffect(() => {
    const currentTimers = timers.current

    if (isFakeLoading) {
      currentTimers.loading = window.setTimeout(
        () => setFakeLoading(false),
        getFakeLoadingDuration(isOneClickBuy)
      )
    }
  }, [isFakeLoading, isOneClickBuy])

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
        setIsMegapromo(true)
        setMegaProduct(JSON.parse(megaPromoProperty.fieldValues[0]))
      }
    }

    let elementContainer = document.querySelectorAll(".vtex-product-summary-2-x-element")
    setTimeout(function(){
    elementContainer.forEach(function(elemento ) {
      let precioMega = elemento.querySelector(".prod-mega")
      if(precioMega){
        let precioregular = elemento.querySelector(".vtex-flex-layout-0-x-flexRow--row-precios-shelf") as HTMLElement
        let priceContainerSearch = elemento.querySelector(".vtex-product-summary-2-x-priceContainer") as HTMLElement
        let precioregularSearch = elemento.querySelector(".vtex-product-price-1-x-sellingPrice") as HTMLElement
        let preciolista = elemento.querySelector(".vtex-product-price-1-x-listPrice--summary") as HTMLElement
        let priceTcencoQA = elemento.querySelector(".tCenco-prod") as HTMLElement;
       
        if(precioregular != null) {
          precioregular.style.display='none'
        }
        if(precioregularSearch != null) {
          precioregularSearch.style.display='none'
        }
        if(priceContainerSearch != null) {
          priceContainerSearch.style.display='none'
        }

        if(preciolista != null) {
          preciolista.style.display='none'
        }
        
        if (priceTcencoQA != null) {
          priceTcencoQA.style.display='none'
        }
      }
      
    });
  },1500)

  }, [productData])

  const [getUsers, { data }] = useLazyQuery(GET_PROFILE)

  useEffect(() => {
    getUsers()

    if (data && data.profile) {
      setUser(data.profile)
    }
  }, [data])

  useEffect(() => {
    const cachedUserPoints = localStorage.getItem('megaCanjeUser')

    if (!userPoints && user) {
      (async () => {
        const points = await getUserPoints()

        setUserPoints(points)
      })()
    }

    if (cachedUserPoints) {
      setUserPoints(JSON.parse(cachedUserPoints))
    }
  }, [user])

  const resolveToastMessage = (success: boolean) => {
    if (!success) return translateMessage(messages.error)

    setIsSuccess(true)
    setTimeout(() => {
      setIsSuccess(false)
    }, 2000)

    return translateMessage(messages.success)
  }

  const toastMessage = ({ success }: { success: boolean }) => {
    const message = resolveToastMessage(success)

    const action = success
      ? { label: translateMessage(messages.seeCart), href: customToastUrl }
      : undefined

    showToast({ message, action })
  }

  const handleChangeSlas = async (sla: any) => {
    const { data: checkoutOrderForm } = await axios.get(`/api/checkout/pub/orderForm/${orderForm?.id}`)
    const { logisticsInfo } = checkoutOrderForm.shippingData
    if(logisticsInfo.length <= 0) return
    if(!sla || (sla && !sla.selectedDeliveryChannel) || (sla && !sla.selectedSla)) return

    checkoutOrderForm.shippingData.logisticsInfo[logisticsInfo.length - 1].selectedDeliveryChannel = sla.selectedDeliveryChannel
    checkoutOrderForm.shippingData.logisticsInfo[logisticsInfo.length - 1].selectedSla = sla.selectedSla
    let hasNullSla = false
    checkoutOrderForm.shippingData.logisticsInfo.map( (item:any) => {
      if(!item || (item && !item.selectedSla)) hasNullSla = true
    })
    if(hasNullSla) return
    await axios.post(`/api/checkout/pub/orderForm/${orderForm.id}/attachments/shippingData`, checkoutOrderForm.shippingData)
  }
  const handleAddToCart = async (event: React.MouseEvent) => {
    const orderFormId = orderForm?.id
    if (orderFormId && orderFormId !== "default-order-form") localStorage.setItem("orderFormId", orderFormId)
    if (productContext) {
      if (productContext.product) {
        const cajita = document.getElementById(`green-${productContext.product?.productId}`)
        if(cajita) cajita.classList.add("metroio-wongfoodapps-1-x-agregando")

        productContext.product.productClusters.forEach(idColeccion => {
          let backOptions = JSON.parse(localStorage.getItem("backOptions") || '{}')
          let count = 0
          if (backOptions?.options && backOptions?.options[0]) {
            if (idColeccion.id == backOptions.options[0].coleccion) {
              if (backOptions.inCart.length > 0) {
                backOptions.inCart.forEach(function (d: { name: string, id: string, option: string, quantity: number }) {
                    if (productContext.selectedItem) {
                      if (d.id === productContext.selectedItem.itemId) {
                        count++
                        d.quantity = productContext.selectedQuantity!
                      }
                    }
                  })
              } else {
                if (productContext.selectedItem) {
                  count++;
                  let prodToAdd = { "id": productContext.selectedItem.itemId, "option": idColeccion.id, "price": productContext.product?.priceRange.sellingPrice.lowPrice, "quantity": productContext.selectedQuantity }
                  backOptions.inCart.push(prodToAdd);
                }
              }

              if (count === 0) {
                if (productContext.selectedItem) {
                  let prodToAdd = { "id": productContext.selectedItem.itemId, "option": idColeccion.id, "price": productContext.product?.priceRange.sellingPrice.lowPrice, "quantity": productContext.selectedQuantity }
                  backOptions.inCart.push(prodToAdd);
                }
              }

              localStorage.setItem("backOptions", JSON.stringify(backOptions));
            }
          }
        })
        setTimeout(function () { checkProds(orderForm.id, account, productContext, productContext.selectedQuantity) }, 2000)
        if (productContextDispatch) {
          productContextDispatch({
            type: 'SET_QUANTITY',
            args: { quantity: 1 },
          })
        }
      }
    }

    if (onClickEventPropagation === 'disabled') {
      event.stopPropagation()
      event.preventDefault()
    }

    setFakeLoading(true)

    const productLinkIsValid = Boolean(productLink.linkText && productLink.productId)
    const shouldNavigateToProductPage = onClickBehavior === 'go-to-product-page' || (onClickBehavior === 'ensure-sku-selection' && multipleAvailableSKUs)
    if (productLinkIsValid && shouldNavigateToProductPage) {
      navigate({
        page: 'store.product',
        params: {
          slug: productLink.linkText,
          id: productLink.productId,
        },
      })
      return
    }

    const pixelEventItems = skuItems.map(mapSkuItemForPixelEvent)
    const pixelEvent =
      customPixelEventId && addToCartFeedback === 'customEvent'
        ? {
          id: customPixelEventId,
          event: 'addToCart',
          items: pixelEventItems,
        }
        : {
          event: 'addToCart',
          items: pixelEventItems,
        }

    // @ts-expect-error the event is not typed in pixel-manager
    push(pixelEvent)
    if (isOneClickBuy) {
      const addItemsPromise = addItems(skuItems, {
        marketingData: { ...utmParams, ...utmiParams },
        ...options,
      })
      await addItemsPromise

      if (major > 0 && (!customOneClickBuyLink || customOneClickBuyLink === checkoutURL)) {
        navigate({ to: checkoutURL })
      } else {
        window.location.assign(`${rootPath}${customOneClickBuyLink ?? checkoutURL}`)
      }
    } else if(orderForm && orderForm.loggedIn){
      await addItems(skuItems, {
        marketingData: { ...utmParams, ...utmiParams },
        ...options,
      })
    }

    addToCartFeedback === 'toast' &&
      (timers.current.toast = window.setTimeout(() => {
        toastMessage({ success: true })
      }, FAKE_LOADING_DURATION))

    /* PWA */
    if (promptOnCustomEvent === 'addToCart' && showInstallPrompt) {
      showInstallPrompt()
    }
  }
  const checkProds = async (d: any, account: string, itemi: Partial<ProductContextState>, quantity: number | undefined) => {
    const response = await axios.get(`/api/checkout/pub/orderForm/${d}`)
    const { data } = response
    let qtyCart: { id: any; quantity: number | undefined, unitMultiplier: number | undefined }[] = []
    if (!localStorage.getItem("qtyCart")) {
      localStorage.setItem("qtyCart", JSON.stringify(qtyCart));
    } else {
      qtyCart = JSON.parse(localStorage.getItem("qtyCart") || '[]');
    }
    if (data && data.items) {
      data.items.forEach(
        async function (item: any) {
          if (item.productId == itemi.product?.productId) {
            if (quantity != item.quantity) {
              quantity = item.quantity
            }
            const respuesta = await checkCartLimits(item, account, quantity)
            if (respuesta) {
              updateQuantity(respuesta, options)
              let cajita = document.getElementById(`green-${itemi.product?.productId}`)
              if (cajita) cajita.classList.remove("metroio-wongfoodapps-1-x-agregando");
              if(item.productId){     
                let QtyToAdd = { "id":item.productId, "quantity":respuesta?.quantity, "unitMultiplier":item.unitMultiplier}
                const chequeo =  qtyCart.length && qtyCart.filter(e=> e.id == item.productId) || []
                if(chequeo.length === 0){
                  qtyCart.push(QtyToAdd);
                  localStorage.setItem("qtyCart", JSON.stringify(qtyCart));
                } else {
                  qtyCart = qtyCart.filter(item => item !== chequeo[0])
                  qtyCart.push(QtyToAdd)
                  localStorage.setItem("qtyCart", JSON.stringify(qtyCart));
                }
              }
            }
          }
        }
      )
    }
  }
  const checkCartLimits = async (e: { uniqueId: any; ean: any; sellerChain: any; quantity: any; } | undefined, account: string, quantiti: number | undefined) => {
    try {
      const ean = e?.ean
      const sellerChain = e?.sellerChain
      let quantity = quantiti
      let uniqueId = e?.uniqueId

      //Boolean true es non-food, false es food
      //wongiot food
      //wongiovv nonfood
      //wongioventaenverde nonfood
      //wongiononfood nonfood
      let check = account == 'wongfoodqawlschv6io' ?
        sellerChain && sellerChain.some((e: string) => e == 'wongfoodqawlschv6iowfqawlwong' || e == 'wongfoodqawlschv6iowfqawlvv') :
        sellerChain && sellerChain.length > 1 &&
        (sellerChain.length>1 && sellerChain[1].startsWith('wongiovv')) ||
        (sellerChain.length>1 && sellerChain[1].startsWith('wongioventaenverde')) ||
        (sellerChain.length>1 && sellerChain[1].startsWith('wongioventaverde')) ||
        (sellerChain.length>1 && sellerChain[1].startsWith('wongiononfood'))

      const url = account == 'wongfoodqawlschv6io' ?
        `https://api.test.smdigital.pe/qa/v1/pe/wm/service-mdw-masterdata/janis/sku?store=${account}&ean=${ean}` :
        `https://api.smdigital.pe/v1/pe/wm/service-mdw-masterdata/janis/sku?store=wongio&ean=${ean}`

      const response = await axios.get(url, { headers: account == 'wongfoodqawlschv6io' ? { 'x-apikey': 'smsOXtQukjSQogz2iu7foMoCiip7cEVa' } : { 'x-apikey': 'f9ImhJN3dSv0KZTaJzVngIMfJ0pDpmZq' } });
      const { data } = response
      const cart_limit = data && data.sku ? data.sku.cart_limit : '0'

      if (check && Number(cart_limit) == 0) {
        let availableQuantity = 10
        if (quantity != undefined && quantity > availableQuantity) {
          quantity = availableQuantity
        }
        return ({ uniqueId, quantity })
      }
      if (!check && Number(cart_limit) == 0) {
        let availableQuantity = 24
        if (quantity != undefined && quantity > availableQuantity) {
          quantity = availableQuantity
        }
        return ({ uniqueId, quantity })
      }
      if (Number(cart_limit) !== 0) {
        if (quantity != undefined && quantity > cart_limit) {
          quantity = cart_limit
        }
        return ({ uniqueId, quantity })
      }
      return
    } catch (error) {
      console.error(error)
      return
    }
  }
  const handleOpenModal = useCallback((evt) => {
    evt.stopPropagation()
    evt.preventDefault()

    dispatch?.({ type: 'OPEN_MODAL' })
  }, [])

  const authenticateUserPointsAPI = useCallback(async () => {
    const headers = {
      'x-apikey': '5rhhIGUeM4xrYsIMGE4vEX4Q4qyCXQqT',
      client_id: 'a6596ed377f648dc93a22515e0bf0fc9',

      'content-type': 'application/json',

      password: 'kK93eaEyca2Nrju',

      username: '1709046692',
    }
    const host = window.location.host.split(".")[0]
    let urlEndpoint = getHost(host)


    const { data } = await axios.post(
      `${urlEndpoint}cencoecommerce/oauth/access_token`,

      {},

      {
        headers,
      }
    )

    return data
  }, [])

  const getHost = (host: string | string[]) => {
    if (host.indexOf("wongfoodqawlschv6io") != -1) {
      return "https://api.smdigital.pe/dev/v1/pe/"
    } else if (host.indexOf("wongio") != -1) {
      return "https://api.smdigital.pe/v1/pe/"
    } else if (host.indexOf("metroqaio") != -1) {
      return "https://api.smdigital.pe/dev/v1/pe/"
    } else if (host.indexOf("metroio") != -1) {
      return "https://api.smdigital.pe/v1/pe/"
    } else {
      return "https://api.smdigital.pe/v1/pe/"
    }
  }

  const getUserPoints = useCallback(async () => {
    if (user) {
      const { access_token } = await authenticateUserPointsAPI()

      const headers = {
        'x-apikey': '5rhhIGUeM4xrYsIMGE4vEX4Q4qyCXQqT',
        authorization: `OAuth ${access_token}`,

        'content-type': 'application/json',
      }

      const body = {
        tarjeta_dni: `DNI-${user.document}`,

        tipo_trama: '0001',

        punto_venta: '1030',

        cajera: 'WONGPE',

        id_trazabilidad: '01234567890123456789',
      }
      const host = window.location.host.split(".")[0]
      let urlEndpoint = getHost(host)
      const response = await axios.post(
        `${urlEndpoint}cencoecommerce/rest/consulta`,

        body,

        {
          headers,
        }
      )

      return response.data
    }
  }, [])

  const handleMegaPromo = (e: any, user: any) => {
    if (!selectedQuantity) return

    const cachedUserPoints = localStorage.getItem('megaCanjeUser')
    const formattedUserPoints = cachedUserPoints && JSON.parse(cachedUserPoints)

    const notLoggedInOrNoDNI = !user || !user.document
    const notEnoughPoints =
      (megaProduct.puntos * selectedQuantity) > formattedUserPoints?.saldo_puntos ||
      (megaProduct.stickers * selectedQuantity) > formattedUserPoints?.saldo_stickers

    const selectedAddress = localStorage.getItem("shippingData")

    if (notLoggedInOrNoDNI || notEnoughPoints || !selectedAddress || !cachedUserPoints) {
      handleOpenModal(e)
    } else {
      if (productContextDispatch) {
        productContextDispatch({
          type: 'SET_BUY_BUTTON_CLICKED',
          args: { clicked: true },
        })
      }

      if (allSkuVariationsSelected) {
        handleAddToCart(e)

        const updatedPointsAndStickers = Object.assign(formattedUserPoints, {
          saldo_puntos:
            formattedUserPoints &&
            String(+formattedUserPoints?.saldo_puntos - (megaProduct.puntos * selectedQuantity)),
          saldo_stickers:
            formattedUserPoints &&
            String(+formattedUserPoints?.saldo_stickers - (megaProduct.stickers * selectedQuantity)),
        })

        setUserPoints(updatedPointsAndStickers)
        localStorage.setItem(
          'megaCanjeUser',
          JSON.stringify(updatedPointsAndStickers)
        )
      }
    }
  }

  const handleClick = async (e: React.MouseEvent) => {
    e.persist()
    e.stopPropagation()
    e.preventDefault()

    const selectedSla = localStorage.getItem('shippingData')
    const formattedSla = selectedSla && JSON.parse(selectedSla)

    if (isMegapromo) {
      handleMegaPromo(e, user)
    } else if (!selectedSla) {
      handleOpenModal(e)
    } else {
      if (productContextDispatch) {
        productContextDispatch({
          type: 'SET_BUY_BUTTON_CLICKED',
          args: { clicked: true },
        })
      }

      if (allSkuVariationsSelected && selectedSla) {
        handleAddToCart(e)
        await handleChangeSlas(formattedSla)
      }
    }
    if (productContext&&!user && !isMegapromo) {
      let qtyCart:any=[]
      const item=productContext?.product
      const unit=item?.items[0].unitMultiplier
      const cuant=productContext.selectedQuantity
      let QtyToAdd = { "id": item?.productId, "quantity": cuant, "unitMultiplier": unit }
      if (QtyToAdd) {
        qtyCart.push(QtyToAdd);
        localStorage.setItem("qtyCart", JSON.stringify(qtyCart));
        const addItemsPromise = addItems(skuItems, {
          marketingData: { ...utmParams, ...utmiParams },
          ...options,
        })
        await addItemsPromise
      }
    }
  }

  /*
   * If text is an empty string it should render the default message
   */
  const availableButtonContent = (
    <div className={`${handles.buttonDataContainer} flex justify-center`}>
      {text ? (
        <span className={handles.buttonText}>{text}</span>
      ) : (
        <FormattedMessage id="store/add-to-cart.add-to-cart">
          {(message) => <span className={handles.buttonText}>{message}</span>}
        </FormattedMessage>
      )}
    </div>
  )

  const unavailableButtonContent = unavailableText ? (
    <span className={handles.buttonText}>{unavailableText}</span>
  ) : (
    <FormattedMessage id="store/add-to-cart.label-unavailable">
      {(message) => <span className={handles.buttonText}>{message}</span>}
    </FormattedMessage>
  )

  const tooltipLabel = (
    <span className={handles.tooltipLabelText}>
      {intl.formatMessage(messages.skuVariations)}
    </span>
  )

  const ButtonWithLabel = (
    <Button
      block
      isLoading={isFakeLoading}
      disabled={disabled || !available}
      onClick={handleClick}
    >
      {isSuccess ? "Agregado" : available ? availableButtonContent : unavailableButtonContent}
    </Button>
  )

  return allSkuVariationsSelected ? (
    ButtonWithLabel
  ) : (
    <Tooltip trigger="click" label={tooltipLabel}>
      {ButtonWithLabel}
    </Tooltip>
  )
}

export default AddToCartButton
