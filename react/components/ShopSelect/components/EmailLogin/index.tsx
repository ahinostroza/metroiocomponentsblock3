import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useCssHandles } from 'vtex.css-handles'
import { useModalDispatch } from 'vtex.modal-layout/ModalContext'
import { OrderForm } from 'vtex.order-manager'
import { Spinner } from 'vtex.styleguide'
import { useRuntime } from 'vtex.render-runtime'
import { useShopSelect } from '../../context/ShopSelectContext'
import { IAccount } from '../../interfaces/IApiBaseURL'
import { baseURL } from '../../../../config/ApiBaseURL'

const CSS_HANDLES = [
  'email',
  'email__wrapper',
  'email__title',
  'email__paragraph',
  'email__form',
  'email__input',
  'email__error',
  'email__submit',
  'shopselect__header',
  'shopselect__close',
] as const

const EmailLogin = () => {
  const [userEmail, setUserEmail] = useState<string>()
  const [emailError, setEmailError] = useState<string>()
  const [isLoading, setIsLoading] = useState(false)
  const [userInfo, setUserInfo] = useState<any>()
  const { setUser, setCurrentStep } = useShopSelect()
  const dispatch = useModalDispatch()
  const { account } = useRuntime()
  const { useOrderForm } = OrderForm
  const { orderForm } = useOrderForm()

  useEffect(() => {
    const cachedUser = localStorage.getItem('user')

    if (cachedUser) {
      setCurrentStep(`menu`)
      setUser(JSON.parse(cachedUser))
    }
  }, [])

  useEffect(() => {
    if (!userEmail) {
      return
    }

    // eslint-disable-next-line prettier/prettier
    (async () => {
      const [{ id, firstName, lastName }] = userInfo

      const { data: addresses } = await axios.get(
        `${baseURL[account as IAccount].url}/search?dataId=AD&userId=${id}&_fields=id,addressName,street,number,neighborhood,city,state,geoCoordinate,postalCode,complement,country&store=${account}`, {
          headers: {
            'x-apikey': baseURL[account as IAccount].key
          }
        }
      )

      const user = {
        id,
        firstName,
        lastName,
        email: userEmail,
        addresses,
      }
      const { data: checkoutOrderform } = await axios.get(
        `/api/checkout/pub/orderForm/${orderForm.id}`
      )

      const clientProfileData = checkoutOrderform.clientProfileData ? checkoutOrderform.clientProfileData : {}

      if (clientProfileData?.email === userEmail) {
        const resOF1 = await axios.post(`/api/checkout/pub/orderForm/${orderForm.id}?refreshOutdatedData=true`)
        if(resOF1 && resOF1.data && resOF1.data.clientProfileData){
          localStorage.setItem("tempOF", JSON.stringify(resOF1.data))
        }
      } else {
        await axios.post(
          `/api/checkout/pub/orderForm/${orderForm.id}/attachments/clientProfileData`,
          {
            email: userEmail
          }
        )
        const resOF2 = await axios.post(`/api/checkout/pub/orderForm/${orderForm.id}?refreshOutdatedData=true`)
        if(resOF2 && resOF2.data && resOF2.data.clientProfileData){
          localStorage.setItem("tempOF", JSON.stringify(resOF2.data))
        }
      }

      setUser(user)
      setCurrentStep('menu')
      localStorage.setItem('user', JSON.stringify(user))
    })()
  }, [userInfo])

  const { handles } = useCssHandles(CSS_HANDLES)

  const handleUser = async (
    email: string | undefined,
    evt: React.FormEvent<HTMLFormElement>
  ) => {
    evt.preventDefault()
    evt.stopPropagation()
    if (!email) {
      return
    }

    setIsLoading(true)
    let data: any = {};
    try {
      data = await axios.get(
        `${baseURL[account as IAccount].url}/search?dataId=CL&email=${email}&_fields=id,firstName,lastName&store=${account}`, {
          headers: {
            'x-apikey': baseURL[account as IAccount].key
          }
        }
      )
      data = data.data;
    } catch (error) {
      console.error('error: ', error)
    }
    if (!data.length) {
      try {
        await axios.post(
          `${baseURL[account as IAccount].url}/create?dataId=CL&store=${account}`,
          {
            email,
          },
          {
            headers: {
              'x-apikey': baseURL[account as IAccount].key
            }
          }
        )
      } catch (err) {
        console.log("error: ", err);
        setEmailError('Email invalido');
      }finally{
        setIsLoading(false);
      }

      const { data: response } = await axios.get(
        `${baseURL[account as IAccount].url}/search?dataId=CL&email=${email}&_fields=id,firstName,lastName&store=${account}`, {
          headers: {
            'x-apikey': baseURL[account as IAccount].key
          }
        }
      )
      localStorage.setItem("isNewAccount", "1")
      setUserInfo(response)
    } else {
      localStorage.removeItem("isNewAccount")
      setUserInfo(data)
    }
  }

  return (
    <section className={handles.email}>
      <header className={handles.shopselect__header}>
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
      <div className={handles.email__wrapper}>
        <h2 className={handles.email__title}>Nuestros Despachos</h2>
        <p className={handles.email__paragraph}>
          Para asignarte una tienda, por favor ingresa tu mail
        </p>
        <form
          className={handles.email__form}
          onSubmit={(evt) => handleUser(userEmail, evt)}
        >
          <input
            className={handles.email__input}
            onChange={(evt) => {
              setUserEmail(evt.target.value);
              setEmailError('');
            }}
            type="text"
            placeholder="Su Mail"
          />
          <span className={handles.email__error}>
            {emailError && emailError}
          </span>          
            <button
              type="submit"
              className={handles.email__submit}
              disabled={!userEmail}
            >
              {isLoading ? <Spinner /> : 'Aceptar'}
            </button>          
        </form>
      </div>
    </section>
  )
}

export default EmailLogin
