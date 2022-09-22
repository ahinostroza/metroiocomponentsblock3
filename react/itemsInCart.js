import React from 'react'
import { useEffect, useState } from 'react';
import { OrderForm } from 'vtex.order-manager';
import { useProduct, useProductDispatch } from 'vtex.product-context'
import { useCssHandles } from 'vtex.css-handles'
import axios from "axios";

const { useOrderForm } = OrderForm
const CSS_HANDLES = [
    'iconCheck',
    'textItems',
    'itemCartContainer',
    'agregando'
]

function itemsInCart() {
    const { handles } = useCssHandles(CSS_HANDLES)

    const { orderForm } = useOrderForm()
    const productContextValue = useProduct()
    const orderformInfo = orderForm
    // let productId = productContextValue?.product?.productId
    let cantproductos = orderformInfo.items.length
    let app = () => (
        <></>
    )
    if (cantproductos == 1) {
        app = () => (
            <>
                <div className={`${handles.itemCartContainer}`} >
                    <span className={handles.textItems}>Tienes {cantproductos} item</span>
                </div>
            </>
        )
    } else if (cantproductos > 1) {
        app = () => (
            <>
                <div className={`${handles.itemCartContainer}`} >
                    <span className={handles.textItems}>Tienes {cantproductos} items</span>
                </div>
            </>
        )
    }

    return <>{app()}</>
}

export default itemsInCart
