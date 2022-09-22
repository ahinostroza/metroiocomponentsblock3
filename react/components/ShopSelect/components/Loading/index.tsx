/* eslint-disable import/order */
/* eslint-disable eqeqeq */
/* eslint-disable prettier/prettier */
/* eslint-disable array-callback-return */
/* eslint-disable no-console */
import React from 'react'
import { Spinner } from 'vtex.styleguide'
import { useCssHandles } from 'vtex.css-handles'
const CSS_HANDLES = [
  'loadingModal'

]

const Loading = () => {
  const { handles } = useCssHandles(CSS_HANDLES)
  return (
    <div className= {`${handles.loadingModal} mw9 w-100 center`}>
      <div
        className={`center flex w-100 items-center justify-center flex-wrap ${handles.loadingWishlist}`}
      >
        <div>
          <Spinner />
        </div>
      </div>
    </div>
  )
}

export default Loading