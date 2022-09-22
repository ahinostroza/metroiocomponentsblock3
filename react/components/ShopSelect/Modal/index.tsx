import React, { useEffect } from 'react'
import { useModalDispatch } from 'vtex.modal-layout/ModalContext'
import { Modal, ModalContent } from 'vtex.modal-layout'
import { useLazyQuery } from 'react-apollo'
import { useCssHandles, useCustomClasses } from 'vtex.css-handles'
import { useShopSelect } from '../context/ShopSelectContext'
import { ISteps } from '../interfaces/ISteps'
import { useRuntime } from 'vtex.render-runtime'
import { OrderForm } from 'vtex.order-manager'
import GET_PROFILE from '../../../graphql/getProfile.gql'
import ChangeLocationContainer from '../components/ShopperLocator/ChangeLocationContainer'
import ShopperLocation from '../components/ShopperLocator'
import EmailLogin from '../components/EmailLogin'
import Menu from '../components/Menu'
import Addresses from '../components/Addresses'
import PickupPoints from '../components/PickupPoints'
import Loading from '../components/Loading'
import axios from 'axios'
import DontDelivery from '../components/DontDelivery'

const CSS_HANDLES = [
  'container', 
  'shopselect',
  'shopselect__button',
  'shopselect__close',
  'shopselect__header',
  'shopselect__email',
  'shopselect__logout',
  'shopselect__strong',
  'shopselect__strong',
  'shopselect__paragraph',
  'shopselect__wrapper',
  'modal-body'
] as const

const ModalComponent = (props: any) => {
  const dispatch = useModalDispatch()
  const [getUsers, { data }] = useLazyQuery(GET_PROFILE)
  const { setCurrentStep, currentStep, setUser, user } = useShopSelect()
  const { handles } = useCssHandles(CSS_HANDLES)
  const { account, route } = useRuntime()
  const { useOrderForm } = OrderForm
  const { orderForm } = useOrderForm()

  //useEffect(() => {
    //console.log(pages)
  //}, [pages])
  useEffect(() => {
    getUsers()
    const cachedUser = localStorage.getItem('user')
    const formattedUser = cachedUser && JSON.parse(cachedUser)

    if (data?.profile) {
      setUser(data.profile)
      setCurrentStep(`menu`)
    } else if (formattedUser) {
      setUser(formattedUser)
      setCurrentStep(`menu`)
    }
    // Cerrar sesion desde MY ACCOUNT
    let currentPage = route.pathId
    if (currentPage == "/account") {
      const btnLogoutAccount = document.querySelector(".vtex-my-account-1-x-menuLinks .vtex-my-account-1-x-menuLink")
      if (btnLogoutAccount != null) {
        btnLogoutAccount!.addEventListener('click', function () {
          // al saltar el modal de confirmacion , chequeo que se haga click en salir
          setTimeout(() => {
            const exitSessionBTN = document.querySelector(".vtex-modal__confirmation > .vtex-button")
            if (exitSessionBTN != null) {
              exitSessionBTN!.addEventListener('click', function () {
                handleLogoutUser(data)
              })
            }
          }, 1500)
        })
      }
    }
    // Cerrar sesion desde Header
    const buttonMyAccount = document.querySelector(".vtex-flex-layout-0-x-flexColChild--login-section .vtex-button")
    if (buttonMyAccount != null) {
      buttonMyAccount!.addEventListener('click', function () {
        setTimeout(() => {
          const buttonLogOut = document.querySelector(".vtex-login-2-x-contentForm .vtex-login-2-x-logoutButton")
          if (buttonLogOut != null) {
            buttonLogOut!.addEventListener('click', function () {
              handleLogoutUser(data)
            })
          }
        }, 1500)
      })
    }
  }, [data])

  const handleLogoutUser = async (data: any) => {
    if (!data?.profile) {
      setCurrentStep(`loading`)
      setUser(undefined)
      localStorage.removeItem('user')
      localStorage.removeItem('shippingData')
      await axios.get(`/checkout/changeToAnonymousUser/${orderForm.id}`)
      await axios.post(
        `/api/checkout/pub/orderForm/${orderForm.id}/attachments/shippingData`,
        {}
      )
      await axios.post('/api/sessions', {
        "public": {
          "country": {
            "value": "PE"
          }
        }
      })
      window.location.reload()
    } else {
      setUser(undefined)
      localStorage.removeItem('user')
      localStorage.removeItem('shippingData')
      
      if(orderForm){
        await axios.get(`/checkout/changeToAnonymousUser/${orderForm.id}`)
      }
      
      await axios.post('/api/sessions', {
        "public": {
          "country": {
            "value": "PE"
          }
        }
      })

      window.location.href = `/api/vtexid/pub/logout?scope=${account}&returnUrl=https%3A%2F%2F${window.location.host}%2F%3Fsc%3D70`
    }
  }

  const steps: ISteps = {
    email: <EmailLogin />,
    menu: <Menu />,
    addresses: <Addresses />,
    newAddress: <ChangeLocationContainer {...props} isnew={true}/>,
    pickup: <PickupPoints />,
    loading: <Loading />,
    dontDelivery: <DontDelivery />
  }
  const classes = useCustomClasses(() => {
    return { 'container': `${handles.container} flex items-center justify-center` }
  })

  return (
    currentStep.toString()!=="dontDelivery"
      ?
      <>
        <Modal>
          {user && (
            <header className={handles.shopselect__header}>
              <p className={handles.shopselect__email}>{user?.email}</p>
              <button
                className={handles.shopselect__logout}
                onClick={() => handleLogoutUser(data)}
              >
                No soy yo
              </button>
              <button
                className={handles.shopselect__close}
                onClick={() => dispatch?.({ type: 'CLOSE_MODAL' })}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 0C5.4 0 0 5.4 0 12C0 18.6 5.4 24 12 24C18.6 24 24 18.6 24 12C24 5.4 18.6 0 12 0ZM16.8964 14.7964C17.0917 14.9917 17.0917 15.3083 16.8964 15.5036L15.5036 16.8964C15.3083 17.0917 14.9917 17.0917 14.7964 16.8964L12 14.1L9.20355 16.8964C9.00829 17.0917 8.69171 17.0917 8.49645 16.8964L7.10355 15.5036C6.90829 15.3083 6.90829 14.9917 7.10355 14.7964L9.9 12L7.10355 9.20355C6.90829 9.00829 6.90829 8.69171 7.10355 8.49645L8.49645 7.10355C8.69171 6.90829 9.00829 6.90829 9.20355 7.10355L12 9.9L14.7964 7.10355C14.9917 6.90829 15.3083 6.90829 15.5036 7.10355L16.8964 8.49645C17.0917 8.69171 17.0917 9.00829 16.8964 9.20355L14.1 12L16.8964 14.7964Z"
                    fill="#3F3F40"
                  />
                </svg>
              </button>
            </header>
          )}
          <div className={`${handles['modal-body']}--${currentStep} ${currentStep.toString()==='loading'&&(handles['modal-body']+'--'+(user?'h200':'h300'))}`}>
            <ModalContent>
              <div>{steps[currentStep]}</div>
            </ModalContent>
          </div>
        </Modal>
        <ShopperLocation {...props} />
      </>
      :
      <Modal classes={classes} scroll="body">
        {steps[currentStep]}
      </Modal>
  )
}

export default ModalComponent
