import React, { useEffect, useState } from "react";
import { useProduct } from 'vtex.product-context'
import ImageFlag from '../ImageFlag'

const PdpFlagsLeft = () => {
  const productContext = useProduct()
  const product = productContext?.product
  const productClusters = product?.clusterHighlights
  const [arrayFlagsHightLight, setArrayFlagsHightLight] = useState<any[]>([])
  const [totalTagPromo,setTotalTagPromo]=useState(0)
  const promotionSellers=productContext?.selectedItem?.sellers[0]

  const getPositionLeft = (highlight: string) => {
    let isLeft = false
    if (highlight.includes('[left-')) {
      isLeft = true
    }
    return isLeft
  }

  useEffect(() => {
    const flags: React.SetStateAction<any[]> = []
    productClusters?.map((cluster: any) => {
      const Higlight = cluster?.name
      if (Higlight) {
        const countryFlag=getCountryFlag(Higlight)
        if (Higlight.includes('TagColl') && getPositionLeft(Higlight)) {
          flags.push(Higlight)
        }
        if(countryFlag){
          flags.push(countryFlag)
        }
      }
    })
    setArrayFlagsHightLight(flags)
  }, [productClusters])

  useEffect(()=>{
    let totalTags=totalTagPromo
    const tagsPromotions=promotionSellers?.commertialOffer?.teasers?.filter((e:any)=>e.name.includes("Tag-"))||[]
    totalTags+=tagsPromotions.length
    setTotalTagPromo(totalTags)
  },[promotionSellers])

  const getCountryFlag=(higlightName:any)=>{
    if(higlightName=="Bandera Estados Unidos") return "[customFlag]bandera-eeuu"
    if(higlightName=="Bandera Espana") return "[customFlag]bandera-espana"
    if(higlightName=="Bandera Argentina") return "[customFlag]bandera-argentina"
    if(higlightName=="Bandera Bolivia") return "[customFlag]bandera-bolivia"
    if(higlightName=="Bandera Costa Rica") return "[customFlag]bandera-costa-rica"
    if(higlightName=="Bandera Escocia") return "[customFlag]bandera-escocia"
    if(higlightName=="Bandera Georgia") return "[customFlag]bandera-georgia"
    if(higlightName=="Bandera Guatemala") return "[customFlag]bandera-guatemala"
    if(higlightName=="Bandera India") return "[customFlag]bandera-india"
    if(higlightName=="Bandera Jamaica") return "[customFlag]bandera-jamaica"
    if(higlightName=="Bandera Japon") return "[customFlag]bandera-japon"
    if(higlightName=="Bandera Nicaragua") return "[customFlag]bandera-nicaragua"
    if(higlightName=="Bandera Panama") return "[customFlag]bandera-panama"
    if(higlightName=="Bandera Africa") return "[customFlag]bandera-africa"
    if(higlightName=="Bandera Chile") return "[customFlag]bandera-chile"
    if(higlightName=="Bandera Francia") return "[customFlag]bandera-francia"
    if(higlightName=="Bandera Italia") return "[customFlag]bandera-italia"
    if(higlightName=="Bandera Perú") return "[customFlag]bandera-peru"
    if(higlightName=="Bandera Portugal") return "[customFlag]bandera-portugal"
    if(higlightName=="Bandera Uruguay") return "[customFlag]bandera-uruguay"
    if(higlightName=="wong-exclusivo") return "[customFlag]exclusivo-wong"
    if(higlightName=="delivery") return "[customFlag]delivery-24"
    return false
  }

  const getEspecifiOcto = () => {
    let hayoctogono = null
    product?.specificationGroups?.map((ele: any) => {
      if (ele.originalName === "allSpecifications" && ele.name === "allSpecifications") {
        const allSpecifications = ele.specifications
        allSpecifications?.map((elem: any) => {
          if (elem.name === "Octogonos" && elem.originalName === "Octogonos") {
            hayoctogono = 'oct1'
            if (elem.values == 'AZUCAR/GRASAS-SAT/GRASAS-TRANS') {
              hayoctogono = 'oct2'
            }
            if (elem.values == 'SODIO/AZUCAR/GRASAS-SAT/GRASAS-TRA' &&
              elem.values == 'SODIO/AZUCAR/GRASAS-SAT/GRASAS-TRANS' &&
              elem.values == 'AZUCAR/SODIO/GRASAS-SAT/GRASAS-TRANS') {
              hayoctogono = 'oct3'
            }
          }
        })
      }
    })
    return hayoctogono
  }

  const validateThumbnail = () => {
    if (product && product?.items) {
      const elemento = product?.items[0]?.images
      if (elemento.length) {
        return true
      }
    }
    return false
  }

  return (
    <ImageFlag
      arrayFlags={arrayFlagsHightLight}
      position='left'
      hayOctogonos={getEspecifiOcto()}
      productId={product?.productId}
      haveTumbnail={validateThumbnail()}
      tagPromo={totalTagPromo}
    />
  )
}

export default PdpFlagsLeft
