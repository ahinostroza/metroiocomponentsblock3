/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
/* eslint-disable react/jsx-filename-extension */

import React from 'react'
import styled from 'styled-components'
import { useRuntime } from 'vtex.render-runtime'


function Pagetitle(PropsTitle) {

  const runtime = useRuntime()

  const app = () => (
    <>
      <Section>
        <Content>
          {"Bienvenidos a Wong" === runtime.route.title ? '' : <Text>TIENDA ONLINE</Text>}
          <Title>{PropsTitle.name}</Title>
        </Content>
      </Section>
    </>
  )

  return <>{app()}</>
}

Pagetitle.schema = {
  title: 'Title Page Content',
  description: 'Escribe el título de la página.',
  type: 'object',
  properties: {
    name: {
      title: 'Title',
      type: 'string',
      properties: {
        text: {
          title: 'Title',
          type: 'string',
          default: '',
        },
      },
    },
  },
}

const Section = styled.section`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #c4c4c4;
  margin-top: 40px;
  @media(max-width: 800px){
    border: none;
  }
`

const Content = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: calc(100% - 32px);
  margin: 0 16px;
`

const Text = styled.p`
  display: flex;
  font-family: Work Sans;
  font-style: normal;
  font-weight: normal;
  font-size: 16px;
  align-items: center;
  letter-spacing: 0.02em;
  color: #000000;
  position: absolute;
  left: 0;
  bottom: 6px;
  margin: 0;
  padding: 0px;
  @media(max-width: 800px){
    display: none;
  }
`

const Title = styled.h1`
  display: flex;
  font-family: Work Sans;
  font-style: normal;
  font-weight: bold;
  font-size: 36px;
  align-items: center;
  letter-spacing: 0.02em;
  color: #000000;
  margin: 0;
  padding: 0px;
  border-bottom: 1px solid #ec1c24;
  position: relative;
  top: 1px;
  padding: 0 20px;
  
`

export default Pagetitle
