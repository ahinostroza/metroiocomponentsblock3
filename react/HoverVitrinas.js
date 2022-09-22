/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
/* eslint-disable react/jsx-filename-extension */
import React, { useEffect } from 'react'



function HoverVitrinas() {
  const app = () => (    
    
    useEffect(() => {
      applyHover()
    }, [])
   
  )

  return <>{app()}</>
}

function applyHover(){
    setTimeout(function(){
      let a=document.getElementsByClassName('vtex-product-summary-2-x-clearLink')
      for (let i in a){
        if(i < a.length){
         a[i].onmouseover=function(){
              this.querySelector('.vtex-flex-layout-0-x-flexRow--hoverIconsQVML').style.display = "block";
      
      }
         a[i].onmouseout=function(){
              this.querySelector('.vtex-flex-layout-0-x-flexRow--hoverIconsQVML').style.display = "none";
          }
        }
      }
  }, 1000);


}

export default HoverVitrinas
