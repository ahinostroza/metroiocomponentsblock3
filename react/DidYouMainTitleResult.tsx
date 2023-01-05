import React, { FC } from 'react'
import { useQuery } from 'react-apollo'
import correctionQuery from 'vtex.store-resources/QueryCorrection'
import { useSearchPage } from 'vtex.search-page-context/SearchPageContext'
import { useRuntime } from 'vtex.render-runtime'
import './styles/didyoumean.css'

interface Label {
  text: string;
  display: string;
  margin: 0;
  fontWeight: string;
  fontColor: string;
  fontSize: string;
  minHeight: string;
  alignItems: string;
}

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

  const { loading, data } = useQuery(correctionQuery, {
    variables: {
      fullText
    },
  })

  if (loading) return <div></div>

  const correction = data?.correction?.correction
  const Label = (props: Label) => {
    const boldText = {
      fontWeight: props.fontWeight
    } as React.CSSProperties;
    
    if (page == 'store.search#category' || page == 'store.search#department' || route.queryString?.map == 'productClusterIds') {
      return <></>
    } else {
      return (
        <p style={{
          color: props.fontColor,
          margin: props.margin,
          display: props.display,
          fontWeight: boldText.fontWeight,
          fontSize: props.fontSize,
          minHeight: props.minHeight,
          alignItems: props.alignItems
        }}>
          {props.text.replace("{fullText}", fullText)}
        </p>
      )
    }
  }

  return (correction?.text !== fullText) ? (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <Label
        text="No encontramos resultados para “{fullText}”. Te sugerimos estos productos:"
        fontColor="#535353"
        fontSize="12px"
        fontWeight="600"
        minHeight="42px"
        margin={0}
        display="flex"
        alignItems="center"
       />
      <WithTerm />
    </div>
  ) : (
    <>
      <WithoutTerm />
    </>
  )
}

export default DidYouMainTitleResult