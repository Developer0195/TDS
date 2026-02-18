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
  {/* TABLE */}
<div className="border border-gray-300 rounded-lg bg-white">
  <div className="overflow-x-auto">
    <table className="min-w-[1100px] w-full text-sm">
      <thead className="bg-gray-50 text-xs text-gray-500 border-b border-gray-300">
        <tr>
          <th className="px-4 py-3 text-left">Week</th>
          <th className="px-4 py-3 text-left">Title</th>
          <th className="px-4 py-3 text-left">Description</th>
          <th className="px-4 py-3 text-left">Subtasks</th>
          <th className="px-4 py-3 text-left">Status</th>
          <th className="px-4 py-3 text-center">Action</th>
        </tr>
      </thead>

      <tbody>
        {loading ? (
          <tr>
            <td colSpan="6" className="px-4 py-6 text-gray-400">
              Loading...
            </td>
          </tr>
        ) : weeklyTasks.length === 0 ? (
          <tr>
            <td colSpan="6" className="px-4 py-6 text-gray-400">
              No weekly tasks found.
            </td>
          </tr>
        ) : (
          weeklyTasks.map((task) => (
            <tr
              key={task._id}
              className="border-b border-gray-200 align-top"
            >
              <td className="px-4 py-4 font-medium whitespace-nowrap">
                {moment(task.weekStart).format("DD MMM")} -{" "}
                {moment(task.weekEnd).format("DD MMM YYYY")}
              </td>

              <td className="px-4 py-4 font-medium whitespace-nowrap">
                {task.name}
              </td>

              <td className="px-4 py-4 text-gray-600 min-w-[250px]">
                {task.description}
              </td>

              <td className="px-4 py-4 min-w-[200px] space-y-1">
                {task.subtasks.map((sub) => (
                  <div
                    key={sub._id}
                    className="text-xs bg-gray-100 px-2 py-1 rounded"
                  >
                    {sub.text}
                  </div>
                ))}
              </td>

              <td className="px-4 py-4 whitespace-nowrap">
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
              </td>

              <td className="px-4 py-4 whitespace-nowrap text-center">
                {task.status === "Submitted" && (
                  <div className="flex flex-col gap-2">
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
                  </div>
                )}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
</div>

    </div>
  );
};

export default WeeklyTasksReviewPage;
