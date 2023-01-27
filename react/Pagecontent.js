/* eslint-disable @typescript-eslint/no-use-before-define */

/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
/* eslint-disable react/jsx-filename-extension */

import React from 'react'
import ReactHtmlParser from 'react-html-parser'
import { Helmet } from 'vtex.render-runtime'

function Pagecontent(PropsTitle) {

  const app = () => (
    <>
      <Helmet>
        <style>{`
          .conteudo-web-inst{
            margin: 0 0 80px 0px;
          }
          .conteudo-web-inst a{
            color: #EC1C24;
            text-decoration: none;
          }
          @media(max-width: 800px){
            .conteudo-web-inst{
              margin: 0 0 10px 0px;
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

Pagecontent.schema = {
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

export default Pagecontent
