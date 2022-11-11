import React, { useEffect } from 'react'
const personaliceAddToCart = require('./components/AWSPersonalize/personalizeAddToCart')

const ClickAddToCartButton= () => {
  const orderForm = vtexjs.checkout.orderForm
  const { items } = orderForm
    useEffect(() => {
      if(items.length > 0){
        personaliceAddToCart(orderForm.orderFormId,vtexjs.checkout.orderForm.userProfileId,idSesion,items)
        const ids = items.map((item, index) => ({
          minus: {
              name: `#item-quantity-change-decrement-${item.id}`,
              index,
              quantity: item.quantity
          },
          plus: {
              name: `#item-quantity-change-increment-${item.id}`,
              index,
              quantity: item.quantity
          },
          input: {
              name: `#item-quantity-${item.id}`,
              index,
              quantity: item.quantity
          }
        }))
      }
      const idSesion=getCookie('vtex_session')?.kid
      function getCookie(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
        }
        return null;
      }
      const pushDatalayer=(a,b,c) => {
        let data={
          event: c?"addToCart":"removeToCart",
          item:a,
          quantity:b
        }
        window.dataLayer.push(data)
      }
      
      if(ids.length > 0){
          ids.forEach(item => {
              // click event to minus
              $(item.minus.name).click(() => {
                  pushDatalayer([item.minus], item.minus.quantity, false)
              })

              // click event to plus
              $(item.plus.name).click(() => {
                  pushDatalayer([item.plus], item.plus.quantity, true)
              })

              // event to input
              $(item.input.name).keyup((e) => {
                  const value = e.target.value

                  if(value >= 1){
                      if(value > item.input.quantity){
                          const quantity = difference(item.input.quantity, parseInt(value))
                          pushDatalayer([item.input], quantity, true)
                      } else {
                          const quantity = difference(item.input.quantity, parseInt(value))
                          pushDatalayer([item.input], quantity, false)
                          
                      }
                  }
              })
          })
        }
        document.getElementsByClassName('col-addToCart-plp').addEventListener('click', () => {
            const datalayer = window.dataLayer
            items.map((item) => ({
              data:{
                event:"addToCart",
                productId:item.id,
                productName:item.name,
                productQuantity: item.quantity,
                productBrand: item.brand,
              }
            }))
        })
    }, []);
    return (
        <>
        </>
    )
}

export default ClickAddToCartButton;