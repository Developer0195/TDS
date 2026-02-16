import { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";
import moment from "moment";
import toast from "react-hot-toast";

const WeeklyTasksReviewPage = ({ userId }) => {
  const [weeklyTasks, setWeeklyTasks] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchWeeklyTasks = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get(
        API_PATHS.WEEKLY_TASKS.GET_BY_USER(userId)
      );

      const tasks = res.data.weeklyTasks || [];

      setWeeklyTasks(tasks);

      if (tasks.length) {
        setUserInfo(tasks[0].createdBy);
      }
    } catch (error) {
      toast.error("Failed to load weekly tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeeklyTasks();
  }, [userId]);

  /* ========================
     APPROVE / REJECT
  ========================= */
  const updateStatus = async (id, status) => {
    try {
      await axiosInstance.put(
        API_PATHS.WEEKLY_TASKS.UPDATE_STATUS(id),
        { status }
      );

      toast.success(`Weekly task ${status}`);

      setWeeklyTasks((prev) =>
        prev.map((t) =>
          t._id === id ? { ...t, status } : t
        )
      );
    } catch (error) {
      toast.error("Action failed");
    }
  };

  return (
    <div className="my-6">

      {/* HEADER */}
      <div className="mb-6">
        <h2 className="text-xl font-medium">
          Weekly Tasks Review
        </h2>

        {userInfo && (
          <p className="text-sm text-gray-500 mt-1">
            {userInfo.name} • {userInfo.email}
          </p>
        )}
      </div>

      {/* TABLE */}
      <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
        <div className="grid grid-cols-12 gap-6 px-4 py-3 bg-gray-50 text-xs font-medium text-gray-500 border-b border-gray-300">
          <div className="col-span-2">Week</div>
          <div className="col-span-2">Title</div>
          <div className="col-span-3">Description</div>
          <div className="col-span-2">Subtasks</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-2 text-center">Action</div>
        </div>

        {loading ? (
          <p className="p-4 text-sm text-gray-400">
            Loading...
          </p>
        ) : weeklyTasks.length === 0 ? (
          <p className="p-4 text-sm text-gray-400">
            No weekly tasks found.
          </p>
        ) : (
          weeklyTasks.map((task) => (
            <div
              key={task._id}
              className="grid grid-cols-12 gap-4 px-5 py-4 border-b border-gray-300 text-sm items-start"
            >
              <div className="col-span-2 font-medium">
                {moment(task.weekStart).format("DD MMM")} -{" "}
                {moment(task.weekEnd).format("DD MMM YYYY")}
              </div>

              <div className="col-span-2 font-medium">
                {task.name}
              </div>

              <div className="col-span-3 text-gray-600">
                {task.description}
              </div>

              <div className="col-span-2 space-y-1">
                {task.subtasks.map((sub) => (
                  <div
                    key={sub._id}
                    className="text-xs bg-gray-100 px-2 py-1 rounded"
                  >
                    {sub.text}
                  </div>
                ))}
              </div>

              <div className="col-span-1">
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    task.status === "Approved"
                      ? "bg-green-100 text-green-700"
                      : task.status === "Rejected"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {task.status}
                </span>
              </div>

              <div className="col-span-2 px-4 flex flex-col justify-center gap-1">
                {task.status === "Submitted" && (
                  <>
                    <button
                      onClick={() =>
                        updateStatus(task._id, "Approved")
                      }
                      className="text-xs bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() =>
                        updateStatus(task._id, "Rejected")
                      }
                      className="text-xs bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WeeklyTasksReviewPage;
