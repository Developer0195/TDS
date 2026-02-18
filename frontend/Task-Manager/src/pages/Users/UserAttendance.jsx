// import React, { useContext, useEffect, useState } from "react";
// import axiosInstance from "../../utils/axiosInstance";
// import { API_PATHS } from "../../utils/apiPaths";
// import { UserContext } from "../../context/userContext";
// import { LuCamera, LuClock, LuMapPin } from "react-icons/lu";
// import CameraCaptureModal from "../../components/CameraCaptureModal";
// import LocationPopover from "../../components/LocationPopOver";
// import RemarksModal from "../../components/Modals/RemarksModal";
// import toast from "react-hot-toast";
// import DashboardLayout from "../../components/Layouts/DashboardLayout";

// const MyAttendance = () => {
//   const { user } = useContext(UserContext);

//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");

//   const [today, setToday] = useState(null);
//   const [history, setHistory] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const [cameraOpen, setCameraOpen] = useState(false);
//   const [action, setAction] = useState(null); // IN | OUT | CHECKIN

//   const [remarksOpen, setRemarksOpen] = useState(false);
//   const [pendingPayload, setPendingPayload] = useState(null);
//   const [requiresCheckins, setRequiresCheckins] = useState(false);

//   /* ================= FETCH ================= */
//   const fetchMyAttendance = async () => {
//     setLoading(true);

//     const params = {};
//     if (startDate && endDate) {
//       params.startDate = startDate;
//       params.endDate = endDate;
//     }

//     const res = await axiosInstance.get(API_PATHS.ATTENDANCE.MY_ATTENDANCE, {
//       params,
//     });

//     setToday(res.data.today);
//     const filteredAttendance = (res.data.attendance || []).filter(
//       (a) => a.punchIn || a.punchOut,
//     );

//     setHistory(filteredAttendance);

//     setRequiresCheckins(
//       res.data.today?.workType === "OFFSITE" &&
//         (res.data.today?.offsiteCheckins?.length || 0) < 3 &&
//         !res.data.today?.punchOut,
//     );

//     setLoading(false);
//   };

//   useEffect(() => {
//     fetchMyAttendance();
//   }, [startDate, endDate]);

//   /* ================= CAMERA CAPTURE ================= */
//   const handleCapture = async (photoBase64) => {
//     navigator.geolocation.getCurrentPosition(async (pos) => {
//       const payload = {
//         latitude: pos.coords.latitude,
//         longitude: pos.coords.longitude,
//         photoBase64,
//       };

//       try {
//         /* 🔹 PUNCH IN */
//         if (action === "IN") {
//           const res = await axiosInstance.post(
//             API_PATHS.ATTENDANCE.PUNCH_IN,
//             payload,
//           );

//           setRequiresCheckins(res.data.requiresCheckins);
//           toast.success("Punch in successful");
//         }

//         /* 🔹 PUNCH OUT */
//         if (action === "OUT") {
//           await axiosInstance.post(API_PATHS.ATTENDANCE.PUNCH_OUT, payload);
//           toast.success("Punch out successful");
//         }

//         /* 🔹 OFFSITE CHECK-IN */
//         if (action === "CHECKIN") {
//           const res = await axiosInstance.post(
//             API_PATHS.ATTENDANCE.OFFSITE_CHECKIN,
//             payload,
//           );

//           toast.success(`Check-in recorded (${res.data.checkinsCompleted}/3)`);
//         }

//         setCameraOpen(false);
//         fetchMyAttendance();
//       } catch (err) {
//         /* 🔴 OFFSITE → remarks required */
//         if (err.response?.data?.message?.includes("Remarks")) {
//           setPendingPayload(payload);
//           setCameraOpen(false);
//           setRemarksOpen(true);
//         } else {
//           toast.error(err.response?.data?.message || "Action failed");
//         }
//       }
//     });
//   };

//   /* ================= REMARKS ================= */
//   const submitRemarks = async (text) => {
//     if (!text.trim()) return;

//     try {
//       await axiosInstance.post(API_PATHS.ATTENDANCE.PUNCH_IN, {
//         ...pendingPayload,
//         remarks: text,
//       });

//       toast.success("Punch in successful");
//       setRemarksOpen(false);
//       setPendingPayload(null);
//       fetchMyAttendance();
//     } catch {
//       toast.error("Failed to submit remarks");
//     }
//   };

//   /* ================= UI ================= */
//   const completedCheckins = today?.offsiteCheckins?.length || 0;

//   return (
//     <DashboardLayout activeMenu="Attendance">
//       <div className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto">
//         <h2 className="font-semibold py-2 px-1">Attendance</h2>
//         {/* ================= TODAY CARD ================= */}
//         <div className="bg-white border border-gray-300 rounded-lg p-5 mb-6 max-w-md">
//           <p className="text-sm text-gray-500">Employee</p>
//           <p className="font-medium">{user?.name}</p>

//           <CameraCaptureModal
//             isOpen={cameraOpen}
//             onClose={() => setCameraOpen(false)}
//             onCapture={handleCapture}
//           />

//           {/* 🔹 Punch In */}
//           {!today?.punchIn && (
//             <button
//               onClick={() => {
//                 setAction("IN");
//                 setCameraOpen(true);
//               }}
//               className="btn-primary w-full mt-4 flex gap-2 justify-center"
//             >
//               <LuCamera /> Punch In
//             </button>
//           )}

//           {/* 🔹 Punch Out */}
//           {today?.punchIn && !today?.punchOut && (
//             <button
//               onClick={() => {
//                 setAction("OUT");
//                 setCameraOpen(true);
//               }}
//               className="btn-primary w-full mt-4 flex gap-2 justify-center"
//             >
//               <LuCamera /> Punch Out
//             </button>
//           )}

//           {/* 🔹 Duration */}
//           {today?.punchOut && (
//             <div className="mt-4 flex items-center gap-2 text-sm">
//               <LuClock />
//               {Math.floor(today.totalDurationMinutes / 60)}h{" "}
//               {today.totalDurationMinutes % 60}m
//             </div>
//           )}

//           {/* 🔴 OFFSITE CHECK-INS */}
//           {requiresCheckins && (
//             <div className="mt-4 border-t pt-3">
//               <p className="text-xs text-gray-500 mb-1">
//                 Offsite Check-ins ({completedCheckins}/3)
//               </p>

//               <button
//                 onClick={() => {
//                   setAction("CHECKIN");
//                   setCameraOpen(true);
//                 }}
//                 className="bg-orange-500 text-white w-full py-2 rounded flex gap-2 justify-center text-sm"
//               >
//                 <LuMapPin /> Submit Check-in
//               </button>
//             </div>
//           )}
//         </div>

//         {/* ================= FILTER ================= */}
//         <div className="bg-white border border-gray-300 rounded-lg p-4 sm:p-5 mb-6 w-full sm:max-w-md">

//           <div className="flex flex-col">
//             <label className="text-xs text-gray-500 mb-1">Start Date</label>
//             <input
//               type="date"
//               value={startDate}
//               onChange={(e) => {
//                 setStartDate(e.target.value);
//                 setEndDate(e.target.value); // reset end date
//               }}
//               className="border border-gray-300 rounded px-3 py-2 text-sm"
//             />
//           </div>

//           <div className="flex flex-col">
//             <label className="text-xs text-gray-500 mb-1">End Date</label>
//             <input
//               type="date"
//               value={endDate}
//               min={startDate}
//               onChange={(e) => setEndDate(e.target.value)}
//               className="border border-gray-300 rounded px-3 py-2 text-sm"
//             />
//           </div>

//           <button
//             onClick={() => {
//               setStartDate("");
//               setEndDate("");
//               fetchMyAttendance();
//             }}
//             className="bg-gray-200 px-4 py-2 text-sm rounded mt-2"

//           >
//             Reset
//           </button>
//         </div>

//         {/* ================= HISTORY ================= */}
//        <div className="bg-white border border-gray-300 rounded-lg overflow-x-auto">

//        <div className="bg-white border border-gray-300 rounded-lg overflow-x-auto">
//   <table className="min-w-[750px] w-full text-sm">
//     <thead className="bg-blue-50">
//       <tr>
//         <th className="px-4 py-3 text-left whitespace-nowrap">Date</th>
//         <th className="px-4 py-3 text-left whitespace-nowrap">In</th>
//         <th className="px-4 py-3 text-left whitespace-nowrap">Out</th>
//         <th className="px-4 py-3 text-left whitespace-nowrap">Duration</th>
//         <th className="px-4 py-3 text-left whitespace-nowrap">Location</th>
//         <th className="px-4 py-3 text-left whitespace-nowrap">Work</th>
//       </tr>
//     </thead>
//     <tbody className="divide-y">
//       {history.map((a) => (
//         <tr key={a._id}>
//           <td className="px-4 py-3 whitespace-nowrap">
//             {new Date(a.date).toDateString()}
//           </td>
//           <td className="px-4 py-3 whitespace-nowrap">
//             {a.punchIn?.time &&
//               new Date(a.punchIn.time).toLocaleTimeString()}
//           </td>
//           <td className="px-4 py-3 whitespace-nowrap">
//             {a.punchOut?.time &&
//               new Date(a.punchOut.time).toLocaleTimeString()}
//           </td>
//           <td className="px-4 py-3 whitespace-nowrap">
//             {a.totalDurationMinutes
//               ? `${Math.floor(a.totalDurationMinutes / 60)}h ${
//                   a.totalDurationMinutes % 60
//                 }m`
//               : "—"}
//           </td>
//           <td className="px-4 py-3 whitespace-nowrap">
//             <LocationPopover location={a?.punchIn?.location} />
//           </td>
//           <td className="px-4 py-3 whitespace-nowrap">
//             {a.workType}
//           </td>
//         </tr>
//       ))}
//     </tbody>
//   </table>
// </div>

//         </div>

//         {/* ================= REMARKS MODAL ================= */}
//         <RemarksModal
//           open={remarksOpen}
//           onClose={() => setRemarksOpen(false)}
//           onSubmit={submitRemarks}
//         />
//       </div>
//     </DashboardLayout>
//   );
// };

// export default MyAttendance;


import React, { useContext, useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { UserContext } from "../../context/userContext";
import { LuCamera, LuClock, LuMapPin } from "react-icons/lu";
import CameraCaptureModal from "../../components/CameraCaptureModal";
import LocationPopover from "../../components/LocationPopOver";
import RemarksModal from "../../components/Modals/RemarksModal";
import toast from "react-hot-toast";
import DashboardLayout from "../../components/Layouts/DashboardLayout";

const MyAttendance = () => {
  const { user } = useContext(UserContext);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [today, setToday] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [action, setAction] = useState(null);

  const [remarksOpen, setRemarksOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState(null);
  const [requiresCheckins, setRequiresCheckins] = useState(false);

  /* ================= FETCH ================= */
  const fetchMyAttendance = async () => {
    try {
      setLoading(true);

      const params = {};
      if (startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      }

      const res = await axiosInstance.get(
        API_PATHS.ATTENDANCE.MY_ATTENDANCE,
        { params }
      );

      setToday(res.data.today);

      const filtered = (res.data.attendance || []).filter(
        (a) => a.punchIn || a.punchOut
      );

      setHistory(filtered);

      setRequiresCheckins(
        res.data.today?.workType === "OFFSITE" &&
          (res.data.today?.offsiteCheckins?.length || 0) < 3 &&
          !res.data.today?.punchOut
      );
    } catch {
      toast.error("Failed to fetch attendance");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyAttendance();
  }, [startDate, endDate]);

  /* ================= CAMERA ================= */
  const handleCapture = async (photoBase64) => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const payload = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        photoBase64,
      };

      try {
        if (action === "IN") {
          const res = await axiosInstance.post(
            API_PATHS.ATTENDANCE.PUNCH_IN,
            payload
          );
          setRequiresCheckins(res.data.requiresCheckins);
          toast.success("Punch in successful");
        }

        if (action === "OUT") {
          await axiosInstance.post(
            API_PATHS.ATTENDANCE.PUNCH_OUT,
            payload
          );
          toast.success("Punch out successful");
        }

        if (action === "CHECKIN") {
          const res = await axiosInstance.post(
            API_PATHS.ATTENDANCE.OFFSITE_CHECKIN,
            payload
          );
          toast.success(
            `Check-in recorded (${res.data.checkinsCompleted}/3)`
          );
        }

        setCameraOpen(false);
        fetchMyAttendance();
      } catch (err) {
        if (err.response?.data?.message?.includes("Remarks")) {
          setPendingPayload(payload);
          setCameraOpen(false);
          setRemarksOpen(true);
        } else {
          toast.error(err.response?.data?.message || "Action failed");
        }
      }
    });
  };

  const submitRemarks = async (text) => {
    if (!text.trim()) return;

    try {
      await axiosInstance.post(API_PATHS.ATTENDANCE.PUNCH_IN, {
        ...pendingPayload,
        remarks: text,
      });

      toast.success("Punch in successful");
      setRemarksOpen(false);
      setPendingPayload(null);
      fetchMyAttendance();
    } catch {
      toast.error("Failed to submit remarks");
    }
  };

  const completedCheckins = today?.offsiteCheckins?.length || 0;

  return (
    <DashboardLayout activeMenu="Attendance">
      <div className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto">
        <h2 className="text-lg font-semibold mb-4">Attendance</h2>

        {/* ================= TODAY CARD ================= */}
        <div className="bg-white border border-gray-300 rounded-lg p-4 sm:p-5 mb-6 w-full sm:max-w-md">
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
              className="btn-primary w-full mt-4 flex items-center justify-center gap-2 py-3 text-sm sm:text-base"
            >
              <LuCamera /> Punch In
            </button>
          )}

          {today?.punchIn && !today?.punchOut && (
            <button
              onClick={() => {
                setAction("OUT");
                setCameraOpen(true);
              }}
              className="btn-primary w-full mt-4 flex items-center justify-center gap-2 py-3 text-sm sm:text-base"
            >
              <LuCamera /> Punch Out
            </button>
          )}

          {today?.punchOut && (
            <div className="mt-4 flex items-center gap-2 text-sm">
              <LuClock />
              {Math.floor(today.totalDurationMinutes / 60)}h{" "}
              {today.totalDurationMinutes % 60}m
            </div>
          )}

          {requiresCheckins && (
            <div className="mt-4 border-t pt-3">
              <p className="text-xs text-gray-500 mb-2">
                Offsite Check-ins ({completedCheckins}/3)
              </p>

              <button
                onClick={() => {
                  setAction("CHECKIN");
                  setCameraOpen(true);
                }}
                className="bg-orange-500 text-white w-full py-3 rounded flex items-center justify-center gap-2 text-sm"
              >
                <LuMapPin /> Submit Check-in
              </button>
            </div>
          )}
        </div>

        {/* ================= FILTER ================= */}
        <div className="bg-white border border-gray-300 rounded-lg p-4 mb-6 flex flex-col sm:flex-row gap-4 sm:items-end">
          <div className="flex flex-col w-full">
            <label className="text-xs text-gray-500 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setEndDate(e.target.value);
              }}
              className="border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>

          <div className="flex flex-col w-full">
            <label className="text-xs text-gray-500 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>

          <button
            onClick={() => {
              setStartDate("");
              setEndDate("");
              fetchMyAttendance();
            }}
            className="bg-gray-200 px-4 py-2 text-sm rounded w-full sm:w-auto"
          >
            Reset
          </button>
        </div>

        {/* ================= HISTORY ================= */}
        <div className="bg-white border border-gray-300 rounded-lg">
          <div className="w-full overflow-x-auto">
            <table className="min-w-[900px] w-max text-sm">
              <thead className="bg-blue-50">
                <tr>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Date</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">In</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Out</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Duration</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Location</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Work</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {history.map((a) => (
                  <tr key={a._id}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {new Date(a.date).toDateString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {a.punchIn?.time &&
                        new Date(a.punchIn.time).toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {a.punchOut?.time &&
                        new Date(a.punchOut.time).toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {a.totalDurationMinutes
                        ? `${Math.floor(a.totalDurationMinutes / 60)}h ${
                            a.totalDurationMinutes % 60
                          }m`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <LocationPopover location={a?.punchIn?.location} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {a.workType}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <RemarksModal
          open={remarksOpen}
          onClose={() => setRemarksOpen(false)}
          onSubmit={submitRemarks}
        />
      </div>
    </DashboardLayout>
  );
};

export default MyAttendance;
