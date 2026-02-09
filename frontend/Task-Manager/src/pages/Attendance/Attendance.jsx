import React, { useState } from "react";
import DashboardLayout from "../../components/Layouts/DashboardLayout";
import DailyAttendance from "./DailyAttendance";
import MyAttendance from "./MyAttendance";
import TeamAttendance from "./TeamAttendance";
import AttendanceLocations from "./AttendanceLocations";

const TABS = [
  { key: "daily", label: "Daily Attendance" },
  { key: "my", label: "My Attendance" },
  { key: "team", label: "Team Attendance" },
  { key: "location", label: "Attendance Locations" },
];

const Attendance = () => {
  const [activeTab, setActiveTab] = useState("daily");

  return (
    <DashboardLayout activeMenu="Attendance">
      <div className="my-5">

        {/* HEADER */}
        <div className="mb-6">
          <h2 className="text-xl font-medium text-gray-900">Attendance</h2>
          <p className="text-sm text-gray-500">
            Manage your and team attendance
          </p>
        </div>

        {/* TABS */}
        <div className="flex gap-2 border-b border-gray-300 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 ${
                activeTab === tab.key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB CONTENT */}
        {activeTab === "daily" && <DailyAttendance />}
        {activeTab === "my" && <MyAttendance />}

        {activeTab === "team" && (
          <TeamAttendance />
        )}

        {activeTab === "location" && (
          <AttendanceLocations />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Attendance;


