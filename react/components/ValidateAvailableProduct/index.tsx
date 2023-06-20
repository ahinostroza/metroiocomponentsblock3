import React, { useEffect } from "react";
import { useProduct } from 'vtex.product-context'
import  style  from "./style.css";

const ValidateAvailableProduct=()=>{
  const productContext = useProduct()
  const product = productContext?.product
  const haveHListPrices=product?.priceRange?.listPrice?.highPrice
  const haveHSellingPrices=product?.priceRange?.sellingPrice?.highPrice
  const haveLListPrices=product?.priceRange?.listPrice?.lowPrice
  const haveLSellingPrices=product?.priceRange?.sellingPrice?.lowPrice
  const productLink=product?.link
  useEffect(()=>{
    const productElement=window?.document?.querySelector(`.vtex-search-result-3-x-galleryItem--product-summary-plp a[href='${productLink}']`) as HTMLElement
    if(productElement&&haveHListPrices===0&&haveHSellingPrices===0&&haveLListPrices===null&&haveLSellingPrices===null){
      productElement?.classList.add(style.hiddeProductGallery)
    }
  },[haveHListPrices,haveHSellingPrices===0&&haveLListPrices,haveLSellingPrices===null])
  return(<></>)
}

export default ValidateAvailableProduct