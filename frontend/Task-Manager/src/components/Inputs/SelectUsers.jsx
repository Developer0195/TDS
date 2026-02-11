import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import Modal from "../Modal";
import AvatarGroup from "../AvatarGroup";
import { LuUser } from "react-icons/lu";
import { API_PATHS } from "../../utils/apiPaths";

const SelectUsers = ({ disabled, selectedUsers, setSelectedUsers, users: externalUsers }) => {
  const [allUsers, setAllUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false); // ✅ FIX
  const [tempSelectedUsers, setTempSelectedUsers] = useState([]);

  const getAllUsers = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.USERS.GET_ADMIN_TEAM);
      if (response.data?.length > 0) {
        setAllUsers(response.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const toggleUserSelection = (userId) => {
    setTempSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };



  const handleAssign = () => {
    setSelectedUsers(tempSelectedUsers);
    setIsModalOpen(false);
  };

   const displayUsers =
  externalUsers && externalUsers.length > 0
    ? externalUsers
    : allUsers;

  const selectedUserAvatars = displayUsers
    .filter((user) => selectedUsers.includes(user._id))
    .map((user) => user.profileImageUrl);

  useEffect(() => {
  // If project members are passed, DO NOT fetch all users
  if (externalUsers && externalUsers.length > 0) return;

  getAllUsers();
}, [externalUsers]);


  useEffect(() => {
    setTempSelectedUsers(selectedUsers || []);
  }, [selectedUsers]);

 


  return (
    <div className="space-y-4 mt-2">
      {selectedUserAvatars.length === 0 && (
        <button
          disabled={disabled}
          type="button"
          className="card-btn"
          onClick={() => setIsModalOpen(true)} // ✅ FIX
        >
          <LuUser className="text-sm" /> Add Members
        </button>
      )}

      {selectedUserAvatars.length > 0 && (
        <div
          className="cursor-pointer"
          onClick={() => setIsModalOpen(true)}
        >
          <AvatarGroup avatars={selectedUserAvatars} maxVisible={3} />
        </div>
      )}

      {
        !disabled &&
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Select users"
        >
          <div className="space-y-4 h-[60vh] overflow-y-auto">
            {displayUsers.map((user) => (
              <div
                key={user._id}
                className="flex items-center gap-4 p-3 border-b"
              >
                <img
                  src={user.profileImageUrl}
                  alt={user.name}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-[13px] text-gray-500">{user.email}</p>
                </div>

                <input
                  type="checkbox"
                  checked={tempSelectedUsers.includes(user._id)}
                  onChange={() => {toggleUserSelection(user._id);}}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button className="card-btn" onClick={() => setIsModalOpen(false)}>
              CANCEL
            </button>
            <button className="card-btn" onClick={handleAssign}>
              DONE
            </button>
          </div>
        </Modal>
      }
    </div>
  );
};

export default SelectUsers;
