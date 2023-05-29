import React, { useEffect, useState } from 'react'
import { Helmet } from "react-helmet";
import { useProduct } from 'vtex.product-context';

const DescriptionInfo = () => {
  const product = useProduct()
  const [mpn, setMpn] = useState<any>(null)
  const [brand, setBrand] = useState<any>(null)
  const insertAfter = (newNode: any, existingNode: any) => {
    existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
  }

  useEffect(() => {
    const container = window?.document?.createElement("div");
    container.id = "flix-minisite";
    setMpn(product?.selectedItem?.name.split('\"')[1] != undefined ? product?.selectedItem?.name.split('\"')[1].trim().toUpperCase() : null)
    setBrand(product?.product?.brand.toUpperCase())
    setTimeout(() => {
      insertAfter(container, window?.document?.getElementsByClassName('vtex-tab-layout-0-x-contentContainer')[0]);
    }, 1500)
  }, [])

  return (
    <>
      {
        mpn != null && brand != null ? (
          <Helmet>
            <script type="text/javascript"
              data-flix-distributor="12814"
              data-flix-language="pe"
              data-flix-fallback-language="t2"
              data-flix-brand={brand}
              data-flix-ean=""
              data-flix-mpn={mpn}
              data-flix-inpage="flix-inpage"
              data-flix-button="flix-minisite"
              data-flix-price=""
              src="//media.flixfacts.com/js/loader.js">
            </script>

            <style>
              {
                `
                  @media only screen and (max-width: 768px){
                    #flix-std-inpage.flix-samsung-t3 .flix-std-content{
                      position:absolute !important;
                    }
                  }
                  `
              }
            </style>
          </Helmet>
        ) : ''
      }
    </>
  )
}
export default DescriptionInfo