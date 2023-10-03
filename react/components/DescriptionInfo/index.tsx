import React, { useEffect, useState } from 'react'
import { useProduct } from 'vtex.product-context'
import { Helmet } from "react-helmet"

const DescriptionInfo = () => {
  const modelpattern = /\ [A-Z|1-9][A-Z\-0-9]{5,}/
  const product = useProduct()
  const [mpn, setMpn] = useState<any>("")
  const [ean, setEan] = useState<any>("")
  const [brand, setBrand] = useState<any>("")

  const settingMedia = (product: any) => {
    if (!window?.document || !product?.selectedItem?.name) return

    const modelMatch = product.selectedItem.name.match(modelpattern)
    let model = product?.product?.properties?.filter((prop: any) => prop.name === 'Modelo')[0]?.values?.filter((value: any) => value)[0]
    model = model ?? (modelMatch ? modelMatch[0].trim() : "")

    setMpn(model)
    setEan(product?.product?.items[0]?.ean || "")
    setBrand(product?.product?.brand?.toUpperCase() || "")
  }

  useEffect(() => {
    settingMedia(product)
  }, [product])

  return (
    <>
      {
        brand !== '' ? (
          <Helmet>
            <style>
              {
                `
                #flix-inpage { width: 80%; }
                @media only screen and (max-width:768px) {
                  #flix-std-inpage.flix-samsung-t3 .flix-std-content {
                    position:absolute !important;
                  }
                }
                `
              }
            </style>
            <script type="text/javascript"
              data-flix-distributor="14289"
              data-flix-language="pe"
              data-flix-fallback-language="t2"
              data-flix-brand={brand}
              data-flix-ean={ean}
              data-flix-mpn={mpn}
              data-flix-inpage="flix-inpage"
              data-flix-button="flix-minisite"
              data-flix-price=""
              src="//media.flixfacts.com/js/loader.js">
            </script>
          </Helmet>
        ) : <></>
      }
    </>
  )
}

export default DescriptionInfo