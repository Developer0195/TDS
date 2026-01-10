import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../../context/userContext";
import DashboardLayout from "../../components/Layouts/DashboardLayout";
import { API_PATHS } from "../../utils/apiPaths";
import axiosInstance from "../../utils/axiosInstance";

const UserProfile = () => {
    const { user, updateUser  } = useContext(UserContext);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        skills: [],
        role: "",
    });

    const [analytics, setAnalytics] = useState(null);

    /* ================= FETCH PROFILE ================= */
    const fetchProfile = async () => {
        try {
            const response = await axiosInstance.get(
                API_PATHS.USERS.GET_MY_PROFILE
            );

            setAnalytics(response.data?.analytics || {});
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    };

    /* ================= INIT ================= */
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                email: user.email || "",
                phone: user.phone || "",
                skills: user.skills || [],
                role: user.role || "",
            });
        }

        fetchProfile();
        return () => { };
    }, [user]);

    /* ================= HANDLERS ================= */
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSave = async () => {
        try {
            const response = await axiosInstance.put(
                API_PATHS.USERS.UPDATE_MY_PROFILE,
                {
                    name: formData.name,
                    phone: formData.phone,
                    skills: formData.skills,
                }
            );

            updateUser({
                ...user,
                ...response.data,
            });
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    };


    /* ================= UI ================= */
    return (
        <DashboardLayout activeMenu="Profile">
            <div className="p-6 max-w-5xl mx-auto">

                {/* ⚠️ AI WARNING */}
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 p-4 rounded mb-6">
                    ⚠️ This is sensitive information. Please fill carefully as it will be used to train our AI.
                </div>

                {/* BASIC INFO */}
                <div className="bg-white rounded shadow p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4">Basic Information</h2>

                    <div className="grid grid-cols-2 gap-4">
                        <input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="input"
                            placeholder="Name"
                        />

                        <input
                            value={formData.email}
                            disabled
                            className="input bg-gray-100"
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
                        onClick={handleSave}
                        className="mt-4 bg-primary text-white px-4 py-2 rounded"
                    >
                        Save Changes
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
        <h3 className="text-xl font-semibold">{value ?? 0}</h3>
    </div>
);

export default UserProfile;
