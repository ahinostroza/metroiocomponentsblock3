/* eslint-disable prettier/prettier */
import React, { Fragment } from 'react'
import { Route } from 'vtex.my-account-commons/Router'

// Your component pages
import OrderListPage from './OrderListPage'

const AccountPageWishlist = () => (
  <Fragment>
    {/* This `path` will be added at the end of the URL */}
    <Route path="/orders-legacy" exact component={OrderListPage} />
  </Fragment>
)

export default AccountPageWishlist
