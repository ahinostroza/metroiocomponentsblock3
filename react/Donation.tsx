/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
/* eslint-disable react/jsx-filename-extension */

import React from 'react'
import styled from 'styled-components'
import { useOrderGroup } from 'vtex.order-placed/OrderGroupContext'

function Donation() {
  const orderGroup = useOrderGroup()

  const skuList: Array<{ name: any; id: any }> = []

  orderGroup.orders.forEach((orderItem: any) => {
    orderItem.items.forEach((sku: any) => {
      skuList.push({ name: sku.skuName, id: sku.id })
    })
  })

  const validate = JSON.stringify(skuList).indexOf(
    JSON.stringify('Donación Ponle Corazón').replace('[', '').replace(']', '')
  )

  if (validate && validate > -1) {
    const app = () => (
      <>
        <Section className="master">
          <Content className="content">
            <Title>¡Gracias por donar a Ponle Corazón!</Title>
            <Text>
              Tu donación será dirigida a la campaña “Ponle Corazón” de la
              Fundación Peruana Contra el Cáncer. Cencosud Retail S.A. no
              obtiene ningún beneficio <br /> económico en esta actividad.
              Conoce más de la campaña en: <br /> <strong>www.fpc.pe</strong>
            </Text>
          </Content>
        </Section>
      </>
    )

    return <>{app()}</>
  }

  return <></>
}

Donation.schema = {
  title: 'Donation - Products',
  description: 'Donation',
  type: 'object',
  properties: {
    content: {
      title: 'Líneas de products',
      description: 'Add item',
      type: 'array',
      minItems: 0,
      maxItems: 500,
      items: {
        title: 'Items',
        type: 'object',
        properties: {
          name: {
            title: 'Nombre del SKU',
            type: 'string',
          },
          id: {
            title: 'Id del SKU',
            type: 'string',
          },
        },
      },
    },
  },
}

const Section = styled.section`
  margin: 0 0 24px 0;
  background: #f5f5f5;
  @media (max-width: 967px) {
    margin-bottom: 24px;
    border-radius: 8px;
    background: #fff;
  }
`

const Content = styled.div`
  padding: 24px 32px;
  @media (max-width: 967px) {
    padding: 24px 10px;
  }
`

const Title = styled.h3`
  font-family: Work Sans;
  font-style: normal;
  font-weight: 600;
  font-size: 24px;
  display: flex;
  align-items: center;
  color: #2c2c2c;
  margin: 0 0 10px 0;
  width: 100%;
  @media (max-width: 967px) {
    text-align: center;
    justify-content: center;
  }
`

const Text = styled.p`
  margin: 0;
  padding: 0;
  font-family: Work Sans;
  font-style: normal;
  font-weight: normal;
  font-size: 18px;
  line-height: 20px;
  align-items: center;
  color: #2e2e2e;
  @media (max-width: 967px) {
    text-align: center;
  }
`

export default Donation
