import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';

import Dashboard from './pages/Admin/Dashboard';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import VerifyEmail from './pages/Auth/VerifyEmail';
import ManageTasks from './pages/Admin/ManageTasks';
import CreateTask from './pages/Admin/CreateTask';
import CreateProject from "./pages/Admin/CreateProject";
import ManageUsers from './pages/Admin/ManageUsers';
import ManageProjects from './pages/Admin/ManageProjects';

import UserDashboard from './pages/Users/UserDashboard';
import Mytasks from './pages/Users/Mytasks';
import ViewTaskDetails from './pages/Users/ViewTaskDetails';

import Attendance from "./pages/Attendance/Attendance";

import PrivateRoute from './routes/PrivateRoute';
import UserProvider, { UserContext } from './context/userContext';
import { Toaster } from 'react-hot-toast';

import UserProfile from "./pages/Profile/UserProfile";
import UserAnalyticsPage from './pages/Admin/UserAnalyticsPage';

/* ✅ ROOT COMPONENT — MUST EXIST */
const Root = () => {
  const { user, loading } = useContext(UserContext);

  if (loading) return <Outlet />;

  if (!user) {
    return <Navigate to="/login" />;
  }

  return user.role === "admin"
    ? <Navigate to="/admin/dashboard" />
    : <Navigate to="/user/dashboard" />;
};

const App = () => {
  return (
    <UserProvider>
      <Router>
        <Routes>

          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* Admin Routes */}
          <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/tasks" element={<ManageTasks />} />
            <Route path="/admin/create-task" element={<CreateTask />} />
            <Route path="/admin/create-project" element={<CreateProject />} />
            <Route path="/admin/projects" element={<ManageProjects />} />
            <Route path="/admin/users" element={<ManageUsers />} />
            <Route path="/admin/users/:id" element={<UserAnalyticsPage />} />
          </Route>

          {/* User Routes */}
          <Route element={<PrivateRoute allowedRoles={["member"]} />}>
            <Route path="/user/dashboard" element={<UserDashboard />} />
            <Route path="/user/my-tasks" element={<Mytasks />} />
            <Route path="/user/task-details/:id" element={<ViewTaskDetails />} />
          </Route>

          {/* Attendance (Admin + Member) */}
          <Route element={<PrivateRoute allowedRoles={["admin", "member"]} />}>
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/profile" element={<UserProfile />} />
          </Route>

          {/* Default Route */}
          <Route path="/" element={<Root />} />

        </Routes>
      </Router>

      <Toaster
        toastOptions={{
          style: { fontSize: "13px" },
        }}
      />
    </UserProvider>
  );
};

export default App;
