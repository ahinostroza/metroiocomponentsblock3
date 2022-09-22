/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
/* eslint-disable react/jsx-filename-extension */

import React from 'react'
import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemButton,
  AccordionItemPanel,
} from 'react-accessible-accordion'

import style from './styles/accordion.css'

type PropsAccordion = {
  titulo: 'string'
  content: any[]
}

function Menuplaced({ titulo, content }: PropsAccordion) {
  const app = () => (
    <>
      {content && titulo ? (
        <Accordion allowZeroExpanded className={style.container}>
          <h3 className={style.title}>{titulo}</h3>
          {content.map(({ title, text }, index) => {
            return (
              <AccordionItem key={index} className={style.subItem}>
                <AccordionItemHeading>
                  <AccordionItemButton className={style.button}>
                    {title}
                  </AccordionItemButton>
                </AccordionItemHeading>
                <AccordionItemPanel className={style.accordion__panel}>
                  <p className={style.text}>{text}</p>
                </AccordionItemPanel>
              </AccordionItem>
            )
          })}
        </Accordion>
      ) : (
        ''
      )}
      <br />
      <br />
    </>
  )

  return <>{app()}</>
}

Menuplaced.schema = {
  title: 'Accordion',
  description: 'Accordion',
  type: 'object',
  properties: {
    titulo: {
      title: 'Titulo',
      description: 'escribe el titulo',
      type: 'string',
      default: null,
    },
    content: {
      title: 'Líneas de contenudo',
      description: 'Add section',
      type: 'array',
      minItems: 0,
      maxItems: 20,
      items: {
        title: 'Section FAQ',
        type: 'object',
        properties: {
          title: {
            title: 'Titulo',
            type: 'string',
            default: null,
          },
          text: {
            title: 'Contenudo Texto',
            type: 'string',
            default: '<p>HTML</p>',
            widget: {
              'ui:widget': 'textarea',
            },
          },
        },
      },
    },
  },
}

export default Menuplaced
