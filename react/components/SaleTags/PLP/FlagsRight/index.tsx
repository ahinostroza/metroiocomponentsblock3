import React from "react";
import {useProduct} from 'vtex.product-context'

const PlpFlagsRight=()=>{
    const productContext=useProduct()
    const product =productContext?.product
    const productClusters=product?.clusterHighlights

    const matchOption=new RegExp(/\[(.*?)\]/g)
    const matchImage=new RegExp(/\(([^()]*)\)/g)

    const getPositionRight=(highlight:string)=>{
        let isRight=false
        if(highlight.includes('[right-')){
            isRight=true
        }
        return isRight
    }

    const getFit=(highlight:string)=>{
        const option=highlight.match(matchOption)
        const formatOption=option?.toString().substring(1,option.toString().length-1)
        const fit=formatOption?.split('-')[3]
        return  fit
    }

    const getScala=(highlight:string)=>{
        const option=highlight.match(matchOption)
        const formatOption=option?.toString().substring(1,option.toString().length-1)
        const scala=formatOption?.split('-')[2]
        const scalaVal1=scala?.split(':')[0]
        const scalaVal2=scala?.split(':')[1]

        return `${scalaVal1}-${scalaVal2}`
    }

    const getWidth=()=>{
        const screenWidth=window?.screen?.width
        return screenWidth
    }

    const getImage=(highlight:string)=>{
        const imageData=highlight.match(matchImage)
        const imageName=imageData?.toString().substring(1,imageData?.toString().length-1)
        return `${imageName}.png`
    }
    const getImageMobile=(highlight:string)=>{
        const imageData=highlight.match(matchImage)
        const imageName=imageData?.toString().substring(1,imageData?.toString().length-1)
        return `${imageName}-mobile.png`
    }
    return (
        <>
        {
            productClusters?.map((cluster:any)=>{
                const Higlight=cluster.name
                const escala=getScala(Higlight)
                const fitt=getFit(Higlight)
                if(Higlight.includes('TagColl')&&getPositionRight(Higlight)){
                    if(getWidth()>960){
                        return(<img 
                            style={{
                                aspectRatio:escala,
                                width:'100%',
                                objectFit:  fitt?.includes('scale')?'scale-down':
                                            fitt?.includes('cover')?'cover':
                                            fitt?.includes('contain')?'contain':
                                            fitt?.includes('fill')?'fill':
                                            'initial',
                                objectPosition:'right'}}
                            src={`/arquivos/${getImage(Higlight)}`}
                            loading="lazy"
                        />)
                    }else{
                        return(<img 
                            style={{
                                aspectRatio:escala,
                                width:'100%',
                                objectFit:  fitt?.includes('scale')?'scale-down':
                                            fitt?.includes('cover')?'cover':
                                            fitt?.includes('contain')?'contain':
                                            fitt?.includes('fill')?'fill':
                                            'initial',
                                objectPosition:'right'
                            }}
                            src={`/arquivos/${getImageMobile(Higlight)}`}
                            loading="lazy"
                        />)
                    }
                }else{
                    return(<></>)
                } 
            })
        }
        </>
    )
}

export default PlpFlagsRight