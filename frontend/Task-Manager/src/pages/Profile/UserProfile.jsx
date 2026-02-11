import React, { useContext, useEffect, useState } from "react";
import DashboardLayout from "../../components/Layouts/DashboardLayout";
import { UserContext } from "../../context/userContext";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";

const UserProfile = () => {
  const { user, updateUser } = useContext(UserContext);

  /* ================= STATE ================= */
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
  });

  const [passwords, setPasswords] = useState({
    password: "",
    confirmPassword: "",
  });

  const [analytics, setAnalytics] = useState(null);

  // separate loading states for profile info and password info
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false)

  /* ================= FETCH PROFILE ================= */
  const fetchProfile = async () => {
    try {
      const res = await axiosInstance.get(
        API_PATHS.USERS.GET_MY_PROFILE
      );
      setAnalytics(res.data?.analytics || {});
    } catch (error) {
      console.error(error);
    }
  };

  /* ================= INIT ================= */
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role || "",
      });
    }

    fetchProfile();
  }, [user]);

  /* ================= HANDLERS ================= */
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e) => {
    setPasswords({
      ...passwords,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveProfile = async () => {
  try {
      setPasswordLoading(true)
    const emailChanged = formData.email !== user.email;

    const res = await axiosInstance.put(
      API_PATHS.AUTH.UPDATE_PROFILE,
      {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      }
    );

    // 🟡 EMAIL CHANGE FLOW
    if (emailChanged) {
      toast.success(
        "Verification email sent to your new email. Please verify to complete the update."
      );

      // ⛔ Do NOT update email in context yet
      setFormData((prev) => ({
        ...prev,
        email: user.email, // revert back until verified
      }));

      return;
    }

    // 🟢 NORMAL PROFILE UPDATE
    updateUser({
      ...user,
      ...res.data,
    });

    toast.success("Profile updated successfully");
  } catch (error) {
    toast.error(
      error.response?.data?.message || "Failed to update profile"
    );
  } finally {
    setProfileLoading(false)
  }
};



  /* ================= UPDATE PASSWORD ================= */
  const handleUpdatePassword = async () => {
    if (!passwords.password) {
      toast.error("Password is required");
      return;
    }

    if (passwords.password !== passwords.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setPasswordLoading(true);

      await axiosInstance.put(
        API_PATHS.AUTH.UPDATE_PROFILE,
        {
          password: passwords.password,
        }
      );

      toast.success("Password updated successfully");
      setPasswords({ password: "", confirmPassword: "" });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update password"
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <DashboardLayout activeMenu="Profile">
      <div className="p-6 max-w-5xl mx-auto space-y-6">

        {/* WARNING */}
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 p-4 rounded">
          ⚠️ This is sensitive information. Please update carefully.
        </div>

        {/* BASIC INFO */}
        <div className="bg-white rounded shadow p-6">
          <h2 className="text-lg font-semibold mb-4">
            Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input"
              placeholder="Full Name"
            />

            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input"
              placeholder="Email"
            />

            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="input"
              placeholder="Phone Number"
            />

            <input
              value={formData.role}
              disabled
              className="input bg-gray-100"
              placeholder="Role"
            />
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={profileLoading}
            className="mt-4 bg-primary text-white px-4 py-2 rounded"
          >
            {profileLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {/* PASSWORD */}
        <div className="bg-white rounded shadow p-6">
          <h2 className="text-lg font-semibold mb-4">
            Change Password
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="password"
              name="password"
              value={passwords.password}
              onChange={handlePasswordChange}
              className="input"
              placeholder="New Password"
            />

            <input
              type="password"
              name="confirmPassword"
              value={passwords.confirmPassword}
              onChange={handlePasswordChange}
              className="input"
              placeholder="Confirm New Password"
            />
          </div>

          <button
            onClick={handleUpdatePassword}
            disabled={passwordLoading}
            className="mt-4 bg-primary text-white px-4 py-2 rounded"
          >
            {passwordLoading ? "Updating..." : "Update Password"}
          </button>
        </div>

        {/* ANALYTICS */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard title="Tasks Completed" value={analytics.tasksCompleted} />
            <StatCard title="On-time %" value={`${analytics.onTimePercentage || 0}%`} />
            <StatCard title="Avg Delay (mins)" value={analytics.avgDelayMinutes} />
            <StatCard title="Weekly Hours" value={analytics?.avgWorkingHours?.weekly} />
            <StatCard title="Monthly Hours" value={analytics?.avgWorkingHours?.monthly} />
            <StatCard title="Yearly Hours" value={analytics?.avgWorkingHours?.yearly} />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

/* ================= STATS CARD ================= */
const StatCard = ({ title, value }) => (
  <div className="bg-white p-4 rounded shadow">
    <p className="text-sm text-gray-500">{title}</p>
    <h3 className="text-xl font-semibold">
      {value ?? 0}
    </h3>
  </div>
);

export default UserProfile;
