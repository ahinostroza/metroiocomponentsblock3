import React from 'react'
import { useRuntime } from 'vtex.render-runtime'

import styles from './styles.css'

const OwnOrderListButton = () => {
    const { history } = useRuntime()

    const renderHtml = async() => {
        if(history.location.hash === '#/orders') {
            setTimeout(() => {
                document
                    .querySelectorAll('.vtex-account__page .vtex-pageHeader__container .vtex-pageHeader__title')
                    .forEach((elm) => {
                        if(!elm.querySelector('.vtex-my-account-1x-orderLegacyLink')) {
                            elm
                                ?.insertAdjacentHTML(
                                    'afterend',
                                    `<div class="vtex-pageHeader__children order-2 order-0-ns  mt0-ns">
                                        <a href='/account#/orders-legacy' class='vtex-my-account-1x-orderLegacyLink ${styles.link_order_legacy}'>Ver historial de pedidos</a>
                                    </div>`
                                )
                        }
                    })
            }, 1500)
        }

        // / BUSCAMOS CUANDO HACEMOS CAMBIO DE HASH
        window.addEventListener('hashchange', () => {
            if(history.location.hash === '#/orders') {
                setTimeout(() => {
                    document
                        .querySelectorAll('.vtex-account__page .vtex-pageHeader__container .vtex-pageHeader__title')
                        .forEach((elm) => {
                            if(!elm.querySelector('.vtex-my-account-1x-orderLegacyLink')) {
                                elm
                                    ?.insertAdjacentHTML(
                                        'afterend',
                                        `<div class="vtex-pageHeader__children order-2 order-0-ns  mt0-ns">
                                            <a href='/account#/orders-legacy' class='vtex-my-account-1x-orderLegacyLink ${styles.link_order_legacy}'>Ver historial de pedidos</a>
                                        </div>`
                                    )
                            }
                        })
                }, 1500)
            }
        })
    }

    React.useEffect(() => {
        if(window) {
            renderHtml()
        }
    }, [
        window
    ])

    return <></>
}

export default OwnOrderListButton