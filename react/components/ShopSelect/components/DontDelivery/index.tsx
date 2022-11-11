import React from 'react'
import { useCssHandles } from 'vtex.css-handles'
import { useShopSelect } from '../../context/ShopSelectContext'

const CSS_HANDLES = [
    'sp_overlay_wrapper', 
    'sp_wrapper__error',
    'sp_overlay__content',
    'sp_scwithoutstock', 
    'sp_scwithoutstock__icon_atention', 
    'sp_scwithoutstock__wrapper', 
    'sp_scwithoutstock__icon_atention__svg', 
    'sp_scwithoutstock__subtitle', 
    'sp_scwithoutstock__subtitle__span', 
    'sp_scwithoutstock__buttons__wrapper', 
    'sp__icon_atention__svg_cls_1', 
    'sp__icon_atention__svg_cls_2', 
    'sp__icon_atention__svg_cls_3', 
    'sp__icon_atention__svg_cls_4', 
    'sp__icon_atention__svg_cls_5', 
    'sp_scwithoutstock__button', 
    'sp_scwithoutstock__button__back', 
    'sp_scwithoutstock__button__saleChannel'
] as const

const DontDelivery = () => {

    const { setCurrentStep } = useShopSelect()
    const { handles } = useCssHandles(CSS_HANDLES)

    const goBackAddresses = (evt: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        evt.stopPropagation()
        evt.preventDefault()
        const cachedUser = localStorage.getItem('user')
        const formattedUser = cachedUser && JSON.parse(cachedUser)
        setCurrentStep(formattedUser ? `menu` : `email`)
    }

    return (
        <div className={`${handles.sp_overlay_wrapper} ${handles.sp_wrapper__error}`}>
            <div className={`${handles.sp_overlay__content}`}>
                <div className={`${handles.sp_scwithoutstock} br2`}>
                    <div className={`${handles.sp_scwithoutstock__icon_atention}`}>
                        <i>
                            <svg className={`${handles.sp_scwithoutstock__icon_atention__svg}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 126.34 126.34">
                                <title>icn_alert_big</title>
                                <g id="Capa_2" data-name="Capa 2">
                                    <g id="Layer_1" data-name="Layer 1">
                                        <path className={`${handles.sp__icon_atention__svg_cls_1}`} d="M98.73,12.58Q96.9,11.29,95,10.14C96.27,10.9,97.51,11.71,98.73,12.58Z"></path>
                                        <path className={`${handles.sp__icon_atention__svg_cls_2}`} d="M63.17,0a63.17,63.17,0,1,0,63.17,63.17A63.24,63.24,0,0,0,63.17,0ZM98.73,12.58Q96.9,11.29,95,10.14C96.27,10.9,97.51,11.71,98.73,12.58ZM63.17,123.68a60.85,60.85,0,0,1-11-1h0a59.55,59.55,0,0,1-13.19-4.06A60.51,60.51,0,0,1,60.06,2.73h0c1,0,2.06-.08,3.1-.08a60.52,60.52,0,0,1,0,121Z"></path>
                                        <path className={`${handles.sp__icon_atention__svg_cls_3}`} d="M111.81,55.74A63.59,63.59,0,0,1,67,116.49,63.57,63.57,0,0,0,60.07,2.73c1,0,2.06-.08,3.1-.08a60.09,60.09,0,0,1,29.61,7.76A63.32,63.32,0,0,1,111.81,55.74Z"></path>
                                        <path className={`${handles.sp__icon_atention__svg_cls_4}`} d="M123.68,63.17a60.54,60.54,0,0,1-71.55,59.5h0a59.55,59.55,0,0,1-13.19-4.06,62.11,62.11,0,0,0,9.31.7A63.55,63.55,0,0,0,92.78,10.41,60.54,60.54,0,0,1,123.68,63.17Z"></path>
                                        <path className={`${handles.sp__icon_atention__svg_cls_5}`} d="M73.32,92.45a10.58,10.58,0,0,0-5.13-5.79A10.44,10.44,0,0,0,53.57,99.29a10.49,10.49,0,0,0,5.6,6.22,10.36,10.36,0,0,0,4.31.93A10.46,10.46,0,0,0,73.93,96,10.66,10.66,0,0,0,73.32,92.45Zm-9.84,11.34a7.69,7.69,0,0,1-3-.6,7.79,7.79,0,1,1,10.46-9.45A7.61,7.61,0,0,1,71.27,96,7.8,7.8,0,0,1,63.48,103.79Z"></path>
                                        <path className={`${handles.sp__icon_atention__svg_cls_3}`} d="M70.94,93.74a2.58,2.58,0,0,1-1.63-.58,6.32,6.32,0,0,0-3.94-1.36A6.39,6.39,0,0,0,59,98.18a6.31,6.31,0,0,0,1.05,3.5,2.69,2.69,0,0,1,.45,1.51,7.79,7.79,0,1,1,10.46-9.45Z"></path>
                                        <path className={`${handles.sp__icon_atention__svg_cls_5}`} d="M73.91,26.67a1.18,1.18,0,0,0-.33-.68,1.3,1.3,0,0,0-1-.44H54.05a1.32,1.32,0,0,0-1,.44,1.3,1.3,0,0,0-.34,1l4.94,52.87a1.36,1.36,0,0,0,1.07,1.19l.26,0h8.65A1.34,1.34,0,0,0,69,79.88l4.51-48.22L73.92,27A1.28,1.28,0,0,0,73.91,26.67ZM70.8,31.81,66.45,78.43H60.21l-4.7-50.22H71.14Z"></path>
                                        <polygon className={`${handles.sp__icon_atention__svg_cls_3}`} points="70.8 31.81 59.41 31.81 63.77 78.43 60.21 78.43 55.51 28.21 71.14 28.21 70.8 31.81"></polygon>
                                    </g>
                                </g>
                            </svg>
                        </i>
                    </div>
                    <div className={`${handles.sp_scwithoutstock__wrapper}`}>
                        <div className={`${handles.sp_scwithoutstock__subtitle}`}>
                            <span className={`${handles.sp_scwithoutstock__subtitle__span}`}>La dirección que elegiste no posee envío a domicilio.</span>
                        </div>
                        <div className={`${handles.sp_scwithoutstock__buttons__wrapper}`}>
                            <button onClick={goBackAddresses} type="button" className={`${handles.sp_scwithoutstock__button} ${handles.sp_scwithoutstock__button__back} ${handles.sp_scwithoutstock__button__saleChannel}`}>
                                Elegir otra dirección o método de entrega
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DontDelivery