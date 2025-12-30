import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Admin/Dashboard';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import ManageTasks from './pages/Admin/ManageTasks';
import CreateTask from './pages/Admin/CreateTask';
import ManageUsers from './pages/Admin/ManageUsers';
import UserDashboard from './pages/Users/UserDashboard';
import Mytasks from './pages/Users/Mytasks';
import ViewTaskDetails from './pages/Users/ViewTaskDetails';
import PrivateRoute from './routes/PrivateRoute';

const App = () => {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />}/> 
          <Route path="/signup" element={<Signup />} />
{/*Admin Routes */}
          <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
           <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/tasks" element= {<ManageTasks />} />
             <Route path="/admin/create-task" element={<CreateTask />} /> 
             <Route path="/admin/users" element={<ManageUsers />} /> 
{/*User Routes */}

             </Route>
             <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
           <Route path="/user/dashboard" element={<UserDashboard />} />
           <Route path="/user/my-tasks" element={<Mytasks />} />
           <Route path="/user/task-details/:id" element={<ViewTaskDetails />} /> 
             </Route>
        </Routes>
      </Router>
    </div>
  )
}

export default App