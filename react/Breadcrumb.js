/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
/* eslint-disable react/jsx-filename-extension */

import React from 'react'
import { useRuntime } from 'vtex.render-runtime'
import styled from 'styled-components'

function Breadcrumb() {
  const runtime = useRuntime()

  const breadCrumbInit = runtime.route.path.split('/')?.filter(e => e !== "")

  const bread = []

  breadCrumbInit.forEach((item, i) => {

    const name = item.replace(/-/g, " ")

    i = i + 1
    if (i == breadCrumbInit.length) {
      bread.push({ id: i, text: runtime.route.title, link: `/${item}`, last: true })
    } else {
      bread.push({ id: i, text: name, link: `/${item}`, last: false })
    }

  })

  const app = () => (
    <>
      <List>
        {
          runtime.account === "metroqaio" ? <ListItem><ListLink href="/">Metro</ListLink></ListItem> : <ListItem><ListLink href="/">Metro</ListLink></ListItem>
        }
        {
          bread.map((e, i) => <ListItem key={i} className={e.last == true ? 'last-item' : ''} ><ListLink href={e.link}>{e.text}</ListLink></ListItem>)
        }
      </List>
    </>
  )

  return <>{app()}</>

}

const List = styled.ul`
  display: flex;
  align-items: center;
  justify-content: felx-start;
  list-style: none;
  margin: 0;
  padding: 10px 16px;
  margin-left:12px;
`

const ListItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: felx-start;
  list-style: none;
  margin: 0px;
  &::after {
    content: "|";
    margin: 0 8px;
  }
  &:last-child::after {
    display: none;
  }
  &:first-child {
    a {
      color: initial;
    }
  }
`

const ListLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: felx-start;
  list-style: none;
  font-family: Work Sans;
  font-style: normal;
  font-weight: normal;
  font-size: 18px;
  line-height: 20px;
  letter-spacing: 0.02em;
  color: black;
  text-decoration: none;
  text-transform:capitalize;
  @media (max-width:800px) {
    font-size: 14px;
  }
`

export default Breadcrumb