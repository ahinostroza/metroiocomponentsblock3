import React, { FC } from 'react'
import { useQuery } from 'react-apollo'
import correctionQuery from 'vtex.store-resources/QueryCorrection'
import { useSearchPage } from 'vtex.search-page-context/SearchPageContext'
import { useRuntime } from 'vtex.render-runtime'
import './styles/didyoumean.css'

interface DidYouMainProps {
  WithTerm: FC,
  WithoutTerm: FC
}

const DidYouMainTitleResult = ({ WithTerm, WithoutTerm }: DidYouMainProps) => {
  const { page, route } = useRuntime()
  const {
    searchQuery: {
      variables: { fullText },
    },
  } = useSearchPage()

  const styleText: React.CSSProperties = {
    margin: "0",
    color: "#535353",
    fontSize: "12px",
    fontWeight: "bold",
    minHeight: "42px",
    display: "flex",
    alignItems: "center"
  }
  
  const { loading, data } = useQuery(correctionQuery, {
    variables: {
      fullText
    },
  })

  if (loading) return <div></div>

  const correction = data?.correction?.correction
  const text = () => {
    if (page == 'store.search#category' || page == 'store.search#department' || route.queryString?.map == 'productClusterIds') {
      return
    } else {
      return <p style={styleText}>
        No encontramos resultados para “{fullText}”. Te sugerimos estos productos:
      </p>
    }
  }
  return (correction?.text !== fullText) ? (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {text()}
      <WithTerm />
    </div>
  ) : (
    <>
      <WithoutTerm />
    </>

  )
}

export default DidYouMainTitleResult