import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import moment from "moment";
import AvatarGroup from "../../components/AvatarGroup";
import DashboardLayout from "../../components/Layouts/DashboardLayout";
import { LuUpload, LuFileText } from "react-icons/lu";
import { UserContext } from "../../context/userContext";
import { LuTrash2 } from "react-icons/lu";
import toast from "react-hot-toast";

const ViewTaskDetails = () => {
  const { user } = useContext(UserContext);
  const user_id = user?._id;
  const { id } = useParams();
  const [task, setTask] = useState(null);

  const getTaskDetailsByID = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.TASKS.GET_TASK_BY_ID(id));
      setTask(res.data);
    } catch {
      toast.error("Failed to load task");
    }
  };

  useEffect(() => {
    getTaskDetailsByID();
  }, [id]);

  const getStatusStyles = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-50 text-green-600 border-green-200";
      case "In Progress":
        return "bg-blue-50 text-blue-600 border-blue-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  const handleDeleteComment = async (commentId) => {
  try {
    await axiosInstance.delete(
      API_PATHS.TASKS.DELETE_COMMENT(id, commentId)
    );

    toast.success("Comment deleted");

    // Refresh task after deletion
    const res = await axiosInstance.get(
      API_PATHS.TASKS.GET_TASK_BY_ID(id)
    );

    setTask(res.data);
  } catch (error) {
    toast.error(
      error.response?.data?.message || "Failed to delete comment"
    );
  }
};


  if (!task) return null;
  console.log("task: ", task);

  return (
    <DashboardLayout activeMenu="My Tasks">
      <div className="mt-6">
        <div className="bg-white border border-blue-100 rounded-xl p-6 shadow-sm">
          {/* HEADER */}
          <div className="flex justify-between items-start border-b border-blue-50 pb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                {task.title}
              </h2>
              <p className="text-xs text-gray-500 mt-1">{task.description}</p>
            </div>

            <div
              className={`text-xs px-3 py-1 rounded-full border ${getStatusStyles(
                task.status,
              )}`}
            >
              {task.status}
            </div>

         
          </div>

            {task?.attachments?.length > 0 && (
  <div className="mt-4 border-t border-blue-50 pt-4">
    <p className="text-xs font-semibold text-gray-500 mb-2">
      Attachments
    </p>

    <div className="space-y-2">
      {task.attachments.map((attachment, index) => (
        <div
          key={index}
          className="flex items-center gap-2 text-xs text-blue-600"
        >
          <LuFileText size={14} />

          <a
            href={attachment.url}
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-blue-800"
          >
            {attachment.name}
          </a>
        </div>
      ))}
    </div>
  </div>
)}

          {/* META */}
          <div className="grid grid-cols-4 gap-6 mt-4 text-xs text-gray-600">
            <div>
              <p className="text-gray-400">Priority</p>
              <p className="mt-1 font-medium text-gray-700">{task.priority}</p>
            </div>

            <div>
              <p className="text-gray-400">Due Date</p>
              <p className="mt-1 font-medium text-gray-700">
                {moment(task.dueDate).format("Do MMM YYYY")}
              </p>
            </div>

            <div>
              <p className="text-gray-400 mb-2">Assigned To</p>

              <div className="flex items-center gap-3 flex-wrap">
                {task?.assignedTo?.map((member) => (
                  <div
                    key={member._id}
                    className="flex items-center gap-2 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full"
                  >
                    <span className="text-xs font-medium text-gray-700">
                      {member.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* assigned by */}
            <div>
              <p className="text-gray-400 mb-1">Assigned By</p>
              <div className="flex items-center gap-2 mt-1">
                <img
                  src={task?.createdBy?.profileImageUrl}
                  alt=""
                  className="w-6 h-6 rounded-full"
                />
                <p className="font-medium text-gray-700">
                  {task?.createdBy?.name}
                </p>
              </div>
            </div>
          </div>

          {/* SUBTASKS */}
          <div className="mt-6">
            <p className="text-xs font-semibold text-gray-500 mb-3">
              Todo Checklist
            </p>

            {task.todoCheckList?.map((item) => (
              <SubtaskCard
                key={item._id}
                taskId={id}
                item={item}
                userId={user_id}
                onUpdated={setTask}
              />
            ))}
          </div>

          {/* COMMENTS */}
          <div className="mt-8 border-t border-blue-50 pt-6">
            <p className="text-xs font-semibold text-gray-500 mb-3">Comments</p>

          {task.comments?.map((c) => (
  <div
    key={c._id}
    className="group border border-blue-100 bg-blue-50/30 rounded-lg p-3 mb-3 flex justify-between items-start hover:bg-blue-50 transition"
  >
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-1">
        <img
          src={c.commentedBy?.profileImageUrl}
          alt=""
          className="w-6 h-6 rounded-full"
        />
        <span className="text-xs font-medium text-gray-700">
          {c.commentedBy?.name}
        </span>
        <span className="text-[10px] text-gray-400">
          {moment(c.createdAt).fromNow()}
        </span>
      </div>

      <p className="text-xs text-gray-700">{c.message}</p>
    </div>

    {/* DELETE BUTTON */}
    {(user.role === "admin" ||
      c.commentedBy?._id === user_id) && (
      <button
        onClick={() => handleDeleteComment(c._id)}
        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition ml-2"
      >
        <LuTrash2 size={16} />
      </button>
    )}
  </div>
))}


            <CommentBox taskId={id} onUpdated={setTask} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ViewTaskDetails;

/* ================= SUBTASK CARD ================= */

const SubtaskCard = ({ item, taskId, userId, onUpdated }) => {
  const assignedUserId =
    typeof item.assignedTo === "object"
      ? item.assignedTo?._id
      : item.assignedTo;

  const isAssignedToMe = assignedUserId === userId;

  const [completed, setCompleted] = useState(item.completed);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const hasChanges = completed !== item.completed || file !== null;


  const handleUpdate = async () => {
    if (!isAssignedToMe || !hasChanges) return;

    const formData = new FormData();
    formData.append("completed", completed);
    if (file) formData.append("file", file);

    try {
      setLoading(true);

      const res = await axiosInstance.put(
        API_PATHS.TASKS.UPDATE_SUBTASK(taskId, item._id),
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      toast.success(res.data.message);
      onUpdated(res.data.task);
      setFile(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-blue-100 bg-blue-50/30 rounded-lg p-4 mb-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={completed}
            disabled={!isAssignedToMe}
            onChange={() => setCompleted(!completed)}
            className="w-4 h-4 accent-blue-600"
          />
          <span className="text-sm text-gray-700">{item.text}</span>
        </div>

        <div className="flex items-center gap-2">
          <img
            src={item.assignedTo?.profileImageUrl}
            alt=""
            className="w-6 h-6 rounded-full border border-white"
          />
          <span className="text-xs text-gray-600">{item.assignedTo?.name}</span>
        </div>
      </div>

      {item.document?.fileUrl && (
        <div className="mt-3 flex items-center gap-2 text-xs text-blue-600">
          <LuFileText size={14} />
          <a
            href={item.document.fileUrl}
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-blue-800"
          >
            {item.document.fileName}
          </a>
        </div>
      )}

      {isAssignedToMe && (
        <div className="mt-4 flex items-center gap-3">
          <label className="cursor-pointer flex items-center gap-2 text-xs bg-white border border-blue-200 px-3 py-1.5 rounded-md hover:bg-blue-50 transition">
            <LuUpload size={14} />
            Choose File
            <input
              type="file"
              hidden
              onChange={(e) => setFile(e.target.files[0])}
            />
          </label>

          {file && <span className="text-xs text-gray-600">{file.name}</span>}

          <button
            onClick={handleUpdate}
            disabled={loading || !hasChanges}
            className={`text-xs px-4 py-1.5 rounded-md transition ${
              hasChanges
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
          >
            {loading ? "Updating..." : "Update"}
          </button>
        </div>
      )}
    </div>
  );
};

/* ================= COMMENT BOX ================= */

const CommentBox = ({ taskId, onUpdated }) => {
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddComment = async () => {
    if (!comment.trim()) return;

    try {
      setLoading(true);

      const res = await axiosInstance.post(
        API_PATHS.TASKS.ADD_COMMENT(taskId),
        { message: comment },
      );

      toast.success("Comment added");
      onUpdated(res.data.task);
      setComment("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add comment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <textarea
        className="w-full border border-blue-100 rounded-md p-2 text-xs focus:outline-none focus:border-blue-300"
        rows={2}
        placeholder="Add a comment..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <button
        onClick={handleAddComment}
        disabled={loading}
        className="mt-2 bg-blue-600 text-white text-xs px-4 py-1.5 rounded-md hover:bg-blue-700"
      >
        {loading ? "Posting..." : "Add Comment"}
      </button>
    </div>
  );
};
