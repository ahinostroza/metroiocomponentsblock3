import React from 'react'
import { useCssHandles } from 'vtex.css-handles'
import { useItemContext } from 'vtex.product-list/ItemContext'

const CSS_HANDLES = [
    'iconCheck',
    'pricexkg',
    'qtyContainer'
]

function MiniCartPricePerUnit() {
    const { handles } = useCssHandles(CSS_HANDLES)
    const { item } = useItemContext()
    return item && item?.measurementUnit === "kg" ? <span className={handles.pricexkg} > S / {(item?.price / 100).toFixed(2)} x {item?.measurementUnit}</span> : null
}

export default MiniCartPricePerUnit
