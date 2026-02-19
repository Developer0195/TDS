import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/Layouts/DashboardLayout";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";
import { FiX } from "react-icons/fi";


const WeeklyTasks = () => {
  const [activeTab, setActiveTab] = useState("current");
  const [selectedTask, setSelectedTask] = useState(null);

  const [task, setTask] = useState(null);
  const [history, setHistory] = useState([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [subtasks, setSubtasks] = useState([{ text: "" }]);
  const [loading, setLoading] = useState(false);

  // pagination on task history
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);


  /* ================= LOAD CURRENT WEEK ================= */

  const loadCurrentWeeklyTask = async () => {
    try {
      const res = await axiosInstance.get(
        API_PATHS.WEEKLY_TASKS.GET_MY_CURRENT,
      );

      if (res.data) {
        setTask(res.data);
        setName(res.data.name);
        setDescription(res.data.description);
        setSubtasks(res.data.subtasks);
      }
    } catch (err) {
      console.log(err);
    }
  };

  /* ================= LOAD HISTORY ================= */

  const loadHistory = async (page = 1) => {
  try {
    const res = await axiosInstance.get(
      `${API_PATHS.WEEKLY_TASKS.GET_MY_HISTORY}?page=${page}`
    );

    setHistory(res.data.tasks);
    setTotalPages(res.data.totalPages);
    setCurrentPage(res.data.currentPage);
  } catch (err) {
    console.log(err);
  }
};


  useEffect(() => {
  loadCurrentWeeklyTask();
  loadHistory(currentPage);
}, [currentPage]);


  /* ================= HANDLE SUBTASK ================= */

  const addSubtask = () => {
    setSubtasks([...subtasks, { text: "" }]);
  };

  const updateSubtask = (index, value) => {
    const updated = [...subtasks];
    updated[index].text = value;
    setSubtasks(updated);
  
  };

  const removeSubtask = (index) => {
    const updated = subtasks.filter((_, i) => i !== index);
    setSubtasks(updated);
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    try {
      setLoading(true);

      if (task) {
        const res = await axiosInstance.put(
          API_PATHS.WEEKLY_TASKS.UPDATE(task._id),
          { name, description, subtasks },
        );

        toast.success(res.data.message);
        setTask(res.data.weeklyTask);
        loadHistory(1)
      } else {
        const res = await axiosInstance.post(API_PATHS.WEEKLY_TASKS.CREATE, {
          name,
          description,
          subtasks,
        });

        toast.success(res.data.message);
        setTask(res.data.weeklyTask);
        loadHistory(); // refresh history after new submit
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <DashboardLayout activeMenu="Weekly Tasks">
      <div className="mt-6 max-w-4xl mx-auto">
        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab("current")}
            className={`px-4 py-2 rounded-md text-sm ${
              activeTab === "current" ? "bg-blue-600 text-white" : "bg-gray-100"
            }`}
          >
            Current Week
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 rounded-md text-sm ${
              activeTab === "history" ? "bg-blue-600 text-white" : "bg-gray-100"
            }`}
          >
            History
          </button>
        </div>

        {/* ================= CURRENT WEEK ================= */}
        {activeTab === "current" && (
          <div className="bg-white border border-blue-100 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center">
  <h2 className="text-lg font-semibold text-gray-800">
    Weekly Task
  </h2>

  {task && (
    <span
      className={`text-xs px-3 py-1 rounded-full ${
        task.status === "Approved"
          ? "bg-green-100 text-green-700"
          : task.status === "Rejected"
          ? "bg-red-100 text-red-700"
          : "bg-yellow-100 text-yellow-700"
      }`}
    >
      {task.status}
    </span>
  )}
</div>


            <div className="mt-5 space-y-4">
              {/* Name */}
              <div>
                <label className="text-xs text-gray-500">Title</label>
                <input
                  className="w-full mt-1 border border-blue-100 rounded-md p-2 text-sm"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs text-gray-500">Description</label>
                <textarea
                  rows={3}
                  className="w-full mt-1 border border-blue-100 rounded-md p-2 text-sm"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Subtasks */}
              <div>
                <label className="text-xs text-gray-500">Subtasks</label>

                <div className="space-y-2 mt-2">
                  {subtasks.map((sub, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        className="flex-1 border border-blue-100 rounded-md p-2 text-sm"
                        value={sub.text}
                        onChange={(e) => updateSubtask(index, e.target.value)}
                      />

                      {subtasks.length > 1 && (
                        <button
                          onClick={() => removeSubtask(index)}
                          className="text-xs text-red-500"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={addSubtask}
                  className="text-xs text-blue-600 mt-2"
                >
                  + Add Subtask
                </button>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-6 py-2 rounded-md"
              >
                {loading
                  ? "Submitting..."
                  : task
                    ? "Update Weekly Task"
                    : "Submit Weekly Task"}
              </button>
            </div>
          </div>
        )}

        {/* ================= HISTORY ================= */}
        {/* ================= HISTORY ================= */}
        {activeTab === "history" && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            {history.length === 0 ? (
              <div className="p-6 text-sm text-gray-500">
                No weekly history yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left">
                  {/* Table Head */}
                  <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Title</th>
                      <th className="px-4 py-3">Description</th>
                      <th className="px-4 py-3">Subtasks</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Submitted On</th>
                    </tr>
                  </thead>

                  {/* Table Body */}
                  <tbody className="divide-y divide-gray-200">
                    {history.map((item) => (
                      <tr
                        key={item._id}
                        onClick={() => setSelectedTask(item)}
                        className="hover:bg-blue-50 cursor-pointer transition"
                      >
                        <td className="px-4 py-3 font-medium text-gray-800">
                          {item.name}
                        </td>

                        <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                          {item.description}
                        </td>

                        <td className="px-4 py-3 text-gray-600">
                          {item.subtasks.length}
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={`text-xs px-3 py-1 rounded-full ${
                              item.status === "Approved"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-gray-500">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                
              </div>
            )}

            
          </div>
        )}
      </div>

      {/* ================= DETAIL CARD ================= */}
      {/* ================= CENTER MODAL ================= */}
{selectedTask && (
  <div className="fixed inset-0 z-50 flex items-center justify-center">

    {/* Backdrop */}
    <div
      className="absolute inset-0 bg-black/50 bg-opacity-40"
      onClick={() => setSelectedTask(null)}
    />

    {/* Modal */}
    <div className="relative bg-white w-full max-w-lg mx-4 rounded-xl shadow-xl p-6 animate-fadeIn">

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Weekly Task Details
        </h3>

        <button
          onClick={() => setSelectedTask(null)}
          className="text-gray-500 hover:text-gray-700 transition"
        >
          <FiX size={20} />
        </button>
      </div>

      <div className="space-y-4 max-h-[60vh] overflow-y-auto">

        {/* Title */}
        <div>
          <p className="text-xs text-gray-500">Title</p>
          <p className="text-sm font-medium text-gray-800">
            {selectedTask.name}
          </p>
        </div>

        {/* Description */}
        <div>
          <p className="text-xs text-gray-500">Description</p>
          <p className="text-sm text-gray-700">
            {selectedTask.description || "—"}
          </p>
        </div>

        {/* Subtasks */}
        <div>
          <p className="text-xs text-gray-500 mb-2">Subtasks</p>

          {selectedTask.subtasks.length === 0 ? (
            <p className="text-sm text-gray-400">No subtasks</p>
          ) : (
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              {selectedTask.subtasks.map((sub, i) => (
                <li key={i}>{sub.text}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Status */}
        <div>
          <p className="text-xs text-gray-500">Status</p>
          <span
            className={`inline-block text-xs px-3 py-1 rounded-full mt-1 ${
              selectedTask.status === "Approved"
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {selectedTask.status}
          </span>
        </div>

        {/* Date */}
        <div>
          <p className="text-xs text-gray-500">Submitted On</p>
          <p className="text-sm text-gray-700">
            {new Date(selectedTask.createdAt).toLocaleString()}
          </p>
        </div>

      </div>
    </div>
  </div>
)}

{/* ================= PAGINATION ================= */}
{totalPages > 1 && (
  <div className="flex justify-center items-center gap-2 p-4">

    <button
      disabled={currentPage === 1}
      onClick={() => setCurrentPage((prev) => prev - 1)}
      className="px-3 py-1 text-sm border rounded disabled:opacity-40"
    >
      Previous
    </button>

    <span className="text-sm text-gray-600">
      Page {currentPage} of {totalPages}
    </span>

    <button
      disabled={currentPage === totalPages}
      onClick={() => setCurrentPage((prev) => prev + 1)}
      className="px-3 py-1 text-sm border rounded disabled:opacity-40"
    >
      Next
    </button>

  </div>
)}



    </DashboardLayout>
  );
};

export default WeeklyTasks;
