/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
/* eslint-disable react/jsx-filename-extension */
import React, { useEffect } from 'react'



function RemovePercentage() {
  const app = () => (    
    
    useEffect(() => {
      removeIt()
    }, [])
   
  )

  return <>{app()}</>
}

function removeIt(){
    setTimeout(function(){
        let b=document.getElementsByClassName('vtex-product-price-1-x-savingsPercentage--discountInsideContainer')
        for(let x=0 ;x<b.length;x++ ){
          if(b[x].innerHTML != '0&nbsp;%'){
            b[x].parentElement.style.visibility ='visible'
          }
        }
    }, 1000);


}

export default RemovePercentage
