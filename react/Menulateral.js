/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
/* eslint-disable react/jsx-filename-extension */

import React from 'react'
import styled from 'styled-components'
import { useRuntime } from 'vtex.render-runtime'

import style from './styles/arrow.css'

function Menulateral(PropsValues) {
  const runtime = useRuntime()
  const linksReturn = PropsValues.content

  if (PropsValues.content) {
    const app = () => (
      <>
        <Nav>
          <Title>Nosotros</Title>
          <Content>
            {linksReturn.map((e,i) => (
              <Item key={i}>
              {e.text === runtime.route.title ? (
                <Link
                  key={Math.floor(Math.random(100 * 32))}
                  className={style.active}
                  href={e.url}
                >
                  {e.text}
                </Link>
              ) : (
                <Link href={e.url}>{e.text}</Link>
              )}
              <span className={`${style.arrow} ${style.right}`} />
            </Item>
            ))}
          </Content>
        </Nav>
      </>
    )

    return <>{app()}</>
  }

  return <></>
}

Menulateral.schema = {
  title: 'Links - Menú lateral',
  description: 'Links',
  type: 'object',
  properties: {
    content: {
      title: 'Líneas de Links',
      description: 'Add item',
      type: 'array',
      minItems: 3,
      maxItems: 500,
      items: {
        title: 'Items',
        type: 'object',
        properties: {
          text: {
            title: 'Texto',
            type: 'string',
            default: '',
          },
          url: {
            title: 'Url',
            type: 'string',
            default: '',
          },
        },
      },
    },
  },
}

const Link = styled.a`
  font-family: Work Sans;
  font-style: normal;
  font-weight: normal;
  font-size: 18px;
  line-height: 20px;
  letter-spacing: 0.02em;
  color: #535353;
  text-decoration: none;
  padding: 16px 0;
  border-top: 1px solid #ccc;
  width: 100%;
  display: block;
  @media(max-width: 800px){
    text-align: center;
  }
`

const Item = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  &:last-child a {
    border-bottom: 1px solid #ccc;
  }
  @media(max-width: 800px){
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
`

const Content = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  width: 100%;
  @media(max-width: 800px){
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
`

const Title = styled.h3`
  font-family: Work Sans;
  font-style: normal;
  font-weight: 600;
  font-size: 18px;
  line-height: 24px;
  color: #2e2e2e;
  @media(max-width: 800px){
    text-align: center;
  }
`

const Nav = styled.nav`
  margin: 0 0 30px 0;
`

export default Menulateral
