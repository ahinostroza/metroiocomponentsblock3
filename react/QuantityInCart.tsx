/* eslint-disable prettier/prettier */
/* eslint-disable array-callback-return */
/* eslint-disable no-console */
import React from 'react'
import { OrderForm } from 'vtex.order-manager';
import { useProduct } from 'vtex.product-context'
import { useCssHandles } from 'vtex.css-handles'

const { useOrderForm } = OrderForm
const CSS_HANDLES = [
  'iconCheck',
  'messageText',
  'qtyContainer'
]

const QuantityInCart = () => {
  const { handles } = useCssHandles(CSS_HANDLES)
  const { orderForm } = useOrderForm()

  const productContextValue = useProduct()
  const orderformInfo = orderForm
  const productId = productContextValue?.product?.productId

  let app = () => (<></>)

  if (!productContextValue || !orderformInfo.items.length)  return app

  const product = orderformInfo.items.filter((item:any) => item.productId == productId)
  if (!product.length)  return app
  if (!product[0].refId)  return app

  const quantity = product[0].quantity
  const unitMultiplier = product[0].unitMultiplier
  const measurementUnit = ((product[0].measurementUnit && product[0].measurementUnit === "kg") && product[0].measurementUnit) || " "
  const totalQuantity = (quantity * unitMultiplier).toFixed(2)

  if (totalQuantity) {
    app = () => (
      <>
        <div className={`${handles.qtyContainer}`} id={`green-${productId}`}>
          <img className={handles.iconCheck} src="/arquivos/icon-check-green-cart.png" /> <span className={handles.messageText}>{totalQuantity.replace(/\.00$/, '')} {measurementUnit} en el carrito</span>
        </div>
      </>
    )
  }

  return (
    <>
      {app()}
    </>
  )
}

export default QuantityInCart