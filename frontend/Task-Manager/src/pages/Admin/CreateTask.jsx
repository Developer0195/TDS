import React, { useEffect, useState } from 'react'
import DashboardLayout from '../../components/Layouts/DashboardLayout'
import { PRIORITY_DATA } from '../../utils/data'
import axiosInstance from '../../utils/axiosInstance'
import { API_PATHS } from '../../utils/apiPaths'
import toast from "react-hot-toast"
import { useLocation, useNavigate } from "react-router-dom"
import moment from "moment"
import { LuTrash2 } from "react-icons/lu"
import SelectDropdown from '../../components/Inputs/SelectDropdown'
import TodoListInput from '../../components/Inputs/TodoListInput'
import AddAttachmentsInput from '../../components/Inputs/AddAttachmentsInput'
import SelectUsers from '../../components/Inputs/SelectUsers'
import Input from '../../components/Inputs/Input'
import Modal from '../../components/Modal'
import DeleteAlert from '../../components/DeleteAlert'
import useAIGeneration from "../../hooks/useAIGeneration";
import useAIEstimation from "../../hooks/useAIEstimation";
import AIEstimationPanel from '../../components/AIEstimationPanel'


const CreateTask = () => {

  const location = useLocation()
  const { taskId } = location.state || {}
  const navigate = useNavigate()

  const [projects, setProjects] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);


  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    priority: "Low",
    dueDate: null,
    assignedTo: [],
    project: null,
    todoCheckList: [],
    attachments: []
  })

  const {
    loading: aiEstimateLoading,
    estimation,
    runEstimation,
    canEstimate,
  } = useAIEstimation({ taskData });



  const [currentTask, setCurrentTask] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [openDeleteAlert, setOpenDeleteAlert] = useState(false)

  /* -------------------- HELPERS -------------------- */

  const isTaskLocked =
    currentTask?.status === "Completed" ||
    currentTask?.status === "Blocked";

  const handleValueChange = (key, value) => {
    setTaskData((prev) => ({ ...prev, [key]: value }))
  }

  const clearData = () => {
    setTaskData({
      title: "",
      description: "",
      priority: "Low",
      dueDate: null,
      assignedTo: [],
      project: null,
      todoCheckList: [],
      attachments: [],
    })
    setAiFile(null)
    setAiAttachment(null)
    setError(null)
  }

  const {
    aiLoading,
    aiFile,
    setAiFile,
    aiAttachment,
    setAiAttachment,
    handleAIGenerate,
    handleRemoveAIFile,
  } = useAIGeneration({
    setTaskData,
    taskId,
    clearData,
  });

  /* -------------------- CREATE TASK -------------------- */

  const createTask = async () => {
    setLoading(true)

    try {
      if (!taskData.dueDate || isNaN(new Date(taskData.dueDate).getTime())) {
        toast.error("Please select a valid due date")
        setLoading(false)
        return
      }

      const todoList = taskData.todoCheckList.map((item) =>
        typeof item === "string"
          ? { text: item, completed: false }
          : { text: item.text, completed: item.completed ?? false }
      )

      const payload = {
        ...taskData,
        project: taskData.project || null,
        dueDate: new Date(taskData.dueDate).toISOString(),
        todoCheckList: todoList,
        attachments: aiAttachment ? [aiAttachment] : [],
      }

      const response = await axiosInstance.post(
        API_PATHS.TASKS.CREATE_TASK,
        payload
      )

      if (response.status === 201) {
        toast.success("Task Created Successfully")
        clearData()
      }
    } catch (error) {
      console.error("Error creating task:", error)
      toast.error(error.response?.data?.message || "Failed to create task")
    } finally {
      setLoading(false)
    }
  }

  /* -------------------- UPDATE TASK -------------------- */

  const updateTask = async () => {
    setLoading(true)

    try {
      if (!taskData.dueDate || isNaN(new Date(taskData.dueDate).getTime())) {
        toast.error("Please select a valid due date")
        setLoading(false)
        return
      }

      const todoList = taskData.todoCheckList.map((item) =>
        typeof item === "string"
          ? { text: item, completed: false }
          : { text: item.text, completed: item.completed ?? false }
      )

      await axiosInstance.put(
        API_PATHS.TASKS.UPDATE_TASK(taskId),
        {
          ...taskData,
          project: taskData.project || null,
          dueDate: new Date(taskData.dueDate).toISOString(),
          todoCheckList: todoList,
          attachments: aiAttachment
            ? [...taskData.attachments, aiAttachment]
            : taskData.attachments,
        }
      )

      toast.success("Task Updated Successfully")
      clearData()
    } catch (error) {
      console.error("Error updating task:", error)
      toast.error("Failed to update task")
    } finally {
      setLoading(false)
    }
  }

  /* -------------------- SUBMIT -------------------- */

  const handleSubmit = () => {
    setError("")

    if (!taskData.title.trim()) return setError("Title is required.")
    if (!taskData.description.trim()) return setError("Description is required.")
    if (!taskData.dueDate) return setError("Due date is required.")
    if (taskData.assignedTo.length === 0)
      return setError("Task not assigned to any member")
    if (taskData.todoCheckList.length === 0)
      return setError("Add at least one todo task")

    taskId ? updateTask() : createTask()
  }


  /* -------------------- LOAD TASK -------------------- */

  useEffect(() => {
    if (!taskId) return

    const loadTask = async () => {
      const response = await axiosInstance.get(
        API_PATHS.TASKS.GET_TASK_BY_ID(taskId)
      )

      const taskInfo = response.data

      console.log(taskInfo)

      setCurrentTask(taskInfo)
      setComments(taskInfo.comments || []);

      setTaskData({
        title: taskInfo.title,
        description: taskInfo.description,
        priority: taskInfo.priority,
        dueDate: taskInfo.dueDate
          ? moment(taskInfo.dueDate).format("YYYY-MM-DD")
          : null,
        assignedTo: taskInfo.assignedTo.map((u) => u._id),
        project: taskInfo.project?._id || null,
        todoCheckList: taskInfo.todoCheckList.map((t) => t.text),
        attachments: taskInfo.attachments || [],
      })
    }

    loadTask()
  }, [taskId])

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axiosInstance.get(API_PATHS.PROJECTS.GET_PROJECTS);

        const formatted = res.data.projects.map((p) => ({
          label: p.name,
          value: p._id,
        }));

        setProjects(formatted);
      } catch (error) {
        console.log(error);
        toast.error("Failed to load projects");
      }
    };

    fetchProjects();
  }, []);


  const handleReopenTask = async () => {
    try {
      await axiosInstance.put(
        API_PATHS.TASKS.UPDATE_TASK_STATUS(taskId),
        { status: "In Review" }
      );

      toast.success("Task reopened for review");

      // Refresh task
      const res = await axiosInstance.get(
        API_PATHS.TASKS.GET_TASK_BY_ID(taskId)
      );

      setCurrentTask(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to reopen task");
    }
  };



  return (
    <DashboardLayout activeMenu="Create Task">
      <div className="mt-5">
        <div className="grid grid-cols-1 md:grid-cols-4 mt-4">
          <div className="form-card col-span-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl md:text-xl font-medium ">
                {taskId ? "Update Task" : "Create Task"}
              </h2>

              {taskId && (
                <button
                  className="flex items-center gap-1.5 text-[13px] font-medium text-rose-500 bg-rose-50 rounded px-2 py-1 border border-rose-100 hover:border-rose-300 cursor-pointer"
                  onClick={() => setOpenDeleteAlert(true)}
                >
                  <LuTrash2 className="text-base" /> Delete
                </button>
              )}
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-600">
                  Task Title
                </label>

                <div className="flex items-center gap-3">
                  {/* 📎 FILE UPLOAD */}
                  {
                    !isTaskLocked &&
                    <label className="text-xs cursor-pointer text-indigo-600 hover:underline">
                      📎 Upload File
                      <input
                        disabled={isTaskLocked}
                        type="file"
                        accept=".pdf,.docx,.txt"
                        hidden
                        onChange={(e) => setAiFile(e.target.files[0])}
                      />
                    </label>
                  }

                  {/* ✨ AI BUTTON */}
                  {
                    !isTaskLocked &&
                    <button
                      onClick={() => handleAIGenerate(taskData.title)}
                      disabled={aiLoading || (!taskData.title) || isTaskLocked}
                      className={`text-xs font-medium hover:underline ${aiLoading || (!aiFile && !taskData.title)
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-indigo-600"
                        }`}
                    >
                      {aiLoading ? "Generating..." : "✨ Generate with AI"}
                    </button>
                  }

                </div>
              </div>

              <input
                disabled={isTaskLocked}
                placeholder="Create App UI"
                className="form-input mt-1"
                value={taskData.title}
                onChange={({ target }) =>
                  handleValueChange("title", target.value)
                }
              />

              {/* 📄 FILE NAME PREVIEW */}
              {aiFile && (
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-slate-500">
                    Selected file: {aiFile.name}
                  </p>

                  <button
                    type="button"
                    onClick={handleRemoveAIFile}
                    className="text-xs text-red-500 hover:underline"
                  >
                    ✕ Remove
                  </button>
                </div>
              )}


            </div>


            <div className="mt-3">
              <label className="text-xs font-medium text-slate-600">
                Description
              </label>

              <textarea
                disabled={isTaskLocked}
                placeholder="Describe task"
                className="form-input"
                rows={4}
                value={taskData.description}
                onChange={({ target }) =>
                  handleValueChange("description", target.value)
                }
              />
            </div>

            <div className="grid grid-cols-12 gap-4 mt-2">
              <div className="col-span-6 md:col-span-4">
                <label className="text-xs font-medium text-slate-600">
                  Priority
                </label>

                <SelectDropdown
                  disabled={isTaskLocked}
                  options={PRIORITY_DATA}
                  value={taskData.priority}
                  onChange={(value) =>
                    handleValueChange("priority", value)
                  }
                  placeholder="Select Priority"
                />
              </div>

              <div className="col-span-6 md:col-span-4">
                <label className="text-xs font-medium text-slate-600">
                  Project (Optional)
                </label>

                <SelectDropdown
                  options={projects}
                  value={taskData.project}
                  onChange={(value) => handleValueChange("project", value)}
                  placeholder="Select Project"
                />
              </div>


              <div className="col-span-6 md:col-span-4">
                <label className="text-xs font-medium  text-slate-600">
                  Due Date
                </label>

                <Input
                  disabled={isTaskLocked}
                  placeholder="Create App UI"
                  className="form-input"
                  value={taskData.dueDate}
                  onChange={({ target }) =>
                    handleValueChange("dueDate", target.value)
                  }
                  type="date"
                />
              </div>

              <div className="col-span-6 md:col-span-4">
                <label className="text-xs font-medium  text-slate-600">
                  Estimated Hours
                </label>

                <Input
                  type="number"
                  placeholder="Estimated Hours"
                  value={taskData.estimatedHours}
                  onChange={(e) =>
                    handleValueChange("estimatedHours", e.target.value)
                  }
                />

              </div>


              <div className="col span-12 md:col-span-3">
                <label className="text-xs font-medium text-slate-600 ">
                  Assign To
                </label>
                <SelectUsers
                  disabled={isTaskLocked}
                  selectedUsers={taskData.assignedTo}
                  setSelectedUsers={(value) => {
                    handleValueChange("assignedTo", value);
                  }}
                />
              </div>

            </div>
            {
              !isTaskLocked &&
              <div className="mt-4">
                <AIEstimationPanel
                  loading={aiEstimateLoading}
                  estimation={estimation}
                  canEstimate={canEstimate}
                  onRun={runEstimation}
                  onApplyDueDate={() => {
                    if (!estimation?.suggestedDueDate) return;
                    handleValueChange("dueDate", estimation.suggestedDueDate);
                  }}
                />
              </div>
            }

            <div className="mt-3">
              <label className="text-xs font-medium  text-slate-600">
                TODO Checklist
              </label>

              <TodoListInput
                disabled={isTaskLocked}
                todoList={taskData?.todoCheckList}
                setTodoList={(value) =>
                  handleValueChange("todoCheckList", value)
                }
              />
            </div>
            <div className="mt-3">
              <label className="text-xs font-medium □text-slate-600">
                Add Attachments
              </label>

              <AddAttachmentsInput
                disabled={isTaskLocked}
                attachments={taskData?.attachments}
                setAttachments={(value) =>
                  handleValueChange("attachments", value)
                }
              />
            </div>
            {/* COMMENTS SECTION */}
            {taskId && (
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2">Comments</h3>

                {comments.length === 0 && (
                  <p className="text-xs text-gray-400">No comments yet</p>
                )}

                <div className="space-y-2">
                  {comments.map((c) => (
                    <div
                      key={c._id}
                      className="border border-gray-100 bg-gray-50 rounded-md p-3"
                    >
                      <p className="text-sm text-gray-800">{c.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {c.commentedBy?.name} •{" "}
                        {moment(c.createdAt).fromNow()}
                      </p>
                    </div>
                  ))}
                </div>

                {/* ADD COMMENT */}
                {!isTaskLocked && (
                  <div className="mt-3">
                    <textarea
                      className="form-input"
                      rows={2}
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />

                    <button
                      className="add-btn mt-2"
                      disabled={!newComment.trim() || commentLoading}
                      onClick={async () => {
                        try {
                          setCommentLoading(true);
                          const res = await axiosInstance.post(
                            API_PATHS.TASKS.ADD_COMMENT(taskId),
                            { message: newComment }
                          );
                          console.log(res)
                          setComments(res.data.task.comments);
                          setNewComment("");
                        } finally {
                          setCommentLoading(false);
                        }
                      }}
                    >
                      Add Comment
                    </button>
                  </div>
                )}
              </div>
            )}


            {/* TASK ACTIONS */}
            {taskId && (
              <div className="mt-6 flex gap-3 justify-end border-t pt-4">

                {/* IN REVIEW → APPROVE / BLOCK */}
                {currentTask?.status === "In Review" && (
                  <>
                    <button
                      className="px-4 py-2 rounded bg-emerald-600 text-white text-sm hover:bg-emerald-700"
                      onClick={async () => {
                        try {
                          await axiosInstance.put(
                            API_PATHS.TASKS.UPDATE_TASK_STATUS(taskId),
                            { status: "Completed" }
                          );

                          toast.success("Task approved & completed");

                          const res = await axiosInstance.get(
                            API_PATHS.TASKS.GET_TASK_BY_ID(taskId)
                          );
                          setCurrentTask(res.data);
                        } catch (error) {
                          toast.error("Failed to complete task");
                        }
                      }}
                    >
                      ✅ Approve & Complete
                    </button>

                    <button
                      className="px-4 py-2 rounded border border-red-400 text-red-600 text-sm hover:bg-red-50"
                      onClick={async () => {
                        try {
                          await axiosInstance.put(
                            API_PATHS.TASKS.UPDATE_TASK_STATUS(taskId),
                            { status: "Blocked" }
                          );

                          toast.success("Task blocked");

                          const res = await axiosInstance.get(
                            API_PATHS.TASKS.GET_TASK_BY_ID(taskId)
                          );
                          setCurrentTask(res.data);
                        } catch (error) {
                          toast.error("Failed to block task");
                        }
                      }}
                    >
                      🚫 Block Task
                    </button>
                  </>
                )}

                {/* COMPLETED / BLOCKED → REOPEN */}
                {(currentTask?.status === "Completed" ||
                  currentTask?.status === "Blocked") && (
                    <button
                      className="px-4 py-2 rounded bg-indigo-600 text-white text-sm hover:bg-indigo-700 cursor-pointer"
                      onClick={handleReopenTask}
                    >
                      🔄 Reopen Task
                    </button>
                  )}
              </div>
            )}



            {error && (
              <p className="text-xs font-medium text-red-500 mt-5">{error}</p>
            )}

            {!isTaskLocked && (
              <div className="flex justify-end mt-7">
                <button
                  className="add-btn"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {taskId ? "UPDATE TASK" : "CREATE TASK"}
                </button>
              </div>
            )}

          </div>
        </div>
      </div>

      <Modal
        isOpen={openDeleteAlert}
        onClose={() => setOpenDeleteAlert(false)}
        title="Delete Task"
      >
        <DeleteAlert
          content="Are you sure you want to delete this task?"
          onDelete={() => deleteTask()}
        />
      </Modal>

    </DashboardLayout>

  )
}

export default CreateTask
