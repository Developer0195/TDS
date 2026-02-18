import { useEffect, useState } from "react";
import DashboardLayout from "../../components/Layouts/DashboardLayout";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { LuUserPlus, LuTrash2 } from "react-icons/lu";
import toast from "react-hot-toast";
import TaskStatusChips from "../../components/TaskStatusChip";
import { useNavigate } from "react-router-dom";

const ManageUsers = () => {
  /* =======================
     STATE
  ======================= */
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const navigate = useNavigate();

  /* =======================
     FETCH TEAM MEMBERS
  ======================= */
  const fetchTeamMembers = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.USERS.GET_ADMIN_TEAM);
      setTeamMembers(res.data || []);
    } catch (error) {
      toast.error("Failed to load team members");
    }
  };

  /* =======================
     FETCH ALL USERS
  ======================= */
  const fetchAllUsers = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.USERS.GET_ALL_USERS);
      setAllUsers(res.data || []);
      setFilteredUsers(res.data || []);
    } catch (error) {
      toast.error("Failed to load users");
    }
  };

  /* =======================
     ADD TEAM MEMBER
  ======================= */
  const addTeamMember = async (userId) => {
    try {
      await axiosInstance.post(API_PATHS.USERS.ADD_TEAM_MEMBER, {
        memberId: userId,
      });

      toast.success("Member added to team");
      setSearchQuery("");
      setShowDropdown(false);
      fetchTeamMembers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add member");
    }
  };

  /* =======================
     REMOVE TEAM MEMBER
  ======================= */
  const removeTeamMember = async (memberId) => {
    try {
      await axiosInstance.delete(API_PATHS.USERS.REMOVE_TEAM_MEMBER(memberId));
      toast.success("Member removed from team");
      fetchTeamMembers();
    } catch {
      toast.error("Failed to remove member");
    }
  };

  /* =======================
     EFFECTS
  ======================= */
  useEffect(() => {
    fetchTeamMembers();
    fetchAllUsers();
  }, []);

  useEffect(() => {
    const q = searchQuery.toLowerCase().trim();

    if (!q) {
      setFilteredUsers(allUsers);
      return;
    }

    setFilteredUsers(
      allUsers.filter(
        (u) =>
          u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
      ),
    );
  }, [searchQuery, allUsers]);

  /* =======================
     USERS NOT IN TEAM
  ======================= */
  const teamMemberIds = teamMembers.map((m) => m._id);

  const availableUsers = filteredUsers.filter(
    (u) => !teamMemberIds.includes(u._id),
  );

  /* =======================
     UI
  ======================= */
  return (
    <DashboardLayout activeMenu="Team Members">
      <div className="my-6">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-medium">Team Members</h2>
        </div>

        {/* ADD MEMBER */}
        <div className="relative max-w-md mb-6">
          <label className="text-xs text-gray-500 mb-1 block">
            Add Team Member
          </label>

          <div className="flex items-center gap-2 border border-gray-300 rounded px-3 py-2 bg-white">
            <LuUserPlus className="text-gray-400" />
            <input
              type="text"
              placeholder="Search or select user"
              className="w-full text-sm outline-none"
              value={searchQuery}
              onFocus={() => setShowDropdown(true)}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* DROPDOWN */}
          {showDropdown && availableUsers.length > 0 && (
            <div className="absolute z-10 w-full bg-white border border-gray-300 rounded mt-1 shadow max-h-60 overflow-y-auto">
              {availableUsers.map((user) => (
                <div
                  key={user._id}
                  className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100"
                  onClick={() => addTeamMember(user._id)}
                >
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TEAM TABLE */}
    {/* TEAM TABLE */}
<div className="border border-gray-300 rounded-lg bg-white">
  <div className="w-full overflow-x-auto">
    {/* Force table width wider than mobile */}
    <div className="min-w-[1200px]">

      {/* Header */}
      <div className="grid grid-cols-13 gap-3 px-4 py-2 bg-gray-50 text-xs font-medium text-gray-500 border-b">
        <div className="col-span-3 whitespace-nowrap">Member</div>
        <div className="col-span-5 whitespace-nowrap">Task Status</div>
        <div className="col-span-3 whitespace-nowrap">On-Time Completion %</div>
        <div className="col-span-1 text-right whitespace-nowrap">Action</div>
        <div className="col-span-1 text-right whitespace-nowrap">Weekly Task</div>
      </div>

      {/* Rows */}
      {teamMembers.length === 0 ? (
        <p className="p-4 text-sm text-gray-400">
          No team members added yet.
        </p>
      ) : (
        teamMembers.map((member) => (
          <div
            key={member._id}
            onClick={() => navigate(`/admin/users/${member._id}`)}
            className="cursor-pointer grid grid-cols-13 gap-3 px-4 py-3 border-b text-sm items-center"
          >
            <div className="col-span-3 whitespace-nowrap">
              <p className="font-medium">{member.name}</p>
              <p className="text-xs text-gray-500 truncate">
                {member.email}
              </p>
            </div>

            <div className="col-span-5 whitespace-nowrap">
              <TaskStatusChips taskCounts={member.taskCounts} />
            </div>

            <div className="col-span-3 whitespace-nowrap">
              <span className="text-xs font-medium px-2 py-1 rounded bg-green-100 text-green-700">
                {member.onTimeCompletionRate}%
              </span>
            </div>

            <div className="col-span-1 text-right whitespace-nowrap">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeTeamMember(member._id);
                }}
                className="text-red-500 hover:text-red-700"
              >
                <LuTrash2 />
              </button>
            </div>

            <div
              className="col-span-1 flex justify-center whitespace-nowrap"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/admin/users/${member._id}/weekly-tasks`);
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
