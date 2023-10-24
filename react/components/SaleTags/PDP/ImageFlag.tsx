import React, { useEffect, useState } from "react";
import styles from '../styles/style.css'

const ImageFlag = ({arrayFlags,position, hayOctogonos, productId,haveTumbnail,tagPromo}:any) => {
  const [images,setImages]=useState([{}])
  const matchOption = new RegExp(/\[(.*?)\]/g)
  const matchImage = new RegExp(/\(([^()]*)\)/g)

  const imageOnLoad = (event: { currentTarget: { className: string; }; }) => {
    if (event.currentTarget.className !== "error") {
      event.currentTarget.className = "success"
    }
  };

  const imageOnError = (event: { currentTarget: { src: string; className: string; }; }) => {
    event.currentTarget.src = 'https://wongio.vtexassets.com/arquivos/pixel.png'
    event.currentTarget.className = "error"
  };

  const getFit = (highlight: string) => {
    const option = highlight?.match(matchOption)
    const formatOption = option?.toString().substring(1, option.toString().length - 1)
    const fit = formatOption?.split('-')[3]
    return fit
  }

  const getWidth = () => {
    const screenWidth = window?.screen?.width
    return screenWidth
  }

  const getScala = (highlight: string) => {
    const option = highlight?.match(matchOption)
    const formatOption = option?.toString().substring(1, option.toString().length - 1)
    const scala = formatOption?.split('-')[1]
    const scalaVal1 = scala?.split(':')[0]
    const scalaVal2 = scala?.split(':')[1]

    return `${scalaVal1}/${scalaVal2}`
  }

  const getImage = (highlight: string) => {
    const imageData = highlight?.match(matchImage)
    const imageName = !highlight.includes("[customFlag]")?imageData?.toString().substring(1, imageData?.toString().length - 1):highlight.replace("[customFlag]",'')
    return `${imageName}.png`
  }

  const getImageId = (highlight: string) => {
    const imageData = highlight?.match(matchImage)
    const imageName = !highlight.includes("[customFlag]")?imageData?.toString().substring(1, imageData?.toString().length - 1):"countryFlag"
    return imageName
  }

  const getImageMobile = (highlight: string) => {
    const imageData = highlight?.match(matchImage)
    const imageName = !highlight.includes("[customFlag]")?imageData?.toString().substring(1, imageData?.toString().length - 1):highlight.replace("[customFlag]",'')
    if(highlight.includes("[customFlag]")){
      return `${imageName}.png`
    }
    return `${imageName}-mobile.png`
  }

  const getOrderPosition=(highlight :string) => {
    let Op=''
    const highlightoption=highlight?.match(matchOption)

    if(highlightoption?.length){
      if(highlightoption[0]?.includes('O1')){
        Op='CAO1'
      }
      if(highlightoption[0]?.includes('O2')){
        Op='CAO2'
      }
      if(highlightoption[0]?.includes('O3')){
        Op='CAO3'
      }
      if(highlightoption[0]?.includes('O4')){
        Op='CAO4'
      }
      if(highlightoption[0]?.includes('PB')){
        Op+='CAPB'
      }
      if(highlightoption[0]?.includes('OI')){
        Op+='CAOI'
      }
    }
    return Op
  }

  useEffect(()=>{
    const imagesLeft: React.SetStateAction<undefined> | { id: string; key: any; style: { aspectRatio: string; width: string; objectFit: string; objectPosition: any; }; className: string; src: string; loading: string; onLoad: { imageOnLoad: (event: { currentTarget: { className: string; }; }) => void; }; onError: { imageOnError: (event: { currentTarget: { src: string; className: string; }; }) => void; }; }[]=[]
    arrayFlags?.map((cluster: any) => {
      const Higlight = String(cluster)
      const orderPosition = getOrderPosition(Higlight)
      const escala = getScala(Higlight)
      const fitt = getFit(Higlight)
      const image={
        id:`flag-${getImageId(Higlight)}-${productId}`,
        key:cluster,
        style:{
          aspectRatio: escala,
          width: 'fit-content',
          objectFit: fitt?.includes('scale') ? 'scale-down' :
            fitt?.includes('cover') ? 'cover' :
              fitt?.includes('contain') ? 'contain' :
                fitt?.includes('fill') ? 'fill' :
                  'initial',
          objectPosition: position,
          zIndex: 2
        },
        className:`wongio-wongiocompo3app-0-x-flag${getImageId(Higlight)} ${
          orderPosition?.length?
            orderPosition=='CAO1'?styles.CAO1:
            orderPosition=='CAO2'?styles.CAO2:
            orderPosition=='CAO3'?styles.CAO3:
            orderPosition=='CAO4'?styles.CAO4:
            orderPosition=='CAO1CAPB'?styles.CAO1CAPB:
            orderPosition=='CAO2CAPB'?styles.CAO2CAPB:
            orderPosition=='CAO3CAPB'?styles.CAO3CAPB:
            orderPosition=='CAO4CAPB'?styles.CAO4CAPB:
            orderPosition=='CAPB'?styles.CAbuttom:
            orderPosition=='CAOI'?styles.CAinverter:''
          :''
        } ${hayOctogonos?hayOctogonos=='oct1'?styles.OCT1:hayOctogonos=='oct2'?styles.OCT2:hayOctogonos=='oct3'?styles.OCT3:'':''}`,
        src:getWidth() > 960 ?`/arquivos/${getImage(Higlight)}`:`/arquivos/${getImageMobile(Higlight)}`,
        loading:"lazy",
        onLoad:{imageOnLoad},
        onError:{imageOnError}
      }
      imagesLeft.push(image)
    })
    setImages(imagesLeft)
  },[arrayFlags])

  const addCustomClass=(idImage:any,imgClass:any)=>{
    window?.document?.getElementById(idImage)?.classList.add(imgClass.toString().trim())
  }
  const validaThumbnail=()=>{
    const element= window?.document?.querySelector(".vtex-flex-layout-0-x-flexRow--container-tags-flags-pdp .vtex-flex-layout-0-x-flexRowContent--container-tags-flags-pdp")
    if(haveTumbnail&&element){
      if(!element.classList.contains(styles.haveTumbnail))
      setInterval(()=>element.classList.add(styles.haveTumbnail),1000)
    }
   
  }
  return (
    <>
      {
        images?.map((image: any) => {
          return (<img
            id={image?.id}
            key={image?.key}
            style={{
              aspectRatio: image?.style?.escala,
              width: image?.style?.width,
              objectFit: image?.style?.objectFit,
              objectPosition: image?.style?.objectPosition,
              zIndex:2,
              position: 'relative'
            }}
            className={`${image?.className} ${tagPromo==1?styles.tagPromo1:tagPromo==2?styles.tagPromo2:tagPromo==3?styles.tagPromo3:styles.tagPromo0}`}
            src={image?.src}
            loading={image?.loading}
            onLoad={()=>{
              imageOnLoad
              addCustomClass(image?.id,image?.className)
              validaThumbnail()}}
            onError={imageOnError}
          />)

        })
      }
    </>
  )
}

export default ImageFlag
