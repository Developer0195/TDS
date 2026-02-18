// import React, { useEffect, useMemo, useState } from "react";
// import axiosInstance from "../../utils/axiosInstance";
// import { API_PATHS } from "../../utils/apiPaths";
// import { LuCalendar, LuX } from "react-icons/lu";
// import toast from "react-hot-toast";

// /* ================== DATE HELPERS ================== */
// const getWeekRange = () => {
//   const today = new Date();
//   const day = today.getDay();

//   const start = new Date(today);
//   start.setDate(today.getDate() - day);
//   start.setHours(0, 0, 0, 0);

//   const end = new Date(start);
//   end.setDate(start.getDate() + 6);
//   end.setHours(23, 59, 59, 999);

//   return { start, end };
// };

// const getMonthRange = () => {
//   const now = new Date();
//   const start = new Date(now.getFullYear(), now.getMonth(), 1);
//   const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

//   start.setHours(0, 0, 0, 0);
//   end.setHours(23, 59, 59, 999);

//   return { start, end };
// };

// const buildDateRange = (start, end) => {
//   const dates = [];
//   const cursor = new Date(start);
//   cursor.setHours(0, 0, 0, 0);

//   while (cursor <= end) {
//     dates.push(new Date(cursor));
//     cursor.setDate(cursor.getDate() + 1);
//   }
//   return dates;
// };

// /* ================== STATUS COLORS ================== */
// const statusStyles = {
//   Present: "bg-green-500 text-white",
//   Absent: "bg-red-500 text-white",
//   Delayed: "bg-orange-400 text-white",
// };

// /* ================== EDIT ATTENDANCE MODAL ================== */
// const EditAttendanceModal = ({
//   open,
//   onClose,
//   member,
//   range,
//   calendar,
//   onSubmit,
// }) => {
//   const [selectedDate, setSelectedDate] = useState(null);
//   const [status, setStatus] = useState("Present");
//   const today = new Date();
// today.setHours(0, 0, 0, 0);

//   const allDates = useMemo(
//     () => buildDateRange(range.start, range.end),
//     [range]
//   );

//   const statusByDate = {};
//   calendar.forEach((c) => {
//     statusByDate[new Date(c.date).toDateString()] = c.status;
//   });

//   if (!open) return null;

//   const handleSave = () => {
//     if (!selectedDate) {
//       toast.error("Please select a date");
//       return;
//     }

//     const dateString = `${selectedDate.getFullYear()}-${
//   String(selectedDate.getMonth() + 1).padStart(2, "0")
// }-${String(selectedDate.getDate()).padStart(2, "0")}`;

//     onSubmit(
//       dateString,
//       status
//     );
//   };

//   return (
//     <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
//       <div className="bg-white rounded-lg w-[380px] p-4 relative">
//         <button
//           onClick={onClose}
//           className="absolute right-3 top-3 text-gray-500"
//         >
//           <LuX />
//         </button>

//         <h3 className="text-sm font-medium mb-3">
//           Edit Attendance – {member.name}
//         </h3>

//         {/* CALENDAR */}
//         <div className="grid grid-cols-7 gap-1 text-xs mb-4">
//           {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d) => (
//             <div key={d} className="text-center text-gray-500">{d}</div>
//           ))}

//           {allDates.map((d) => {
//   const key = d.toDateString();
//   const isSelected =
//     selectedDate &&
//     d.toDateString() === selectedDate.toDateString();

//   let cellStyle = "bg-gray-200"; // default (future / today)

//   if (statusByDate[key]) {
//     // ✅ Attendance exists
//     cellStyle = statusStyles[statusByDate[key]];
//   } else if (d < today) {
//     // 🔴 Missing past date → Absent
//     cellStyle = statusStyles["Absent"];
//   }

//   return (
//     <button
//       key={key}
//       onClick={() => setSelectedDate(d)}
//       className={`h-8 rounded flex items-center justify-center
//         ${isSelected ? "ring-2 ring-blue-600" : cellStyle}
//       `}
//     >
//       {d.getDate()}
//     </button>
//   );
// })}

//         </div>

//         {/* STATUS */}
//         <label className="text-xs text-gray-500 mb-1 block">
//           Attendance Status
//         </label>
//         <select
//           className="border border-gray-300 px-2 py-1 rounded text-sm w-full mb-4"
//           value={status}
//           onChange={(e) => setStatus(e.target.value)}
//         >
//           <option value="Present">Present</option>
//           <option value="Absent">Absent</option>
//           <option value="Delayed">Delayed</option>
//         </select>

//         {/* ACTIONS */}
//         <div className="flex justify-end gap-2">
//           <button
//             onClick={onClose}
//             className="border border-gray-300 px-3 py-1 text-sm rounded"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={handleSave}
//             className="bg-blue-600 text-white px-3 py-1 text-sm rounded"
//           >
//             Save
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// /* ================== MAIN COMPONENT ================== */
// const TeamAttendance = () => {
//   const [mode, setMode] = useState("weekly");
//   const [range, setRange] = useState(getWeekRange());
//   const [members, setMembers] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const [editOpen, setEditOpen] = useState(false);
//   const [editMember, setEditMember] = useState(null);

//   const fetchAnalytics = async () => {
//     try {
//       setLoading(true);
//       const res = await axiosInstance.get(
//         API_PATHS.ATTENDANCE.TEAM_ANALYTICS,
//         {
//           params: {
//             startDate: range.start.toISOString(),
//             endDate: range.end.toISOString(),
//           },
//         }
//       );
//       console.log(res)
//       setMembers(res.data.members || []);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchAnalytics();
//   }, [range]);

//   const submitOverride = async (date, status) => {
//     try {
//       await axiosInstance.put(API_PATHS.ATTENDANCE.ADMIN_OVERRIDE, {
//         userId: editMember.userId,
//         date,
//         attendanceStatus: status,
//         reason: "Admin override",
//       });

//       toast.success("Attendance updated");
//       setEditOpen(false);
//       fetchAnalytics();
//     } catch {
//       toast.error("Failed to update attendance");
//     }
//   };

//   return (
//     <>
//       {/* FILTER */}
//       <div className="bg-white border border-gray-300 rounded-lg p-4 flex gap-4 mb-6">
//         <select
//           value={mode}
//           onChange={(e) => {
//             const val = e.target.value;
//             setMode(val);
//             if (val === "weekly") setRange(getWeekRange());
//             if (val === "monthly") setRange(getMonthRange());
//           }}
//           className="border border-gray-300 px-2 py-1 rounded text-sm"
//         >
//           <option value="weekly">Weekly</option>
//           <option value="monthly">Monthly</option>
//           <option value="custom">Custom</option>
//         </select>

//         {mode === "custom" && (
//           <>
//             <input
//               type="date"
//               className="border border-gray-300 px-2 py-1 text-sm rounded"
//               onChange={(e) =>
//                 setRange((r) => ({
//                   ...r,
//                   start: new Date(e.target.value),
//                 }))
//               }
//             />
//             <input
//               type="date"
//               className="border border-gray-300 px-2 py-1 text-sm rounded"
//               onChange={(e) =>
//                 setRange((r) => ({
//                   ...r,
//                   end: new Date(e.target.value),
//                 }))
//               }
//             />
//           </>
//         )}
//       </div>

//       {/* TABLE */}
//       <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
//         <table className="w-full text-sm">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-4 py-3 text-left">Member</th>
//               <th className="px-4 py-3">Present</th>
//               <th className="px-4 py-3">Absent</th>
//               <th className="px-4 py-3">Delayed</th>
//               <th className="px-4 py-3">Edit</th>
//             </tr>
//           </thead>

//           <tbody>
//             {loading ? (
//               <tr>
//                 <td colSpan="5" className="p-4">Loading…</td>
//               </tr>
//             ) : (
//               members.map((m) => (
//                 <tr key={m.userId} className="border-t border-gray-300">
//                   <td className="px-4 py-3">{m.name}</td>
//                   <td className="px-4 py-3 text-center">{m.stats.presentDays}</td>
//                   <td className="px-4 py-3 text-center">{m.stats.absentDays}</td>
//                   <td className="px-4 py-3 text-center">{m.stats.delayedDays}</td>
//                   <td className="px-4 py-3 text-center">
//                     <button
//                       onClick={() => {
//                         setEditMember(m);
//                         setEditOpen(true);
//                       }}
//                       className="text-blue-600 text-xs"
//                     >
//                       Edit
//                     </button>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>

//       {editOpen && (
//         <EditAttendanceModal
//           open={editOpen}
//           onClose={() => setEditOpen(false)}
//           member={editMember}
//           range={range}
//           calendar={editMember?.calendar || []}
//           onSubmit={submitOverride}
//         />
//       )}
//     </>
//   );
// };

// export default TeamAttendance;

import React, { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { LuCalendar, LuX } from "react-icons/lu";
import toast from "react-hot-toast";

/* ================== DATE HELPERS ================== */
const getWeekRange = () => {
  const today = new Date();
  const day = today.getDay();

  const start = new Date(today);
  start.setDate(today.getDate() - day);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

const getMonthRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

const buildDateRange = (start, end) => {
  const dates = [];
  const cursor = new Date(start);
  cursor.setHours(0, 0, 0, 0);

  while (cursor <= end) {
    dates.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
};

/* ================== STATUS COLORS ================== */
const statusStyles = {
  Present: "bg-green-500 text-white",
  Absent: "bg-red-500 text-white",
  Delayed: "bg-orange-400 text-white",
};

/* ================== EDIT ATTENDANCE MODAL ================== */
const EditAttendanceModal = ({
  open,
  onClose,
  member,
  range,
  calendar,
  onSubmit,
  holidays,
}) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [status, setStatus] = useState("Present");

  const holidayMap = {};
  holidays.forEach((h) => {
    holidayMap[new Date(h.date).toDateString()] = h.name;
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const allDates = useMemo(
    () => buildDateRange(range.start, range.end),
    [range],
  );

  const statusByDate = {};
  calendar.forEach((c) => {
    statusByDate[new Date(c.date).toDateString()] = c.status;
  });

  if (!open) return null;

  const handleSave = () => {
    if (!selectedDate) {
      toast.error("Please select a date");
      return;
    }

    if (selectedDate > today) {
      toast.error("Cannot edit future dates");
      return;
    }

    const dateString = `${selectedDate.getFullYear()}-${String(
      selectedDate.getMonth() + 1,
    ).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;

    onSubmit(dateString, status);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-lg w-[380px] p-4 relative">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-gray-500"
        >
          <LuX />
        </button>

        <h3 className="text-sm font-medium mb-3">
          Edit Attendance – {member.name}
        </h3>

        <div className="flex flex-wrap gap-3 text-xs mb-4">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-green-500"></span>
            <span>Present</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-red-500"></span>
            <span>Absent</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-orange-400"></span>
            <span>Delayed</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-yellow-300"></span>
            <span>Holiday / Sunday</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-gray-200"></span>
            <span>Future</span>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-xs mb-4">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
            <div key={d} className="text-center text-gray-500">
              {d}
            </div>
          ))}

          {allDates.map((d) => {
            const key = d.toDateString();
            const isSelected =
              selectedDate && d.toDateString() === selectedDate.toDateString();

            // let cellStyle = "bg-gray-200";

            // if (statusByDate[key]) {
            //   cellStyle = statusStyles[statusByDate[key]];
            // } else if (d < today) {
            //   cellStyle = statusStyles["Absent"];
            // }

            let cellStyle = "bg-gray-200";
            const isHoliday = holidayMap[key];
            const isSunday = d.getDay() === 0;

            if (isHoliday || isSunday) {
              cellStyle = "bg-yellow-300 text-black";
            } else if (statusByDate[key]) {
              cellStyle = statusStyles[statusByDate[key]];
            } else if (d < today) {
              cellStyle = statusStyles["Absent"];
            }

            return (
              // <button
              //   key={key}
              //   disabled={d > today}
              //   onClick={() => d <= today && setSelectedDate(d)}
              //   className={`h-8 rounded flex items-center justify-center
              //     ${isSelected ? "ring-2 ring-blue-600" : cellStyle}
              //     ${d > today ? "opacity-40 cursor-not-allowed" : ""}
              //   `}
              // >
              //   {d.getDate()}
              // </button>

              <button
                key={key}
                disabled={d > today || isHoliday || isSunday}
                onClick={() =>
                  d <= today && !isHoliday && !isSunday && setSelectedDate(d)
                }
                className={`h-8 rounded flex items-center justify-center
    ${isSelected ? "ring-2 ring-blue-600" : cellStyle}
    ${d > today || isHoliday || isSunday ? "opacity-50 cursor-not-allowed" : ""}
  `}
                title={
                  isHoliday
                    ? holidayMap[key]
                    : isSunday
                      ? "Sunday (Weekly Off)"
                      : ""
                }
              >
                {d.getDate()}
              </button>
            );
          })}
        </div>

        <label className="text-xs text-gray-500 mb-1 block">
          Attendance Status
        </label>
        <select
          className="border border-gray-300 px-2 py-1 rounded text-sm w-full mb-4"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="Present">Present</option>
          <option value="Absent">Absent</option>
          <option value="Delayed">Delayed</option>
        </select>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="border border-gray-300 px-3 py-1 text-sm rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-3 py-1 text-sm rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

/* ================== MAIN COMPONENT ================== */
const TeamAttendance = () => {
  const [mode, setMode] = useState("weekly");
  const [range, setRange] = useState(getWeekRange());
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editMember, setEditMember] = useState(null);

  const [holidays, setHolidays] = useState([]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(API_PATHS.ATTENDANCE.TEAM_ANALYTICS, {
        params: {
          startDate: range.start.toISOString(),
          endDate: range.end.toISOString(),
        },
      });
      setMembers(res.data.members || []);
      setHolidays(res.data.holidays || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [range]);

  const submitOverride = async (date, status) => {
    try {
      await axiosInstance.put(API_PATHS.ATTENDANCE.ADMIN_OVERRIDE, {
        userId: editMember.userId,
        date,
        attendanceStatus: status,
        reason: "Admin override",
      });

      toast.success("Attendance updated");
      setEditOpen(false);
      fetchAnalytics();
    } catch {
      toast.error("Failed to update attendance");
    }
  };

  return (
    <>
      <div className="bg-white border border-gray-300 rounded-lg p-4 flex gap-4 mb-6">
        <select
          value={mode}
          onChange={(e) => {
            const val = e.target.value;
            setMode(val);
            if (val === "weekly") setRange(getWeekRange());
            if (val === "monthly") setRange(getMonthRange());
          }}
          className="border border-gray-300 px-2 py-1 rounded text-sm"
        >
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="custom">Custom</option>
        </select>

        {mode === "custom" && (
          <>
            <input
              type="date"
              className="border border-gray-300 px-2 py-1 text-sm rounded"
              onChange={(e) => {
                const newStart = new Date(e.target.value);
                if (range.end && newStart > range.end) {
                  toast.error("Start date cannot be after end date");
                  return;
                }
                setRange((r) => ({ ...r, start: newStart }));
              }}
            />
            <input
              type="date"
              className="border border-gray-300 px-2 py-1 text-sm rounded"
              onChange={(e) => {
                const newEnd = new Date(e.target.value);
                if (range.start && newEnd < range.start) {
                  toast.error("End date cannot be before start date");
                  return;
                }
                setRange((r) => ({ ...r, end: newEnd }));
              }}
            />
          </>
        )}
      </div>

      {/* LEGEND */}
      <div className="flex flex-wrap gap-3 text-xs mb-4">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-green-500"></span>
          <span>Present</span>
        </div>

        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-red-500"></span>
          <span>Absent</span>
        </div>

        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-orange-400"></span>
          <span>Delayed</span>
        </div>

        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-yellow-300"></span>
          <span>Holiday</span>
        </div>

        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-gray-200"></span>
          <span>Future / No Data</span>
        </div>
      </div>

     {/* ================= TABLE ================= */}
<div className="bg-white border border-gray-300 rounded-lg">
  <div className="w-full overflow-x-auto mobile-scroll touch-pan-x">
    <table className="min-w-[720px] w-full text-sm">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-4 py-3 text-left whitespace-nowrap">
            Member
          </th>
          <th className="px-4 py-3 text-center whitespace-nowrap">
            Present
          </th>
          <th className="px-4 py-3 text-center whitespace-nowrap">
            Absent
          </th>
          <th className="px-4 py-3 text-center whitespace-nowrap">
            Delayed
          </th>
          <th className="px-4 py-3 text-center whitespace-nowrap">
            Edit
          </th>
        </tr>
      </thead>


      <tbody>
        {loading ? (
          <tr>
            <td colSpan="5" className="p-4 whitespace-nowrap text-center">
              Loading…
            </td>
          </tr>
        ) : members.length === 0 ? (
          <tr>
            <td colSpan="5" className="p-4 whitespace-nowrap text-center text-gray-400">
              No data available
            </td>
          </tr>
        ) : (
          members.map((m) => (
            <tr key={m.userId} className="border-t border-gray-300">
              <td className="px-4 py-3 whitespace-nowrap font-medium">
                {m.name}
              </td>

              <td className="px-4 py-3 text-center whitespace-nowrap">
                {m.stats.presentDays}
              </td>

              <td className="px-4 py-3 text-center whitespace-nowrap">
                {m.stats.absentDays}
              </td>

              <td className="px-4 py-3 text-center whitespace-nowrap">
                {m.stats.delayedDays}
              </td>

              <td className="px-4 py-3 text-center whitespace-nowrap">
                <button
                  onClick={() => {
                    setEditMember(m);
                    setEditOpen(true);
                  }}
                  className="text-blue-600 text-xs hover:underline"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))
        )}
      </tbody>

    </table>
  </div>
</div>


      {editOpen && (
        <EditAttendanceModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          member={editMember}
          range={range}
          calendar={editMember?.calendar || []}
          onSubmit={submitOverride}
          holidays={holidays}
        />
      )}
    </>
  );
};

export default TeamAttendance;
