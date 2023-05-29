import React from 'react'
import { OrderForm } from 'vtex.order-manager'
import { useCssHandles } from 'vtex.css-handles'
//import { useEffect, useState } from 'react';
//import { useProduct, useProductDispatch } from 'vtex.product-context'
//import axios from "axios";

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

    const orderformInfo = orderForm

    const itemsID = [];
    const filterArray = () => {
      let findId = orderformInfo.items.filter((itemId) => {
          const duplicateID = itemsID.includes(itemId.productId);
          if (!duplicateID) {
            itemsID.push(itemId.productId);
            return true;
          }
          return false
      })
      return findId
    }
    const arrayProducts = filterArray()
    const arrayLength = arrayProducts.length
    let app = () => (
        <></>
    )
    if (arrayLength == 1) {
        app = () => (
            <>
                <div className={`${handles.itemCartContainer}`} >
                    <span className={handles.textItems}>Tienes {arrayLength} item</span>
                </div>
            </>
        )
    } else if (arrayLength > 1) {
        app = () => (
            <>
                <div className={`${handles.itemCartContainer}`} >
                    <span className={handles.textItems}>Tienes {arrayLength} items</span>
                </div>
            </>
        )
    }

    return <>{app()}</>
}

export default itemsInCart
