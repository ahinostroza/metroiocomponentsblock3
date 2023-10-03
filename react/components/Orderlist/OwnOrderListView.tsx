import React from 'react'
import { useSessionResponse, hasSession } from './hooks/useSessionResponse'

import styles from './styles.css'

const OwnOrderListView: StorefrontFunctionComponent = () => {
    const sessionInfo = useSessionResponse()
    //Obtener email
    const email = hasSession(sessionInfo)
        ? sessionInfo.namespaces?.profile?.email?.value
        : null

    React.useEffect(() => {
        if (!email) return
    }, [email])

    return (
        <>
            <section className='vtex-account__page w-100 w-80-m'>
                <header>
                    <div className='vtex-pageHeader__container pa5 pa7-ns'>
                        <div className='vtex-pageHeader-link__container mb3'>
                            <a href='/account#/orders' className='vtex-button bw1 ba fw5 v-mid relative pa0 br2 bn nr2 nl2 pointer bg-transparent b--transparent c-action-primary hover-b--transparent hover-bg-action-secondary hover-b--action-secondary t-action'>
                                <div className='flex items-center justify-center h-100 pv1 ttn ph2'>
                                    <svg className="vtex__icon-arrow-back" width="16" height="11" viewBox="0 0 16 11" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none">
                                        <path d="M5.5 15.5002C5.75781 15.5002 5.92969 15.4169 6.10156 15.2502L11 10.5002L9.79687 9.33356L6.35938 12.6669L6.35938 0H4.64063L4.64062 12.6669L1.20312 9.33356L0 10.5002L4.89844 15.2502C5.07031 15.4169 5.24219 15.5002 5.5 15.5002Z" transform="translate(16.0002) rotate(90)" fill="currentColor"></path>
                                    </svg>
                                    <span className='ml3 ttu t-action--small'>Atrás</span>
                                </div>
                            </a>
                        </div>
                        <div className='c-on-base flex flex-wrap flex-row justify-between mt0'>
                            <div className='vtex-pageHeader__title t-heading-2 order-0 flex-grow-1'>Pedidos</div>
                        </div>
                    </div>
                </header>
                <main className='vtex-account__page-body vtex-my-orders-app-3-x-ordersList vtex-account__orders-list w-100 pa4-s'>
                    <div className='center w-100 helvetica'>
                        <section className='ph0'>
                            <div>
                                <div className={`${styles.orderMessageContainer} pa4-s tc`}>
                                    <p className={styles.orderMessageTitle}>¡Tu historial de pedidos estará disponible pronto!</p>
                                    <p className={styles.orderMessageInfo}>Si necesitas información detallada de tus pedidos anteriores, no dudes en comunicarte con nuestra línea de <strong>Atención al Cliente: 01-6138888</strong></p>
                                </div>
                            </div>
                        </section>
                    </div>
                </main>
            </section>
        </>
    )
}

export default OwnOrderListView