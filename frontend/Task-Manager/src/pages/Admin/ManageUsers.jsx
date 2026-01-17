import React, { useEffect, useState } from "react";
import { API_PATHS } from "../../utils/apiPaths";
import axiosInstance from "../../utils/axiosInstance";
import DashboardLayout from "../../components/Layouts/DashboardLayout";
import { LuFileSpreadsheet } from "react-icons/lu";
import UserCard from "../../components/Cards/UserCard";
import DeleteAlert from "../../components/DeleteAlert";
import { useNavigate } from "react-router-dom";

const ManageUsers = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [deleteError, setDeleteError] = useState("");

  const navigate = useNavigate();

  const getAllUsers = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.USERS.GET_ALL_USERS);
      if (response.data?.length > 0) {
        setAllUsers(response.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const confirmDeleteUser = (userId) => {
    setSelectedUserId(userId);
    setDeleteError("");
    setShowDeleteAlert(true);
  };

  const deleteUser = async () => {
    try {
      await axiosInstance.delete(
        API_PATHS.USERS.DELETE_USER(selectedUserId)
      );
      setShowDeleteAlert(false);
      setSelectedUserId(null);
      getAllUsers();
    } catch (error) {
      setDeleteError(
        error.response?.data?.message || "Failed to delete user"
      );
    }
  };

  const handleDownloadReport = async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.REPORTS.EXPORT_USERS,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "user_details.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading report:", error);
    }
  };

  useEffect(() => {
    getAllUsers();
  }, []);

  return (
    <DashboardLayout activeMenu="Team Members">
      <div className="mt-5 mb-10">
        <div className="flex md:flex-row md:items-center justify-between">
          <h2 className="text-xl font-medium">Team Members</h2>

          <button
            className="flex md:flex download-btn"
            onClick={handleDownloadReport}
          >
            <LuFileSpreadsheet className="text-lg" />
            Download Report
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {allUsers.map((user) => (
            <div key={user._id}>
              <UserCard
                userInfo={user}
                onClick={() => navigate(`/admin/users/${user._id}`)}
              />

              <button
                onClick={() => confirmDeleteUser(user._id)}
                className="mt-2 w-full text-sm bg-red-500 hover:bg-red-600 text-white py-1 rounded"
              >
                Delete User
              </button>
            </div>
          ))}
        </div>
      </div>

      {showDeleteAlert && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-5 w-[90%] max-w-sm">
            <DeleteAlert
              content={
                deleteError ||
                "Are you sure you want to delete this user?"
              }
              onDelete={deleteUser}
            />

            <button
              className="text-xs text-gray-500 mt-3"
              onClick={() => setShowDeleteAlert(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ManageUsers;
