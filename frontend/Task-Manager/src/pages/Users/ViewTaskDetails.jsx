import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import moment from 'moment';
import AvatarGroup from '../../components/AvatarGroup';
import DashboardLayout from '../../components/Layouts/DashboardLayout';
import { LuSquareArrowOutUpRight } from 'react-icons/lu';

const ViewTaskDetails = () => {
  const { id } = useParams();
  const [task, setTask] = useState(null);

  const [comment, setComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

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


  // get Task info by ID
  const getTaskDetailsByID = async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.TASKS.GET_TASK_BY_ID(id)
      );

      if (response.data) {
        const taskInfo = response.data;
        setTask(taskInfo);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };


  const updatetodoCheckList = async (index) => {
    if (!task?.todoCheckList?.[index]) return;

    const taskId = id;

    const todoCheckList = task.todoCheckList.map((item, i) =>
      i === index
        ? { ...item, completed: !item.completed }
        : item
    );

    try {
      const response = await axiosInstance.put(
        API_PATHS.TASKS.UPDATE_TODO_CHECKLIST(taskId),
        { todoCheckList }
      );

      if (response.status === 200) {
        setTask(response.data.task);
      }
    } catch (error) {
      console.error("Failed to update checklist", error);
    }
  };



  // Handle attachment link tick
  const handleLinkClick = (link) => {
    if (!/^https?:\/\//i.test(link)) {
      link = "https://" + link; // Default to HTTPS
    }

    window.open(link, "_blank");
  };

  useEffect(() => {
    if (id) {
      getTaskDetailsByID();
    }

    return () => { };
  }, [id]);


  return (
    <DashboardLayout activeMenu="My Tasks">
      <div className="mt-5">
        {task && (<div className="grid grid-cols-1 md:grid-cols-4 mt-4">
          <div className="form-card col-span-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm md:text-xl font-medium">
                {task?.title}
              </h2>

              <div
                className={`text-[11px] md:test-[13px] font-medium ${getStatusTagColor(
                  task?.status
                )} px-4 py-0.5 rounded`}
              >
                {task?.status}
              </div>
            </div>
            <div className='mt-4'>
              <InfoBox label="Description" value={task?.description} />
            </div>

            <div className="grid grid-cols-12 gap-4 mt-4">
              <div className="col-span-6 md:col-span-4">
                <InfoBox label="Priority" value={task?.priority} />
              </div>

              <div className="col-span-6 md:col-span-4">
                <InfoBox
                  label="Due Date"
                  value={
                    task?.dueDate
                      ? moment(task?.dueDate).format("Do MMM YYYY")
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
                    task?.assignedTo?.map((item) => item?.profileImageUrl) || []
                  }
                  maxVisible={5}
                />
              </div>
            </div>

            <div className="mt-2">
              <label className="text-xs font-medium text-slate-500">
                Todo Checklist
              </label>

              {task?.todoCheckList?.map((item, index) => (
                <TodoCheckList
                  key={`todo_${index}`}
                  text={item.text}
                  isChecked={item?.completed}
                  disabled={["Completed", "Blocked"].includes(task?.status)}
                  onChange={() => updatetodoCheckList(index)}
                />
              ))}
            </div>

            {task?.attachments?.length > 0 && (
              <div className="mt-2">
                <label className="text-xs font-medium text-slate-500">
                  Attachments
                </label>

                {task?.attachments?.map((link, index) => (
                  <Attachment
                    key={`link_${index}`}
                    link={link}
                    index={index}
                    onClick={() => handleLinkClick(link)}
                  />
                ))}
              </div>
            )}

            {/* COMMENTS SECTION */}
            <div className="mt-6">
              <label className="text-xs font-medium text-slate-500">
                Comments
              </label>

              {task?.comments?.length === 0 && (
                <p className="text-xs text-gray-400 mt-2">
                  No comments yet
                </p>
              )}

              <div className="mt-2 space-y-2">
                {task?.comments?.map((c) => (
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

                    <p className="text-sm text-gray-800">{c.message}</p>
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

export default ViewTaskDetails

const InfoBox = ({ label, value }) => {
  return (
    <>
      <label className="text-xs font-medium text-slate-500">{label}</label>
      <p className="text-[12px] md:text-[13px] font-medium text-gray-700 mt-0.5">
        {value}
      </p>
    </>
  );
};


const TodoCheckList = ({ text, isChecked, onChange, disabled }) => {
  return (
    <div className="flex items-center gap-3 p-3">
      <input
        type="checkbox"
        checked={isChecked}
        disabled={disabled}
        onChange={onChange}
        className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded-sm cursor-pointer disabled:cursor-not-allowed"
      />
      <p className={`text-[13px] ${disabled ? "text-gray-400" : "text-gray-800"}`}>
        {text}
      </p>
    </div>
  );
};


const Attachment = ({ link, index, onClick }) => {
  return (
    <div
      className="flex justify-between bg-gray-50 border border-gray-100 px-3 py-2 rounded-md mb-3mt-2 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex-1 flex items-center gap-3">
        <span className="text-xs text-gray-400 font-semibold mr-2">
          {index < 9 ? `0${index + 1}` : index + 1}
        </span>
        <p className="text-xs text-black">{link}</p>
      </div>

      <LuSquareArrowOutUpRight className="text-gray-400" />
    </div>
  );
};
