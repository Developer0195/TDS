import React, { useEffect, useState, useContext } from "react";
import axiosInstance from "../../utils/axiosInstance";
import AddLocationModal from "../../components/Modals/AddLocationModal";
import { API_PATHS } from "../../utils/apiPaths";
import { Trash2, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import { UserContext } from "../../context/userContext";

const PAGE_SIZE = 10;

const AttendanceLocations = () => {
  const {user} = useContext(UserContext);
  const [showModal, setShowModal] = useState(false);
  const [locations, setLocations] = useState([]);
  const [users, setUsers] = useState([]);

  const [selectedUser, setSelectedUser] = useState("");
  const [selectedUserObj, setSelectedUserObj] = useState(null);

  const [selectedLocations, setSelectedLocations] = useState([]);
  const [loading, setLoading] = useState(false);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [page, setPage] = useState(1);

  /* ---------------- Fetch Locations ---------------- */
  const fetchLocations = async () => {
    const res = await axiosInstance.get(API_PATHS.LOCATIONS.GET_ALL);
    setLocations(res.data.locations || []);
  };

  /* ---------------- Fetch Team Members ---------------- */
  const fetchUsers = async () => {
    let res = null;
    if(user.role == "admin"){
      res = await axiosInstance.get(API_PATHS.USERS.GET_ADMIN_TEAM);
    }
    else{
      res = await axiosInstance.get(API_PATHS.USERS.GET_ALL_USERS);
    }
    if(res.data){
      setUsers(res.data || []);
    }
    
  };

  useEffect(() => {
    fetchLocations();
    fetchUsers();
  }, []);

  /* ---------------- Handle User Change ---------------- */
  const handleUserChange = (userId) => {
    setSelectedUser(userId);

    const user = users.find((u) => u._id === userId);
    setSelectedUserObj(user || null);

    // ✅ preselect already assigned locations
    const assignedIds =
      user?.assignedLocations?.map((loc) => loc._id) || [];
    setSelectedLocations(assignedIds);
  };

  /* ---------------- Toggle Location (Max 5) ---------------- */
  const toggleLocation = (id) => {
    if (selectedLocations.includes(id)) {
      setSelectedLocations(selectedLocations.filter((l) => l !== id));
    } else {
      if (selectedLocations.length >= 5) {
        toast.error("You can assign maximum 5 locations");
        return;
      }
      setSelectedLocations([...selectedLocations, id]);
    }
  };

  /* ---------------- Assign Locations ---------------- */
  const assignLocations = async () => {
  if (!selectedUser) return toast.error("Please select a team member");

  setLoading(true);
  try {
    await axiosInstance.put(
      API_PATHS.LOCATIONS.ASSIGN(selectedUser),
      { locationIds: selectedLocations }
    );

    toast.success("Locations assigned successfully");

    // 🔥 UPDATE USER LOCALLY (NO REFRESH)
    const updatedLocations = locations.filter((loc) =>
      selectedLocations.includes(loc._id)
    );

    setUsers((prev) =>
      prev.map((u) =>
        u._id === selectedUser
          ? { ...u, assignedLocations: updatedLocations }
          : u
      )
    );

    setSelectedUserObj((prev) =>
      prev ? { ...prev, assignedLocations: updatedLocations } : prev
    );
  } catch (err) {
    toast.error(err.response?.data?.message || "Assignment failed");
  } finally {
    setLoading(false);
  }
};

  /* ---------------- Delete Location ---------------- */
  const deleteLocation = async (id) => {
    if (!window.confirm("Delete this location?")) return;
    await axiosInstance.delete(API_PATHS.LOCATIONS.DELETE(id));
    fetchLocations();
  };

  /* ---------------- Pagination ---------------- */
  const totalPages = Math.ceil(locations.length / PAGE_SIZE);
  const paginatedLocations = locations.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-lg font-semibold">Attendance Locations</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-3 py-1.5 text-sm rounded"
        >
          + Add Location
        </button>
      </div>

      {/* ASSIGN SECTION */}
      <div className="bg-white border border-gray-300 rounded-lg p-4 mb-6">
        <h2 className="font-medium text-sm mb-3">Assign Sites</h2>

        {/* USER DROPDOWN */}
        <select
          value={selectedUser}
          onChange={(e) => handleUserChange(e.target.value)}
          className="border border-gray-300 p-2 rounded w-full mb-3 text-sm"
        >
          <option value="">Select Team Member</option>
          {users.map((u) => (
            <option key={u._id} value={u._id}>
              {u.name} ({u.email})
            </option>
          ))}
        </select>

        {/* ✅ SHOW ASSIGNED LOCATIONS */}
        {selectedUserObj?.assignedLocations?.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-1">
              Currently Assigned Locations
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedUserObj.assignedLocations.map((loc) => (
                <span
                  key={loc._id}
                  className="text-xs bg-gray-100 px-2 py-1 rounded"
                >
                  {loc.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* LOCATIONS DROPDOWN */}
        <div className="relative mb-4">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm flex justify-between items-center"
          >
            <span>
              Select Locations ({selectedLocations.length}/5)
            </span>
            <ChevronDown size={16} />
          </button>

          {dropdownOpen && (
            <div className="absolute z-10 bg-white border border-gray-300 rounded mt-1 w-full max-h-56 overflow-auto">
              {locations.map((loc) => (
                <label
                  key={loc._id}
                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedLocations.includes(loc._id)}
                    onChange={() => toggleLocation(loc._id)}
                  />
                  <span>{loc.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={assignLocations}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-1.5 text-sm rounded"
        >
          {loading ? "Assigning..." : "Assign Locations"}
        </button>
      </div>

      {/* LOCATIONS LIST */}
      <div className="bg-white border border-gray-300 rounded-lg p-4">
        <h2 className="font-medium text-sm mb-3">Existing Locations</h2>

        {paginatedLocations.length === 0 ? (
          <p className="text-xs text-gray-500">No locations added</p>
        ) : (
          <ul className="space-y-2">
            {paginatedLocations.map((loc) => (
              <li
                key={loc._id}
                className="border border-gray-200 p-3 rounded flex justify-between items-start"
              >
                <div>
                  <p className="text-sm font-medium">{loc.name}</p>
                  <p className="text-xs text-gray-500">{loc.address}</p>
                  <p className="text-xs text-gray-400">
                    Radius: {loc.radiusInMeters}m
                  </p>
                </div>

                <button
                  onClick={() => deleteLocation(loc._id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-end gap-2 mt-4">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-2 py-1 text-xs border rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-xs pt-1">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="px-2 py-1 text-xs border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <AddLocationModal
          onClose={() => setShowModal(false)}
          onCreated={fetchLocations}
        />
      )}
    </div>
  );
};

export default AttendanceLocations;
