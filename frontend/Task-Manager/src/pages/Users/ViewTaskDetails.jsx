import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import moment from "moment";
import AvatarGroup from "../../components/AvatarGroup";
import DashboardLayout from "../../components/Layouts/DashboardLayout";
import { LuSquareArrowOutUpRight } from "react-icons/lu";

const ViewTaskDetails = () => {
  const { id } = useParams();
  const [task, setTask] = useState(null);

  const [comment, setComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  /* -------------------- COMMENTS -------------------- */

  const handleAddComment = async () => {
    if (!comment.trim()) return;

    try {
      setCommentLoading(true);

      const response = await axiosInstance.post(
        API_PATHS.TASKS.ADD_COMMENT(id),
        { message: comment }
      );

      if (response.data?.task) {
        setTask(response.data.task);
        setComment("");
      }
    } catch (error) {
      console.error("Failed to add comment", error);
    } finally {
      setCommentLoading(false);
    }
  };

  /* -------------------- STATUS TAG -------------------- */

  const getStatusTagColor = (status) => {
    switch (status) {
      case "In Progress":
        return "text-cyan-500 bg-cyan-50 border border-cyan-500/10";
      case "In Review":
        return "text-amber-500 bg-amber-50 border border-amber-500/20";
      case "Completed":
        return "text-lime-500 bg-lime-50 border border-lime-500/20";
      case "Blocked":
        return "text-red-500 bg-red-50 border border-red-500/20";
      default:
        return "text-violet-500 bg-violet-50 border border-violet-500/10";
    }
  };

  /* -------------------- FETCH TASK -------------------- */

  const getTaskDetailsByID = async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.TASKS.GET_TASK_BY_ID(id)
      );

      if (response.data) {
        setTask(response.data);
      }
    } catch (error) {
      console.error("Error fetching task:", error);
    }
  };

  /* -------------------- TODO CHECKLIST -------------------- */

  const updatetodoCheckList = async (index) => {
    if (!task?.todoCheckList?.[index]) return;

    const todoCheckList = task.todoCheckList.map((item, i) =>
      i === index ? { ...item, completed: !item.completed } : item
    );

    try {
      const response = await axiosInstance.put(
        API_PATHS.TASKS.UPDATE_TODO_CHECKLIST(id),
        { todoCheckList }
      );

      if (response.status === 200) {
        setTask(response.data.task);
      }
    } catch (error) {
      console.error("Failed to update checklist", error);
    }
  };

  /* -------------------- ATTACHMENTS -------------------- */

  const normalizedAttachments = useMemo(() => {
    if (!Array.isArray(task?.attachments)) return [];

    return task.attachments.map((a) => {
      // Legacy string support
      if (typeof a === "string") {
        return { url: a, name: a };
      }

      // Wrapped object safety
      if (a?.url && typeof a.url === "object") {
        return a.url;
      }

      return a;
    });
  }, [task?.attachments]);

  const handleLinkClick = (url) => {
    if (!url) return;

    if (!/^https?:\/\//i.test(url)) {
      url = "https://" + url;
    }

    window.open(url, "_blank");
  };

  /* -------------------- EFFECT -------------------- */

  useEffect(() => {
    if (id) getTaskDetailsByID();
  }, [id]);

  /* -------------------- UI -------------------- */

  return (
    <DashboardLayout activeMenu="My Tasks">
      <div className="mt-5">
        {task && (
          <div className="grid grid-cols-1 md:grid-cols-4 mt-4">
            <div className="form-card col-span-3">
              {/* HEADER */}
              <div className="flex items-center justify-between">
                <h2 className="text-sm md:text-xl font-medium">
                  {task.title}
                </h2>

                <div
                  className={`text-[11px] font-medium ${getStatusTagColor(
                    task.status
                  )} px-4 py-0.5 rounded`}
                >
                  {task.status}
                </div>
              </div>

              {/* DESCRIPTION */}
              <div className="mt-4">
                <InfoBox label="Description" value={task.description} />
              </div>

              {/* META */}
              <div className="grid grid-cols-12 gap-4 mt-4">
                <div className="col-span-6 md:col-span-4">
                  <InfoBox label="Priority" value={task.priority} />
                </div>

                <div className="col-span-6 md:col-span-4">
                  <InfoBox
                    label="Due Date"
                    value={
                      task.dueDate
                        ? moment(task.dueDate).format("Do MMM YYYY")
                        : "N/A"
                    }
                  />
                </div>

                <div className="col-span-6 md:col-span-4">
                  <label className="text-xs font-medium text-slate-500">
                    Assigned To
                  </label>

                  <AvatarGroup
                    avatars={
                      task.assignedTo?.map(
                        (item) => item.profileImageUrl
                      ) || []
                    }
                    maxVisible={5}
                  />
                </div>
              </div>

              {/* TODO */}
              <div className="mt-3">
                <label className="text-xs font-medium text-slate-500">
                  Todo Checklist
                </label>

                {task.todoCheckList?.map((item, index) => (
                  <TodoCheckList
                    key={index}
                    text={item.text}
                    isChecked={item.completed}
                    disabled={["Completed", "Blocked"].includes(task.status)}
                    onChange={() => updatetodoCheckList(index)}
                  />
                ))}
              </div>

              {/* ATTACHMENTS */}
              {normalizedAttachments.length > 0 && (
                <div className="mt-4">
                  <label className="text-xs font-medium text-slate-500">
                    Attachments
                  </label>

                  <div className="mt-2">
                    {normalizedAttachments.map((file, index) => (
                      <Attachment
                        key={file._id || index}
                        file={file}
                        index={index}
                        onClick={() => handleLinkClick(file.url)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* COMMENTS */}
              <div className="mt-6">
                <label className="text-xs font-medium text-slate-500">
                  Comments
                </label>

                {task.comments?.length === 0 && (
                  <p className="text-xs text-gray-400 mt-2">
                    No comments yet
                  </p>
                )}

                <div className="mt-2 space-y-2">
                  {task.comments?.map((c) => (
                    <div
                      key={c._id}
                      className="border border-gray-100 bg-gray-50 rounded-md p-3"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <img
                          src={c.commentedBy?.profileImageUrl}
                          alt=""
                          className="w-6 h-6 rounded-full"
                        />
                        <p className="text-xs font-medium text-gray-700">
                          {c.commentedBy?.name}
                        </p>
                        <span className="text-[11px] text-gray-400">
                          {moment(c.createdAt).fromNow()}
                        </span>
                      </div>

                      <p className="text-sm text-gray-800">
                        {c.message}
                      </p>
                    </div>
                  ))}
                </div>

                {/* ADD COMMENT */}
                <div className="mt-3">
                  <textarea
                    className="form-input"
                    rows={2}
                    placeholder="Add a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />

                  <button
                    className="add-btn mt-2"
                    disabled={commentLoading || !comment.trim()}
                    onClick={handleAddComment}
                  >
                    {commentLoading ? "Posting..." : "Add Comment"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ViewTaskDetails;

/* -------------------- SUB COMPONENTS -------------------- */

const InfoBox = ({ label, value }) => (
  <>
    <label className="text-xs font-medium text-slate-500">
      {label}
    </label>
    <p className="text-[12px] md:text-[13px] font-medium text-gray-700 mt-0.5">
      {value}
    </p>
  </>
);

const TodoCheckList = ({ text, isChecked, onChange, disabled }) => (
  <div className="flex items-center gap-3 p-3">
    <input
      type="checkbox"
      checked={isChecked}
      disabled={disabled}
      onChange={onChange}
      className="w-4 h-4 cursor-pointer disabled:cursor-not-allowed"
    />
    <p
      className={`text-[13px] ${
        disabled ? "text-gray-400" : "text-gray-800"
      }`}
    >
      {text}
    </p>
  </div>
);

const Attachment = ({ file, index, onClick }) => (
  <div
    className="flex justify-between bg-gray-50 border border-gray-100 px-3 py-2 rounded-md mb-2 cursor-pointer"
    onClick={onClick}
  >
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-400 font-semibold">
        {index < 9 ? `0${index + 1}` : index + 1}
      </span>
      <p className="text-xs text-black break-all">
        {file.name || file.url}
      </p>
    </div>

    <LuSquareArrowOutUpRight className="text-gray-400" />
  </div>
);
