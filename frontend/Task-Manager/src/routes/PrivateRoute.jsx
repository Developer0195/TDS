import React from 'react'
import { Outlet } from 'react-router-dom'

const PrivateRoute = ({allowedRules}) => {
  return <Outlet />
}

export default PrivateRoute