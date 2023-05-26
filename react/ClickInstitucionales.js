import React, { useEffect } from 'react'

const ClickInstitucionales = () => {
    useEffect(() => {
        if (window.location.path === '/consultas-y-sugerencias') {
            if (localStorage.getItem('isTelephone')) {
                window.scrollTo(0, 1400)
                storage.removeItem('isTelephone');
            }
        }
        document.getElementById('menu-item-03').addEventListener('click', () => {
            localStorage.setItem('isTelephone', true);
        })
    }, [])
    return (
        <>
        </>
    )
}

export default ClickInstitucionales;