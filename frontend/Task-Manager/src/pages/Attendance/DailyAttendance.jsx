import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import LocationPopover from "../../components/LocationPopOver";
import moment from "moment-timezone";

const DailyAttendance = () => {
  // const [selectedDate, setSelectedDate] = useState(
  //   new Date().toISOString().split("T")[0],
  // );

  const [selectedDate, setSelectedDate] = useState(
  moment().tz("Asia/Kolkata").format("YYYY-MM-DD")
);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDailyAttendance = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(API_PATHS.ATTENDANCE.DAILY, {
        params: { date: selectedDate },
      });
      setRows(res.data.rows || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyAttendance();
  }, [selectedDate]);

  return (
    <>
      {/* FILTER */}
      <div className="bg-white border border-gray-300 rounded-lg p-4 mb-5">
        <label className="text-xs text-gray-500">Attendance Date</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="block mt-1 border border-gray-300 px-2 py-1 text-xs rounded"
        />
      </div>

      {rows.length === 0 &&
  moment.tz(selectedDate, "Asia/Kolkata").day() === 0 && (
    <div className="bg-blue-50 border border-blue-200 text-blue-700 text-sm p-3 rounded mb-4">
      Sunday – Weekly Off
    </div>
)}

    {/* TABLE */}
<div className="bg-white border border-gray-300 rounded-lg">
  <div className="w-full overflow-x-auto touch-pan-x">
    <table className="min-w-[1000px] w-full text-sm">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-4 py-3 text-left">Member</th>
          <th className="px-4 py-3 text-left">In</th>
          <th className="px-4 py-3 text-left">Out</th>
          <th className="px-4 py-3 text-left">Duration</th>
          <th className="px-4 py-3 text-left">Work</th>
          <th className="px-4 py-3 text-left">Remarks</th>
          <th className="px-4 py-3 text-left">Location</th>
          <th className="px-4 py-3 text-left">Status</th>
        </tr>
      </thead>

      <tbody className="divide-y">
        {loading ? (
          <tr>
            <td colSpan="7" className="p-4">
              Loading…
            </td>
          </tr>
        ) : rows.length === 0 ? (
          <tr>
            <td colSpan="7" className="p-4">
              No data
            </td>
          </tr>
        ) : (
          rows.map((r) => (
            <tr key={r.userId} className="border-b border-gray-300">
              <td className="px-4 py-3 font-medium">{r.name}</td>
              <td className="px-4 py-3">
                {/* {r.punchInTime
                  ? new Date(r.punchInTime).toLocaleTimeString()
                  : "—"} */}
                  {r.punchInTime
  ? moment(r.punchInTime)
      .tz("Asia/Kolkata")
      .format("hh:mm A")
  : "—"}
              </td>
              <td className="px-4 py-3">
                {/* {r.punchOutTime
                  ? new Date(r.punchOutTime).toLocaleTimeString()
                  : "—"} */}
                  {r.punchOutTime
  ? moment(r.punchOutTime)
      .tz("Asia/Kolkata")
      .format("hh:mm A")
  : "—"}
              </td>
              <td className="px-4 py-3">
                {r.durationMinutes
                  ? `${Math.floor(r.durationMinutes / 60)}h ${
                      r.durationMinutes % 60
                    }m`
                  : "—"}
              </td>
              <td className="px-4 py-3">{r.workType || "—"}</td>
              <td className="px-4 py-3 text-xs text-gray-600 max-w-[220px]">
                {r.workType === "OFFSITE" ? (
                  r.remarks ? (
                    <span title={r.remarks}>{r.remarks}</span>
                  ) : (
                    <span className="italic text-gray-400">
                      No remarks
                    </span>
                  )
                ) : (
                  "—"
                )}
              </td>
              <td className="px-4 py-3">
                <LocationPopover location={r.location} />
              </td>

              <td className="px-4 py-3">
                {r.attendanceStatus === "Holiday" ? (
                  <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">
                    Holiday {r.holidayName ? `- ${r.holidayName}` : ""}
                  </span>
                ) : (
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      r.attendanceStatus === "Present"
                        ? "bg-green-100 text-green-700"
                        : r.attendanceStatus === "Delayed"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {r.attendanceStatus}
                  </span>
                )}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
</div>

    </>
  );
};

export default DailyAttendance;
