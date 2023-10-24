import React, { useEffect, useState } from "react";
import { useProduct } from 'vtex.product-context'
import ImageFlag from '../ImageFlag'

const PdpFlagsRight = () => {
  const productContext = useProduct()
  const product = productContext?.product
  const productClusters = product?.clusterHighlights
  const [arrayFlagsHightLight, setArrayFlagsHightLight] = useState<any[]>([])

  const getPositionRight = (highlight: string) => {
    let isRight = false
    if (highlight.includes('[right-')) {
      isRight = true
    }
    return isRight
  }

  useEffect(() => {
    const flags: React.SetStateAction<any[]>=[]
    productClusters?.map((cluster: any) => {
      const Higlight = cluster?.name
      
      if(Higlight){
        if (Higlight.includes('TagColl') && getPositionRight(Higlight)) {
          flags.push(Higlight)
        } 
      }
    })
    setArrayFlagsHightLight(flags)
  }, [productClusters])

  const getEspecifiOcto=()=>{
    let hayoctogono=null
    product?.specificationGroups?.map((ele:any)=>{
      if(ele.originalName==="allSpecifications"&&ele.name==="allSpecifications"){
        const allSpecifications=ele.specifications
        allSpecifications?.map((elem:any)=>{
          if(elem.name==="Octogonos"&&elem.originalName==="Octogonos"){
            hayoctogono='oct1'
            if(elem.values=='AZUCAR/GRASAS-SAT/GRASAS-TRANS'){
                hayoctogono='oct2'
            }
            if(elem.values=='SODIO/AZUCAR/GRASAS-SAT/GRASAS-TRA'&&
              elem.values=='SODIO/AZUCAR/GRASAS-SAT/GRASAS-TRANS'&&
              elem.values=='AZUCAR/SODIO/GRASAS-SAT/GRASAS-TRANS'){
                hayoctogono='oct3'
            }
          }
        })
      }
    })
    return hayoctogono
  }
  return (
    <ImageFlag
      arrayFlags={arrayFlagsHightLight}
      position='right'
      hayOctogonos={getEspecifiOcto()}
      productId={product?.productId}
    />
  )
}

export default PdpFlagsRight
