// import React, { useEffect, useState, useMemo, useContext } from "react";
// import { useParams } from "react-router-dom";
// import axiosInstance from "../../utils/axiosInstance";
// import { API_PATHS } from "../../utils/apiPaths";
// import moment from "moment";
// import AvatarGroup from "../../components/AvatarGroup";
// import DashboardLayout from "../../components/Layouts/DashboardLayout";
// import { LuSquareArrowOutUpRight } from "react-icons/lu";
// import { UserContext } from "../../context/userContext";

// const ViewTaskDetails = () => {
//   const { user } = useContext(UserContext);
//   const user_id = user?._id;
//   const { id } = useParams();
//   const [task, setTask] = useState(null);
//   console.log("Task: ", task);

//   const [comment, setComment] = useState("");
//   const [commentLoading, setCommentLoading] = useState(false);

//   /* -------------------- COMMENTS -------------------- */

//   const handleAddComment = async () => {
//     if (!comment.trim()) return;

//     try {
//       setCommentLoading(true);

//       const response = await axiosInstance.post(
//         API_PATHS.TASKS.ADD_COMMENT(id),
//         { message: comment },
//       );

//       if (response.data?.task) {
//         setTask(response.data.task);
//         setComment("");
//       }
//     } catch (error) {
//       console.error("Failed to add comment", error);
//     } finally {
//       setCommentLoading(false);
//     }
//   };

//   // handle file upload
//   const handleSubtaskFileUpload = async (file, subtaskId) => {
//     const formData = new FormData();
//     formData.append("file", file);

//     try {
//       const response = await axiosInstance.post(
//         API_PATHS.TASKS.UPLOAD_SUBTASK_FILE(id, subtaskId),
//         formData,
//         {
//           headers: { "Content-Type": "multipart/form-data" },
//         },
//       );

//       setTask(response.data.task);
//     } catch (error) {
//       console.error("Upload failed", error);
//     }
//   };

//   /* -------------------- STATUS TAG -------------------- */

//   const getStatusTagColor = (status) => {
//     switch (status) {
//       case "In Progress":
//         return "text-cyan-500 bg-cyan-50 border border-cyan-500/10";
//       case "In Review":
//         return "text-amber-500 bg-amber-50 border border-amber-500/20";
//       case "Completed":
//         return "text-lime-500 bg-lime-50 border border-lime-500/20";
//       case "Blocked":
//         return "text-red-500 bg-red-50 border border-red-500/20";
//       default:
//         return "text-violet-500 bg-violet-50 border border-violet-500/10";
//     }
//   };

//   /* -------------------- FETCH TASK -------------------- */

//   const getTaskDetailsByID = async () => {
//     try {
//       const response = await axiosInstance.get(
//         API_PATHS.TASKS.GET_TASK_BY_ID(id),
//       );

//       if (response.data) {
//         setTask(response.data);
//       }
//     } catch (error) {
//       console.error("Error fetching task:", error);
//     }
//   };

//   /* -------------------- TODO CHECKLIST -------------------- */

//   // const updatetodoCheckList = async (index) => {
//   //   if (!task?.todoCheckList?.[index]) return;

//   //   const todoCheckList = task.todoCheckList.map((item, i) =>
//   //     i === index ? { ...item, completed: !item.completed } : item
//   //   );

//   //   try {
//   //     const response = await axiosInstance.put(
//   //       API_PATHS.TASKS.UPDATE_TODO_CHECKLIST(id),
//   //       { todoCheckList }
//   //     );

//   //     if (response.status === 200) {
//   //       setTask(response.data.task);
//   //     }
//   //   } catch (error) {
//   //     console.error("Failed to update checklist", error);
//   //   }
//   // };

//   const updatetodoCheckList = async (index) => {
//     const item = task?.todoCheckList?.[index];
//     if (!item) return;

//     // 🚨 Prevent if not assigned to me
//     if (item.assignedTo?._id !== user_id) return;

//     const todoCheckList = task.todoCheckList.map((t, i) =>
//       i === index ? { ...t, completed: !t.completed } : t,
//     );

//     try {
//       const response = await axiosInstance.put(
//         API_PATHS.TASKS.UPDATE_TODO_CHECKLIST(id),
//         { todoCheckList },
//       );

//       if (response.status === 200) {
//         setTask(response.data.task);
//       }
//     } catch (error) {
//       console.error("Failed to update checklist", error);
//     }
//   };

//   /* -------------------- ATTACHMENTS -------------------- */

//   const normalizedAttachments = useMemo(() => {
//     if (!Array.isArray(task?.attachments)) return [];

//     return task.attachments.map((a) => {
//       // Legacy string support
//       if (typeof a === "string") {
//         return { url: a, name: a };
//       }

//       // Wrapped object safety
//       if (a?.url && typeof a.url === "object") {
//         return a.url;
//       }

//       return a;
//     });
//   }, [task?.attachments]);

//   const handleLinkClick = (url) => {
//     if (!url) return;

//     if (!/^https?:\/\//i.test(url)) {
//       url = "https://" + url;
//     }

//     window.open(url, "_blank");
//   };

//   /* -------------------- EFFECT -------------------- */

//   useEffect(() => {
//     if (id) getTaskDetailsByID();
//   }, [id]);

//   /* -------------------- UI -------------------- */

//   return (
//     <DashboardLayout activeMenu="My Tasks">
//       <div className="mt-5">
//         {task && (
//           <div className="grid grid-cols-1 md:grid-cols-4 mt-4">
//             <div className="form-card col-span-3">
//               {/* HEADER */}
//               <div className="flex items-center justify-between">
//                 <h2 className="text-sm md:text-xl font-medium">{task.title}</h2>

//                 <div
//                   className={`text-[11px] font-medium ${getStatusTagColor(
//                     task.status,
//                   )} px-4 py-0.5 rounded`}
//                 >
//                   {task.status}
//                 </div>
//               </div>

//               {/* DESCRIPTION */}
//               <div className="mt-4">
//                 <InfoBox label="Description" value={task.description} />
//               </div>

//               {/* META */}
//               <div className="grid grid-cols-12 gap-4 mt-4">
//                 <div className="col-span-6 md:col-span-4">
//                   <InfoBox label="Priority" value={task.priority} />
//                 </div>

//                 <div className="col-span-6 md:col-span-4">
//                   <InfoBox
//                     label="Due Date"
//                     value={
//                       task.dueDate
//                         ? moment(task.dueDate).format("Do MMM YYYY")
//                         : "N/A"
//                     }
//                   />
//                 </div>

//                 <div className="col-span-6 md:col-span-4">
//                   <label className="text-xs font-medium text-slate-500">
//                     Assigned To
//                   </label>

//                   <AvatarGroup
//                     avatars={
//                       task.assignedTo?.map((item) => item.profileImageUrl) || []
//                     }
//                     maxVisible={5}
//                   />
//                 </div>
//               </div>

//               {/* TODO */}
//               <div className="mt-3">
//                 <label className="text-xs font-medium text-slate-500">
//                   Todo Checklist
//                 </label>

//                 {task.todoCheckList?.map((item, index) => {
//                   const isAssignedToMe = item.assignedTo?._id === user_id;

//                   const isTaskLocked = ["Completed", "Blocked"].includes(
//                     task.status,
//                   );

//                   return (
//                     <TodoCheckList
//                       key={item._id}
//                       item={item}
//                       isAssignedToMe={isAssignedToMe}
//                       isTaskLocked={isTaskLocked}
//                       onToggle={() => updatetodoCheckList(index)}
//                       onFileUpload={(file) =>
//                         handleSubtaskFileUpload(file, item._id)
//                       }
//                     />
//                   );
//                 })}
//               </div>

//               {/* ATTACHMENTS */}
//               {normalizedAttachments.length > 0 && (
//                 <div className="mt-4">
//                   <label className="text-xs font-medium text-slate-500">
//                     Attachments
//                   </label>

//                   <div className="mt-2">
//                     {normalizedAttachments.map((file, index) => (
//                       <Attachment
//                         key={file._id || index}
//                         file={file}
//                         index={index}
//                         onClick={() => handleLinkClick(file.url)}
//                       />
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* COMMENTS */}
//               <div className="mt-6">
//                 <label className="text-xs font-medium text-slate-500">
//                   Comments
//                 </label>

//                 {task.comments?.length === 0 && (
//                   <p className="text-xs text-gray-400 mt-2">No comments yet</p>
//                 )}

//                 <div className="mt-2 space-y-2">
//                   {task.comments?.map((c) => (
//                     <div
//                       key={c._id}
//                       className="border border-gray-100 bg-gray-50 rounded-md p-3"
//                     >
//                       <div className="flex items-center gap-2 mb-1">
//                         <img
//                           src={c.commentedBy?.profileImageUrl}
//                           alt=""
//                           className="w-6 h-6 rounded-full"
//                         />
//                         <p className="text-xs font-medium text-gray-700">
//                           {c.commentedBy?.name}
//                         </p>
//                         <span className="text-[11px] text-gray-400">
//                           {moment(c.createdAt).fromNow()}
//                         </span>
//                       </div>

//                       <p className="text-sm text-gray-800">{c.message}</p>
//                     </div>
//                   ))}
//                 </div>

//                 {/* ADD COMMENT */}
//                 <div className="mt-3">
//                   <textarea
//                     className="form-input"
//                     rows={2}
//                     placeholder="Add a comment..."
//                     value={comment}
//                     onChange={(e) => setComment(e.target.value)}
//                   />

//                   <button
//                     className="add-btn mt-2"
//                     disabled={commentLoading || !comment.trim()}
//                     onClick={handleAddComment}
//                   >
//                     {commentLoading ? "Posting..." : "Add Comment"}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </DashboardLayout>
//   );
// };

// export default ViewTaskDetails;

// /* -------------------- SUB COMPONENTS -------------------- */

// const InfoBox = ({ label, value }) => (
//   <>
//     <label className="text-xs font-medium text-slate-500">{label}</label>
//     <p className="text-[12px] md:text-[13px] font-medium text-gray-700 mt-0.5">
//       {value}
//     </p>
//   </>
// );

// const TodoCheckList = ({ text, isChecked, onChange, disabled }) => (
//   <div className="flex items-center gap-3 p-3">
//     <input
//       type="checkbox"
//       checked={isChecked}
//       disabled={disabled}
//       onChange={onChange}
//       className="w-4 h-4 cursor-pointer disabled:cursor-not-allowed"
//     />
//     <p
//       className={`text-[13px] ${disabled ? "text-gray-400" : "text-gray-800"}`}
//     >
//       {text}
//     </p>
//   </div>
// );

// const TodoCheckList = ({
//   item,
//   isAssignedToMe,
//   isTaskLocked,
//   onToggle,
//   onFileUpload,
// }) => {
//   const disabled = !isAssignedToMe || isTaskLocked;

//   return (
//     <div className="border border-gray-100 rounded-md p-3 mb-2 bg-gray-50">

//       {/* Top Row */}
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-3">
//           <input
//             type="checkbox"
//             checked={item.completed}
//             disabled={disabled}
//             onChange={onToggle}
//             className="w-4 h-4 cursor-pointer disabled:cursor-not-allowed"
//           />

//           <p
//             className={`text-[13px] ${
//               disabled ? "text-gray-400" : "text-gray-800"
//             }`}
//           >
//             {item.text}
//           </p>
//         </div>

//         {/* Assigned User */}
//         <div className="flex items-center gap-2">
//           <img
//             src={item.assignedTo?.profileImageUrl}
//             alt=""
//             className="w-6 h-6 rounded-full"
//           />
//           <span className="text-xs text-gray-600">
//             {item.assignedTo?.name}
//           </span>
//         </div>
//       </div>

//       {/* Upload Section */}
//       {isAssignedToMe && (
//         <div className="mt-2">
//           <input
//             type="file"
//             onChange={(e) =>
//               e.target.files[0] &&
//               onFileUpload(e.target.files[0])
//             }
//             className="text-xs"
//           />
//         </div>
//       )}
//     </div>
//   );
// };

// const Attachment = ({ file, index, onClick }) => (
//   <div
//     className="flex justify-between bg-gray-50 border border-gray-100 px-3 py-2 rounded-md mb-2 cursor-pointer"
//     onClick={onClick}
//   >
//     <div className="flex items-center gap-3">
//       <span className="text-xs text-gray-400 font-semibold">
//         {index < 9 ? `0${index + 1}` : index + 1}
//       </span>
//       <p className="text-xs text-black break-all">{file.name || file.url}</p>
//     </div>

//     <LuSquareArrowOutUpRight className="text-gray-400" />
//   </div>
// );

import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import moment from "moment";
import AvatarGroup from "../../components/AvatarGroup";
import DashboardLayout from "../../components/Layouts/DashboardLayout";
import { LuUpload, LuFileText } from "react-icons/lu";
import { UserContext } from "../../context/userContext";
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

  if (!task) return null;

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
              <p className="text-gray-400 mb-1">Assigned To</p>
              <AvatarGroup
                avatars={task.assignedTo?.map((u) => u.profileImageUrl) || []}
                maxVisible={5}
              />
            </div>

              {/* assigned by */}
              {console.log(task)}
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
                className="border border-blue-100 bg-blue-50/30 rounded-lg p-3 mb-3"
              >
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

  console.log("Uploading file:", file);

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
