import React from 'react'
import { useCssHandles } from 'vtex.css-handles'

import { useShopSelect } from '../../context/ShopSelectContext'

const CSS_HANDLES = [
  'menu',
  'menu__title',
  'menu__paragraph',
  'menu__wrapper',
  'menu__button',
  'menu__icon',
] as const

const Menu = () => {
  const { setCurrentStep } = useShopSelect()

  const { handles } = useCssHandles(CSS_HANDLES)

  return (
    <section className={handles.menu}>
      <h2 className={handles.menu__title}>Servicios de Entrega</h2>
      <p className={handles.menu__paragraph}>Indicanos tu modo de entrega:</p>
      <div className={handles.menu__wrapper}>
        <button
          className={handles.menu__button}
          onClick={() => setCurrentStep('addresses')}
        >
          <svg
            className={handles.menu__icon}
            width="90"
            height="89"
            viewBox="0 0 90 89"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <ellipse
              cx="21.9438"
              cy="64.4939"
              rx="7.09421"
              ry="7.0942"
              stroke="#3F3F40"
              strokeWidth="2"
            />
            <ellipse
              cx="67.3471"
              cy="64.4939"
              rx="7.09421"
              ry="7.0942"
              stroke="#3F3F40"
              strokeWidth="2"
            />
            <path
              d="M59.1881 27.2486L59.1881 15.8337C59.1881 15.2815 58.7404 14.8337 58.1881 14.8337H5.20801C4.65572 14.8337 4.20801 15.2815 4.20801 15.8337V52.8519C4.20801 53.4042 4.65572 53.8519 5.20801 53.8519H5.98156M59.1881 27.2486L59.3471 53.8519M59.1881 27.2486H68.0559M77.2804 63.3799H84.7913C85.3436 63.3799 85.7913 62.9322 85.7913 62.3799V46.7577M57.8372 63.3799H50.6383M31.8283 63.3799H37.9055M12.6041 63.3799C12.6041 63.3799 8.76905 63.3799 6.31172 63.3799V63.3799C6.12938 63.3799 5.98156 63.2321 5.98156 63.0498V53.8519M5.98156 53.8519H37.9055M59.1881 53.8519H59.3471M37.9055 63.3799V53.8519M37.9055 63.3799H50.6383M37.9055 53.8519H50.6383M50.6383 63.3799V53.8519M50.6383 53.8519H59.3471M68.0559 27.2486H73.3765L84.3269 38.199C85.2646 39.1367 85.7913 40.4085 85.7913 41.7345V46.7577M68.0559 27.2486V45.7577C68.0559 46.31 68.5036 46.7577 69.0559 46.7577H85.7913"
              stroke="#3F3F40"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Despacho a Domicilio
        </button>
        <button
          className={handles.menu__button}
          onClick={() => setCurrentStep('pickup')}
        >
          <svg
            className={handles.menu__icon}
            width="84"
            height="86"
            viewBox="0 0 84 86"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M69.3333 1H14.6667L1 26.2C1 33.9336 7.1172 40.2 14.6667 40.2C22.2161 40.2 28.3333 33.9336 28.3333 26.2C28.3333 33.9336 34.4505 40.2 42 40.2C49.5495 40.2 55.6667 33.9336 55.6667 26.2C55.6667 33.9336 61.7839 40.2 69.3333 40.2C76.8828 40.2 83 33.9336 83 26.2L69.3333 1Z"
              stroke="#3F3F40"
              strokeWidth="2"
              strokeMiterlimit="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M72.75 53.5V85H11.25V53.5"
              stroke="#3F3F40"
              strokeWidth="2"
              strokeMiterlimit="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M33.7998 85V62.6H50.1998V85"
              stroke="#3F3F40"
              strokeWidth="2"
              strokeMiterlimit="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Recojo en Tienda
        </button>
      </div>
    </section>
  )
}

export default Menu
