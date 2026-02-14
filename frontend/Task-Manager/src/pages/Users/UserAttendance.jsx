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
  const [action, setAction] = useState(null); // IN | OUT | CHECKIN

  const [remarksOpen, setRemarksOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState(null);
  const [requiresCheckins, setRequiresCheckins] = useState(false);

  /* ================= FETCH ================= */
  const fetchMyAttendance = async () => {
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
    setHistory(res.data.attendance || []);
    setRequiresCheckins(
      res.data.today?.workType === "OFFSITE" &&
      (res.data.today?.offsiteCheckins?.length || 0) < 3 &&
      !res.data.today?.punchOut
    );

    setLoading(false);
  };

  useEffect(() => {
    fetchMyAttendance();
  }, []);

  /* ================= CAMERA CAPTURE ================= */
  const handleCapture = async (photoBase64) => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const payload = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        photoBase64,
      };

      try {
        /* 🔹 PUNCH IN */
        if (action === "IN") {
          const res = await axiosInstance.post(
            API_PATHS.ATTENDANCE.PUNCH_IN,
            payload
          );

          setRequiresCheckins(res.data.requiresCheckins);
          toast.success("Punch in successful");
        }

        /* 🔹 PUNCH OUT */
        if (action === "OUT") {
          await axiosInstance.post(
            API_PATHS.ATTENDANCE.PUNCH_OUT,
            payload
          );
          toast.success("Punch out successful");
        }

        /* 🔹 OFFSITE CHECK-IN */
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
        /* 🔴 OFFSITE → remarks required */
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

  /* ================= REMARKS ================= */
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

  /* ================= UI ================= */
  const completedCheckins = today?.offsiteCheckins?.length || 0;

  return (
    <DashboardLayout activeMenu="Attendance">
        <div className = "m-2 ">
            <h2 className = "font-semibold py-2 px-1">Attendance</h2>
              {/* ================= TODAY CARD ================= */}
      <div className="bg-white border border-gray-300 rounded-lg p-5 mb-6 max-w-md">
        <p className="text-sm text-gray-500">Employee</p>
        <p className="font-medium">{user?.name}</p>

        <CameraCaptureModal
          isOpen={cameraOpen}
          onClose={() => setCameraOpen(false)}
          onCapture={handleCapture}
        />

        {/* 🔹 Punch In */}
        {!today?.punchIn && (
          <button
            onClick={() => {
              setAction("IN");
              setCameraOpen(true);
            }}
            className="btn-primary w-full mt-4 flex gap-2 justify-center"
          >
            <LuCamera /> Punch In
          </button>
        )}

        {/* 🔹 Punch Out */}
        {today?.punchIn && !today?.punchOut && (
          <button
            onClick={() => {
              setAction("OUT");
              setCameraOpen(true);
            }}
            className="btn-primary w-full mt-4 flex gap-2 justify-center"
          >
            <LuCamera /> Punch Out
          </button>
        )}

        {/* 🔹 Duration */}
        {today?.punchOut && (
          <div className="mt-4 flex items-center gap-2 text-sm">
            <LuClock />
            {Math.floor(today.totalDurationMinutes / 60)}h{" "}
            {today.totalDurationMinutes % 60}m
          </div>
        )}

        {/* 🔴 OFFSITE CHECK-INS */}
        {requiresCheckins && (
          <div className="mt-4 border-t pt-3">
            <p className="text-xs text-gray-500 mb-1">
              Offsite Check-ins ({completedCheckins}/3)
            </p>

            <button
              onClick={() => {
                setAction("CHECKIN");
                setCameraOpen(true);
              }}
              className="bg-orange-500 text-white w-full py-2 rounded flex gap-2 justify-center text-sm"
            >
              <LuMapPin /> Submit Check-in
            </button>
          </div>
        )}
      </div>

      {/* ================= HISTORY ================= */}
      <div className="bg-white border border-gray-300 rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-blue-50">
            <tr>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">In</th>
              <th className="px-4 py-3 text-left">Out</th>
              <th className="px-4 py-3 text-left">Duration</th>
              <th className="px-4 py-3 text-left">Location</th>
              <th className="px-4 py-3 text-left">Work</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {history.map((a) => (
              <tr key={a._id}>
                <td className="px-4 py-3">
                  {new Date(a.date).toDateString()}
                </td>
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
                <td className="px-4 py-3">{a.workType}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= REMARKS MODAL ================= */}
      <RemarksModal
        open={remarksOpen}
        onClose={() => setRemarksOpen(false)}
        onSubmit={submitRemarks}
      />
      
        </div>
    
    </DashboardLayout>
  )};

export default MyAttendance;
