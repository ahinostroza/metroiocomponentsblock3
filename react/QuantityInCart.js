import React from 'react'
import { useEffect, useState } from 'react';
import { OrderForm } from 'vtex.order-manager';
import { useProduct, useProductDispatch } from 'vtex.product-context'
import { useCssHandles } from 'vtex.css-handles'

const { useOrderForm } = OrderForm
const CSS_HANDLES = [
    'iconCheck',
    'messageText',
    'qtyContainer',
    'agregando'
]

function QuantityInCart() {
    const { handles } = useCssHandles(CSS_HANDLES)

    const { orderForm } = useOrderForm()
    const productContextValue = useProduct()
    const orderformInfo = orderForm
    let productId = productContextValue?.product?.productId
    let qtyCart = 0
    let unitMultiplier = 1
    let totalresult = 0
    const oculto ={display:'none'} 
    if (orderformInfo.items.length > 0) {
        // if (localStorage.getItem("qtyCart")) {
        // let itemsInCart = JSON.parse(localStorage.getItem("qtyCart") || '[]');
        orderformInfo.items.forEach(item => {
            const idProductOF = item.productId
            if (idProductOF == productId) {
                qtyCart = item.quantity
                unitMultiplier = item.unitMultiplier
                totalresult = (qtyCart * unitMultiplier).toFixed(2)
                totalresult = totalresult.replace(/\.00$/, '');
            }
        })
        // }
    }

    let app = () => (
        <>
        <div className={`${handles.qtyContainer}` } style={oculto} id={`green-${productId}`}>
        </div>
        </>
    )

    if (qtyCart) {
        app = () => (
            <>
                <div className={`${handles.qtyContainer}` } id={`green-${productId}`}>
                    <img className={handles.iconCheck} src="/arquivos/icon-check-green-cart.png" /> <span className={handles.messageText}>{totalresult}  en el carrito</span>
                </div>
            </>
        )
    }

    return <>{app()}</>
}

export default QuantityInCart
