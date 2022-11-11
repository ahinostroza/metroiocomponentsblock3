/* eslint-disable @typescript-eslint/no-use-before-define */

/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
/* eslint-disable react/jsx-filename-extension */

import React from 'react'
import ReactHtmlParser from 'react-html-parser'
import { Helmet } from 'vtex.render-runtime'

function Pageventas(PropsTitle) {
  const app = () => (
    <>
      <Helmet>
        <style>{`
          .conteudo-web-inst{
            margin: 0;
          }
          .conteudo-web-inst a{
            text-decoration: none;
          }
          .termos {
            background: #fff200;
            border-radius: 4px;
            font-family: Work Sans;
            font-style: normal;
            font-weight: 500;
            font-size: 16px;
            line-height: 24px;
            letter-spacing: 0.02em;
            text-transform: uppercase;
            color: #222222;
            padding: 12px;
            display: inline-block;
            margin-bottom: 30px;
          }
          @media(max-width: 800px){
            .conteudo-web-inst{
              margin: 0 0 10px 0px;
            }
            .termos{
              width: 100%;
              display: block;
              text-align: center;
            }
          }
        `}</style>
      </Helmet>
      <section className="conteudo-web-inst">
        {ReactHtmlParser(PropsTitle.html)}
      </section>
    </>
  )

  return <>{app()}</>
}

Pageventas.schema = {
  title: 'Contenido',
  description: 'Contenido en HTML',
  type: 'object',
  properties: {
    html: {
      title: 'Contenido',
      type: 'string',
      default: '<p>HTML</p>',
      widget: {
        'ui:widget': 'textarea',
      },
    },
  },
}

export default Pageventas
