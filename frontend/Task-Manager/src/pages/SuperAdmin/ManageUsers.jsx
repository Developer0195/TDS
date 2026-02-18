import { useEffect, useState } from "react";
import DashboardLayout from "../../components/Layouts/DashboardLayout";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";
import TaskStatusChips from "../../components/TaskStatusChip";
import { useNavigate } from "react-router-dom";

const ManageUsers = () => {
  /* =======================
     STATE
  ======================= */
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  console.log(users);

  const navigate = useNavigate();

  /* =======================
     FETCH ALL USERS
  ======================= */
  const fetchAllUsers = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.USERS.GET_SUPERADMIN_USERS);

      const usersData = res.data?.users || res.data || [];

      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (error) {
      toast.error("Failed to load users");
    }
  };

  /* =======================
     LOAD ON MOUNT
  ======================= */
  useEffect(() => {
    fetchAllUsers();
  }, []);

  /* =======================
     SEARCH FILTER
  ======================= */
  useEffect(() => {
    const q = searchQuery.toLowerCase().trim();

    if (!q) {
      setFilteredUsers(users);
      return;
    }

    setFilteredUsers(
      users.filter(
        (u) =>
          u.name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q),
      ),
    );
  }, [searchQuery, users]);

  /* =======================
     UI
  ======================= */
  return (
    <DashboardLayout activeMenu="User Management">
      <div className="my-6">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-medium">All Users</h2>
        </div>

        {/* SEARCH */}
        <div className="max-w-md mb-6">
          <input
            type="text"
            placeholder="Search users by name or email..."
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* USERS TABLE */}
        {/* USERS TABLE */}
        <div className="border border-gray-300 rounded-lg bg-white">
          <div className="overflow-x-auto">
            <div className="min-w-[1000px]">
              {/* TABLE HEADER */}
              <div className="grid grid-cols-13 gap-3 px-4 py-2 bg-gray-50 text-xs font-medium text-gray-500 border-b">
                <div className="col-span-3">User</div>
                <div className="col-span-2">Role</div>
                <div className="col-span-4">Task Status</div>
                <div className="col-span-3">On-Time Completion %</div>
                <div className="col-span-1">Weekly Tasks</div>
              </div>

              {/* TABLE BODY */}
              {filteredUsers.length === 0 ? (
                <p className="p-4 text-sm text-gray-400">No users found.</p>
              ) : (
                filteredUsers.map((user) => (
                  <div
                    key={user._id}
                    onClick={() => navigate(`/superadmin/users/${user._id}`)}
                    className="cursor-pointer grid grid-cols-13 gap-3 px-4 py-3 border-b text-sm items-center hover:bg-gray-50"
                  >
                    <div className="col-span-3">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>

                    <div className="col-span-2">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded ${
                          user.role === "superadmin"
                            ? "bg-purple-100 text-purple-700"
                            : user.role === "admin"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {user.role}
                      </span>
                    </div>

                    <div className="col-span-4">
                      <TaskStatusChips taskCounts={user.taskCounts} />
                    </div>

                    <div className="col-span-3">
                      <span className="text-xs font-medium px-2 py-1 rounded bg-green-100 text-green-700">
                        {user.onTimeCompletionRate || 0}%
                      </span>
                    </div>

                    <div
                      className="col-span-1 flex justify-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/superadmin/users/${user._id}/weekly-tasks`);
                      }}
                    >
                      <button className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-200">
                        View
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ManageUsers;
