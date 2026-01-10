import React, { useContext, useEffect, useState } from "react";
import DashboardLayout from "../../components/Layouts/DashboardLayout";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { UserContext } from "../../context/userContext";
import { LuLogIn, LuLogOut, LuClock } from "react-icons/lu";

const Attendance = () => {
  const { user } = useContext(UserContext);

  const [loading, setLoading] = useState(false);
  const [today, setToday] = useState(null);
  const [attendanceList, setAttendanceList] = useState([]);
  const [error, setError] = useState(null);

  /* ---------------- FETCH DATA ---------------- */
  const fetchAttendance = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.ATTENDANCE.MY_ATTENDANCE);
      setToday(res.data.today || null);
      setAttendanceList(res.data.attendance || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  /* ---------------- LOCATION HANDLER ---------------- */
  const withLocation = (callback) => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => callback(pos.coords),
      () => {
        setError("Location permission is required");
        setLoading(false);
      }
    );
  };

  const handlePunchIn = () =>
    withLocation(async ({ latitude, longitude }) => {
      try {
        await axiosInstance.post(API_PATHS.ATTENDANCE.PUNCH_IN, {
          latitude,
          longitude,
        });
        fetchAttendance();
      } catch (err) {
        setError(err.response?.data?.message);
      } finally {
        setLoading(false);
      }
    });

  const handlePunchOut = () =>
    withLocation(async ({ latitude, longitude }) => {
      try {
        await axiosInstance.post(API_PATHS.ATTENDANCE.PUNCH_OUT, {
          latitude,
          longitude,
        });
        fetchAttendance();
      } catch (err) {
        setError(err.response?.data?.message);
      } finally {
        setLoading(false);
      }
    });

  const formatDuration = (minutes = 0) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  return (
    <DashboardLayout activeMenu="Attendance">
      <div className="my-5">

        {/* ---------- HEADER ---------- */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-medium text-gray-950">
              Attendance
            </h2>
            <p className="text-sm text-gray-500">
              Track your daily work attendance
            </p>
          </div>
        </div>

        {/* ---------- TODAY CARD ---------- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-gray-200/60 rounded-lg p-5">
            <p className="text-sm text-gray-500 mb-1">Employee</p>
            <p className="font-medium text-gray-900">{user?.name}</p>

            {!today?.punchIn && (
              <button
                onClick={handlePunchIn}
                disabled={loading}
                className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
              >
                <LuLogIn />
                Punch In
              </button>
            )}

            {today?.punchIn && !today?.punchOut && (
              <button
                onClick={handlePunchOut}
                disabled={loading}
                className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
              >
                <LuLogOut />
                Punch Out
              </button>
            )}

            {today?.punchIn && today?.punchOut && (
              <div className="mt-4 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <LuClock />
                  <span>
                    {formatDuration(today.totalDurationMinutes)}
                  </span>
                </div>
                <p
                  className={`mt-1 font-medium ${
                    today.status === "WFO"
                      ? "text-green-600"
                      : "text-orange-600"
                  }`}
                >
                  {today.status}
                </p>
              </div>
            )}

            {error && (
              <p className="text-xs text-red-500 mt-3">
                {error}
              </p>
            )}
          </div>
        </div>

        {/* ---------- HISTORY TABLE ---------- */}
        <div className="bg-white border border-gray-200/60 rounded-lg">
          <div className="border-b border-gray-200/60 px-5 py-3">
            <h3 className="font-medium text-gray-900">
              Attendance History
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="text-left px-5 py-3">Date</th>
                  <th className="text-left px-5 py-3">Punch In</th>
                  <th className="text-left px-5 py-3">Punch Out</th>
                  <th className="text-left px-5 py-3">Duration</th>
                  <th className="text-left px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {attendanceList.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-5 py-4 text-gray-500">
                      No attendance records found
                    </td>
                  </tr>
                ) : (
                  attendanceList.map((item) => (
                    <tr key={item._id}>
                      <td className="px-5 py-3">
                        {new Date(item.date).toDateString()}
                      </td>
                      <td className="px-5 py-3">
                        {item.punchIn?.time &&
                          new Date(item.punchIn.time).toLocaleTimeString()}
                      </td>
                      <td className="px-5 py-3">
                        {item.punchOut?.time &&
                          new Date(item.punchOut.time).toLocaleTimeString()}
                      </td>
                      <td className="px-5 py-3">
                        {formatDuration(item.totalDurationMinutes)}
                      </td>
                      <td
                        className={`px-5 py-3 font-medium ${
                          item.status === "WFO"
                            ? "text-green-600"
                            : "text-orange-600"
                        }`}
                      >
                        {item.status}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Attendance;
