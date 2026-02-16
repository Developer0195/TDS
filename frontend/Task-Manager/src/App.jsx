// import React, { useContext } from 'react';
// import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';

// import Dashboard from './pages/Admin/Dashboard';
// import Login from './pages/Auth/Login';
// import Signup from './pages/Auth/Signup';
// import VerifyEmail from './pages/Auth/VerifyEmail';
// import ManageTasks from './pages/Admin/ManageTasks';
// import CreateTask from './pages/Admin/CreateTask';
// import CreateProject from "./pages/Admin/CreateProject";
// import ManageUsers from './pages/Admin/ManageUsers';
// import ManageProjects from './pages/Admin/ManageProjects';

// import UserDashboard from './pages/Users/UserDashboard';
// import Mytasks from './pages/Users/Mytasks';
// import ViewTaskDetails from './pages/Users/ViewTaskDetails';

// import Attendance from "./pages/Attendance/Attendance";

// import PrivateRoute from './routes/PrivateRoute';
// import UserProvider, { UserContext } from './context/userContext';
// import { Toaster } from 'react-hot-toast';

// import UserProfile from "./pages/Profile/UserProfile";
// import UserAnalyticsPage from './pages/Admin/UserAnalyticsPage';
// import WeeklyTasks from './pages/Users/WeeklyTasks';
// import MyAttendance from './pages/Users/UserAttendance';

// import SuperAdminDashboard from "./pages/SuperAdmin/Dashboard"
// import SuperAdminCreateProject from "./pages/SuperAdmin/CreateProject"
// import SuperAdminCreateTask from "./pages/SuperAdmin/CreateTask"
// import SuperAdminManageProjects from "./pages/SuperAdmin/ManageProjects"
// import SuperAdminManageTasks from "./pages/SuperAdmin/ManageTasks"
// import SuperAdminManageUsers from "./pages/SuperAdmin/ManageUsers"
// import SuperAdminUserAnalytics from "./pages/SuperAdmin/UserAnalyticsPage"

// /* ✅ ROOT COMPONENT — MUST EXIST */
// // const Root = () => {
// //   const { user, loading } = useContext(UserContext);

// //   if (loading) return <Outlet />;

// //   if (!user) {
// //     return <Navigate to="/login" />;
// //   }

// //   return user.role === "admin"
// //     ? <Navigate to="/admin/dashboard" />
// //     : <Navigate to="/user/dashboard" />;
// // };


// const Root = () => {
//   const { user, loading } = useContext(UserContext);

//   console.log(user)

//   if (loading) return <Outlet />;

//   if (!user) {
//     return <Navigate to="/login" />;
//   }

//   if (user.role == "superadmin") {
//     return <Navigate to="/superadmin/dashboard" />;
//   }

//   if (user.role == "admin") {
//     return <Navigate to="/admin/dashboard" />;
//   }

//   return <Navigate to="/user/dashboard" />;
// };



// const App = () => {
//   return (
//     <UserProvider>
//       <Router>
//         <Routes>

//           {/* Public Routes */}
//           <Route path="/login" element={<Login />} />
//           <Route path="/signup" element={<Signup />} />
//           <Route path="/verify-email" element={<VerifyEmail />} />

//           {/* SuperAdmin Routes */}
//            <Route element={<PrivateRoute allowedRoles={["superadmin"]} />}>
//             <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
//             <Route path="/superadmin/tasks" element={<SuperAdminManageTasks />} />
//             <Route path="/superadmin/create-task" element={<SuperAdminCreateTask />} />
//             <Route path="/superadmin/create-project" element={<SuperAdminCreateProject />} />
//             <Route path="/superadmin/projects" element={<SuperAdminManageProjects />} />
//             <Route path="/superadmin/users" element={<SuperAdminManageUsers />} />
//             <Route path="/superadmin/users/:id" element={<SuperAdminUserAnalytics />} />
//           </Route>

//           {/* Admin Routes */}
//           <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
//             <Route path="/admin/dashboard" element={<Dashboard />} />
//             <Route path="/admin/tasks" element={<ManageTasks />} />
//             <Route path="/admin/create-task" element={<CreateTask />} />
//             <Route path="/admin/create-project" element={<CreateProject />} />
//             <Route path="/admin/projects" element={<ManageProjects />} />
//             <Route path="/admin/users" element={<ManageUsers />} />
//             <Route path="/admin/users/:id" element={<UserAnalyticsPage />} />
//           </Route>

//           {/* User Routes */}
//           <Route element={<PrivateRoute allowedRoles={["member"]} />}>
//             <Route path="/user/dashboard" element={<UserDashboard />} />
//             <Route path="/user/my-tasks" element={<Mytasks />} />
//             <Route path="/user/task-details/:id" element={<ViewTaskDetails />} />
//             <Route path = "/user/weekly-tasks" element = {<WeeklyTasks />} />
//             <Route path = "/user/attendance" element = {<MyAttendance />} />
//           </Route>

//           {/* Attendance (Admin + Member) */}
//           <Route element={<PrivateRoute allowedRoles={["admin", "member"]} />}>
//             <Route path="/attendance" element={<Attendance />} />
//             <Route path="/profile" element={<UserProfile />} />
//           </Route>

//           {/* Default Route */}
//           <Route path="/" element={<Root />} />

//         </Routes>
//       </Router>

//       <Toaster
//         toastOptions={{
//           style: { fontSize: "13px" },
//         }}
//       />
//     </UserProvider>
//   );
// };

// export default App;













import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Dashboard from "./pages/Admin/Dashboard";
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import VerifyEmail from "./pages/Auth/VerifyEmail";
import ManageTasks from "./pages/Admin/ManageTasks";
import CreateTask from "./pages/Admin/CreateTask";
import CreateProject from "./pages/Admin/CreateProject";
import ManageUsers from "./pages/Admin/ManageUsers";
import ManageProjects from "./pages/Admin/ManageProjects";
import AdminWeeklyTaskReview from "./pages/Admin/WeeklyTaskReview";

import UserDashboard from "./pages/Users/UserDashboard";
import Mytasks from "./pages/Users/Mytasks";
import ViewTaskDetails from "./pages/Users/ViewTaskDetails";
import WeeklyTasks from "./pages/Users/WeeklyTasks";
import MyAttendance from "./pages/Users/UserAttendance";

import Attendance from "./pages/Attendance/Attendance";
import UserProfile from "./pages/Profile/UserProfile";
import UserAnalyticsPage from "./pages/Admin/UserAnalyticsPage";

import SuperAdminDashboard from "./pages/SuperAdmin/Dashboard";
import SuperAdminCreateProject from "./pages/SuperAdmin/CreateProject";
import SuperAdminCreateTask from "./pages/SuperAdmin/CreateTask";
import SuperAdminManageProjects from "./pages/SuperAdmin/ManageProjects";
import SuperAdminManageTasks from "./pages/SuperAdmin/ManageTasks";
import SuperAdminManageUsers from "./pages/SuperAdmin/ManageUsers";
import SuperAdminUserAnalytics from "./pages/SuperAdmin/UserAnalyticsPage";
import SuperAdminWeeklyTaskReview from "./pages/SuperAdmin/WeeklyTaskReview"


import PrivateRoute from "./routes/PrivateRoute";
import UserProvider from "./context/userContext";
import { Toaster } from "react-hot-toast";

const App = () => {
  return (
    <UserProvider>
      <Router>
        <Routes>
          {/* ================= PUBLIC ROUTES ================= */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* ================= SUPERADMIN ROUTES ================= */}
          <Route element={<PrivateRoute allowedRoles={["superadmin"]} />}>
            <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
            <Route path="/superadmin/tasks" element={<SuperAdminManageTasks />} />
            <Route path="/superadmin/create-task" element={<SuperAdminCreateTask />} />
            <Route path="/superadmin/create-project" element={<SuperAdminCreateProject />} />
            <Route path="/superadmin/projects" element={<SuperAdminManageProjects />} />
            <Route path="/superadmin/users" element={<SuperAdminManageUsers />} />
            <Route path="/superadmin/users/:id" element={<SuperAdminUserAnalytics />} />
            <Route path="/superadmin/users/:userId/weekly-tasks" element={<SuperAdminWeeklyTaskReview/>} />
            
          </Route>

          {/* ================= ADMIN ROUTES ================= */}
          <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/tasks" element={<ManageTasks />} />
            <Route path="/admin/create-task" element={<CreateTask />} />
            <Route path="/admin/create-project" element={<CreateProject />} />
            <Route path="/admin/projects" element={<ManageProjects />} />
            <Route path="/admin/users" element={<ManageUsers />} />
            <Route path="/admin/users/:id" element={<UserAnalyticsPage />} />
            <Route path="/admin/users/:userId/weekly-tasks" element={<AdminWeeklyTaskReview />} />
          </Route>

          {/* ================= MEMBER ROUTES ================= */}
          <Route element={<PrivateRoute allowedRoles={["member"]} />}>
            <Route path="/user/dashboard" element={<UserDashboard />} />
            <Route path="/user/my-tasks" element={<Mytasks />} />
            <Route path="/user/task-details/:id" element={<ViewTaskDetails />} />
            <Route path="/user/weekly-tasks" element={<WeeklyTasks />} />
            <Route path="/user/attendance" element={<MyAttendance />} />
          </Route>

          {/* ================= SHARED ROUTES ================= */}
          <Route element={<PrivateRoute allowedRoles={["admin", "member", "superadmin"]} />}>
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/profile" element={<UserProfile />} />
          </Route>

          {/* ================= DEFAULT REDIRECT ================= */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* ================= CATCH ALL ================= */}
          <Route path="*" element={<Navigate to="/login" replace />} />
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

