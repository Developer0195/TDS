import React, { useContext, useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { UserContext } from "../../context/userContext";
import { LuCamera, LuClock } from "react-icons/lu";
import CameraCaptureModal from "../../components/CameraCaptureModal";
import LocationPopover from "../../components/LocationPopOver";

const MyAttendance = () => {
  const { user } = useContext(UserContext);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [today, setToday] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [action, setAction] = useState(null); // IN | OUT

  const fetchMyAttendance = async () => {
    setLoading(true);

    const params = {};
    if (startDate && endDate) {
      params.startDate = startDate;
      params.endDate = endDate;
    }

    const res = await axiosInstance.get(API_PATHS.ATTENDANCE.MY_ATTENDANCE, {
      params,
    });

    setToday(res.data.today);
    setHistory(res.data.attendance || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchMyAttendance();
  }, []);

  const handleCapture = async (photoBase64) => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const payload = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        photoBase64,
      };

      if (action === "IN") {
        await axiosInstance.post(API_PATHS.ATTENDANCE.PUNCH_IN, payload);
      } else {
        await axiosInstance.post(API_PATHS.ATTENDANCE.PUNCH_OUT, payload);
      }

      setCameraOpen(false);
      fetchMyAttendance();
    });
  };

  return (
    <>
      {/* TODAY CARD */}
      <div className="bg-white border border-gray-300 rounded-lg p-5 mb-6 max-w-md">
        <p className="text-sm text-gray-500">Employee</p>
        <p className="font-medium">{user?.name}</p>

        <CameraCaptureModal
          isOpen={cameraOpen}
          onClose={() => setCameraOpen(false)}
          onCapture={handleCapture}
        />

        {!today?.punchIn && (
          <button
            onClick={() => {
              setAction("IN");
              setCameraOpen(true);
            }}
            className="btn-primary w-full flex items-center justify-center gap-4 mt-4"
          >
            <LuCamera size={20} /> Punch In
          </button>
        )}

        {today?.punchIn && !today?.punchOut && (
          <button
            onClick={() => {
              setAction("OUT");
              setCameraOpen(true);
            }}
            className="btn-primary flex items-center justify-center gap-4 w-full mt-4"
          >
            <LuCamera size={20} /> Punch Out
          </button>
        )}

        {today?.punchOut && (
          <div className="mt-4 text-sm flex items-center gap-2">
            <LuClock />
            {Math.floor(today.totalDurationMinutes / 60)}h{" "}
            {today.totalDurationMinutes % 60}m
          </div>
        )}
      </div>

      {/* DATE RANGE FILTER */}
      <div className="bg-white border border-gray-300 rounded-lg p-4 mb-5 max-w-xl">
        <h4 className="text-xs font-medium text-gray-600 mb-2">
          Filter by date range
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] text-gray-500">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 w-full border border-gray-300 px-2 py-1 text-xs rounded"
            />
          </div>

          <div>
            <label className="text-[11px] text-gray-500">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 w-full border border-gray-300 px-2 py-1 text-xs rounded"
            />
          </div>
        </div>

        <button
          onClick={fetchMyAttendance}
          className="mt-3 text-xs px-3 py-1 rounded bg-blue-600 text-white"
        >
          Apply Filter
        </button>
      </div>

      {/* HISTORY */}
      <div className="bg-white border border-gray-300 rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-blue-50">
            <tr>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Punch In</th>
              <th className="px-4 py-3 text-left">Punch Out</th>
              <th className="px-4 py-3 text-left">Duration</th>
              <th className="px-4 py-3 text-left">Location</th>
              <th className="px-4 py-3 text-left">Work</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {console.log(history)}
            {history.map((a) => (
              <tr key={a._id}>
                <td className="px-4 py-3">{new Date(a.date).toDateString()}</td>
                <td className="px-4 py-3">
                  {a.punchIn?.time &&
                    new Date(a.punchIn.time).toLocaleTimeString()}
                </td>
                <td className="px-4 py-3">
                  {a.punchOut?.time &&
                    new Date(a.punchOut.time).toLocaleTimeString()}
                </td>
                <td className="px-4 py-3">
                  {a.totalDurationMinutes
                    ? `${Math.floor(a.totalDurationMinutes / 60)}h ${a.totalDurationMinutes % 60}m`
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  <LocationPopover location={a?.punchIn?.location} />
                </td>
                <td className="px-4 py-3">{a?.workType}</td>
                
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default MyAttendance;
