// import React from 'react'
// import { Outlet } from 'react-router-dom'

// const PrivateRoute = ({allowedRules}) => {
//   return <Outlet />
// }

// export default PrivateRoute




import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { UserContext } from "../context/userContext";

const PrivateRoute = ({ allowedRoles }) => {
  const { user, loading } = useContext(UserContext);

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect user to their correct dashboard
    if (user.role === "superadmin") {
      return <Navigate to="/superadmin/dashboard" replace />;
    }

    if (user.role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }

    return <Navigate to="/user/dashboard" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
