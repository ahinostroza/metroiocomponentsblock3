import React, { useEffect, useState } from 'react'
import { useCssHandles } from 'vtex.css-handles';
const CSS_HANDLES = [
    'modal__app',
    'modalContainer',
    'modalContainerLeft',
    'modalContainerRight',
    'modalButton',
    'modalDownloadApp',
    'modalImageApp',
    'modalContainerImage',
    'modalContainerTextWrap',
    "modalTextStrong",
    'modalTextSpan'
]
const ModalApp = () => {
    const { handles } = useCssHandles(CSS_HANDLES)
    const [visible, setVisibile] = useState(false);
    const verifiedStorage = () => {
        if (localStorage.getItem('modalAppDownload')) {
            setVisibile(false)
        } else {
            setVisibile(true)
        }
    }
    const closeButton = (e) => {
        setVisibile(false)
        localStorage.setItem('modalAppDownload', false)
    }
    useEffect(() => {
        verifiedStorage();
    })
    return (
        <>
            {visible ? (
                <div className={handles.modal__app}>
                    <div className={handles.modalContainer}>
                        <div className={handles.modalContainerLeft}>
                            <figure className={handles.modalContainerImage}>
                                <img className={handles.modalImageApp} src="/arquivos/metro-wong-download.png" alt="logo wong" />
                            </figure>
                        </div>
                        <div className={handles.modalContainerRight}>
                            <div className={handles.modalContainerTextWrap}>
                                <strong className={handles.modalTextStrong}>¡Descarga la App!</strong>
                                <span className={handles.modalTextSpan}>Descubre toda  nuestra variedad con delivery GRATIS </span>
                            </div>
                            {
                                ['iPad Simulator', 'iPhone Simulator', 'iPod Simulator', 'iPad', 'iPhone', 'iPod'].includes(navigator.platform) == true ?
                                    (
                                        <a className={handles.modalDownloadApp} href="https://apps.apple.com/us/app/supermercados-metro/id1289357369" target="_blank" rel="noopener noreferrer">Descargar</a>
                                    )
                                    : (
                                        <a className={handles.modalDownloadApp} href="https://play.google.com/store/apps/details?id&#61;com.cencosud.pe.metro&amp;hl&#61;es_PE&amp;gl&#61;US" target="_blank" rel="noopener noreferrer">Descargar</a>
                                    )

                            }
                            <button className={handles.modalButton} onClick={closeButton}>
                                X
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                ''
            )
            }
        </>
    )
}

export default ModalApp;